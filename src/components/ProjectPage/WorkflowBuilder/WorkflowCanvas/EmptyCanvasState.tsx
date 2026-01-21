import { Icon } from "@iconify/react";
import { DropZone } from "./DropZone";

export function EmptyCanvasState() {
    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md animate-fade-in py-8">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                    Build your workflow
                </h3>
                <p className="text-sm text-default-500 max-w-xs mx-auto">
                    Drag blocks from the library on the left to start building your process.
                </p>
            </div>

            <div className="relative w-full flex flex-col items-center gap-4">
                {/* Visual arrow hinting at drag direction */}
                <Icon
                    icon="lucide:arrow-down"
                    className="w-6 h-6 text-default-300 animate-bounce"
                />

                {/* Prominent Drop Zone for the first block */}
                <DropZone
                    id="drop-zone-root"
                    className="h-32 border-2 border-dashed border-default-300 bg-default-50/50 hover:bg-default-100/50 hover:border-primary/50 transition-colors"
                    baseHeight="h-32"
                    label="Drop first block here"
                    alwaysVisible={true}
                />
            </div>
        </div>
    );
}
