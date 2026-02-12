import { useQuery } from '@tanstack/react-query';
import { mockRateCards } from '../data/mock-rate-cards';
import { RateCard, Currency } from '../types/pricing';
import { MOCK_API_DELAY_MS, QUERY_STALE_TIME_MS } from '../constants/pricing';

async function fetchRateCards(currency?: Currency): Promise<RateCard[]> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY_MS));

    // Deep copy including nested entries array AND individual entry objects
    const cards = mockRateCards.map(card => ({
        ...card,
        entries: card.entries.map(entry => ({ ...entry }))
    }));

    if (currency) {
        return cards.filter(card => card.currency === currency);
    }

    return cards;
}

/**
 * Hook to access available Rate Cards, optionally filtered by currency.
 * @param currency Optional currency code to filter cards.
 */
export function useRateCards(currency?: Currency) {
    return useQuery({
        queryKey: ['rateCards', currency || 'all'],
        queryFn: () => fetchRateCards(currency),
        staleTime: QUERY_STALE_TIME_MS,
    });
}
