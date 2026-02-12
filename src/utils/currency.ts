import { Currency } from "../types/pricing";

/**
 * Returns the appropriate twemoji flag icon for a given currency.
 * Used for visual consistency across the pricing module.
 */
export function getCurrencyFlagIcon(currency: Currency): string {
    const icons: Record<Currency, string> = {
        EUR: 'twemoji:flag-european-union',
        GBP: 'twemoji:flag-united-kingdom',
        USD: 'twemoji:flag-united-states',
    };
    return icons[currency];
}

/**
 * Returns the currency symbol for a given currency code.
 * @param currency - ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP')
 * @returns The currency symbol (e.g., '$', '€', '£')
 */
export function getCurrencySymbol(currency: string): string {
    switch (currency) {
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        default: return '';
    }
}
