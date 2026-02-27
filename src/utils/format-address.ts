import { countries } from '../constants/countries';
import type { AddressPayload } from '../types/order';

/**
 * Returns the full country name for a given ISO 3166-1 alpha-2 code.
 * Falls back to the code itself if no match is found.
 */
export function getCountryName(code: string): string {
    return countries.find((c) => c.code === code)?.name ?? code;
}

/**
 * Composes an AddressPayload into a single human-readable string.
 * Empty or nullish fields are omitted.
 * Example: "Johannisstraße 20, Hinterhaus 2. OG, 10117 Berlin, Germany"
 */
export function formatAddress(address: AddressPayload): string {
    const parts: string[] = [
        address.line1,
        address.line2,
        [address.postcode, address.city].filter(Boolean).join(' '),
        address.country ? getCountryName(address.country) : '',
    ];

    return parts.filter(Boolean).join(', ');
}
