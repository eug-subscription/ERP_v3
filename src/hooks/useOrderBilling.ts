import { useQuery } from '@tanstack/react-query';
import { mockBillingLines } from '../data/mock-billing-lines';
import { BillingLineInstance, Currency, TaxTreatment } from '../types/pricing';
import { MOCK_API_DELAY, DEFAULT_STALE_TIME } from '../constants/query-config';

/**
 * Hook to fetch billing lines for a specific order
 */
export function useOrderBillingLines(orderId: string) {
    const query = useQuery({
        queryKey: ['orderBillingLines', orderId],
        queryFn: async (): Promise<BillingLineInstance[]> => {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
            return mockBillingLines.filter((line) => line.orderId === orderId);
        },
        staleTime: DEFAULT_STALE_TIME,
    });

    return {
        lines: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

export interface OrderBillingSummary {
    orderId: string;
    currency: Currency;
    taxTreatment: TaxTreatment;
    totalCost: number;
    totalClientPreTax: number;
    totalTax: number;
    totalClientIncTax: number;
    absoluteMargin: number;
    marginPercentage: number;
    taxRate: number;
    hasMixedTaxRates: boolean;
    breakdown: {
        draft: { preTax: number; incTax: number; cost: number };
        voided: { preTax: number; incTax: number; cost: number };
    };
    lineCount: {
        total: number;
        draft: number;
        voided: number;
    };
}

/**
 * Hook to calculate and provide order billing summary
 */
export function useOrderBillingSummary(orderId: string) {
    const { lines, isLoading, isError, error } = useOrderBillingLines(orderId);

    const calculateSummary = (lines: BillingLineInstance[]): OrderBillingSummary | null => {
        if (lines.length === 0) return null;

        // Use context from the first line for currency/tax treatment
        // In a real app, this would come from Project/Order settings
        const contextLine = lines[0];

        // We only sum non-voided lines for totals
        const activeLines = lines.filter((l) => l.status !== 'voided');

        const totalCost = activeLines.reduce((sum, l) => sum + l.lineCostTotal, 0);
        const totalClientPreTax = activeLines.reduce((sum, l) => sum + l.lineClientTotalPreTax, 0);
        const totalTax = activeLines.reduce((sum, l) => sum + l.taxAmount, 0);
        const totalClientIncTax = activeLines.reduce((sum, l) => sum + l.lineClientTotalIncTax, 0);

        const absoluteMargin = totalClientPreTax - totalCost;
        const marginPercentage = totalClientPreTax !== 0
            ? (absoluteMargin / totalClientPreTax) * 100
            : 0;

        const draftLines = lines.filter(l => l.status === 'draft');
        const voidedLines = lines.filter(l => l.status === 'voided');

        return {
            orderId,
            currency: contextLine.currency,
            taxTreatment: contextLine.taxTreatment,
            taxRate: contextLine.taxRate,
            hasMixedTaxRates: new Set(activeLines.map(l => l.taxRate)).size > 1,
            totalCost,
            totalClientPreTax,
            totalTax,
            totalClientIncTax,
            absoluteMargin,
            marginPercentage,
            breakdown: {
                draft: {
                    preTax: draftLines.reduce((sum, l) => sum + l.lineClientTotalPreTax, 0),
                    incTax: draftLines.reduce((sum, l) => sum + l.lineClientTotalIncTax, 0),
                    cost: draftLines.reduce((sum, l) => sum + l.lineCostTotal, 0),
                },
                voided: {
                    preTax: voidedLines.reduce((sum, l) => sum + l.lineClientTotalPreTax, 0),
                    incTax: voidedLines.reduce((sum, l) => sum + l.lineClientTotalIncTax, 0),
                    cost: voidedLines.reduce((sum, l) => sum + l.lineCostTotal, 0),
                }
            },
            lineCount: {
                total: lines.length,
                draft: draftLines.length,
                voided: voidedLines.length,
            }
        };
    };

    const summary = calculateSummary(lines);

    return {
        summary,
        isLoading,
        isError,
        error,
    };
}
