import { useState, useMemo } from "react";
import { useRateItems } from "./useRateItems";
import { useModifierReasonCodes } from "./useModifierReasonCodes";
import { useProjectPricing } from "./useProjectPricing";
import { useRateCards } from "./useRateCards";
import { useProjectOverrides } from "./useProjectOverrides";
import { calculateLineFinancials, calculateFinalRate } from "../utils/billingCalculations";
import { NewBillingLinePayload, RateSource, ModifierType } from "../types/pricing";
import { ALL_TEAM_MEMBERS } from "../data/mock-team-members";

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
    const [clientModifierType, setClientModifierType] = useState<ModifierType>('percentage');
    const [clientModifierFixedAmount, setClientModifierFixedAmount] = useState<number | null>(null);
    const [clientReasonCode, setClientReasonCode] = useState<string | null>(null);
    const [costModifier, setCostModifier] = useState<number>(1.0);
    const [costModifierType, setCostModifierType] = useState<ModifierType>('percentage');
    const [costModifierFixedAmount, setCostModifierFixedAmount] = useState<number | null>(null);
    const [costReasonCode, setCostReasonCode] = useState<string | null>(null);
    const [note, setNote] = useState<string>("");

    const resetForm = () => {
        setSelectedTypeId("");
        setQuantity(1);
        setClientModifier(1.0);
        setClientModifierType('percentage');
        setClientModifierFixedAmount(null);
        setClientReasonCode(null);
        setCostModifier(1.0);
        setCostModifierType('percentage');
        setCostModifierFixedAmount(null);
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

        const finalCost = calculateFinalRate(effectiveCost, costModifierType, costModifier, costModifierFixedAmount);
        const finalClient = calculateFinalRate(effectiveClient, clientModifierType, clientModifier, clientModifierFixedAmount);

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
            margin: lineMargin,
            clientModifierType,
            clientModifierFixedAmount,
            costModifierType,
            costModifierFixedAmount
        };
    }, [
        selectedTypeId,
        quantity,
        clientModifier,
        clientModifierType,
        clientModifierFixedAmount,
        costModifier,
        costModifierType,
        costModifierFixedAmount,
        pricingSettings,
        rateCards,
        rateItems,
        overrides
    ]);

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
            clientModifierType: activePricing.clientModifierType,
            clientModifierValue: clientModifier,
            clientModifierFixedAmount: activePricing.clientModifierFixedAmount,
            clientModifierReasonCode: clientReasonCode,
            clientModifierNote: note || null,
            clientModifierSource: "MANUAL",
            costModifierType: activePricing.costModifierType,
            costModifierValue: costModifier,
            costModifierFixedAmount: activePricing.costModifierFixedAmount,
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
            createdBy: ALL_TEAM_MEMBERS[0].id,
            modifiedAt: null,
            modifiedBy: null,
            voidedAt: null,
            voidedBy: null,
            voidReason: null,
        };

        onAdd(newLine);
    };

    const isLoading = isLoadingItems || isLoadingReasons || isLoadingPricing || isLoadingRateCards || isLoadingOverrides;

    const isClientModifierActive =
        (clientModifierType === 'percentage' && clientModifier !== 1.0) ||
        (clientModifierType === 'fixed' && clientModifierFixedAmount !== null && clientModifierFixedAmount !== 0);

    const isCostModifierActive =
        (costModifierType === 'percentage' && costModifier !== 1.0) ||
        (costModifierType === 'fixed' && costModifierFixedAmount !== null && costModifierFixedAmount !== 0);

    const isFormValid = selectedTypeId && availableRateItems.length > 0 && activePricing &&
        (!isClientModifierActive || clientReasonCode) &&
        (!isCostModifierActive || costReasonCode);

    return {
        // Form state
        selectedTypeId,
        quantity,
        clientModifier,
        clientModifierType,
        clientModifierFixedAmount,
        clientReasonCode,
        costModifier,
        costModifierType,
        costModifierFixedAmount,
        costReasonCode,
        note,
        // Setters
        setSelectedTypeId,
        setQuantity,
        setClientModifier,
        setClientModifierType,
        setClientModifierFixedAmount,
        setClientReasonCode,
        setCostModifier,
        setCostModifierType,
        setCostModifierFixedAmount,
        setCostReasonCode,
        setNote,
        // Derived data
        availableRateItems,
        activePricing,
        isLoading,
        pricingSettings,
        rateCards,
        reasonCodes,
        // Handlers
        handleAdd,
        resetForm,
        // Validation
        isFormValid,
        isClientModifierActive,
        isCostModifierActive,
    };
}
