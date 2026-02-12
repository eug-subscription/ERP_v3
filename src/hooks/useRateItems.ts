import { useQuery } from '@tanstack/react-query';
import { mockRateItems } from '../data/mock-rate-items';
import { RateItem } from '../types/pricing';
import { MOCK_API_DELAY_MS, QUERY_STALE_TIME_MS } from '../constants/pricing';

async function fetchRateItems(): Promise<RateItem[]> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY_MS));
    return [...mockRateItems]; // Return copy to ensure React Query detects changes
}

/**
 * Hook to access available Rate Items from the API.
 */
export function useRateItems() {
    return useQuery({
        queryKey: ['rateItems'],
        queryFn: fetchRateItems,
        staleTime: QUERY_STALE_TIME_MS,
    });
}
