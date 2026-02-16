import React, { useState, useMemo } from "react";
import {
    Modal,
    Button,
    TextArea,
    Label,
    ScrollShadow,
    TextField
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { BillingLineInstance, ModifierType } from "../../types/pricing";
import { ModifierAdjustments } from "./AddManualLine/ModifierAdjustments";
import { LivePreview } from "./AddManualLine/LivePreview";
import { mockModifierReasonCodes } from "../../data/mock-modifier-reason-codes";
import { calculateLineFinancials } from "../../utils/billingCalculations";
import { MODAL_BACKDROP } from "../../constants/ui-tokens";
import { PRICING_LABEL_CLASSES } from "../../constants/pricing";

interface LineModifierEditorProps {
    line: BillingLineInstance;
    rateItemName?: string;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (updatedLine: Partial<BillingLineInstance>) => void;
    isPending?: boolean;
}

export function LineModifierEditor({
    line,
    rateItemName,
    isOpen,
    onOpenChange,
    onSave,
    isPending = false
}: LineModifierEditorProps) {
    // Client Modifier State
    const [clientType, setClientType] = useState<ModifierType>(line.clientModifierType);
    const [clientValue, setClientValue] = useState(line.clientModifierValue);
    const [clientFixedAmount, setClientFixedAmount] = useState(line.clientModifierFixedAmount ?? line.effectiveClientRate);
    const [clientReason, setClientReason] = useState(line.clientModifierReasonCode);

    // Cost Modifier State
    const [costType, setCostType] = useState<ModifierType>(line.costModifierType);
    const [costValue, setCostValue] = useState(line.costModifierValue);
    const [costFixedAmount, setCostFixedAmount] = useState(line.costModifierFixedAmount ?? line.effectiveCostRate);
    const [costReason, setCostReason] = useState(line.costModifierReasonCode);
    const [note, setNote] = useState(line.clientModifierNote || line.costModifierNote || "");

    // Derived modifier active flags — check by type to avoid false positives
    const isClientModifierActive = clientType === 'fixed'
        ? clientFixedAmount !== line.effectiveClientRate
        : clientValue !== 1.0;
    const isCostModifierActive = costType === 'fixed'
        ? costFixedAmount !== line.effectiveCostRate
        : costValue !== 1.0;

    // Derived Calculations for Preview
    const preview = useMemo(() => {
        // Calculate final rates based on modifier type
        const finalCostRate = costType === 'percentage'
            ? line.effectiveCostRate * costValue
            : (costFixedAmount ?? line.effectiveCostRate);

        const finalClientRate = clientType === 'percentage'
            ? line.effectiveClientRate * clientValue
            : (clientFixedAmount ?? line.effectiveClientRate);

        const financials = calculateLineFinancials(
            line.quantityEffective,
            finalClientRate,
            finalCostRate,
            line.taxRate,
            line.taxTreatment
        );

        return {
            finalCostRate,
            finalClientRate,
            ...financials,
            margin: financials.lineMargin // Mapping for compatibility
        };
    }, [line, clientValue, costValue, clientType, costType, clientFixedAmount, costFixedAmount]);

    // Map preview data to ActivePricing shape for LivePreview component
    const activePricing = useMemo(() => ({
        rateSource: line.rateSource,
        taxTreatment: line.taxTreatment,
        effectiveQuantity: line.quantityEffective,
        finalCost: preview.finalCostRate,
        finalClient: preview.finalClientRate,
        currency: line.currency,
        lineCostTotal: preview.lineCostTotal,
        lineClientTotalPreTax: preview.lineClientTotalPreTax,
        taxRate: line.taxRate,
        taxAmount: preview.taxAmount,
        margin: preview.margin,
        lineClientTotalIncTax: preview.lineClientTotalIncTax
    }), [line, preview]);

    // Validation
    const isClientValid = !isClientModifierActive || clientReason !== null;
    const isCostValid = !isCostModifierActive || costReason !== null;
    const isValid = isClientValid && isCostValid;

    const handleSave = () => {
        onSave({
            clientModifierType: clientType,
            clientModifierValue: clientValue,
            clientModifierFixedAmount: clientType === 'fixed' ? clientFixedAmount : null,
            clientModifierReasonCode: clientReason,
            clientModifierNote: note || null,
            clientModifierSource: 'MANUAL',
            costModifierType: costType,
            costModifierValue: costValue,
            costModifierFixedAmount: costType === 'fixed' ? costFixedAmount : null,
            costModifierReasonCode: costReason,
            costModifierNote: note || null,
            costModifierSource: 'MANUAL',
            finalCostRate: preview.finalCostRate,
            finalClientRate: preview.finalClientRate,
            lineCostTotal: preview.lineCostTotal,
            lineClientTotalPreTax: preview.lineClientTotalPreTax,
            taxAmount: preview.taxAmount,
            lineClientTotalIncTax: preview.lineClientTotalIncTax,
            lineMargin: preview.margin
        });
        onOpenChange(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <Modal.Backdrop className={MODAL_BACKDROP}>
                <Modal.Container>
                    <Modal.Dialog className="max-w-2xl flex flex-col max-h-[90vh]">
                        <Modal.CloseTrigger />
                        <Modal.Header className="flex items-center gap-4">
                            <div className="bg-accent/10 text-accent shrink-0 p-2 rounded-full">
                                <Icon icon="lucide:pencil-line" className="size-5" />
                            </div>
                            <Modal.Heading className="text-2xl font-bold leading-tight">
                                Edit Pricing Modifiers
                            </Modal.Heading>
                        </Modal.Header>

                        <Modal.Body className="flex-1 overflow-hidden p-0">
                            <ScrollShadow className="h-full">
                                <div className="px-6 py-5 space-y-5">
                                    <ModifierAdjustments
                                        clientModifier={clientValue}
                                        setClientModifier={setClientValue}
                                        clientModifierType={clientType}
                                        setClientModifierType={setClientType}
                                        clientModifierFixedAmount={clientFixedAmount}
                                        setClientModifierFixedAmount={(val) => setClientFixedAmount(val ?? line.effectiveClientRate)}
                                        clientReasonCode={clientReason}
                                        setClientReasonCode={setClientReason}
                                        costModifier={costValue}
                                        setCostModifier={setCostValue}
                                        costModifierType={costType}
                                        setCostModifierType={setCostType}
                                        costModifierFixedAmount={costFixedAmount}
                                        setCostModifierFixedAmount={(val) => setCostFixedAmount(val ?? line.effectiveCostRate)}
                                        costReasonCode={costReason}
                                        setCostReasonCode={setCostReason}
                                        reasonCodes={mockModifierReasonCodes}
                                        currency={line.currency}
                                        isClientModifierActive={isClientModifierActive}
                                        isCostModifierActive={isCostModifierActive}
                                    />

                                    <TextField value={note} onChange={setNote} className="w-full">
                                        <Label className={PRICING_LABEL_CLASSES}>
                                            Note (Optional)
                                        </Label>
                                        <TextArea
                                            placeholder="Add a reason or context for this adjustment..."
                                            className="min-h-[80px]"
                                        />
                                    </TextField>
                                </div>
                            </ScrollShadow>
                        </Modal.Body>

                        {/* Sticky preview — always visible above action buttons */}
                        <div className="shrink-0 border-t border-accent/10 px-6">
                            <LivePreview activePricing={activePricing} rateItemName={rateItemName} />
                        </div>

                        <Modal.Footer className="shrink-0 px-6 py-4 gap-4">
                            <Button
                                variant="ghost"
                                className="font-black"
                                onPress={() => onOpenChange(false)}
                            >
                                Discard Changes
                            </Button>
                            <Button
                                variant="primary"
                                className="font-black shadow-accent-md px-8"
                                onPress={handleSave}
                                isDisabled={!isValid || isPending}
                                isPending={isPending}
                            >
                                Save Modifiers
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
