export type CountryEntry = { id: string; name: string; code: string };

/**
 * Static country lookup list.
 *
 * `id` = full country name — used as the ComboBox selectedKey so that
 * PersonalInfo.country (stored as a full name) maps directly.
 * `code` = ISO 3166-1 alpha-2 — kept for display/flag purposes.
 */
export const countries: CountryEntry[] = [
    { id: 'Australia', name: 'Australia', code: 'AU' },
    { id: 'France', name: 'France', code: 'FR' },
    { id: 'Germany', name: 'Germany', code: 'DE' },
    { id: 'India', name: 'India', code: 'IN' },
    { id: 'Italy', name: 'Italy', code: 'IT' },
    { id: 'Netherlands', name: 'Netherlands', code: 'NL' },
    { id: 'Spain', name: 'Spain', code: 'ES' },
    { id: 'United Kingdom', name: 'United Kingdom', code: 'GB' },
    { id: 'United States', name: 'United States', code: 'US' },
];
