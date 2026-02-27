import { useMemo } from "react";
import { useOrder } from "./useOrder";
import { useOrderBillingLines } from "./useOrderBilling";
import { mockRateItems } from "../data/mock-rate-items";
import { BLOCK_TYPE_TO_CATEGORY } from "../constants/order-details";
import type { TaxTreatment, UnitType } from "../types/pricing";

export interface ScopeLine {
    id: string;
    name: string;
    quantity: number;
    unit: UnitType;
    lineTotal: number;
    lineCostTotal: number;
    currency: string;
}

/**
 * Derives billing context and order metadata for the Order Details tab.
 * Composes useOrder() and useOrderBillingLines() — no new API calls.
 */
export function useOrderDetails(orderId: string) {
    const { data: order, isLoading: isOrderLoading } = useOrder();
    const { lines, isLoading: isBillingLoading } = useOrderBillingLines(orderId);

    const isLoading = isOrderLoading || isBillingLoading;

    const { orderTypes, totalSessionHours, scopeLines, taxTreatment } = useMemo(() => {
        const activeLines = lines.filter((l) => l.status !== "voided");
        const taxTreatment: TaxTreatment | null = activeLines[0]?.taxTreatment ?? null;

        // Build O(1) lookup map once — avoids repeated Array.find across multiple passes.
        const rateItemMap = new Map(mockRateItems.map((ri) => [ri.id, ri]));

        const categorySet = new Set<string>();
        let sessionHours = 0;
        const scopeMap = new Map<string, ScopeLine>();

        // Single pass: derive all three results simultaneously.
        for (const l of activeLines) {
            const rateItem = rateItemMap.get(l.rateItemId);
            if (!rateItem) continue;

            // Order type category
            if (rateItem.blockTypes) {
                for (const blockType of rateItem.blockTypes) {
                    const category = BLOCK_TYPE_TO_CATEGORY[blockType];
                    if (category) categorySet.add(category);
                }
            }

            // Total session hours
            if (rateItem.unitType === "hour") {
                sessionHours += l.quantityEffective;
            }

            // Scope aggregation
            const name = rateItem.displayName ?? rateItem.name;
            const existing = scopeMap.get(rateItem.id);
            if (existing) {
                existing.quantity += l.quantityEffective;
                existing.lineTotal += l.lineClientTotalPreTax;
                existing.lineCostTotal += l.lineCostTotal;
            } else {
                scopeMap.set(rateItem.id, {
                    id: rateItem.id,
                    name,
                    quantity: l.quantityEffective,
                    unit: rateItem.unitType,
                    lineTotal: l.lineClientTotalPreTax,
                    lineCostTotal: l.lineCostTotal,
                    currency: l.currency,
                });
            }
        }

        return {
            orderTypes: Array.from(categorySet),
            totalSessionHours: sessionHours,
            scopeLines: Array.from(scopeMap.values()),
            taxTreatment,
        };
    }, [lines]); // order is returned directly below — not derived in this memo

    return {
        order,
        orderTypes,
        totalSessionHours,
        scopeLines,
        taxTreatment,
        isLoading,
    };
}
