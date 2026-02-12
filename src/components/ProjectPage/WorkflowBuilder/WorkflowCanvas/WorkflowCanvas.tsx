import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useEffect, useRef } from "react";
import { StartNode } from "./StartNode";
import { ConnectionLine } from "./ConnectionLine";
import { EmptyCanvasState } from "./EmptyCanvasState";
import { CanvasBlock } from "./CanvasBlock";
import { WorkflowSkeleton } from "./WorkflowSkeleton";
import { DropZone } from "./DropZone";
import { CanvasBlock as CanvasBlockType } from "../../../../types/workflow"; // Import type alias to avoid conflict

import { BlockLibraryItem } from "../../../../data/block-ui-categories";
import {
    CONNECTION_LINE_HEIGHT,
    CONNECTOR_AREA_HEIGHT,
    CONNECTION_GAP_HEIGHT,
    MERGE_ZONE_HEIGHT_EXPANDED,
    MERGE_ZONE_MARGIN_TOP_EXPANDED,
    CANVAS_BLOCK_WIDTH,
    START_NODE_ID,
    PLACEHOLDER_PREFIX,
    CANVAS_DOT_GRID_SIZE
} from "../constants";
import { LaneContainer } from "./LaneContainer";
import { SCROLL_DELAY_MS } from "../../../../constants/ui-tokens";

interface WorkflowCanvasProps {
    className?: string;
    blocks?: CanvasBlockType[];
    selectedBlockId?: string | null;
    lastAddedBlockId?: string | null;
    onBlockSelect?: (blockId: string | null) => void;

    // New props for drag projection
    activeLibraryItem?: BlockLibraryItem | null;
    projectionIndex?: number | null;
    projectionBranchId?: 'main' | 'photo' | 'video';
    isLoading?: boolean;
}

export function WorkflowCanvas({
    className = "",
    blocks = [],
    selectedBlockId,
    lastAddedBlockId,
    onBlockSelect,
    activeLibraryItem,
    projectionIndex,
    projectionBranchId = 'main',
    isLoading = false
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
            }, SCROLL_DELAY_MS);
            return () => clearTimeout(timer);
        }
    }, [lastAddedBlockId]);

    // PREPARE BLOCKS FOR RENDERING
    // 1. Filter out start node
    const realBlocks = blocks.filter(b => b.id !== START_NODE_ID && !b.id.startsWith(PLACEHOLDER_PREFIX));

    // 2. Determine flow split points based only on REAL blocks (prevents layout loops during IF_ELSE drag)
    const ifElseIndex = realBlocks.findIndex(b => b.type === 'IF_ELSE');
    const mergeIndex = realBlocks.findIndex(b => b.type === 'MERGE');

    // 3. Inject Placeholder if dragging from library
    let placeholderBlock: CanvasBlockType | null = null;
    if (activeLibraryItem && projectionIndex !== null && projectionIndex !== undefined) {
        placeholderBlock = {
            id: `${PLACEHOLDER_PREFIX}${activeLibraryItem.type}`,
            type: activeLibraryItem.type,
            label: activeLibraryItem.label,
            category: 'PROCESSING',
            isEnabled: true,
            position: { id: 'temp', branchId: projectionBranchId, index: projectionIndex },
            validationState: 'valid'
        };
    }

    const hasBlocks = realBlocks.length > 0 || !!placeholderBlock;

    return (
        <div
            className={`flex-1 relative bg-surface overflow-hidden flex flex-col items-center ${className}`}
            style={{
                backgroundImage: "radial-gradient(circle, var(--heroui-default-200) 1px, transparent 1px)",
                backgroundSize: `${CANVAS_DOT_GRID_SIZE}px ${CANVAS_DOT_GRID_SIZE}px`,
            }}
        >
            <div className="w-full max-w-4xl h-full overflow-y-auto p-8 flex flex-col items-center gap-0">
                {!isLoading && (
                    <div className="flex flex-col items-center w-full">
                        <StartNode />
                    </div>
                )}

                {!hasBlocks && !isLoading ? (
                    <EmptyCanvasState />
                ) : isLoading ? (
                    <WorkflowSkeleton />
                ) : (
                    <div className="flex-1 w-full flex flex-col items-center">
                        <div
                            className="relative w-full flex justify-center items-center -mt-[2px]"
                            style={{ height: CONNECTION_GAP_HEIGHT }}
                        >
                            <div className="absolute inset-y-0 flex items-center justify-center">
                                <ConnectionLine height={CONNECTION_LINE_HEIGHT} animated={false} />
                            </div>
                            <DropZone
                                id="drop-zone-root"
                                data={{ branchId: 'main', index: 1 }}
                                className="absolute inset-y-0 z-10 left-1/2 -translate-x-1/2"
                                style={{ width: CANVAS_BLOCK_WIDTH }}
                                baseHeight="h-full"
                                hideVisuals={!!activeLibraryItem}
                            />
                        </div>

                        {(() => {
                            // SPLIT FLOW INTO SECTIONS

                            // 1. TOP MAIN (Before IF_ELSE or MERGE)
                            let topEndIndex = realBlocks.length;
                            if (ifElseIndex !== -1) topEndIndex = ifElseIndex + 1;
                            else if (mergeIndex !== -1) topEndIndex = mergeIndex;

                            const mainBlocksTop = realBlocks.slice(0, topEndIndex);
                            const projectionIdx = projectionIndex ?? 0;

                            if (placeholderBlock && projectionBranchId === 'main' && projectionIdx <= topEndIndex) {
                                const idxInMain = Math.max(0, projectionIdx - 1);
                                if (idxInMain <= mainBlocksTop.length) {
                                    mainBlocksTop.splice(idxInMain, 0, placeholderBlock);
                                }
                            }

                            // 2. PARALLEL BRANCHES
                            const photoBlocks = realBlocks.filter(b => b.position.branchId === 'photo');
                            if (placeholderBlock && projectionBranchId === 'photo') {
                                photoBlocks.splice(Math.max(0, projectionIdx), 0, placeholderBlock);
                            }

                            const videoBlocks = realBlocks.filter(b => b.position.branchId === 'video');
                            if (placeholderBlock && projectionBranchId === 'video') {
                                videoBlocks.splice(Math.max(0, projectionIdx), 0, placeholderBlock);
                            }

                            // 3. BOTTOM MAIN (After merge or conditional fallthrough)
                            let mainBlocksBottom: CanvasBlockType[] = [];
                            // Detect if we're dragging a Merge block (either as placeholder or from library)
                            const isPlaceholderMerge = placeholderBlock?.type === 'MERGE' || activeLibraryItem?.type === 'MERGE';

                            // Extract the real Merge block separately so it can be rendered at the junction
                            const realMergeBlock = mergeIndex !== -1 ? realBlocks[mergeIndex] : null;

                            if (mergeIndex !== -1) {
                                // Only include blocks AFTER the Merge (not the Merge itself)
                                mainBlocksBottom = realBlocks.slice(mergeIndex + 1).filter(b => b.position.branchId === 'main');
                            } else if (ifElseIndex !== -1) {
                                mainBlocksBottom = realBlocks.filter((b, idx) =>
                                    idx > ifElseIndex && b.position.branchId === 'main'
                                );
                            }

                            if (placeholderBlock && projectionBranchId === 'main' && projectionIdx > topEndIndex && !isPlaceholderMerge) {
                                // Calculate position relative to bottom section start
                                const idxInBottom = projectionIdx - (ifElseIndex !== -1 ? ifElseIndex + 2 : mergeIndex + 1);
                                if (idxInBottom >= 0 && idxInBottom <= mainBlocksBottom.length) {
                                    mainBlocksBottom.splice(idxInBottom, 0, placeholderBlock);
                                } else if (idxInBottom > mainBlocksBottom.length) {
                                    mainBlocksBottom.push(placeholderBlock);
                                }
                            }

                            return (
                                <>
                                    {/* Top Main Section */}
                                    <div className="w-full flex flex-col items-center overflow-visible">
                                        <SortableContext
                                            items={mainBlocksTop.map(b => b.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {mainBlocksTop.map((block, idx) => {
                                                const isPlaceholder = block.id.startsWith(PLACEHOLDER_PREFIX);
                                                const isIfElse = block.type === 'IF_ELSE' && !isPlaceholder;

                                                return (
                                                    <div key={block.id} className="flex flex-col items-center w-full">
                                                        <CanvasBlock
                                                            block={block}
                                                            isSelected={block.id === selectedBlockId}
                                                            onSelect={(id) => onBlockSelect?.(id)}
                                                        />

                                                        {/* Connections & Dropzones - Suppress after IF_ELSE and placeholders */}
                                                        {!isIfElse && !isPlaceholder && (
                                                            <div className="relative w-full flex justify-center items-center" style={{ height: CONNECTOR_AREA_HEIGHT }}>
                                                                <div className="absolute inset-y-0 flex items-center justify-center">
                                                                    <ConnectionLine height={CONNECTOR_AREA_HEIGHT} animated={false} />
                                                                </div>
                                                                <DropZone
                                                                    id={`drop-zone-main-${idx + 1}`}
                                                                    data={{ branchId: 'main', index: realBlocks.indexOf(block) + 2 }}
                                                                    className="absolute inset-y-0 z-10 left-1/2 -translate-x-1/2"
                                                                    style={{ width: CANVAS_BLOCK_WIDTH }}
                                                                    baseHeight="h-full"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </SortableContext>
                                    </div>

                                    {/* Lane Container (Branches) */}
                                    {ifElseIndex !== -1 && (
                                        <>
                                            <LaneContainer
                                                photoBlocks={photoBlocks}
                                                videoBlocks={videoBlocks}
                                                selectedBlockId={selectedBlockId}
                                                onBlockSelect={onBlockSelect}
                                                showMergeCurves={mergeIndex !== -1}
                                                isDraggingMerge={isPlaceholderMerge}
                                            />

                                            {/* Connector before Bottom Section / Rejoin Point */}
                                            <div className="relative w-full flex flex-col items-center">
                                                {/* Merge block offset: -mt-6 pulls block up to visually connect with lane curve tips */}
                                                {/* Render placeholder when dragging */}
                                                {isPlaceholderMerge && placeholderBlock && (
                                                    <div className="w-full flex flex-col items-center -mt-1">
                                                        <CanvasBlock
                                                            block={placeholderBlock}
                                                            isSelected={false}
                                                        />
                                                    </div>
                                                )}

                                                {/* Render the REAL Merge block at the junction point */}
                                                {realMergeBlock && (
                                                    <>
                                                        <div className="w-full flex flex-col items-center -mt-1">
                                                            <CanvasBlock
                                                                block={realMergeBlock}
                                                                isSelected={realMergeBlock.id === selectedBlockId}
                                                                onSelect={(id) => onBlockSelect?.(id)}
                                                            />
                                                        </div>
                                                        {/* Connection line and drop zone after Merge */}
                                                        <div className="relative w-full flex justify-center items-center" style={{ height: CONNECTOR_AREA_HEIGHT }}>
                                                            <div className="absolute inset-y-0 flex items-center justify-center">
                                                                <ConnectionLine height={CONNECTOR_AREA_HEIGHT} animated={false} />
                                                            </div>
                                                            <DropZone
                                                                id="drop-zone-after-merge"
                                                                data={{ branchId: 'main', index: mergeIndex + 2 }}
                                                                className="absolute inset-y-0 z-10 left-1/2 -translate-x-1/2"
                                                                style={{ width: CANVAS_BLOCK_WIDTH }}
                                                                baseHeight="h-full"
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                {/* Merge Drop Zone - expanded height for easy targeting (only when no merge exists) */}
                                                {!realMergeBlock && !isPlaceholderMerge && (
                                                    <div
                                                        className="relative w-full flex justify-center items-center"
                                                        style={{
                                                            height: MERGE_ZONE_HEIGHT_EXPANDED,
                                                            marginTop: MERGE_ZONE_MARGIN_TOP_EXPANDED
                                                        }}
                                                    >
                                                        <DropZone
                                                            id="drop-zone-main-after-lanes"
                                                            data={{ branchId: 'main', index: realBlocks.length + 1 }}
                                                            className="absolute inset-y-0 inset-x-auto z-50 left-1/2 -translate-x-1/2"
                                                            style={{ width: CANVAS_BLOCK_WIDTH }}
                                                            baseHeight="h-full"
                                                            label="Drop Merge Block to Rejoin"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* Bottom Main Section (MERGE onwards) */}
                                    {mainBlocksBottom.length > 0 && (
                                        <div className="w-full flex flex-col items-center">
                                            <SortableContext
                                                items={mainBlocksBottom.map(b => b.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {mainBlocksBottom.map((block, idx) => {
                                                    const isPlaceholder = block.id.startsWith(PLACEHOLDER_PREFIX);

                                                    return (
                                                        <div key={block.id} className="flex flex-col items-center w-full">
                                                            <CanvasBlock
                                                                block={block}
                                                                isSelected={block.id === selectedBlockId}
                                                                onSelect={(id) => onBlockSelect?.(id)}
                                                            />

                                                            {!isPlaceholder && (
                                                                <div className="relative w-full flex justify-center items-center" style={{ height: CONNECTOR_AREA_HEIGHT }}>
                                                                    <div className="absolute inset-y-0 flex items-center justify-center">
                                                                        <ConnectionLine height={CONNECTOR_AREA_HEIGHT} animated={false} />
                                                                    </div>
                                                                    <DropZone
                                                                        id={`drop-zone-post-${idx}`}
                                                                        data={{ branchId: 'main', index: realBlocks.indexOf(block) + 2 }}
                                                                        className="absolute inset-y-0 z-10 left-1/2 -translate-x-1/2"
                                                                        style={{ width: CANVAS_BLOCK_WIDTH }}
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
                                </>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}
