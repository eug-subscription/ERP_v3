import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BillingLineInstance } from '../types/pricing';
import { mockBillingLines } from '../data/mock-billing-lines';
import { mockUsers } from '../data/mock-users';

import { MOCK_API_DELAY } from '../constants/query-config';
import { calculateLineFinancials, calculateFinalRate } from '../utils/billingCalculations';

const DEFAULT_USER_ID = mockUsers[0].id;

/**
 * Helper to recalculate all totals for a billing line instance
 */
function calculateLineTotals(line: BillingLineInstance): BillingLineInstance {
    const updatedLine = { ...line };

    // 1. Calculate effective quantity based on rules
    const minimum = updatedLine.appliedRulesSnapshot?.minimum || 0;
    updatedLine.quantityEffective = Math.max(updatedLine.quantityInput, minimum);

    // 2. Calculate final rates after modifiers using shared utility
    updatedLine.finalCostRate = calculateFinalRate(
        updatedLine.effectiveCostRate, updatedLine.costModifierType, updatedLine.costModifierValue, updatedLine.costModifierFixedAmount
    );
    updatedLine.finalClientRate = calculateFinalRate(
        updatedLine.effectiveClientRate, updatedLine.clientModifierType, updatedLine.clientModifierValue, updatedLine.clientModifierFixedAmount
    );

    // 3. Calculate totals using shared utility
    const financials = calculateLineFinancials(
        updatedLine.quantityEffective,
        updatedLine.finalClientRate,
        updatedLine.finalCostRate,
        updatedLine.taxRate,
        updatedLine.taxTreatment
    );

    updatedLine.lineCostTotal = financials.lineCostTotal;
    updatedLine.lineClientTotalPreTax = financials.lineClientTotalPreTax;
    updatedLine.taxAmount = financials.taxAmount;
    updatedLine.lineClientTotalIncTax = financials.lineClientTotalIncTax;
    updatedLine.lineMargin = financials.lineMargin;

    return updatedLine;
}

/**
 * Simulate API call for updating a billing line
 */
async function simulateUpdateLine(id: string, updates: Partial<BillingLineInstance>): Promise<BillingLineInstance> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));

    const lineIndex = mockBillingLines.findIndex((l) => l.id === id);
    if (lineIndex === -1) {
        throw new Error('Billing line not found');
    }

    const currentLine = mockBillingLines[lineIndex];

    // Prevent updates to voided lines
    if (currentLine.status === 'voided' && !('status' in updates)) {
        throw new Error('Cannot update a voided billing line');
    }

    // Apply updates and recalculate
    let updatedLine = { ...currentLine, ...updates };

    // Recalculate totals if quantity or modifiers changed
    if ('quantityInput' in updates ||
        'clientModifierType' in updates ||
        'clientModifierValue' in updates ||
        'clientModifierFixedAmount' in updates ||
        'costModifierType' in updates ||
        'costModifierValue' in updates ||
        'costModifierFixedAmount' in updates ||
        'clientModifierReasonCode' in updates ||
        'costModifierReasonCode' in updates) {
        updatedLine = calculateLineTotals(updatedLine);
        // Stamp audit trail for modifications
        updatedLine.modifiedAt = new Date().toISOString();
        updatedLine.modifiedBy = DEFAULT_USER_ID;
    }

    // "Persist" to mock data
    mockBillingLines[lineIndex] = updatedLine;

    return updatedLine;
}

/**
 * Hook to update billing line quantity
 */
export function useUpdateBillingLineQuantity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, quantityInput }: { id: string; quantityInput: number }) =>
            simulateUpdateLine(id, { quantityInput }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['orderBillingLines', data.orderId] });
        },
    });
}

/**
 * Hook to update billing line modifiers
 */
export function useUpdateBillingLineModifiers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            updates
        }: {
            id: string;
            updates: Partial<Pick<BillingLineInstance,
                'clientModifierType' | 'clientModifierValue' | 'clientModifierFixedAmount' | 'clientModifierReasonCode' | 'clientModifierNote' | 'clientModifierSource' |
                'costModifierType' | 'costModifierValue' | 'costModifierFixedAmount' | 'costModifierReasonCode' | 'costModifierNote' | 'costModifierSource'>>
        }) => simulateUpdateLine(id, updates),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['orderBillingLines', data.orderId] });
        },
    });
}

/**
 * Hook to void a billing line
 */
export function useVoidBillingLine() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, voidReason }: { id: string; voidReason: string }) =>
            simulateUpdateLine(id, {
                status: 'voided',
                voidReason,
                voidedAt: new Date().toISOString(),
                voidedBy: DEFAULT_USER_ID,
            }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['orderBillingLines', data.orderId] });
        },
    });
}

/**
 * Hook to add a manual billing line
 */
export function useAddManualBillingLine() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (line: Partial<BillingLineInstance>) => {
            await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));

            // Create a pseudo-random ID
            const id = `bli-manual-${Math.random().toString(36).substr(2, 9)}`;
            const newLine = { ...line, id } as BillingLineInstance;

            // "Persist" to mock data
            mockBillingLines.push(newLine);

            return newLine;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['orderBillingLines', data.orderId] });
        },
    });
}
