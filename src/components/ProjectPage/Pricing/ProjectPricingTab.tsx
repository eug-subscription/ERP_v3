import { useState, useMemo } from "react";
import { useParams, useBlocker } from "@tanstack/react-router";
import { Card, Spinner, Alert, Button, toast, AlertDialog } from "@heroui/react";
import { Icon } from "@iconify/react";
import { ProjectOverridesTable } from "./ProjectOverridesTable";
import { OverrideModal } from "./OverrideModal";
import { Currency, TaxTreatment } from "../../../types/pricing";
import { useProjectPricing, useUpdateProjectPricing } from "../../../hooks/useProjectPricing";
import { useOverrideModal } from "../../../hooks/useOverrideModal";
import { PricingEngine } from "./PricingEngine";
import { DEFAULT_TAX_RATE, decimalToPercent } from "../../../constants/pricing-data";

// Default values for pricing configuration
const DEFAULT_CURRENCY: Currency = "EUR";
const DEFAULT_TAX_TREATMENT: TaxTreatment = "exclusive";
/**
 * ProjectPricingTab - Main container for project-specific pricing settings.
 * Renders Currency/Tax settings, Rate Card selection, and Overrides.
 */
export function ProjectPricingTab() {
    const { projectId } = useParams({ from: '/project/$projectId/pricing-beta' });
    const { data: pricing, isLoading, error } = useProjectPricing(projectId);
    const updateMutation = useUpdateProjectPricing();
    const overrideModal = useOverrideModal();

    // Track dirty states from child components
    const [isCurrencySettingsDirty, setIsCurrencySettingsDirty] = useState(false);
    const [isRateCardDirty, setIsRateCardDirty] = useState(false);
    const hasUnsavedChanges = isCurrencySettingsDirty || isRateCardDirty;

    // Block navigation when there are unsaved changes - use withResolver for custom UI
    // enableBeforeUnload: false disables the native browser dialog on page refresh
    const { proceed, reset, status } = useBlocker({
        shouldBlockFn: () => hasUnsavedChanges,
        withResolver: true,
        enableBeforeUnload: false,
    });

    // Rate card ID from pricing data (optimistic updates handled by mutation)
    const rateCardId = pricing?.rateCardId || "";

    const currencyTaxInitialData = useMemo(() => ({
        currency: pricing?.currency || DEFAULT_CURRENCY,
        taxTreatment: pricing?.taxTreatment || DEFAULT_TAX_TREATMENT,
        taxRate: decimalToPercent(pricing?.taxRate ?? DEFAULT_TAX_RATE),
        taxNumber: pricing?.taxRegistrationNumber || ""
    }), [pricing]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Spinner size="lg" color="accent" />
                <p className="text-default-500 animate-pulse">Loading project pricing settings...</p>
            </div>
        );
    }

    if (error || !pricing) {
        return (
            <Alert status="danger" className="mt-4">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title>Failed to load pricing settings</Alert.Title>
                    <Alert.Description>{error?.message || "Project pricing data unavailable."}</Alert.Description>
                </Alert.Content>
            </Alert>
        );
    }

    const currentCurrency = pricing.currency;

    return (
        <div className="space-y-2">

            <div className="grid grid-cols-1 gap-4">
                {/* Pricing Configuration (Unified Engine) */}
                <PricingEngine
                    projectId={projectId}
                    currencyTaxInitialData={currencyTaxInitialData}
                    currentCurrency={currentCurrency}
                    selectedCardId={rateCardId}
                    isSaving={updateMutation.isPending}
                    onSaveAll={({ rateCard, tax }) => {
                        // Build merged mutation payload to avoid concurrent mutations
                        const payload = { ...pricing };

                        if (rateCard) {
                            payload.rateCardId = rateCard.cardId || "";
                            payload.currency = rateCard.currency || pricing.currency;
                        }

                        if (tax) {
                            payload.taxTreatment = tax.taxTreatment;
                            payload.taxRate = tax.taxRate;
                            payload.taxRegistrationNumber = tax.taxNumber;
                        }

                        updateMutation.mutate(payload, {
                            onSuccess: () => {
                                if (rateCard) setIsRateCardDirty(false);
                                if (tax) setIsCurrencySettingsDirty(false);

                                // Single toast for all changes
                                const messages = [];
                                if (rateCard) messages.push("rate card");
                                if (tax) messages.push("tax settings");

                                toast("Pricing settings saved", {
                                    variant: "success",
                                    description: `Updated ${messages.join(" and ")}`
                                });
                            }
                        });
                    }}
                    onCurrencyTaxDirtyChange={setIsCurrencySettingsDirty}
                    onRateCardDirtyChange={setIsRateCardDirty}
                />


                {/* Project Overrides */}
                <Card>
                    <Card.Header>
                        <div className="flex items-center justify-between gap-4 w-full">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <Icon icon="lucide:settings-2" className="size-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Custom Rates</h3>
                                    <p className="text-xs text-default-400 font-medium">Set permanent custom rates for specific items in this project.</p>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                size="sm"
                                onPress={overrideModal.actions.openAdd}
                                isDisabled={!rateCardId}
                            >
                                <Icon icon="lucide:plus" className="mr-1" />
                                Add Custom Rate
                            </Button>
                        </div>
                    </Card.Header>
                    <Card.Content>
                        <ProjectOverridesTable
                            projectId={projectId}
                            currency={currentCurrency}
                            rateCardId={rateCardId}
                            onAdd={overrideModal.actions.openAdd}
                            onEdit={overrideModal.actions.openEdit}
                        />
                    </Card.Content>
                </Card>
            </div>

            <OverrideModal
                isOpen={overrideModal.isOpen}
                onOpenChange={(open) => !open && overrideModal.actions.close()}
                projectId={projectId}
                currency={currentCurrency}
                rateCardId={rateCardId}
                override={overrideModal.mode === 'edit' ? overrideModal.override : undefined}
            />

            {/* Unsaved Changes Warning Dialog */}
            <AlertDialog
                isOpen={status === 'blocked'}
                onOpenChange={(open) => !open && reset?.()}
            >
                <AlertDialog.Backdrop className="backdrop-blur-sm bg-black/20">
                    <AlertDialog.Container>
                        <AlertDialog.Dialog className="sm:max-w-[400px]">
                            <AlertDialog.CloseTrigger />
                            <AlertDialog.Header>
                                <AlertDialog.Icon status="warning" />
                                <AlertDialog.Heading>Unsaved Changes</AlertDialog.Heading>
                            </AlertDialog.Header>
                            <AlertDialog.Body>
                                <p className="text-default-500 text-sm">
                                    You have unsaved changes to your pricing settings. If you leave now, your changes will be lost.
                                </p>
                            </AlertDialog.Body>
                            <AlertDialog.Footer>
                                <Button
                                    variant="tertiary"
                                    onPress={() => reset?.()}
                                >
                                    Stay and Save
                                </Button>
                                <Button
                                    variant="danger"
                                    onPress={() => proceed?.()}
                                >
                                    Leave Without Saving
                                </Button>
                            </AlertDialog.Footer>
                        </AlertDialog.Dialog>
                    </AlertDialog.Container>
                </AlertDialog.Backdrop>
            </AlertDialog>
        </div>
    );
}
