import { Chip, Tooltip, Separator } from "@heroui/react";
import { PRICING_LABEL_CLASSES } from "../../constants/pricing";
import { TOOLTIP_DELAY } from "../../constants/ui-tokens";

interface ModifierBadgeProps {
    value: number; // e.g., 1.5 for +50%, 0.8 for -20%
    reasonCode?: string | null;
    type: "client" | "cost";
    size?: "sm" | "md" | "lg";
    className?: string;
}

/**
 * ModifierBadge - Displays a price modifier as a percentage badge.
 * Color-coded: green for discounts (< 1.0), warning (orange) for premiums (> 1.0).
 * Shows tooltip with reason code and effective multiplier if provided.
 */
export function ModifierBadge({
    value,
    reasonCode,
    type,
    size = "sm",
    className = "",
}: ModifierBadgeProps) {
    const percentageValue = (value - 1) * 100;
    const isNeutral = Math.abs(percentageValue) < 0.01;
    const isSurcharge = percentageValue > 0;
    const isDiscount = percentageValue < 0;

    // Semantic colors based on business impact:
    // Revenue (client): increase = good (green), decrease = bad (red)
    // Expense (cost): increase = bad (red), decrease = good (green)
    let color: "default" | "accent" | "success" | "warning" | "danger" = "default";

    if (type === "client") {
        // Revenue: more = green, less = red
        if (isSurcharge) color = "success";
        if (isDiscount) color = "danger";
    } else {
        // Expense: more = red, less = green
        if (isSurcharge) color = "danger";
        if (isDiscount) color = "success";
    }

    const sign = !isNeutral && isSurcharge ? "+" : "";
    const formattedValue = `${sign}${percentageValue.toFixed(0)}%`;

    const badgeTypeLabel = type === "client" ? "Markup" : "Cost Adj.";

    const content = (
        <Chip
            variant={isNeutral ? "soft" : "primary"}
            color={color}
            size={size}
            className={`font-mono font-bold ${className}`}
        >
            {isNeutral ? "Standard" : formattedValue}
        </Chip>
    );

    if (reasonCode || !isNeutral) {
        return (
            <Tooltip delay={TOOLTIP_DELAY}>
                <Tooltip.Trigger>
                    <div className="inline-block cursor-help hover:opacity-80 transition-opacity">
                        {content}
                    </div>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <Tooltip.Arrow />
                    <div className="flex flex-col gap-1 p-2 min-w-40">
                        <div className="flex items-center justify-between gap-4">
                            <span className={PRICING_LABEL_CLASSES}>
                                {type} {badgeTypeLabel}
                            </span>
                            <span className="text-xs font-mono font-bold">
                                ×{value.toFixed(2)}
                            </span>
                        </div>
                        <Separator className="my-1 opacity-20" />
                        {reasonCode ? (
                            <div className="flex flex-col">
                                <span className={PRICING_LABEL_CLASSES}>
                                    Reason
                                </span>
                                <span className="text-xs font-medium">{reasonCode}</span>
                            </div>
                        ) : !isNeutral ? (
                            <span className="text-xs italic text-danger font-medium animate-pulse-subtle">
                                No reason provided
                            </span>
                        ) : null}
                    </div>
                </Tooltip.Content>
            </Tooltip>
        );
    }

    return content;
}
