import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RateItem, RateCard, RateCardEntry, ModifierReasonCode } from '../types/pricing';
import { mockRateItems } from '../data/mock-rate-items';
import { mockRateCards } from '../data/mock-rate-cards';

import { mockModifierReasonCodes } from '../data/mock-modifier-reason-codes';

const MOCK_DELAY = 100; // Faster feedback for dev

// Rate Items
export function useCreateRateItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (item: Partial<RateItem>) => {
            await new Promise(r => setTimeout(r, MOCK_DELAY));
            const newItem = { ...item, id: `ri-${Math.random().toString(36).substr(2, 9)}` } as RateItem;
            mockRateItems.push(newItem);
            return newItem;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rateItems'] })
    });
}

export function useUpdateRateItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (item: Partial<RateItem>) => {
            await new Promise(r => setTimeout(r, MOCK_DELAY));
            const index = mockRateItems.findIndex(i => i.id === item.id);
            if (index !== -1) mockRateItems[index] = { ...mockRateItems[index], ...item };
            return mockRateItems[index];
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rateItems'] })
    });
}

// Rate Cards
export function useCreateRateCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (card: Partial<RateCard>) => {
            await new Promise(r => setTimeout(r, MOCK_DELAY));
            const newCard = { ...card, id: `rc-${Math.random().toString(36).substr(2, 9)}`, entries: [] } as RateCard;
            mockRateCards.push(newCard);
            return newCard;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rateCards'] })
    });
}

export function useCreateRateCardEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ cardId, entry }: { cardId: string, entry: Partial<RateCardEntry> }) => {
            await new Promise(r => setTimeout(r, MOCK_DELAY));
            const card = mockRateCards.find(c => c.id === cardId);
            if (!card) throw new Error("Rate Card not found");
            const newEntry = { ...entry, id: `rce-${Math.random().toString(36).substr(2, 9)}`, rateCardId: cardId } as RateCardEntry;
            card.entries.push(newEntry);
            return newEntry;
        },
        onSuccess: () => {
            // Force complete refetch by removing cached data
            queryClient.removeQueries({ queryKey: ['rateCards'] });
            queryClient.invalidateQueries({ queryKey: ['rateCardDetails'] });
        }
    });
}

export function useUpdateRateCardEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ cardId, entry }: { cardId: string, entry: Partial<RateCardEntry> }) => {
            await new Promise(r => setTimeout(r, MOCK_DELAY));
            const card = mockRateCards.find(c => c.id === cardId);
            if (!card) throw new Error("Rate Card not found");
            const index = card.entries.findIndex(e => e.id === entry.id);
            if (index !== -1) {
                card.entries[index] = { ...card.entries[index], ...entry };
            }
            return card.entries[index];
        },
        onSuccess: () => {
            // Force complete refetch by removing cached data
            queryClient.removeQueries({ queryKey: ['rateCards'] });
            queryClient.invalidateQueries({ queryKey: ['rateCardDetails'] });
        }
    });
}

export function useDeleteRateCardEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ cardId, entryId }: { cardId: string, entryId: string }) => {
            await new Promise(r => setTimeout(r, MOCK_DELAY));
            const card = mockRateCards.find(c => c.id === cardId);
            if (!card) throw new Error("Rate Card not found");
            const index = card.entries.findIndex(e => e.id === entryId);
            if (index !== -1) card.entries.splice(index, 1);
            return entryId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rateCards'] });
            queryClient.invalidateQueries({ queryKey: ['rateCardDetails'] });
        }
    });
}



// Modifier Codes
export function useCreateModifierCode() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (code: Partial<ModifierReasonCode>) => {
            await new Promise(r => setTimeout(r, MOCK_DELAY));
            const newCode = { ...code, id: `mrc-${Math.random().toString(36).substr(2, 9)}` } as ModifierReasonCode;
            mockModifierReasonCodes.push(newCode);
            return newCode;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modifierReasonCodes'] })
    });
}

export function useUpdateModifierCode() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (code: Partial<ModifierReasonCode>) => {
            await new Promise(r => setTimeout(r, MOCK_DELAY));
            const index = mockModifierReasonCodes.findIndex(c => c.id === code.id);
            if (index !== -1) {
                // Ensure we spread both old and new to preserve all fields
                mockModifierReasonCodes[index] = { ...mockModifierReasonCodes[index], ...code };
            }
            return mockModifierReasonCodes[index];
        },
        onSuccess: () => {
            // Broad invalidation to catch both activeOnly: true and false
            queryClient.invalidateQueries({ queryKey: ['modifierReasonCodes'] });
        }
    });
}

export function useDeleteModifierCode() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await new Promise(r => setTimeout(r, MOCK_DELAY));
            const index = mockModifierReasonCodes.findIndex(c => c.id === id);
            if (index !== -1) mockModifierReasonCodes.splice(index, 1);
            return id;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modifierReasonCodes'] })
    });
}
