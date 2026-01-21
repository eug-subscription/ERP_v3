import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners
} from "@dnd-kit/core";
import { BlockLibrary } from "./BlockLibrary/BlockLibrary";
import { BlockLibraryItem } from "../../../data/block-ui-categories";
import { useState, useEffect } from "react";
import { WorkflowCanvas } from "./WorkflowCanvas/WorkflowCanvas";
import { useWorkflowBuilder } from "../../../hooks/useWorkflowBuilder";
import { CanvasBlockCard } from "./WorkflowCanvas/CanvasBlockCard";
import type { CanvasBlock as CanvasBlockType } from "../../../types/workflow";
import { CANVAS_BLOCK_WIDTH } from "./constants";

type ActiveDragState =
    | { kind: 'LIBRARY', item: BlockLibraryItem }
    | { kind: 'CANVAS', item: CanvasBlockType }
    | null;

/**
 * Main Workflow Builder container.
 * Orchestrates drag-and-drop between Library and Canvas, and manages global workflow state.
 */
export function WorkflowBuilder() {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const [activeDragState, setActiveDragState] = useState<ActiveDragState>(null);
    const { state, actions } = useWorkflowBuilder();

    // Global keyboard listener for deleting selected blocks (CR-014)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const selectedId = state.canvasState.selectedBlockId;

            // Only proceed if a block is selected and we're not in an input/textarea
            if (
                selectedId &&
                (e.key === 'Delete' || e.key === 'Backspace') &&
                !(document.activeElement instanceof HTMLInputElement ||
                    document.activeElement instanceof HTMLTextAreaElement)
            ) {
                actions.removeBlock(selectedId);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.canvasState.selectedBlockId, actions]);

    const [projectionIndex, setProjectionIndex] = useState<number | null>(null);

    const handleDragOver = (event: DragEndEvent) => {
        const { active, over } = event;
        // Only active for Library items moving over canvas
        if (active.data.current?.type !== "BLOCK_TEMPLATE" || !over) {
            setProjectionIndex(null);
            return;
        }

        // IF HOVERING SELF (The placeholder), keep the current projection! (Stable state)
        const placeholderId = `placeholder-${active.data.current.blockType}`;
        if (over.id === placeholderId) {
            return;
        }

        // Determine potential insertion index
        let index = state.blocks.length;

        if (over.id === 'drop-zone-root') {
            index = 1;
        } else if (typeof over.id === 'string' && over.id.startsWith('drop-zone-')) {
            const parsedIndex = parseInt(over.id.replace('drop-zone-', ''), 10);
            if (!isNaN(parsedIndex)) index = parsedIndex;
        } else {
            // Hovering over a block, determine relative position
            const overIndex = state.blocks.findIndex(b => b.id === over.id);
            if (overIndex !== -1) {
                // If hovering upper half, insert before? For simple vertical lists, 
                // hovering a sortable usually pushes it down, so insert at that index.
                // dnd-kit's sortable logic usually handles 'insertion' visually if the item is present.
                // We'll trust the SortableStrategy to shift items if we insert at 'overIndex'.
                index = overIndex + 1; // Default to after for now, or match DropZone logic
            }
        }
        setProjectionIndex(index);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const current = active.data.current;

        // Handle Library Items
        if (current?.type === "BLOCK_TEMPLATE") {
            setActiveDragState({
                kind: 'LIBRARY',
                item: {
                    type: current.blockType,
                    category: current.category,
                    label: current.label || "New Block",
                    description: "",
                    icon: current.icon || "lucide:box",
                } as BlockLibraryItem
            });
            return;
        }

        // Handle Canvas Blocks (Reordering)
        // Check if the active ID exists in our canvas blocks
        const canvasBlock = state.blocks.find(b => b.id === active.id);
        if (canvasBlock) {
            setActiveDragState({
                kind: 'CANVAS',
                item: canvasBlock
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        // Reset drag overlay state (keep projectionIndex for a moment to use it logic)
        setActiveDragState(null);

        if (!over) {
            setProjectionIndex(null);
            return;
        }

        // Case 1: Dragging from Library to Canvas (New Block)
        const isNewBlock = active.data.current?.type === "BLOCK_TEMPLATE";

        if (isNewBlock) {
            const blockType = active.data.current?.blockType;
            if (blockType) { // Ensure blockType exists
                let insertIndex = state.blocks.length;

                // Priority Check: If we have a projection (visible ghost), TRUST IT.
                // This ensures "What You See Is What You Get". The ghost position is the drop position.
                if (projectionIndex !== null) {
                    insertIndex = Math.max(1, projectionIndex);
                }
                // Fallbacks (unlikely to be hit if projection is working, but safe to keep)
                else if (over.id === 'drop-zone-root') {
                    insertIndex = 1;
                } else if (typeof over.id === 'string' && over.id.startsWith('drop-zone-')) {
                    const parsedIndex = parseInt(over.id.replace('drop-zone-', ''), 10);
                    if (!isNaN(parsedIndex)) {
                        insertIndex = parsedIndex;
                    }
                } else {
                    const overIndex = state.blocks.findIndex(b => b.id === over.id);
                    if (overIndex !== -1) {
                        insertIndex = overIndex + 1;
                    }
                }

                actions.insertBlock(blockType, insertIndex);
            }
            setProjectionIndex(null); // Clear projection after handling
            return;
        }

        // Case 2: Reordering existing blocks on Canvas
        if (active.id !== over.id && !over.id.toString().startsWith('drop-zone-')) {
            actions.reorderBlocks(active.id as string, over.id as string);
        }

        setProjectionIndex(null); // Finally clear projection
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden rounded-xl border border-default-200 bg-background shadow-sm">

                {/* Left Panel: Block Library */}
                <BlockLibrary />

                {/* Center Canvas */}
                <WorkflowCanvas
                    blocks={state.blocks}
                    onBlockSelect={actions.selectBlock}
                    selectedBlockId={state.canvasState.selectedBlockId}
                    lastAddedBlockId={state.canvasState.lastAddedBlockId}
                    activeLibraryItem={activeDragState?.kind === 'LIBRARY' ? activeDragState.item : null}
                    projectionIndex={projectionIndex}
                />
            </div>

            <DragOverlay dropAnimation={null}>
                {/* Disable default drop animation for snappier feel */}
                {activeDragState?.kind === 'LIBRARY' ? (
                    <div
                        className="opacity-90 rotate-2 cursor-grabbing"
                        style={{ width: CANVAS_BLOCK_WIDTH }}
                    >
                        <CanvasBlockCard
                            block={{
                                id: 'temp-drag-preview',
                                type: activeDragState.item.type,
                                label: activeDragState.item.label,
                                category: 'PROCESSING', // Logical fallback, visual resolved by type
                                isEnabled: true,
                                position: { id: 'temp', branchId: 'main', index: 0 },
                                validationState: 'valid' // Assume valid for preview
                            }}
                            isSelected={true}
                            className="shadow-xl"
                        />
                    </div>
                ) : null}

                {activeDragState?.kind === 'CANVAS' ? (
                    <div
                        className="opacity-90 rotate-2 cursor-grabbing"
                        style={{ width: CANVAS_BLOCK_WIDTH }}
                    >
                        {/* Fixed width for preview consistency, slightly rotated for 'lifted' effect */}
                        <CanvasBlockCard
                            block={activeDragState.item}
                            isSelected={true} // Highlight being dragged
                            className="shadow-xl"
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
