import { useState, useEffect, useCallback } from "react";
import { Button, AlertDialog, useOverlayState, Chip, Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import { RateCardComboBox } from "./RateCardComboBox";
import { RateCardTicket } from "./RateCardTicket";
import { TaxSettings } from "./TaxSettings";
import { Currency, TaxTreatment } from "../../../types/pricing";
import { percentToDecimal } from "../../../constants/pricing-data";

interface SaveAllData {
    rateCard: { cardId: string | null; currency: Currency | null } | null;
    tax: {
        currency: Currency;
        taxTreatment: TaxTreatment;
        taxRate: number;
        taxNumber?: string;
    } | null;
}

interface PricingEngineProps {
    projectId: string;
    currencyTaxInitialData: {
        currency: Currency;
        taxTreatment: TaxTreatment;
        taxRate: number;
        taxNumber?: string;
    };
    currentCurrency: Currency;
    selectedCardId?: string;
    isSaving: boolean;
    onSaveAll: (data: SaveAllData) => void;
    onCurrencyTaxDirtyChange: (isDirty: boolean) => void;
    onRateCardDirtyChange: (isDirty: boolean) => void;
}

/**
 * PricingEngine - Unified 1-step flow for financial calibrations.
 * Consolidates Currency, Rate Card, and Tax Settings into a single step.
 */
export function PricingEngine({
    projectId: _projectId,
    currencyTaxInitialData,
    selectedCardId,
    isSaving,
    onSaveAll,
    onCurrencyTaxDirtyChange,
    onRateCardDirtyChange,
    currentCurrency: initialCurrency
}: PricingEngineProps) {
    // Manual state for pending changes
    const [pendingRateCardId, setPendingRateCardId] = useState<string | null>(selectedCardId || null);
    const [pendingCurrency, setPendingCurrency] = useState<Currency | null>(
        selectedCardId ? initialCurrency : null
    );
    const [pendingTaxData, setPendingTaxData] = useState<{
        taxTreatment: TaxTreatment;
        taxRate: number;
        taxNumber: string;
    }>({
        taxTreatment: currencyTaxInitialData.taxTreatment,
        taxRate: percentToDecimal(currencyTaxInitialData.taxRate),
        taxNumber: currencyTaxInitialData.taxNumber || ""
    });

    const resetState = useOverlayState();

    const handleCardChange = useCallback((cardId: string | null, currency: Currency | null) => {
        setPendingRateCardId(cardId);
        setPendingCurrency(currency);
    }, []);

    const handleTaxChange = useCallback((data: { taxTreatment: TaxTreatment; taxRate: number; taxNumber?: string }) => {
        setPendingTaxData(prev => {
            const nextTaxNumber = data.taxNumber || "";
            if (prev.taxTreatment === data.taxTreatment &&
                prev.taxRate === data.taxRate &&
                prev.taxNumber === nextTaxNumber) {
                return prev;
            }
            return {
                taxTreatment: data.taxTreatment,
                taxRate: data.taxRate,
                taxNumber: nextTaxNumber
            };
        });
    }, []);

    // Manual dirty calculations
    const isRateCardDirty = pendingRateCardId !== (selectedCardId || null);
    const isTaxDirty = pendingTaxData.taxTreatment !== currencyTaxInitialData.taxTreatment ||
        Math.round(pendingTaxData.taxRate * 100) !== Math.round(currencyTaxInitialData.taxRate) ||
        pendingTaxData.taxNumber !== (currencyTaxInitialData.taxNumber || "");

    const isDirty = isRateCardDirty || isTaxDirty;

    useEffect(() => {
        onRateCardDirtyChange(isRateCardDirty);
    }, [isRateCardDirty, onRateCardDirtyChange]);

    useEffect(() => {
        onCurrencyTaxDirtyChange(isTaxDirty);
    }, [isTaxDirty, onCurrencyTaxDirtyChange]);

    const handleApplyAll = () => {
        // Build merged payload and call single save handler
        onSaveAll({
            rateCard: isRateCardDirty
                ? { cardId: pendingRateCardId, currency: pendingCurrency }
                : null,
            tax: isTaxDirty
                ? {
                    currency: initialCurrency,
                    taxTreatment: pendingTaxData.taxTreatment,
                    taxRate: pendingTaxData.taxRate,
                    taxNumber: pendingTaxData.taxNumber
                }
                : null
        });
    };

    const handleReset = () => {
        setPendingRateCardId(selectedCardId || null);
        setPendingCurrency(selectedCardId ? initialCurrency : null);
        setPendingTaxData({
            taxTreatment: currencyTaxInitialData.taxTreatment,
            taxRate: percentToDecimal(currencyTaxInitialData.taxRate),
            taxNumber: currencyTaxInitialData.taxNumber || ""
        });
        resetState.close();
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Unified Header */}
            <div className="flex items-center justify-between px-2 pt-1 mb-2">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold tracking-tight">Pricing Engine</h2>
                    <p className="text-xs text-default-500 font-medium tracking-tight">Configure pricing rules for this project</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`transition-opacity duration-500 ${isDirty ? 'opacity-100' : 'opacity-0'}`}>
                        <Chip
                            color="accent"
                            variant="soft"
                            size="sm"
                            className="font-semibold px-2 h-6"
                        >
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-accent animate-pulse" />
                                <span>Unsaved Changes</span>
                            </div>
                        </Chip>
                    </div>

                    {isDirty && (
                        <Button
                            variant="ghost"
                            className="rounded-full h-9 px-4 font-black uppercase tracking-widest text-default-400 hover:text-danger text-xs transition-all"
                            onPress={() => resetState.open()}
                        >
                            Reset
                        </Button>
                    )}

                    <Button
                        variant="primary"
                        size="md"
                        onPress={handleApplyAll}
                        isPending={isSaving}
                        isDisabled={!isDirty && !isSaving}
                    >
                        <Icon icon="lucide:save" width={16} className="mr-2" />
                        Save All Changes
                    </Button>
                </div>
            </div>

            {/* Main Layout: 50/50 Balanced Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN: Controls (50%) */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Rate Card Selection Card */}
                    <Card>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <Icon icon="lucide:credit-card" className="size-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Rate Card</h3>
                                    <p className="text-xs text-default-400 font-medium">Select a rate card to set pricing</p>
                                </div>
                            </div>

                            {/* Aligned with title text */}
                            <div className="ml-14">
                                <RateCardComboBox
                                    selectedCardId={pendingRateCardId}
                                    onChange={handleCardChange}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Tax Settings Card */}
                    <Card>
                        <TaxSettings
                            initialData={{
                                taxTreatment: currencyTaxInitialData.taxTreatment,
                                taxRate: percentToDecimal(currencyTaxInitialData.taxRate),
                                taxNumber: currencyTaxInitialData.taxNumber
                            }}
                            onChange={handleTaxChange}
                        />
                    </Card>
                </div>

                {/* RIGHT COLUMN: Artifact (50%) */}
                <div className="lg:col-span-6 sticky top-6">
                    <RateCardTicket cardId={pendingRateCardId} />
                </div>
            </div>

            {/* Reset Verification */}
            <AlertDialog isOpen={resetState.isOpen} onOpenChange={resetState.setOpen}>
                <AlertDialog.Backdrop className="backdrop-blur-sm bg-black/20">
                    <AlertDialog.Container>
                        <AlertDialog.Dialog className="sm:max-w-[400px]">
                            <AlertDialog.CloseTrigger />
                            <AlertDialog.Header>
                                <AlertDialog.Icon status="danger" />
                                <AlertDialog.Heading>Discard Changes?</AlertDialog.Heading>
                            </AlertDialog.Header>
                            <AlertDialog.Body>
                                <p>
                                    You are about to revert all pricing calibrations to their last saved state. Any unsaved modifications to the protocol or taxation logic will be lost.
                                </p>
                            </AlertDialog.Body>
                            <AlertDialog.Footer>
                                <Button slot="close" variant="tertiary">
                                    Cancel
                                </Button>
                                <Button
                                    slot="close"
                                    variant="danger"
                                    onPress={handleReset}
                                >
                                    Confirm Reset
                                </Button>
                            </AlertDialog.Footer>
                        </AlertDialog.Dialog>
                    </AlertDialog.Container>
                </AlertDialog.Backdrop>
            </AlertDialog>
        </div>
    );
}
