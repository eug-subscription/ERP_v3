import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    CollisionDetection
} from "@dnd-kit/core";
import { BlockLibrary } from "./BlockLibrary/BlockLibrary";
import { BlockLibraryItem } from "../../../data/block-ui-categories";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
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

const ERROR_TOOLTIP_COLORS = {
    background: '#DC2626',
    text: '#FFFFFF'
} as const;

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
    const { state, actions, validation } = useWorkflowBuilder();
    const settingsRef = useRef<BlockSettingsRef>(null);

    // Check if currently dragging a Merge block
    const isDraggingMergeBlock = activeDragState?.kind === 'LIBRARY' && activeDragState.item.type === 'MERGE';

    // Get IDs of blocks in photo/video branches for filtering - memoized for stable collision detection
    const laneBlockIds = useMemo(() => new Set(
        state.blocks
            .filter(b => b.position.branchId === 'photo' || b.position.branchId === 'video')
            .map(b => b.id)
    ), [state.blocks]);

    // Use custom collision detection when dragging Merge block - inline for correct closure
    const collisionDetection: CollisionDetection = useCallback((args) => {
        const { droppableContainers, ...rest } = args;

        // Filter out lane drop zones and lane blocks when dragging a Merge block
        let filteredContainers = droppableContainers;
        if (isDraggingMergeBlock) {
            filteredContainers = droppableContainers.filter((container) => {
                const id = container.id.toString();

                // Exclude photo and video lane drop zones by ID
                if (id.includes('photo-drop-zone') || id.includes('video-drop-zone')) {
                    return false;
                }

                // Exclude blocks that are in photo or video branches
                if (laneBlockIds.has(id)) {
                    return false;
                }

                return true;
            });
        }

        // Use closestCorners with the filtered containers
        return closestCorners({ ...rest, droppableContainers: filteredContainers });
    }, [isDraggingMergeBlock, laneBlockIds]);

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
    const [projectionBranchId, setProjectionBranchId] = useState<'main' | 'photo' | 'video'>('main');
    const [dragError, setDragError] = useState<string | null>(null);

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) {
            if (projectionIndex !== null) setProjectionIndex(null);
            if (dragError !== null) setDragError(null);
            return;
        }

        const isNewBlock = active.data.current?.type === "BLOCK_TEMPLATE";
        const overData = over.data.current;

        let branchId: 'main' | 'photo' | 'video' = 'main';
        if (overData?.branchId) {
            branchId = overData.branchId;
        } else {
            const overBlock = state.blocks.find(b => b.id === over.id);
            if (overBlock) branchId = overBlock.position.branchId;
        }

        let nextError: string | null = null;
        let nextIndex = state.blocks.length;

        if (isNewBlock) {
            const blockType = active.data.current?.blockType;
            if (blockType) {
                // Ignore placeholder for collision to prevent jitter
                if (over.id === `placeholder-${blockType}`) return;

                if (!validation.isBlockAllowedInBranch(blockType, branchId)) {
                    const laneName = branchId === 'photo' ? 'Photo' : branchId === 'video' ? 'Video' : 'Main';
                    nextError = `This block cannot be placed in the ${laneName} lane`;
                    nextIndex = -1;
                }
            }
        } else {
            const activeBlock = state.blocks.find(b => b.id === active.id);
            if (activeBlock && activeBlock.position.branchId !== branchId) {
                nextError = "Cross-lane drag is not allowed";
                nextIndex = -1;
                branchId = activeBlock.position.branchId; // Lock to original branch
            }
        }

        if (nextIndex !== -1) {
            if (overData?.type === "DROP_ZONE") {
                nextIndex = (overData.index as number) ?? (overData.branchIndex as number) ?? state.blocks.length;
            } else if (over.id === 'drop-zone-root' || over.id === 'drop-zone-1') {
                nextIndex = 1;
            } else if (typeof over.id === 'string' && over.id.includes('drop-zone-')) {
                const parsedIndex = parseInt(over.id.split('-').pop() || '', 10);
                if (!isNaN(parsedIndex)) nextIndex = parsedIndex;
            } else {
                const overIndex = state.blocks.findIndex(b => b.id === over.id);
                if (overIndex !== -1) nextIndex = overIndex + 1;
            }
        }

        // Batch state updates and only update if changed to prevent infinite loops
        if (dragError !== nextError) setDragError(nextError);
        if (projectionBranchId !== branchId) setProjectionBranchId(branchId);
        if (projectionIndex !== (nextIndex === -1 ? null : nextIndex)) setProjectionIndex(nextIndex === -1 ? null : nextIndex);
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
        const finalBranchId = projectionBranchId;
        const finalIndex = projectionIndex;

        setActiveDragState(null);
        setDragError(null);
        setProjectionIndex(null);

        if (!over) return;

        const isNewBlock = active.data.current?.type === "BLOCK_TEMPLATE";

        if (isNewBlock) {
            const blockType = active.data.current?.blockType;
            if (blockType && finalIndex !== null) {
                if (validation.isBlockAllowedInBranch(blockType, finalBranchId)) {
                    actions.insertBlock(blockType, finalIndex, finalBranchId);
                }
            }
            return;
        }

        if (active.id !== over.id && !over.id.toString().startsWith('drop-zone-')) {
            actions.reorderBlocks(active.id as string, over.id as string);
        }
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
            collisionDetection={collisionDetection}
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
                    projectionBranchId={projectionBranchId}
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
                    <div className="relative group">
                        <div className={`opacity-90 rotate-2 cursor-grabbing transition-opacity duration-200 ${dragError ? 'opacity-40 grayscale-[0.5]' : ''}`} style={{ width: CANVAS_BLOCK_WIDTH }}>
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
                                className={`shadow-xl ${dragError ? 'border-danger-400' : ''}`}
                            />
                        </div>

                        {dragError && (
                            <div
                                className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl shadow-2xl min-w-[220px] animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300 z-[100]"
                                style={{ backgroundColor: ERROR_TOOLTIP_COLORS.background, color: ERROR_TOOLTIP_COLORS.text }}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon icon="lucide:alert-circle" className="shrink-0" width={20} height={20} />
                                    <span className="text-sm font-semibold leading-tight">{dragError}</span>
                                </div>
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45" style={{ backgroundColor: ERROR_TOOLTIP_COLORS.background }} />
                            </div>
                        )}
                    </div>
                ) : null}

                {activeDragState?.kind === 'CANVAS' ? (
                    <div className={`opacity-90 rotate-2 cursor-grabbing transition-opacity duration-200 ${dragError ? 'opacity-40 grayscale-[0.5]' : ''}`} style={{ width: CANVAS_BLOCK_WIDTH }}>
                        <CanvasBlockCard
                            block={activeDragState.item}
                            isSelected={true}
                            className={`shadow-xl ${dragError ? 'border-danger-400' : ''}`}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
