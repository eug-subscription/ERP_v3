import { useState, useCallback } from 'react';
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
            const oldIndex = prev.blocks.findIndex(b => b.id === activeId);
            const newIndex = prev.blocks.findIndex(b => b.id === overId);

            if (oldIndex === -1 || newIndex === -1) return prev;

            const newBlocks = arrayMove(prev.blocks, oldIndex, newIndex).map((block, index) => ({
                ...block,
                position: { ...block.position, index }
            }));

            return {
                ...prev,
                blocks: newBlocks,
                hasUnsavedChanges: true
            };
        });
    }, []);

    /**
     * Insert a new block at a specific index
     */
    const insertBlock = useCallback((blockType: WorkflowBlockType, index: number) => {
        const info = getBlockInfo(blockType);
        const newBlockId = crypto.randomUUID();

        setCanvasState(prev => {
            const masterBlock = MASTER_BLOCKS[blockType];
            const newBlock: CanvasBlock = {
                id: newBlockId,
                type: blockType,
                label: info.label,
                category: UI_TO_BLOCK_CATEGORY[info.category],
                isEnabled: true,
                position: { id: newBlockId, branchId: 'main', index },
                validationState: masterBlock?.config ? 'unconfigured' : 'valid',
                config: masterBlock?.config ? { ...masterBlock.config } : undefined
            };

            const updatedBlocks = [...prev.blocks];
            updatedBlocks.splice(index, 0, newBlock);

            // Re-index all blocks to ensure consistency
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
     * TODO: Implement full canvas validation logic in Phase 4
     */
    const validateCanvas = useCallback((): ValidationResult => {
        return {
            isValid: true,
            errors: []
        };
    }, []);

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
            validate: validateCanvas
        }
    };
}
