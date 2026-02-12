import { useState, useMemo } from "react";
import { useRateItems } from "./useRateItems";
import { useModifierReasonCodes } from "./useModifierReasonCodes";
import { useProjectPricing } from "./useProjectPricing";
import { useRateCards } from "./useRateCards";
import { useProjectOverrides } from "./useProjectOverrides";
import { calculateLineFinancials } from "../utils/billingCalculations";
import { NewBillingLinePayload, RateSource } from "../types/pricing";
import { mockUsers } from "../data/mock-users";

interface UseAddManualLineProps {
    orderId: string;
    projectId: string;
}

export function useAddManualLine({ orderId, projectId }: UseAddManualLineProps) {
    // Data fetching
    const { data: rateItems = [], isLoading: isLoadingItems } = useRateItems();
    const { data: reasonCodes = [], isLoading: isLoadingReasons } = useModifierReasonCodes();
    const { data: pricingSettings, isLoading: isLoadingPricing } = useProjectPricing(projectId);
    const { data: rateCards = [], isLoading: isLoadingRateCards } = useRateCards(pricingSettings?.currency);
    const { data: overrides = [], isLoading: isLoadingOverrides } = useProjectOverrides(projectId);

    // Form state
    const [selectedTypeId, setSelectedTypeId] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);
    const [clientModifier, setClientModifier] = useState<number>(1.0);
    const [clientReasonCode, setClientReasonCode] = useState<string | null>(null);
    const [costModifier, setCostModifier] = useState<number>(1.0);
    const [costReasonCode, setCostReasonCode] = useState<string | null>(null);
    const [note, setNote] = useState<string>("");

    const resetForm = () => {
        setSelectedTypeId("");
        setQuantity(1);
        setClientModifier(1.0);
        setClientReasonCode(null);
        setCostModifier(1.0);
        setCostReasonCode(null);
        setNote("");
    };

    // Filter rate items to only those available in the project's rate card
    const availableRateItems = useMemo(() => {
        if (!pricingSettings?.rateCardId || !rateCards.length) return [];

        const rateCard = rateCards.find(rc => rc.id === pricingSettings.rateCardId);
        if (!rateCard) return [];

        const rateCardItemIds = new Set(rateCard.entries.map(e => e.rateItemId));

        return rateItems.filter(item =>
            item.status === 'active' && rateCardItemIds.has(item.id)
        );
    }, [rateItems, rateCards, pricingSettings]);

    // Derived pricing data and calculations
    const activePricing = useMemo(() => {
        if (!selectedTypeId || !pricingSettings || !rateCards.length) return null;

        const rateItem = rateItems.find(t => t.id === selectedTypeId);
        if (!rateItem) return null;

        const rateCard = rateCards.find(rc => rc.id === pricingSettings.rateCardId);
        if (!rateCard) return null;

        const entry = rateCard.entries.find(e => e.rateItemId === rateItem.id);
        if (!entry) return null;

        const override = overrides.find(o => o.rateItemId === rateItem.id);

        const baseCost = entry.costRate;
        const baseClient = entry.clientRate;
        const overrideCost = override?.costRate ?? null;
        const overrideClient = override?.clientRate ?? null;

        const effectiveCost = overrideCost ?? baseCost;
        const effectiveClient = overrideClient ?? baseClient;
        const rateSource: RateSource = override ? "project_override" : "rate_card";

        let rules = null;
        if (entry.rulesJson) {
            try {
                rules = JSON.parse(entry.rulesJson);
            } catch {
                // Invalid rules JSON — fall back to null (no rules applied)
            }
        }

        const effectiveQuantity = rules?.minimum ? Math.max(quantity, rules.minimum) : quantity;

        const finalCost = effectiveCost * costModifier;
        const finalClient = effectiveClient * clientModifier;

        const financials = calculateLineFinancials(
            effectiveQuantity,
            finalClient,
            finalCost,
            pricingSettings.taxRate,
            pricingSettings.taxTreatment
        );

        const {
            lineCostTotal,
            lineClientTotalPreTax,
            taxAmount,
            lineClientTotalIncTax,
            lineMargin
        } = financials;

        return {
            rateItem,
            rateCardId: rateCard.id,
            currency: rateCard.currency,
            taxTreatment: pricingSettings.taxTreatment,
            taxRate: pricingSettings.taxRate,
            rateSource,
            baseCost,
            baseClient,
            overrideCost,
            overrideClient,
            effectiveCost,
            effectiveClient,
            rules,
            effectiveQuantity,
            finalCost,
            finalClient,
            lineCostTotal,
            lineClientTotalPreTax,
            taxAmount,
            lineClientTotalIncTax,
            margin: lineMargin
        };
    }, [selectedTypeId, quantity, clientModifier, costModifier, pricingSettings, rateCards, rateItems, overrides]);

    const handleAdd = (onAdd: (line: NewBillingLinePayload) => void) => {
        if (!activePricing) return;

        const newLine: NewBillingLinePayload = {
            orderId,
            rateItemId: activePricing.rateItem.id,
            rateCardId: activePricing.rateCardId,
            currency: activePricing.currency,
            taxTreatment: activePricing.taxTreatment,
            taxRate: activePricing.taxRate,
            rateSource: activePricing.rateSource,
            baseCostRate: activePricing.baseCost,
            baseClientRate: activePricing.baseClient,
            overrideCostRate: activePricing.overrideCost,
            overrideClientRate: activePricing.overrideClient,
            effectiveCostRate: activePricing.effectiveCost,
            effectiveClientRate: activePricing.effectiveClient,
            appliedRulesSnapshot: activePricing.rules,
            quantityInput: quantity,
            quantityEffective: activePricing.effectiveQuantity,
            clientModifierValue: clientModifier,
            clientModifierReasonCode: clientReasonCode,
            clientModifierNote: note || null,
            clientModifierSource: "MANUAL",
            costModifierValue: costModifier,
            costModifierReasonCode: costReasonCode,
            costModifierNote: null,
            costModifierSource: "MANUAL",
            finalCostRate: activePricing.finalCost,
            finalClientRate: activePricing.finalClient,
            lineCostTotal: activePricing.lineCostTotal,
            lineClientTotalPreTax: activePricing.lineClientTotalPreTax,
            taxAmount: activePricing.taxAmount,
            lineClientTotalIncTax: activePricing.lineClientTotalIncTax,
            lineMargin: activePricing.margin,
            status: "draft" as const,
            createdAt: new Date().toISOString(),
            createdBy: mockUsers[0].id,
            confirmedAt: null,
            confirmedBy: null,
            voidedAt: null,
            voidedBy: null,
            voidReason: null,
        };

        onAdd(newLine);
    };

    const isLoading = isLoadingItems || isLoadingReasons || isLoadingPricing || isLoadingRateCards || isLoadingOverrides;

    const isFormValid = selectedTypeId && availableRateItems.length > 0 && activePricing &&
        (clientModifier === 1.0 || clientReasonCode) &&
        (costModifier === 1.0 || costReasonCode);

    return {
        formState: {
            selectedTypeId,
            quantity,
            clientModifier,
            clientReasonCode,
            costModifier,
            costReasonCode,
            note,
        },
        setters: {
            setSelectedTypeId,
            setQuantity,
            setClientModifier,
            setClientReasonCode,
            setCostModifier,
            setCostReasonCode,
            setNote,
        },
        derivedData: {
            availableRateItems,
            activePricing,
            isLoading,
            pricingSettings,
            rateCards,
            reasonCodes,
        },
        handlers: {
            handleAdd,
            resetForm,
        },
        validation: {
            isFormValid,
        },
    };
}
