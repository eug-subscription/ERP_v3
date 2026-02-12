import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useBlockValidation } from './useBlockValidation';
import { useCanvasOperations } from './useCanvasOperations';
import {
    ProjectWorkflowConfig,
    WorkflowCanvasState,
    CanvasBlock,
    ValidationResult,
    UserWorkflowTemplate,
    WorkflowBranch,
    WorkflowBlock,
    TimelineConfig
} from '../types/workflow';

import { autoFixCanvasBlocks, getAutoFixActions } from '../data/block-dependencies';
import { isBlockAllowedInBranch } from '../utils/workflow';
import { useSaveWorkflow } from './useProjectWorkflow';
import { serializeCanvasToConfig } from '../utils/workflow-serializer';
import { START_NODE_ID } from '../components/ProjectPage/WorkflowBuilder/constants';

/**
 * Core hook managing the entire builder state including canvas blocks, selection, and DnD coordination.
 */
export function useWorkflowBuilder(initialConfig?: ProjectWorkflowConfig) {
    // Initial state setup
    const initialBlocks: CanvasBlock[] = initialConfig ? [] : [
        {
            id: START_NODE_ID,
            type: 'ORDER_CREATED',
            label: 'Order Created',
            category: 'STARTING',
            isEnabled: true,
            position: { id: START_NODE_ID, branchId: 'main', index: 0 },
            validationState: 'valid'
        }
    ];

    const [canvasState, setCanvasState] = useState<WorkflowCanvasState>({
        blocks: initialBlocks,
        selectedBlockId: null,
        isDragging: false,
        hasUnsavedChanges: false,
        lastAddedBlockId: null
    });

    const [timelineConfig, setTimelineConfig] = useState<TimelineConfig | undefined>(initialConfig?.timelineConfig);

    const hydrationRef = useRef(false);

    // Hydrate state when initialConfig becomes available (since it's usually async)
    useEffect(() => {
        if (!initialConfig || hydrationRef.current) return;

        // Transform WorkflowConfig branches back into flat CanvasBlocks
        const configBlocks: CanvasBlock[] = initialConfig.branches.flatMap(branch =>
            branch.blocks.map((block, idx) => ({
                ...block,
                position: { id: block.id, branchId: branch.id as 'main' | 'photo' | 'video', index: idx },
                validationState: 'valid' // Initial assumption, re-validated by standard flow
            }))
        );

        // Only hydrate if we have blocks and haven't already hydrated
        // Schedule update to avoid synchronous setState in effect and cascading renders
        const timer = setTimeout(() => {
            setCanvasState(prev => {
                if (hydrationRef.current) return prev;

                // Note: initialBlocks has exactly 1 block (START_NODE_ID)
                if (configBlocks.length > 0 && prev.blocks.length === 1 && prev.blocks[0].id === START_NODE_ID) {
                    hydrationRef.current = true;
                    // Also hydrate timeline config if present
                    setTimelineConfig(initialConfig.timelineConfig);
                    return {
                        ...prev,
                        blocks: configBlocks,
                        hasUnsavedChanges: false
                    };
                }
                return prev;
            });
        }, 0);

        return () => clearTimeout(timer);
    }, [initialConfig]);

    // Use canvas operations hook for all block manipulation
    const {
        insertBlock,
        reorderBlocks,
        removeBlock,
        selectBlock,
        updateBlockConfig
    } = useCanvasOperations({
        setCanvasState,
        setTimelineConfig
    });

    /**
     * Automatically fix common validation issues
     */
    const autoFix = useCallback(() => {
        setCanvasState(prev => ({
            ...prev,
            blocks: autoFixCanvasBlocks(prev.blocks),
            hasUnsavedChanges: true
        }));
    }, []);

    /**
     * Apply a workflow template to the canvas
     */
    const applyTemplate = useCallback((template: UserWorkflowTemplate) => {
        // Build ID remap: oldId → newId
        const idRemap = new Map<string, string>();

        // We'll transform its branches back into flat CanvasBlocks with new IDs
        const newBlocks: CanvasBlock[] = (template.branches || []).flatMap((branch: WorkflowBranch) =>
            (branch.blocks || []).map((block: WorkflowBlock, idx: number) => {
                const newId = crypto.randomUUID();
                // Track the ID mapping for timeline config remapping
                idRemap.set(block.id, newId);

                return {
                    ...block,
                    id: newId,
                    position: {
                        id: newId,
                        branchId: branch.id as 'main' | 'photo' | 'video',
                        index: idx
                    },
                    validationState: 'valid' // Templates are assumed valid or will be re-validated
                };
            })
        );

        // Ensure we have at least the Start node if the template is empty or missing it
        if (newBlocks.length === 0 || newBlocks[0].id !== START_NODE_ID) {
            const hasStartNode = newBlocks.some(b => b.type === 'ORDER_CREATED');
            if (!hasStartNode) {
                newBlocks.unshift({
                    id: START_NODE_ID,
                    type: 'ORDER_CREATED',
                    label: 'Order Created',
                    category: 'STARTING',
                    isEnabled: true,
                    position: { id: START_NODE_ID, branchId: 'main', index: 0 },
                    validationState: 'valid'
                });
            }
        }

        setCanvasState(prev => ({
            ...prev,
            blocks: newBlocks,
            selectedBlockId: null,
            hasUnsavedChanges: true,
            lastAddedBlockId: null
        }));

        // Remap timeline config keys from old IDs to new IDs
        if (template.timelineConfig) {
            const remappedSteps: Record<string, TimelineConfig['steps'][string]> = {};
            for (const [oldId, overrides] of Object.entries(template.timelineConfig.steps)) {
                const newId = idRemap.get(oldId);
                if (newId) {
                    remappedSteps[newId] = overrides;
                }
            }
            setTimelineConfig({ steps: remappedSteps });
        } else {
            setTimelineConfig(undefined);
        }
    }, []);

    /**
     * Merge validation results into blocks for the UI
     */
    const validationResult = useBlockValidation(canvasState.blocks);

    const { mutateAsync: saveMutation, isPending: isSaving } = useSaveWorkflow();

    /**
     * Save the current canvas state to the project configuration
     */
    const saveWorkflow = useCallback(async (projectId: string = 'current-project') => {
        const config = serializeCanvasToConfig(
            projectId,
            initialConfig?.templateId || 'custom-workflow',
            canvasState.blocks,
            timelineConfig
        );

        try {
            await saveMutation(config);
            setCanvasState(prev => ({ ...prev, hasUnsavedChanges: false }));
            return true;
        } catch {
            return false;
        }
    }, [canvasState.blocks, timelineConfig, saveMutation, initialConfig?.templateId]);

    const validatedBlocks = useMemo(() => {
        return canvasState.blocks.map(block => {
            const blockError = validationResult.errors.find(e => e.blockId === block.id);

            // Determine the state based on validation and config status
            let newState: CanvasBlock['validationState'] = block.validationState;

            if (blockError) {
                newState = blockError.level === 'ERROR' ? 'error' : 'warning';
            } else if (block.validationState !== 'unconfigured') {
                newState = 'valid';
            }

            return {
                ...block,
                validationState: newState,
                validationMessage: blockError?.message
            };
        });
    }, [canvasState.blocks, validationResult]);

    /**
     * Legacy manual validation (now mostly redundant but kept for sync calls)
     */
    const validateCanvas = useCallback((): ValidationResult => {
        return validationResult;
    }, [validationResult]);

    return {
        state: {
            canvasState,
            hasUnsavedChanges: canvasState.hasUnsavedChanges,
            blocks: validatedBlocks, // Return blocks with merged validation info
            timelineConfig
        },
        actions: {
            insertBlock,
            reorderBlocks,
            removeBlock,
            selectBlock,
            updateBlockConfig,
            autoFix,
            applyTemplate,
            setCanvasState,
            saveWorkflow,
            setTimelineConfig
        },
        validation: {
            validate: validateCanvas,
            getAutoFixActions: () => getAutoFixActions(canvasState.blocks),
            isBlockAllowedInBranch
        },
        isSaving
    };
}
