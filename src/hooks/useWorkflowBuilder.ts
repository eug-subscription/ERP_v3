import { useState, useCallback } from 'react';
import { arrayMove } from "@dnd-kit/sortable";
import {
    ProjectWorkflowConfig,
    WorkflowCanvasState,
    WorkflowBlockType,
    BlockConfig,
    CanvasBlock,
    ValidationResult,
    ValidationError,
    BlockCategory
} from '../types/workflow';
import { BLOCK_LIBRARY, BlockCategoryUI } from '../data/block-ui-categories';
import { MASTER_BLOCKS } from '../data/master-blocks';
import { STANDARD_BRANCHES } from '../data/branch-structure';

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
            id: 'start-node',
            type: 'ORDER_CREATED',
            label: 'Order Created',
            category: 'STARTING',
            isEnabled: true,
            position: { id: 'start-node', branchId: 'main', index: 0 },
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
        if (blockId === 'start-node') return;

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
     * Validate the entire canvas
     */
    const validateCanvas = useCallback((): ValidationResult => {
        const hasIfElse = canvasState.blocks.some(b => b.type === 'IF_ELSE');
        const hasMerge = canvasState.blocks.some(b => b.type === 'MERGE');
        const ifElseIndex = canvasState.blocks.findIndex(b => b.type === 'IF_ELSE');
        const mergeIndex = canvasState.blocks.findIndex(b => b.type === 'MERGE');

        const errors: ValidationError[] = [];

        if (hasIfElse && !hasMerge) {
            errors.push({
                type: 'IF_ELSE',
                message: 'Workflow with branching must be rejoined with a Merge block.',
                level: 'ERROR'
            });
        }

        if (hasMerge && !hasIfElse) {
            errors.push({
                type: 'MERGE',
                message: 'Merge block can only be used after an If/Else branch.',
                level: 'ERROR'
            });
        }

        if (hasMerge && hasIfElse && mergeIndex < ifElseIndex) {
            errors.push({
                type: 'MERGE',
                message: 'Merge block must be placed after the If/Else branch.',
                level: 'ERROR'
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }, [canvasState.blocks]);

    return {
        state: {
            canvasState,
            hasUnsavedChanges: canvasState.hasUnsavedChanges,
            blocks: canvasState.blocks // Convenience accessor
        },
        actions: {
            insertBlock,
            reorderBlocks,
            removeBlock,
            selectBlock,
            updateBlockConfig,
            setCanvasState
        },
        validation: {
            validate: validateCanvas,
            isBlockAllowedInBranch
        }
    };
}
