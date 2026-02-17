
/**
 * Utility functions for consistent formatting across the application.
 */

/**
 * Formats a number as a percentage string.
 * @param value The value to format (e.g., 0.15 for 15% or 15 depending on context)
 * @param precision Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, precision: number = 1): string {
    return `${value.toFixed(precision)}%`;
}

/**
 * Formats a number for currency display (without the currency symbol).
 * @param value The amount to format
 * @param precision Number of decimal places
 * @returns Formatted number string
 */
export function formatAmount(value: number, precision: number = 2): string {
    return value.toFixed(precision);
}

/**
 * Formats a number as currency with a plus/minus sign.
 * @param value The amount to format
 * @param currency The currency symbol or code
 * @param precision Number of decimal places
 * @returns Formatted string (e.g., "+15.00 EUR")
 */
export function formatSignedCurrency(value: number, currency: string, precision: number = 2): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(precision)} ${currency}`;
}

/**
 * Formats a number as a full currency string (symbol + amount).
 * Uses the browser's default locale for number formatting.
 * @param amount The amount to format
 * @param currency ISO 4217 currency code (e.g., "EUR", "USD")
 * @param precision Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "€168.00")
 */
export function formatCurrencyAmount(amount: number, currency: string, precision: number = 2): string {
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
    }).format(amount);
}

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * 1024;

/**
 * Formats a byte count into a human-readable file size string.
 * @param bytes The size in bytes
 * @param precision Number of decimal places (default: 1)
 * @returns Formatted size string (e.g., "2.4 KB", "10.3 MB")
 */
export function formatFileSize(bytes: number, precision: number = 1): string {
    return bytes < BYTES_PER_MB
        ? `${(bytes / BYTES_PER_KB).toFixed(precision)} KB`
        : `${(bytes / BYTES_PER_MB).toFixed(precision)} MB`;
}

