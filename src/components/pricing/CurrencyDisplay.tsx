import { Chip } from "@heroui/react";
import { Currency } from "../../types/pricing";

interface CurrencyDisplayProps {
    amount: number;
    currency: Currency;
    showSymbol?: boolean;
    decimals?: number;
    variant?: "primary" | "secondary" | "tertiary" | "soft";
    color?: "default" | "accent" | "success" | "warning" | "danger";
    size?: "sm" | "md" | "lg";
    className?: string;
}

/**
 * CurrencyDisplay - Formats and displays currency values using HeroUI Chip.
 * Follows erp_pricing_spec_v1_7.md and project coding standards.
 */
export function CurrencyDisplay({
    amount,
    currency,
    showSymbol = true,
    decimals = 2,
    variant = "secondary",
    color = "default",
    size = "md",
    className = "",
}: CurrencyDisplayProps) {
    // Format the currency using Intl.NumberFormat
    const formatter = new Intl.NumberFormat("en-US", {
        style: showSymbol ? "currency" : "decimal",
        currency: currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    const formattedValue = formatter.format(amount);

    return (
        <Chip
            variant={variant}
            color={color}
            size={size}
            className={`font-mono ${className}`}
        >
            {formattedValue}
        </Chip>
    );
}
