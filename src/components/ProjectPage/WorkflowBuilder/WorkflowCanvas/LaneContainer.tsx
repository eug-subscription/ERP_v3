import { useRef, useEffect, useState } from "react";
import { CanvasBlock } from "../../../../types/workflow";
import { CanvasBlock as CanvasBlockComponent } from "./CanvasBlock";
import { DropZone } from "./DropZone";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CONNECTION_LINE_WIDTH } from "../constants";

/** Lane-specific colors for consistent theming */
const LANE_COLORS = {
    photo: "#3B82F6", // Blue
    video: "#8B5CF6", // Purple
} as const;

/** Fixed SVG coordinate positions for perfect alignment */
const LANE_POSITIONS = {
    photo: 192, // x-coordinate for Photo lane center
    video: 640, // x-coordinate for Video lane center
    containerWidth: 832,
} as const;

/** Spacing constants for compact layout */
const SPACING = {
    splitHeight: 60,   // Height of split curves area
    mergeHeight: 24,   // Height of merge curves area
    dropZoneHeight: 24, // Height of drop zones between blocks
} as const;

interface LaneContainerProps {
    photoBlocks: CanvasBlock[];
    videoBlocks: CanvasBlock[];
    selectedBlockId?: string | null;
    onBlockSelect?: (id: string | null) => void;
    showMergeCurves?: boolean;
    isDraggingMerge?: boolean;
}

/**
 * Container for parallel lanes created by IF/ELSE blocks.
 * Implements two columns with Path A (Photo) and Path B (Video).
 * 
 * Uses a unified SVG background for continuous connection lines from split to merge.
 */
export function LaneContainer({
    photoBlocks,
    videoBlocks,
    selectedBlockId,
    onBlockSelect,
    showMergeCurves = false,
    isDraggingMerge = false
}: LaneContainerProps) {
    const showBottomCurves = showMergeCurves || isDraggingMerge;
    const lanesRef = useRef<HTMLDivElement>(null);
    const [lanesHeight, setLanesHeight] = useState(150);

    // Measure lanes height for dynamic SVG background
    useEffect(() => {
        if (lanesRef.current) {
            const observer = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    setLanesHeight(entry.contentRect.height);
                }
            });
            observer.observe(lanesRef.current);
            return () => observer.disconnect();
        }
    }, []);

    const mergeHeight = showBottomCurves ? SPACING.mergeHeight : 0;
    const totalHeight = SPACING.splitHeight + lanesHeight + mergeHeight;

    return (
        <div className="relative w-[832px] flex flex-col items-center -mt-2">
            {/* Unified SVG background for all connection lines */}
            <svg
                width={LANE_POSITIONS.containerWidth}
                height={totalHeight}
                viewBox={`0 0 ${LANE_POSITIONS.containerWidth} ${totalHeight}`}
                className="absolute top-0 left-0 pointer-events-none overflow-visible"
                style={{ zIndex: 0 }}
            >
                {/* Photo Lane (Path A) - Complete continuous path with smooth S-curves */}
                <path
                    d={`M 416 0 
                        L 416 5 
                        C 416 35, ${LANE_POSITIONS.photo} 25, ${LANE_POSITIONS.photo} 55 
                        L ${LANE_POSITIONS.photo} ${SPACING.splitHeight + lanesHeight - 8}
                        ${showBottomCurves ? `
                        C ${LANE_POSITIONS.photo} ${SPACING.splitHeight + lanesHeight + 12}, 416 ${SPACING.splitHeight + lanesHeight + 2}, 416 ${SPACING.splitHeight + lanesHeight + 20}
                        L 416 ${totalHeight}
                        ` : ''}`}
                    fill="none"
                    stroke={LANE_COLORS.photo}
                    strokeWidth={CONNECTION_LINE_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Video Lane (Path B) - Complete continuous path with smooth S-curves */}
                <path
                    d={`M 416 0 
                        L 416 5 
                        C 416 35, ${LANE_POSITIONS.video} 25, ${LANE_POSITIONS.video} 55 
                        L ${LANE_POSITIONS.video} ${SPACING.splitHeight + lanesHeight - 8}
                        ${showBottomCurves ? `
                        C ${LANE_POSITIONS.video} ${SPACING.splitHeight + lanesHeight + 12}, 416 ${SPACING.splitHeight + lanesHeight + 2}, 416 ${SPACING.splitHeight + lanesHeight + 20}
                        L 416 ${totalHeight}
                        ` : ''}`}
                    fill="none"
                    stroke={LANE_COLORS.video}
                    strokeWidth={CONNECTION_LINE_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            {/* Spacer for split curves area */}
            <div style={{ height: SPACING.splitHeight }} className="w-full" />

            {/* Lanes content - positioned to align with SVG coordinates */}
            <div
                ref={lanesRef}
                className="relative w-full flex animate-lane-split"
                style={{ zIndex: 1 }}
            >
                {/* Photo Lane (Path A) - centered at x=192 */}
                <div
                    className="flex flex-col items-center"
                    style={{
                        width: LANE_POSITIONS.photo * 2,
                        paddingLeft: 32,
                        paddingRight: 32,
                    }}
                >
                    <div className="relative flex flex-col items-center w-full mb-1">
                        <span
                            className="text-[10px] font-semibold text-default-500 uppercase tracking-[0.1em] bg-white dark:bg-content1 shadow-sm px-3 py-1 rounded border-l-2"
                            style={{ borderLeftColor: LANE_COLORS.photo }}
                        >
                            Path A (Photo)
                        </span>
                    </div>

                    <div className="w-full flex flex-col items-center">
                        <SortableContext items={photoBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                            {/* Initial insertion point in lane */}
                            <div className="relative w-full flex justify-center items-center" style={{ height: SPACING.dropZoneHeight }}>
                                <DropZone
                                    id="photo-drop-zone-0"
                                    data={{ branchId: 'photo', branchIndex: 0 }}
                                    className="absolute inset-x-0 inset-y-0 z-10"
                                    baseHeight="h-full"
                                    label="Drop Photo Block"
                                    isValid={!isDraggingMerge}
                                    disabled={isDraggingMerge}
                                />
                            </div>

                            {photoBlocks.map((block, index) => (
                                <div key={block.id} className="flex flex-col items-center w-full">
                                    <CanvasBlockComponent
                                        block={block}
                                        isSelected={block.id === selectedBlockId}
                                        onSelect={(id) => onBlockSelect?.(id)}
                                    />

                                    <div className="relative w-full flex justify-center items-center" style={{ height: SPACING.dropZoneHeight }}>
                                        <DropZone
                                            id={`photo-drop-zone-${index + 1}`}
                                            data={{ branchId: 'photo', branchIndex: index + 1 }}
                                            className="absolute inset-x-0 inset-y-0 z-10"
                                            baseHeight="h-full"
                                            label="Drop Photo Block"
                                            isValid={!isDraggingMerge}
                                            disabled={isDraggingMerge}
                                        />
                                    </div>
                                </div>
                            ))}
                        </SortableContext>
                    </div>
                </div>

                {/* Video Lane (Path B) - centered at x=640 */}
                <div
                    className="flex flex-col items-center"
                    style={{
                        width: (LANE_POSITIONS.containerWidth - LANE_POSITIONS.video) * 2,
                        marginLeft: 'auto',
                        paddingLeft: 32,
                        paddingRight: 32,
                    }}
                >
                    <div className="relative flex flex-col items-center w-full mb-1">
                        <span
                            className="text-[10px] font-semibold text-default-500 uppercase tracking-[0.1em] bg-white dark:bg-content1 shadow-sm px-3 py-1 rounded border-l-2"
                            style={{ borderLeftColor: LANE_COLORS.video }}
                        >
                            Path B (Video)
                        </span>
                    </div>

                    <div className="w-full flex flex-col items-center">
                        <SortableContext items={videoBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                            {/* Initial insertion point in lane */}
                            <div className="relative w-full flex justify-center items-center" style={{ height: SPACING.dropZoneHeight }}>
                                <DropZone
                                    id="video-drop-zone-0"
                                    data={{ branchId: 'video', branchIndex: 0 }}
                                    className="absolute inset-x-0 inset-y-0 z-10"
                                    baseHeight="h-full"
                                    label="Drop Video Block"
                                    isValid={!isDraggingMerge}
                                    disabled={isDraggingMerge}
                                />
                            </div>

                            {videoBlocks.map((block, index) => (
                                <div key={block.id} className="flex flex-col items-center w-full">
                                    <CanvasBlockComponent
                                        block={block}
                                        isSelected={block.id === selectedBlockId}
                                        onSelect={(id) => onBlockSelect?.(id)}
                                    />

                                    <div className="relative w-full flex justify-center items-center" style={{ height: SPACING.dropZoneHeight }}>
                                        <DropZone
                                            id={`video-drop-zone-${index + 1}`}
                                            data={{ branchId: 'video', branchIndex: index + 1 }}
                                            className="absolute inset-x-0 inset-y-0 z-10"
                                            baseHeight="h-full"
                                            label="Drop Video Block"
                                            isValid={!isDraggingMerge}
                                            disabled={isDraggingMerge}
                                        />
                                    </div>
                                </div>
                            ))}
                        </SortableContext>
                    </div>
                </div>
            </div>

            {/* Spacer for merge curves area */}
            {showBottomCurves && <div style={{ height: SPACING.mergeHeight }} className="w-full" />}
        </div>
    );
}
