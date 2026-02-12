import React, { useState, useMemo } from "react";
import {
    Modal,
    Button,
    Tabs,
    Switch,
    TextArea,
    Chip,
    Description,
    Label
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { BillingLineInstance, ModifierSource } from "../../types/pricing";
import { ModifierInput } from "../pricing/ModifierInput";
import { ReasonCodeSelector } from "../pricing/ReasonCodeSelector";
import { CurrencyDisplay } from "../pricing/CurrencyDisplay";
import { mockModifierReasonCodes } from "../../data/mock-modifier-reason-codes";
import { calculateLineFinancials } from "../../utils/billingCalculations";
import { formatPercentage } from "../../utils/formatters";

interface LineModifierEditorProps {
    line: BillingLineInstance;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (updatedLine: Partial<BillingLineInstance>) => void;
    isPending?: boolean;
}

export function LineModifierEditor({
    line,
    isOpen,
    onOpenChange,
    onSave,
    isPending = false
}: LineModifierEditorProps) {
    // Client Modifier State
    const [clientValue, setClientValue] = useState(line.clientModifierValue);
    const [clientReason, setClientReason] = useState(line.clientModifierReasonCode);
    const [clientNote, setClientNote] = useState(line.clientModifierNote || "");
    const [clientSource, setClientSource] = useState<ModifierSource>(line.clientModifierSource);

    // Cost Modifier State
    const [costValue, setCostValue] = useState(line.costModifierValue);
    const [costReason, setCostReason] = useState(line.costModifierReasonCode);
    const [costNote, setCostNote] = useState(line.costModifierNote || "");
    const [costSource, setCostSource] = useState<ModifierSource>(line.costModifierSource);

    const [activeTab, setActiveTab] = useState<string>("client");

    // Derived Calculations for Preview
    const preview = useMemo(() => {
        const finalCostRate = line.effectiveCostRate * costValue;
        const finalClientRate = line.effectiveClientRate * clientValue;

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
    }, [line, clientValue, costValue]);

    // Validation
    const isClientValid = clientValue === 1.0 || (clientValue !== 1.0 && clientReason !== null);
    const isCostValid = costValue === 1.0 || (costValue !== 1.0 && costReason !== null);
    const isValid = isClientValid && isCostValid;

    const handleSave = () => {
        onSave({
            clientModifierValue: clientValue,
            clientModifierReasonCode: clientReason,
            clientModifierNote: clientNote || null,
            clientModifierSource: clientSource,
            costModifierValue: costValue,
            costModifierReasonCode: costReason,
            costModifierNote: costNote || null,
            costModifierSource: costSource,
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

    const toggleOverride = (type: 'client' | 'cost', isOverridden: boolean) => {
        if (type === 'client') {
            setClientSource('MANUAL');
            if (!isOverridden) {
                // Reset to default value
                setClientValue(1.0);
                setClientReason(null);
            }
        } else {
            setCostSource('MANUAL');
            if (!isOverridden) {
                setCostValue(1.0);
                setCostReason(null);
            }
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog className="rounded-premium-lg max-w-2xl overflow-visible">
                        <Modal.Header className="flex flex-col gap-1 p-8 bg-default-50/50 border-b border-default-100">
                            <Modal.Heading className="text-2xl font-bold text-default-900">
                                Edit Pricing Modifiers
                            </Modal.Heading>
                            <Description className="text-sm text-default-500 font-medium leading-relaxed">
                                Adjust revenue and expense modifiers for this specific billing line.
                            </Description>
                        </Modal.Header>

                        <Modal.Body className="p-0">

                            <Tabs
                                aria-label="Modifier types"
                                selectedKey={activeTab}
                                onSelectionChange={(key) => setActiveTab(key as string)}
                                className="w-full"
                                variant="primary"
                            >
                                <Tabs.List className="px-8 border-b border-default-100 bg-background">
                                    <Tabs.Tab key="client" id="client" className="py-4">
                                        <div className="flex items-center gap-2">
                                            <Icon icon="lucide:user" className="w-4 h-4" />
                                            <span className="font-bold">Revenue Modifier</span>
                                        </div>
                                        <Tabs.Indicator />
                                    </Tabs.Tab>
                                    <Tabs.Tab key="cost" id="cost" className="py-4">
                                        <div className="flex items-center gap-2">
                                            <Icon icon="lucide:wallet" className="w-4 h-4" />
                                            <span className="font-bold">Expense Modifier</span>
                                        </div>
                                        <Tabs.Indicator />
                                    </Tabs.Tab>
                                </Tabs.List>
                            </Tabs>

                            <div className="p-8 space-y-8 min-h-[400px]">
                                {activeTab === "client" ? (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="flex items-center justify-between p-4 bg-default-50 rounded-2xl border border-default-200">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-tiny font-black uppercase tracking-widest text-default-400">Current Source</span>
                                                <div className="flex items-center gap-2">
                                                    <Chip
                                                        size="sm"
                                                        variant="soft"
                                                        color="accent"
                                                        className="font-bold uppercase text-tiny"
                                                    >
                                                        {clientSource.replace(/_/g, ' ')}
                                                    </Chip>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-default-700">Manual Override</span>
                                                <Switch
                                                    isSelected={true}
                                                    onChange={(selected: boolean) => toggleOverride('client', selected)}
                                                >
                                                    <Switch.Control>
                                                        <Switch.Thumb />
                                                    </Switch.Control>
                                                </Switch>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <ModifierInput
                                                label="Revenue Modifier"
                                                value={clientValue}
                                                onChange={setClientValue}
                                                className=""
                                            />
                                            <ReasonCodeSelector
                                                value={clientReason}
                                                onChange={setClientReason}
                                                reasonCodes={mockModifierReasonCodes}
                                                required={clientValue !== 1.0}
                                                isInvalid={clientValue !== 1.0 && !clientReason}
                                                errorMessage="Reason code required for specialized rates"
                                                className=""
                                            />
                                        </div>

                                        <div className="">
                                            <Label className="text-xs font-bold text-default-700 mb-1.5 block leading-normal">Revenue Note</Label>
                                            <TextArea
                                                placeholder="Reason for this specific adjustment..."
                                                value={clientNote}
                                                onChange={(e) => setClientNote(e.target.value)}
                                                className="bg-background border-default-200 focus:border-accent min-h-[100px] w-full"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="flex items-center justify-between p-4 bg-default-50 rounded-2xl border border-default-200">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-tiny font-black uppercase tracking-widest text-default-400">Current Source</span>
                                                <Chip
                                                    size="sm"
                                                    variant="soft"
                                                    color="accent"
                                                    className="font-bold uppercase text-tiny"
                                                >
                                                    {costSource.replace(/_/g, ' ')}
                                                </Chip>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-default-700">Manual Override</span>
                                                <Switch
                                                    isSelected={true}
                                                    onChange={(selected: boolean) => toggleOverride('cost', selected)}
                                                >
                                                    <Switch.Control>
                                                        <Switch.Thumb />
                                                    </Switch.Control>
                                                </Switch>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <ModifierInput
                                                label="Expense Modifier"
                                                value={costValue}
                                                onChange={setCostValue}
                                                className=""
                                            />
                                            <ReasonCodeSelector
                                                label="Expense Reason Code"
                                                value={costReason}
                                                onChange={setCostReason}
                                                reasonCodes={mockModifierReasonCodes}
                                                required={costValue !== 1.0}
                                                isInvalid={costValue !== 1.0 && !costReason}
                                                errorMessage="Reason code required for specialized rates"
                                                className=""
                                            />
                                        </div>

                                        <div className="">
                                            <Label className="text-xs font-bold text-default-700 mb-1.5 block leading-normal">Expense Note</Label>
                                            <TextArea
                                                placeholder="Internal note for expense adjustment..."
                                                value={costNote}
                                                onChange={(e) => setCostNote(e.target.value)}
                                                className="bg-background border-default-200 focus:border-accent min-h-[100px] w-full"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Live Preview Bar */}
                            <div className="bg-accent/5 border-t border-accent/10 p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-tiny font-black uppercase tracking-wider text-accent/60">New Revenue Rate</span>
                                    <CurrencyDisplay amount={preview.finalClientRate} currency={line.currency} size="md" color="accent" />
                                </div>
                                <div className="flex flex-col gap-1 border-l border-accent/10 pl-4">
                                    <span className="text-tiny font-black uppercase tracking-wider text-accent/60">Revenue Total (Pre-tax)</span>
                                    <CurrencyDisplay amount={preview.lineClientTotalPreTax} currency={line.currency} size="md" color="accent" className="font-black" />
                                </div>
                                <div className="flex flex-col gap-1 border-l border-accent/10 pl-4">
                                    <span className="text-tiny font-black uppercase tracking-wider text-default-400">Expense Total</span>
                                    <CurrencyDisplay amount={preview.lineCostTotal} currency={line.currency} size="md" variant="soft" className="bg-transparent border-none p-0 min-w-0" />
                                </div>
                                <div className="flex flex-col gap-1 border-l border-accent/10 pl-4 text-right">
                                    <span className="text-tiny font-black uppercase tracking-wider text-default-400">Net Margin</span>
                                    <div className={`text-sm font-black ${preview.margin >= 0 ? "text-success" : "text-danger"}`}>
                                        <CurrencyDisplay amount={preview.margin} currency={line.currency} size="sm" className="bg-transparent border-none p-0 inline-flex min-w-0" />
                                        <span className="text-tiny ml-1">({formatPercentage((preview.margin / (preview.lineClientTotalPreTax || 1)) * 100)})</span>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>

                        <Modal.Footer className="p-8 border-t border-default-100 flex items-center justify-end gap-3">
                            <Button
                                variant="ghost"
                                className="font-bold text-default-500 rounded-xl"
                                onPress={() => onOpenChange(false)}
                            >
                                Discard Changes
                            </Button>
                            <Button
                                variant="primary"
                                className="font-bold shadow-accent-md rounded-xl px-8"
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
