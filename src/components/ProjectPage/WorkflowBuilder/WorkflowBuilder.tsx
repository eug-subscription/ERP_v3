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
import { useState, useEffect, useRef } from "react";
import { WorkflowCanvas } from "./WorkflowCanvas/WorkflowCanvas";
import { useWorkflowBuilder } from "../../../hooks/useWorkflowBuilder";
import { CanvasBlockCard } from "./WorkflowCanvas/CanvasBlockCard";
import type { CanvasBlock as CanvasBlockType } from "../../../types/workflow";
import { CANVAS_BLOCK_WIDTH } from "./constants";
import { BlockSettingsPanel, BlockSettingsRef } from "./BlockSettings/BlockSettingsPanel";

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
    const settingsRef = useRef<BlockSettingsRef>(null);

    // Global keyboard listener for deleting selected blocks
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const selectedId = state.canvasState.selectedBlockId;

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
        if (active.data.current?.type !== "BLOCK_TEMPLATE" || !over) {
            setProjectionIndex(null);
            return;
        }

        const placeholderId = `placeholder-${active.data.current.blockType}`;
        if (over.id === placeholderId) return;

        let index = state.blocks.length;

        if (over.id === 'drop-zone-root') {
            index = 1;
        } else if (typeof over.id === 'string' && over.id.startsWith('drop-zone-')) {
            const parsedIndex = parseInt(over.id.replace('drop-zone-', ''), 10);
            if (!isNaN(parsedIndex)) index = parsedIndex;
        } else {
            const overIndex = state.blocks.findIndex(b => b.id === over.id);
            if (overIndex !== -1) {
                index = overIndex + 1;
            }
        }
        setProjectionIndex(index);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const current = active.data.current;

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
        setActiveDragState(null);

        if (!over) {
            setProjectionIndex(null);
            return;
        }

        const isNewBlock = active.data.current?.type === "BLOCK_TEMPLATE";

        if (isNewBlock) {
            const blockType = active.data.current?.blockType;
            if (blockType) {
                let insertIndex = state.blocks.length;
                if (projectionIndex !== null) {
                    insertIndex = Math.max(1, projectionIndex);
                } else if (over.id === 'drop-zone-root') {
                    insertIndex = 1;
                } else if (typeof over.id === 'string' && over.id.startsWith('drop-zone-')) {
                    const parsedIndex = parseInt(over.id.replace('drop-zone-', ''), 10);
                    if (!isNaN(parsedIndex)) insertIndex = parsedIndex;
                } else {
                    const overIndex = state.blocks.findIndex(b => b.id === over.id);
                    if (overIndex !== -1) insertIndex = overIndex + 1;
                }

                actions.insertBlock(blockType, insertIndex);
            }
            setProjectionIndex(null);
            return;
        }

        if (active.id !== over.id && !over.id.toString().startsWith('drop-zone-')) {
            actions.reorderBlocks(active.id as string, over.id as string);
        }

        setProjectionIndex(null);
    };

    const [isSettingsDirty, setIsSettingsDirty] = useState(false);

    const handleBlockSelect = (id: string | null) => {
        if (isSettingsDirty && settingsRef.current) {
            settingsRef.current.promptUnsavedChanges(() => actions.selectBlock(id));
        } else {
            actions.selectBlock(id);
        }
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

                <BlockLibrary />

                <WorkflowCanvas
                    blocks={state.blocks}
                    onBlockSelect={handleBlockSelect}
                    selectedBlockId={state.canvasState.selectedBlockId}
                    lastAddedBlockId={state.canvasState.lastAddedBlockId}
                    activeLibraryItem={activeDragState?.kind === 'LIBRARY' ? activeDragState.item : null}
                    projectionIndex={projectionIndex}
                />

                <BlockSettingsPanel
                    ref={settingsRef}
                    block={state.blocks.find(b => b.id === state.canvasState.selectedBlockId) || null}
                    availableBlocks={state.blocks}
                    onClose={() => actions.selectBlock(null)}
                    onDelete={(id) => {
                        actions.removeBlock(id);
                        setIsSettingsDirty(false);
                    }}
                    onSave={(config) => {
                        const selectedId = state.canvasState.selectedBlockId;
                        if (selectedId) {
                            actions.updateBlockConfig(selectedId, config);
                            setIsSettingsDirty(false);
                        }
                    }}
                    onDirtyChange={setIsSettingsDirty}
                />
            </div>

            <DragOverlay dropAnimation={null}>
                {activeDragState?.kind === 'LIBRARY' ? (
                    <div className="opacity-90 rotate-2 cursor-grabbing" style={{ width: CANVAS_BLOCK_WIDTH }}>
                        <CanvasBlockCard
                            block={{
                                id: 'temp-drag-preview',
                                type: activeDragState.item.type,
                                label: activeDragState.item.label,
                                category: 'PROCESSING',
                                isEnabled: true,
                                position: { id: 'temp', branchId: 'main', index: 0 },
                                validationState: 'valid'
                            }}
                            isSelected={true}
                            className="shadow-xl"
                        />
                    </div>
                ) : null}

                {activeDragState?.kind === 'CANVAS' ? (
                    <div className="opacity-90 rotate-2 cursor-grabbing" style={{ width: CANVAS_BLOCK_WIDTH }}>
                        <CanvasBlockCard
                            block={activeDragState.item}
                            isSelected={true}
                            className="shadow-xl"
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
