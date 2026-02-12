import { useCallback } from "react";
import { useRateItems } from "./useRateItems";
import { RateItem } from "../types/pricing";

/**
 * Hook to provide lookup capabilities for Rate Items by their ID.
 * Centralizes the find logic to avoid duplication across List components.
 */
export function useRateItemLookup() {
    const { data: rateItems, isLoading } = useRateItems();

    const getRateItemName = useCallback((id: string): string => {
        return rateItems?.find(item => item.id === id)?.name || id;
    }, [rateItems]);

    const getRateItem = useCallback((id: string): RateItem | undefined => {
        return rateItems?.find(item => item.id === id);
    }, [rateItems]);

    return {
        getRateItemName,
        getRateItem,
        rateItems,
        isLoading
    };
}
