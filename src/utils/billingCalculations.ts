
import { TaxTreatment } from '../types/pricing';

export interface FinancialBreakdown {
    lineCostTotal: number;
    lineClientTotalPreTax: number;
    taxAmount: number;
    lineClientTotalIncTax: number;
    lineMargin: number;
}

/**
 * Calculates the financial totals for a billing line based on rates, quantity, and tax treatment.
 * Centralizes logic to ensure consistency between mutations, previews, and manual addition.
 *
 * @param quantity Effective quantity
 * @param finalClientRate Client rate after modifiers are applied
 * @param finalCostRate Cost rate after modifiers are applied
 * @param taxRate Decimal tax rate (e.g., 0.19 for 19%)
 * @param taxTreatment 'inclusive' or 'exclusive'
 */
export function calculateLineFinancials(
    quantity: number,
    finalClientRate: number,
    finalCostRate: number,
    taxRate: number,
    taxTreatment: TaxTreatment
): FinancialBreakdown {
    const lineCostTotal = finalCostRate * quantity;
    let lineClientTotalPreTax: number;
    let taxAmount: number;
    let lineClientTotalIncTax: number;

    if (taxTreatment === 'exclusive') {
        // Exclusive: Rate is Pre-Tax
        lineClientTotalPreTax = finalClientRate * quantity;
        taxAmount = lineClientTotalPreTax * taxRate;
        lineClientTotalIncTax = lineClientTotalPreTax + taxAmount;
    } else {
        // Inclusive: Rate is Inc-Tax (Gross)
        lineClientTotalIncTax = finalClientRate * quantity;
        lineClientTotalPreTax = lineClientTotalIncTax / (1 + taxRate);
        taxAmount = lineClientTotalIncTax - lineClientTotalPreTax;
    }

    // Margin is always Net Sales (Pre-Tax) - Cost
    const lineMargin = lineClientTotalPreTax - lineCostTotal;

    return {
        lineCostTotal,
        lineClientTotalPreTax,
        taxAmount,
        lineClientTotalIncTax,
        lineMargin
    };
}
