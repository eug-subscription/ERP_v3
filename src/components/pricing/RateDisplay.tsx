import { Currency, UnitType } from "../../types/pricing";
import { CurrencyDisplay } from "./CurrencyDisplay";
import { MARGIN_DANGER_THRESHOLD, MARGIN_DISPLAY_CLASSES } from "../../constants/pricing";

interface RateDisplayProps {
    costRate: number;
    clientRate: number;
    currency: Currency;
    unitType: UnitType;
    showMargin?: boolean;
    showMarginOnly?: boolean;
    className?: string;
    size?: "sm" | "md" | "lg";
}

/**
 * RateDisplay - Displays cost and client rates side by side with unit and optional margin.
 * Follows erp_pricing_spec_v1_7.md Section 7.
 */
export function RateDisplay({
    costRate,
    clientRate,
    currency,
    unitType: _unitType, // Unused but kept for interface consistency
    showMargin: _showMargin = false, // Unused but kept for interface consistency
    showMarginOnly = false,
    className = "",
    size = "md",
}: RateDisplayProps) {
    // Calculate margin %: (client - cost) / client * 100
    const marginPercentage =
        clientRate > 0 ? ((clientRate - costRate) / clientRate) * 100 : 0;

    if (showMarginOnly) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${marginPercentage < MARGIN_DANGER_THRESHOLD ? "bg-danger animate-pulse" : "bg-success"}`} />
                <span
                    className={`${MARGIN_DISPLAY_CLASSES} t-compact ${marginPercentage < MARGIN_DANGER_THRESHOLD ? "text-danger" : "text-success"
                        }`}
                >
                    {marginPercentage.toFixed(1)}%
                </span>
            </div>
        );
    }

    return (
        <div className={`flex items-center ${className}`}>
            {/* Revenue / Client Rate - Fixed width for decimal spine alignment */}
            <div className="w-[88px] flex justify-end">
                <CurrencyDisplay
                    amount={clientRate}
                    currency={currency}
                    size={size}
                    color="accent"
                    variant="soft"
                    className="font-black"
                />
            </div>

            {/* Mathematical Separator - Fixed width for horizontal rhythm */}
            <div className="w-10 flex justify-center">
                <span className="text-default-200 font-light select-none">—</span>
            </div>

            {/* Expense / Cost Rate - Fixed width for decimal spine alignment */}
            <div className="w-[80px] flex justify-start">
                <CurrencyDisplay
                    amount={costRate}
                    currency={currency}
                    size={size}
                    variant="soft"
                    className="font-bold text-default-400/60"
                />
            </div>
        </div>
    );
}
