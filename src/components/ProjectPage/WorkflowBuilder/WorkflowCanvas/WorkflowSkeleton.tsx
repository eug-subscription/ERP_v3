import { Skeleton } from "@heroui/react";
import { CanvasBlockSkeleton } from "./CanvasBlockSkeleton";
import { CONNECTOR_AREA_HEIGHT } from "../constants";

/**
 * Full workflow canvas skeleton.
 * Displays a few block skeletons connected by lines.
 */
export function WorkflowSkeleton() {
    return (
        <div className="flex-1 w-full flex flex-col items-center">
            {/* Start Node Skeleton */}
            <Skeleton className="w-48 h-10 rounded-2xl mb-8" />

            {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center w-full">
                    <CanvasBlockSkeleton />

                    {i < 3 && (
                        <div
                            className="relative w-full flex justify-center items-center"
                            style={{ height: CONNECTOR_AREA_HEIGHT }}
                        >
                            <div className="w-[1px] h-full bg-default-200" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
