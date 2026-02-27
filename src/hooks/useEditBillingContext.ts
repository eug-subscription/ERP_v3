import { useOrderBillingLines } from './useOrderBilling';
import { useUpdateBillingLineQuantity, useAddManualBillingLine } from './useBillingLineMutations';

/**
 * Aggregates data and mutations needed for the Billing Context edit workflow
 * on the Order Details tab.
 */
export function useEditBillingContext(orderId: string) {
    const { lines, isLoading } = useOrderBillingLines(orderId);
    const updateQuantity = useUpdateBillingLineQuantity();
    const addManualLine = useAddManualBillingLine();

    return {
        lines,
        isLoading,
        updateQuantity,
        addManualLine,
    };
}
