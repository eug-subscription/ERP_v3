import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useEffect, useRef } from "react";
import { StartNode } from "./StartNode";
import { ConnectionLine } from "./ConnectionLine";
import { EmptyCanvasState } from "./EmptyCanvasState";
import { CanvasBlock } from "./CanvasBlock";
import { DropZone } from "./DropZone";
import { CanvasBlock as CanvasBlockType } from "../../../../types/workflow"; // Import type alias to avoid conflict

import { BlockLibraryItem } from "../../../../data/block-ui-categories";
import {
    CONNECTION_LINE_HEIGHT,
    CONNECTOR_AREA_HEIGHT,
    CONNECTION_GAP_HEIGHT
} from "../constants";

interface WorkflowCanvasProps {
    className?: string;
    blocks?: CanvasBlockType[];
    selectedBlockId?: string | null;
    lastAddedBlockId?: string | null;
    onBlockSelect?: (blockId: string | null) => void;

    // New props for drag projection
    activeLibraryItem?: BlockLibraryItem | null;
    projectionIndex?: number | null;
}

export function WorkflowCanvas({
    className = "",
    blocks = [],
    selectedBlockId,
    lastAddedBlockId,
    onBlockSelect,
    activeLibraryItem,
    projectionIndex
}: WorkflowCanvasProps) {

    const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    // Scroll logic...
    useEffect(() => {
        if (lastAddedBlockId) {
            const timer = setTimeout(() => {
                const element = blockRefs.current.get(lastAddedBlockId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [lastAddedBlockId]);

    // PREPARE BLOCKS FOR RENDERING
    // 1. Filter out start node
    const draggableBlocks = blocks.filter(b => b.id !== 'start-node');

    // 2. Inject Placeholder if dragging from library
    if (activeLibraryItem && projectionIndex !== null && projectionIndex !== undefined) {
        const placeholderBlock: CanvasBlockType = {
            id: `placeholder-${activeLibraryItem.type}`, // ID distinct from drag source
            type: activeLibraryItem.type,
            label: activeLibraryItem.label,
            category: 'PROCESSING',
            isEnabled: true,
            position: { id: 'temp', branchId: 'main', index: projectionIndex },
            validationState: 'valid'
        };

        // Adjust index for start-node (Start node is conceptually index 0, but filtered out)
        // projectionIndex is 1-based from the root drop zone.
        // If projectionIndex is 1 (after start node), insert at index 0 of draggableBlocks.
        const insertAt = Math.max(0, projectionIndex - 1);
        draggableBlocks.splice(insertAt, 0, placeholderBlock);
    }

    const hasBlocks = draggableBlocks.length > 0;

    return (
        <div
            className={`flex-1 relative bg-background overflow-hidden flex flex-col items-center ${className}`}
            // Dot grid background pattern using radial-gradient with theme variable
            style={{
                backgroundImage: "radial-gradient(circle, var(--heroui-default-200) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
            }}
        >
            <div className="w-full max-w-4xl h-full overflow-y-auto p-8 flex flex-col items-center gap-0">
                {/* Start Node Always Visible */}
                <div className="flex flex-col items-center w-full">
                    <StartNode />
                    {/* Connection logic moved to Connector Area 1 */}
                </div>

                {/* Conditional Rendering: Empty State vs Block List */}
                {!hasBlocks ? (
                    <EmptyCanvasState />
                ) : (
                    <div className="flex-1 w-full flex flex-col items-center">
                        {/* Connector Area 1: Between StartNode and First Block */}
                        <div
                            className="relative w-full flex justify-center items-center -mt-[2px]"
                            style={{ height: CONNECTION_GAP_HEIGHT }}
                        >
                            {/* Continuous Line */}
                            <div className="absolute inset-y-0 flex items-center justify-center">
                                <ConnectionLine height={CONNECTION_LINE_HEIGHT} animated={false} />
                            </div>
                            <DropZone
                                id="drop-zone-1"
                                className="absolute inset-0 z-10"
                                baseHeight="h-full"
                                hideVisuals={!!activeLibraryItem}
                            />
                        </div>

                        <SortableContext
                            items={draggableBlocks.map(b => b.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {draggableBlocks.map((block, index) => {
                                // draggableBlocks[0] is index 1 in the full list
                                const actualIndex = index + 1;
                                return (
                                    <div
                                        key={block.id}
                                        ref={(el) => {
                                            if (el) blockRefs.current.set(block.id, el);
                                            else blockRefs.current.delete(block.id);
                                        }}
                                        className="flex flex-col items-center w-full"
                                    >
                                        <CanvasBlock
                                            block={block}
                                            isSelected={block.id === selectedBlockId}
                                            onSelect={(id) => onBlockSelect?.(id)}
                                        />

                                        {/* Connector Area: Merges ConnectionLine and DropZone for continuous flow */}
                                        {index < draggableBlocks.length - 1 ? (
                                            <div
                                                className="relative w-full flex justify-center items-center"
                                                style={{ height: CONNECTOR_AREA_HEIGHT }}
                                            >
                                                {/* Continuous Line (Background) */}
                                                <div className="absolute inset-y-0 flex items-center justify-center">
                                                    <ConnectionLine height={CONNECTOR_AREA_HEIGHT} animated={false} />
                                                </div>

                                                {/* Drop Zone (Overlay) */}
                                                <DropZone
                                                    id={`drop-zone-${actualIndex + 1}`}
                                                    className="absolute inset-0 z-10"
                                                    baseHeight="h-full"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full flex justify-center items-center mt-2" style={{ height: CONNECTION_GAP_HEIGHT }}>
                                                <DropZone
                                                    id={`drop-zone-${actualIndex + 1}`}
                                                    baseHeight="h-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </SortableContext>
                    </div>
                )}
            </div>
        </div>
    );
}
