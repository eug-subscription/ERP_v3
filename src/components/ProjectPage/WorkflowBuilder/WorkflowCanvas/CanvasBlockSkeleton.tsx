import { Card, Skeleton, cn } from "@heroui/react";
import { CANVAS_BLOCK_WIDTH, CANVAS_BLOCK_HEIGHT } from "../constants";

interface CanvasBlockSkeletonProps {
    className?: string;
}

/**
 * Skeleton loader for a Canvas Block.
 * Used during initial workflow loading or fetching state.
 */
export function CanvasBlockSkeleton({ className }: CanvasBlockSkeletonProps) {
    return (
        <div
            className={cn(
                "rounded-xl overflow-hidden",
                className
            )}
            style={{ width: CANVAS_BLOCK_WIDTH }}
        >
            <Card
                variant="default"
                className={cn(
                    "w-full border border-default p-0 flex flex-row items-stretch !rounded-xl relative overflow-hidden isolate shadow-sm",
                    "gpu-clipping-fix"
                )}
                style={{ height: CANVAS_BLOCK_HEIGHT }}
            >
                {/* Colored Left Accent Bar Placeholder */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 z-10 !rounded-l-xl bg-default-200" />

                <Card.Content className="flex-1 flex flex-row items-center p-0 pl-3 pr-4 gap-2 relative z-0 min-w-0 !rounded-xl overflow-hidden">
                    {/* Grip/Handle Placeholder */}
                    <div className="flex items-center justify-center w-6 shrink-0">
                        <Skeleton className="w-4 h-6 rounded-md" />
                    </div>

                    {/* Icon Container Placeholder */}
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />

                    {/* Content Block Placeholder */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center items-start gap-1">
                        <Skeleton className="w-24 h-4 rounded-md" />
                        <Skeleton className="w-16 h-2 rounded-md" />
                    </div>

                    {/* Status Indicator Placeholder */}
                    <Skeleton className="w-6 h-6 rounded-full shrink-0 ml-auto" />
                </Card.Content>
            </Card>
        </div>
    );
}
