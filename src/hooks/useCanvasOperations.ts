import { useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import {
    WorkflowBlockType,
    CanvasBlock,
    BlockConfig,
    BlockCategory,
    TimelineConfig,
    WorkflowCanvasState
} from "../types/workflow";
import { BLOCK_LIBRARY, BlockCategoryUI } from "../data/block-ui-categories";
import { MASTER_BLOCKS } from "../data/master-blocks";
import { START_NODE_ID } from "../components/ProjectPage/WorkflowBuilder/constants";
import { isBlockAllowedInBranch } from "../utils/workflow";

const UI_TO_BLOCK_CATEGORY: Record<BlockCategoryUI, BlockCategory> = {
    'SETUP_ONBOARDING': 'STARTING',
    'GATES_PREREQUISITES': 'STARTING',
    'PRODUCTION_PROCESSING': 'PROCESSING',
    'FLOW_CONTROL': 'PROCESSING',
    'QUALITY_ASSURANCE': 'PROCESSING',
    'ASSET_MANAGEMENT': 'FINALISATION',
    'DELIVERY_NOTIFICATIONS': 'FINALISATION',
};

interface UseCanvasOperationsParams {
    setCanvasState: React.Dispatch<React.SetStateAction<WorkflowCanvasState>>;
    setTimelineConfig: React.Dispatch<React.SetStateAction<TimelineConfig | undefined>>;
}

/**
 * Manages canvas block operations including insert, remove, reorder, and selection.
 * Handles DnD reordering logic using @dnd-kit/sortable.
 */
export function useCanvasOperations({
    setCanvasState,
    setTimelineConfig
}: UseCanvasOperationsParams) {
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

        // Clean up timeline config if block had overrides
        setTimelineConfig(prev => {
            if (!prev || !prev.steps[blockId]) return prev;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [blockId]: _removed, ...remaining } = prev.steps;
            return { ...prev, steps: remaining };
        });
    }, [setCanvasState, setTimelineConfig]);

    /**
     * Reorder blocks within the list (for SortableContext)
     * This is the core DnD logic using @dnd-kit/sortable
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
    }, [setCanvasState]);

    /**
     * Insert a new block at a specific index in a specific branch
     */
    const insertBlock = useCallback((
        blockType: WorkflowBlockType,
        index: number,
        branchId: 'main' | 'photo' | 'video' = 'main'
    ) => {
        if (!isBlockAllowedInBranch(blockType, branchId)) {
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
    }, [getBlockInfo, setCanvasState]);

    /**
     * Select or deselect a block
     */
    const selectBlock = useCallback((blockId: string | null) => {
        setCanvasState(prev => ({
            ...prev,
            selectedBlockId: blockId,
            lastAddedBlockId: null // Clear last added when interacting
        }));
    }, [setCanvasState]);

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
    }, [setCanvasState]);

    return {
        removeBlock,
        reorderBlocks,
        insertBlock,
        selectBlock,
        updateBlockConfig,
    };
}
