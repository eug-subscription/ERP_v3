import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useBlockValidation } from './useBlockValidation';
import { arrayMove } from "@dnd-kit/sortable";
import {
    ProjectWorkflowConfig,
    WorkflowCanvasState,
    WorkflowBlockType,
    BlockConfig,
    CanvasBlock,
    ValidationResult,
    BlockCategory
} from '../types/workflow';
import { BLOCK_LIBRARY, BlockCategoryUI } from '../data/block-ui-categories';
import { MASTER_BLOCKS } from '../data/master-blocks';
import { STANDARD_BRANCHES } from '../data/branch-structure';
import { autoFixCanvasBlocks, getAutoFixActions } from '../data/block-dependencies';
import { useSaveWorkflow } from './useProjectWorkflow';
import { serializeCanvasToConfig } from '../utils/workflow-serializer';
import { START_NODE_ID } from '../components/ProjectPage/WorkflowBuilder/constants';

const isBlockAllowedInBranch = (blockType: WorkflowBlockType, branchId: 'main' | 'photo' | 'video'): boolean => {
    if (branchId === 'photo') {
        const branch = STANDARD_BRANCHES.find(b => b.id === 'photo');
        return branch?.allowedBlockTypes.includes(blockType) || false;
    }
    if (branchId === 'video') {
        const branch = STANDARD_BRANCHES.find(b => b.id === 'video');
        return branch?.allowedBlockTypes.includes(blockType) || false;
    }

    // 'main' branch covers both 'initial' and 'completion'
    const initialBranch = STANDARD_BRANCHES.find(b => b.id === 'initial');
    const completionBranch = STANDARD_BRANCHES.find(b => b.id === 'completion');

    return (initialBranch?.allowedBlockTypes.includes(blockType) ||
        completionBranch?.allowedBlockTypes.includes(blockType)) || false;
};

const UI_TO_BLOCK_CATEGORY: Record<BlockCategoryUI, BlockCategory> = {
    'SETUP_ONBOARDING': 'STARTING',
    'GATES_PREREQUISITES': 'STARTING',
    'PRODUCTION_PROCESSING': 'PROCESSING',
    'FLOW_CONTROL': 'PROCESSING',
    'QUALITY_ASSURANCE': 'PROCESSING',
    'ASSET_MANAGEMENT': 'FINALISATION',
    'DELIVERY_NOTIFICATIONS': 'FINALISATION',
};

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

    /**
     * Helper to lookup basic block info from library
     */
    const getBlockInfo = useCallback((type: WorkflowBlockType) => {
        return BLOCK_LIBRARY.find(b => b.type === type) || {
            label: type.replace(/_/g, ' '),
            category: 'PRODUCTION_PROCESSING' as BlockCategoryUI
        };
    }, []);

    /**
     * Remove a block from the canvas
     */
    const removeBlock = useCallback((blockId: string) => {
        // Prevent deleting Start node
        if (blockId === START_NODE_ID) return;

        setCanvasState(prev => ({
            ...prev,
            blocks: prev.blocks.filter(b => b.id !== blockId),
            selectedBlockId: prev.selectedBlockId === blockId ? null : prev.selectedBlockId,
            hasUnsavedChanges: true
        }));
    }, []);

    /**
     * Reorder blocks within the list (for SortableContext)
     */
    const reorderBlocks = useCallback((activeId: string, overId: string) => {
        setCanvasState(prev => {
            const activeBlock = prev.blocks.find(b => b.id === activeId);
            const overBlock = prev.blocks.find(b => b.id === overId);

            if (!activeBlock || !overBlock) return prev;

            // Ensure we are reordering within the same branch
            if (activeBlock.position.branchId !== overBlock.position.branchId) return prev;

            const oldIndex = prev.blocks.findIndex(b => b.id === activeId);
            const newIndex = prev.blocks.findIndex(b => b.id === overId);

            if (oldIndex === -1 || newIndex === -1) return prev;

            const newBlocks = arrayMove(prev.blocks, oldIndex, newIndex);

            // Re-index all blocks to maintain internal consistency
            const reindexedBlocks = newBlocks.map((b, i) => ({
                ...b,
                position: { ...b.position, index: i }
            }));

            return {
                ...prev,
                blocks: reindexedBlocks,
                hasUnsavedChanges: true
            };
        });
    }, []);

    /**
     * Insert a new block at a specific index in a specific branch
     */
    const insertBlock = useCallback((
        blockType: WorkflowBlockType,
        index: number,
        branchId: 'main' | 'photo' | 'video' = 'main'
    ) => {
        if (!isBlockAllowedInBranch(blockType, branchId)) {
            console.warn(`Block ${blockType} is not allowed in branch ${branchId}`);
            return;
        }

        const info = getBlockInfo(blockType);
        const newBlockId = crypto.randomUUID();

        setCanvasState(prev => {
            const masterBlock = MASTER_BLOCKS[blockType];

            const updatedBlocks = [...prev.blocks];
            let targetGlobalIndex = index;

            // If inserting into a parallel branch (photo/video)
            if (branchId === 'photo' || branchId === 'video') {
                // Find all existing blocks in this specific branch
                const branchBlocks = updatedBlocks.filter(b => b.position.branchId === branchId);

                if (branchBlocks.length === 0) {
                    // First block in branch: 
                    // Insert immediately after IF_ELSE or at the end if none
                    const ifElseIdx = updatedBlocks.findIndex(b => b.type === 'IF_ELSE');
                    targetGlobalIndex = ifElseIdx !== -1 ? ifElseIdx + 1 : updatedBlocks.length;
                } else {
                    // Middle of branch:
                    // Find the global index of the block at 'index - 1' and insert after it
                    const targetBranchIdx = Math.min(index, branchBlocks.length);
                    if (targetBranchIdx === 0) {
                        // Insert before first block in branch
                        targetGlobalIndex = updatedBlocks.findIndex(b => b.id === branchBlocks[0].id);
                    } else {
                        // Insert after the block at targetBranchIdx - 1
                        const prevBlockInBranch = branchBlocks[targetBranchIdx - 1];
                        targetGlobalIndex = updatedBlocks.findIndex(b => b.id === prevBlockInBranch.id) + 1;
                    }
                }
            }

            const newBlock: CanvasBlock = {
                id: newBlockId,
                type: blockType,
                label: info.label,
                category: UI_TO_BLOCK_CATEGORY[info.category],
                isEnabled: true,
                position: { id: newBlockId, branchId, index: 0 }, // internal index will be re-set below
                validationState: masterBlock?.config ? 'unconfigured' : 'valid',
                config: masterBlock?.config ? { ...masterBlock.config } : undefined
            };

            updatedBlocks.splice(targetGlobalIndex, 0, newBlock);

            // Re-index all blocks to maintain consistency
            const reindexedBlocks = updatedBlocks.map((b, i) => ({
                ...b,
                position: { ...b.position, index: i }
            }));

            return {
                ...prev,
                blocks: reindexedBlocks,
                hasUnsavedChanges: true,
                lastAddedBlockId: newBlockId
            };
        });
    }, [getBlockInfo]);

    /**
     * Select or deselect a block
     */
    const selectBlock = useCallback((blockId: string | null) => {
        setCanvasState(prev => ({
            ...prev,
            selectedBlockId: blockId,
            lastAddedBlockId: null // Clear last added when interacting
        }));
    }, []);

    /**
     * Update configuration for a specific block
     */
    const updateBlockConfig = useCallback((blockId: string, config: BlockConfig) => {
        setCanvasState(prev => ({
            ...prev,
            blocks: prev.blocks.map(b =>
                b.id === blockId
                    ? { ...b, config: config, validationState: 'valid' }
                    : b
            ),
            hasUnsavedChanges: true
        }));
    }, []);

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
            canvasState.blocks
        );

        try {
            await saveMutation(config);
            setCanvasState(prev => ({ ...prev, hasUnsavedChanges: false }));
            return true;
        } catch {
            return false;
        }
    }, [canvasState.blocks, saveMutation, initialConfig?.templateId]);

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
            blocks: validatedBlocks // Return blocks with merged validation info
        },
        actions: {
            insertBlock,
            reorderBlocks,
            removeBlock,
            selectBlock,
            updateBlockConfig,
            autoFix,
            setCanvasState,
            saveWorkflow
        },
        validation: {
            validate: validateCanvas,
            getAutoFixActions: () => getAutoFixActions(canvasState.blocks),
            isBlockAllowedInBranch
        },
        isSaving
    };
}
