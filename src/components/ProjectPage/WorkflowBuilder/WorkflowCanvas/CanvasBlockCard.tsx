import { Card, Tooltip, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { CanvasBlock as CanvasBlockType } from "../../../../types/workflow";
import { UI_CATEGORIES, BLOCK_LIBRARY } from "../../../../data/block-ui-categories";
import { getBlockLabel } from "../../../../utils/workflow";
import { CANVAS_BLOCK_WIDTH, CANVAS_BLOCK_HEIGHT } from "../constants";

interface CanvasBlockCardProps {
    block: CanvasBlockType;
    className?: string;
    style?: React.CSSProperties;
    isSelected?: boolean;
}

/**
 * Pure UI component for the Canvas Block.
 * Engineered for "Intentional Minimalism" - Compact, information-dense, yet breathable.
 */
export function CanvasBlockCard({ block, isSelected, className, style }: CanvasBlockCardProps) {
    // RESOLVE VISUAL CATEGORY:
    // We must look up the *visual* category from BLOCK_LIBRARY based on the block type.
    // The `block.category` property is the *logical* category (STARTING/PROCESSING) and does not map to colors.
    const libraryItem = BLOCK_LIBRARY.find(item => item.type === block.type);
    const categoryId = libraryItem?.category;

    // Find category metadata for styling
    const categoryMeta = UI_CATEGORIES.find(c => c.id === categoryId);
    const accentColor = categoryMeta?.color || "#9CA3AF"; // Default to gray-400 if not found

    // Validation logic
    const validationStatus = block.validationState || "valid";
    const validationMessage = block.validationMessage || (validationStatus === "valid" ? "Configured correctly" : "Configuration required");

    return (
        <div
            className={cn(
                "group relative select-none outline-none transition-transform active:scale-[0.98]",
                "rounded-xl overflow-hidden", // Double-clip layer 1: Wrapper
                isSelected && "z-10",
                className
            )}
            style={{ ...style, width: CANVAS_BLOCK_WIDTH }}
            aria-label={`Workflow block: ${getBlockLabel(block)}`}
        >
            <Card
                variant="default"
                className={cn(
                    "w-full border border-default shadow-sm hover:shadow-md transition-shadow",
                    "p-0 flex flex-row items-stretch !rounded-xl relative overflow-hidden isolate",
                    "gpu-clipping-fix"
                )}
                style={{ height: CANVAS_BLOCK_HEIGHT }}
            >
                {/* Colored Left Accent Bar */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 z-10 !rounded-l-xl"
                    style={{ backgroundColor: accentColor }}
                />

                <Card.Content className="flex-1 flex flex-row items-center p-0 pl-3 pr-4 gap-2 relative z-0 min-w-0 !rounded-xl overflow-hidden">
                    {/* Drag Handle - Visible gray by default, darker on hover */}
                    <div className="flex items-center justify-center w-6 cursor-grab active:cursor-grabbing shrink-0">
                        <Icon
                            icon="lucide:grip-vertical"
                            width={16}
                            height={16}
                            className="text-muted group-hover:text-foreground transition-colors"
                        />
                    </div>

                    {/* Icon Container */}
                    <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${accentColor}, transparent 85%)`,
                        }}
                    >
                        <Icon
                            icon={categoryMeta?.icon || "lucide:box"}
                            width={16}
                            height={16}
                            style={{ color: accentColor }}
                        />
                    </div>

                    {/* Content Block */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center items-start gap-0">
                        <span className="text-small font-bold text-foreground truncate leading-snug">
                            {getBlockLabel(block)}
                        </span>
                        <span className="text-[10px] text-muted truncate">
                            {categoryMeta?.label || "Uncategorized"}
                        </span>
                    </div>

                    {/* Status/Validation Indicator */}
                    <div className="shrink-0 flex items-center justify-center ml-auto">
                        <Tooltip delay={0} closeDelay={0}>
                            <Tooltip.Trigger>
                                <div className="cursor-help p-1 rounded-full hover:bg-default transition-colors">
                                    {validationStatus === "valid" && (
                                        <Icon icon="lucide:check-circle" width={16} height={16} className="text-muted" />
                                    )}
                                    {(validationStatus === "warning" || validationStatus === "unconfigured") && (
                                        <Icon icon="lucide:alert-circle" width={16} height={16} className="text-warning" />
                                    )}
                                    {validationStatus === "error" && (
                                        <div className="relative flex w-3 h-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-danger"></span>
                                        </div>
                                    )}
                                </div>
                            </Tooltip.Trigger>
                            <Tooltip.Content>{validationMessage}</Tooltip.Content>
                        </Tooltip>
                    </div>
                </Card.Content>
            </Card>

            {/* Selection Border Overlay - Adjusted for perfect concentric curvature */}
            {isSelected && (
                <div className="absolute -inset-[1.5px] rounded-[13.5px] border-2 border-primary pointer-events-none z-50 shadow-[0_0_0_1px_rgba(59,130,246,0.1)]" />
            )}
        </div>
    );
}


