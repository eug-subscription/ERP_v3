import { useQuery } from '@tanstack/react-query';
import { mockModifierReasonCodes } from '../data/mock-modifier-reason-codes';
import { ModifierReasonCode } from '../types/pricing';
import { MOCK_API_DELAY_MS, QUERY_STALE_TIME_EXTENDED_MS } from '../constants/pricing';

async function fetchModifierReasonCodes(activeOnly: boolean = true): Promise<ModifierReasonCode[]> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY_MS));

    // Always return a new array reference to ensure TanStack Query detects changes
    const data = [...mockModifierReasonCodes];

    if (activeOnly) {
        return data.filter(r => r.active);
    }

    return data;
}

/**
 * Hook to access available Modifier Reason Codes from the API.
 * @param activeOnly Whether to return only active reason codes (default: true).
 */
export function useModifierReasonCodes(activeOnly: boolean = true) {
    return useQuery({
        queryKey: ['modifierReasonCodes', { activeOnly }],
        queryFn: () => fetchModifierReasonCodes(activeOnly),
        staleTime: QUERY_STALE_TIME_EXTENDED_MS,
    });
}
