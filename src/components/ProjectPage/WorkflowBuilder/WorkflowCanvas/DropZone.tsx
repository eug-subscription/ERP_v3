import { useDroppable } from "@dnd-kit/core";
import { cn } from "@heroui/react";

interface DropZoneProps {
    id: string;
    /**
     * Whether the currently dragged item can be validly dropped here.
     * Defaults to true. Parent responsible for validation logic.
     */
    isValid?: boolean;
    className?: string;
    /** Default height when not active. Defaults to 2 (0.5rem) */
    baseHeight?: string;
    /** If true, suppressing active state styles (used when ghost block provides feedback) */
    hideVisuals?: boolean;
    /** If true, show the drop zone even when not being hovered */
    alwaysVisible?: boolean;
    /** Optional label to display when active. Defaults to "Drop Here" */
    label?: string;
    /** Optional data to pass to dnd-kit's useDroppable */
    data?: Record<string, unknown>;
    /** If true, the drop zone will not react to drags */
    disabled?: boolean;
}

export function DropZone({
    id,
    isValid = true,
    className,
    baseHeight = "h-4",
    alwaysVisible = false,
    hideVisuals = false,
    label = "Drop Here",
    data,
    disabled = false
}: DropZoneProps) {
    const { isOver, setNodeRef } = useDroppable({
        id,
        data: {
            type: "DROP_ZONE",
            ...data
        },
        disabled
    });

    const isActive = isOver;
    const showActiveVisuals = isActive && !hideVisuals;

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "w-full transition-all duration-200 ease-out flex items-center justify-center rounded-lg",
                // Base state: small gap, invisible but droppable
                baseHeight,
                // Active state (hovered by drag item)
                showActiveVisuals ? "h-16 my-2" : cn(
                    "hover:opacity-100",
                    !alwaysVisible && "opacity-0"
                ),
                // Styling based on validity
                showActiveVisuals && isValid && "bg-primary/10 border-2 border-dashed border-primary animate-pulse",
                showActiveVisuals && !isValid && "bg-danger/10 border-2 border-dashed border-danger cursor-not-allowed",
                // Additional classes
                className
            )}
            aria-label={isValid ? "Drop block here" : "Cannot drop here"}
        >
            {(showActiveVisuals || alwaysVisible) && (
                <div className={cn(
                    "text-sm font-medium transition-colors",
                    showActiveVisuals ? (isValid ? "text-primary" : "text-danger") : "text-muted"
                )}>
                    {showActiveVisuals && !isValid ? "Invalid Drop" : label}
                </div>
            )}
        </div>
    );
}
