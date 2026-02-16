import React from "react";
import {
    Modal,
    Button,
    TextField,
    TextArea,
    Label,
    Skeleton,
    Disclosure,
    ScrollShadow
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAddManualLine } from "../../hooks/useAddManualLine";
import { ValidationAlerts } from "./AddManualLine/ValidationAlerts";
import { RateItemForm } from "./AddManualLine/RateItemForm";
import { ModifierAdjustments } from "./AddManualLine/ModifierAdjustments";
import { LivePreview } from "./AddManualLine/LivePreview";
import { NewBillingLinePayload } from "../../types/pricing";
import { PRICING_LABEL_CLASSES } from "../../constants/pricing";
import { MODAL_BACKDROP } from "../../constants/ui-tokens";

interface AddManualLineModalProps {
    orderId: string;
    projectId: string;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onAdd: (line: NewBillingLinePayload) => void;
    isPending?: boolean;
}

export function AddManualLineModal({
    orderId,
    projectId,
    isOpen,
    onOpenChange,
    onAdd,
    isPending = false,
}: AddManualLineModalProps) {
    const {
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
    } = useAddManualLine({ orderId, projectId });

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        onOpenChange(open);
    };

    const isAdjustmentActive = isClientModifierActive || isCostModifierActive;

    const [isExpanded, setIsExpanded] = React.useState(false);

    const selectedRateItemName = React.useMemo(() => {
        if (!selectedTypeId || !availableRateItems.length) return undefined;
        const item = availableRateItems.find((i: { id: string; name: string; displayName?: string }) => i.id === selectedTypeId);
        return item?.displayName || item?.name;
    }, [selectedTypeId, availableRateItems]);

    // Auto-expand if adjustments are active
    React.useEffect(() => {
        if (isAdjustmentActive) {
            setIsExpanded(true);
        }
    }, [isAdjustmentActive]);

    return (
        <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Modal.Backdrop className={MODAL_BACKDROP}>
                <Modal.Container>
                    <Modal.Dialog className="max-w-2xl flex flex-col max-h-[90vh]">
                        <Modal.CloseTrigger />
                        <Modal.Header className="flex items-center gap-4">
                            <div className="bg-accent/10 text-accent shrink-0 p-2 rounded-full">
                                <Icon icon="lucide:plus-circle" className="size-5" />
                            </div>
                            <Modal.Heading className="text-2xl font-bold leading-tight">Add Billing Line</Modal.Heading>
                        </Modal.Header>

                        <Modal.Body className="flex-1 overflow-hidden p-0">
                            <ScrollShadow className="h-full px-6 py-5 space-y-5">
                                <div className="space-y-5">
                                    <ValidationAlerts
                                        isLoading={isLoading}
                                        pricingSettings={pricingSettings}
                                        availableRateItems={availableRateItems}
                                        rateCards={rateCards}
                                    />

                                    {isLoading ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-10 w-full" />
                                            <Skeleton className="h-20 w-full" />
                                            <Skeleton className="h-40 w-full" />
                                        </div>
                                    ) : (
                                        <React.Fragment>
                                            <RateItemForm
                                                selectedTypeId={selectedTypeId}
                                                setSelectedTypeId={setSelectedTypeId}
                                                quantity={quantity}
                                                setQuantity={setQuantity}
                                                availableRateItems={availableRateItems}
                                            />

                                            <Disclosure
                                                isExpanded={isExpanded}
                                                onExpandedChange={setIsExpanded}
                                                className="w-full"
                                            >
                                                <Disclosure.Heading>
                                                    <Disclosure.Trigger className="flex items-center justify-between w-full text-sm font-semibold text-default-600 group-data-[hovered=true]:text-default-900 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <Icon icon="lucide:sliders-horizontal" className="size-4" />
                                                            Price Adjustment
                                                            {isAdjustmentActive && !isExpanded && (
                                                                <span className="ml-2 t-mini bg-accent/10 text-accent px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                                                                    Active
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Disclosure.Indicator />
                                                    </Disclosure.Trigger>
                                                </Disclosure.Heading>
                                                <Disclosure.Content>
                                                    <Disclosure.Body className="space-y-4 pt-2">
                                                        <ModifierAdjustments
                                                            clientModifier={clientModifier}
                                                            setClientModifier={setClientModifier}
                                                            clientModifierType={clientModifierType}
                                                            setClientModifierType={setClientModifierType}
                                                            clientModifierFixedAmount={clientModifierFixedAmount}
                                                            setClientModifierFixedAmount={setClientModifierFixedAmount}
                                                            clientReasonCode={clientReasonCode}
                                                            setClientReasonCode={setClientReasonCode}
                                                            costModifier={costModifier}
                                                            setCostModifier={setCostModifier}
                                                            costModifierType={costModifierType}
                                                            setCostModifierType={setCostModifierType}
                                                            costModifierFixedAmount={costModifierFixedAmount}
                                                            setCostModifierFixedAmount={setCostModifierFixedAmount}
                                                            costReasonCode={costReasonCode}
                                                            setCostReasonCode={setCostReasonCode}
                                                            reasonCodes={reasonCodes}
                                                            currency={activePricing?.currency || pricingSettings?.currency || 'USD'}
                                                            isClientModifierActive={isClientModifierActive}
                                                            isCostModifierActive={isCostModifierActive}
                                                        />

                                                        <TextField
                                                            value={note}
                                                            onChange={setNote}
                                                            className="w-full"
                                                        >
                                                            <Label className={PRICING_LABEL_CLASSES}>Note (Optional)</Label>
                                                            <TextArea
                                                                placeholder="Add a reason or context for this manual addition..."
                                                                className="min-h-[80px]"
                                                            />
                                                        </TextField>
                                                    </Disclosure.Body>
                                                </Disclosure.Content>
                                            </Disclosure>


                                        </React.Fragment>
                                    )}
                                </div>
                            </ScrollShadow>
                        </Modal.Body>

                        {/* Sticky preview — always visible above action buttons */}
                        {activePricing && (
                            <div className="shrink-0 border-t border-accent/10 px-6">
                                <LivePreview activePricing={activePricing} rateItemName={selectedRateItemName} />
                            </div>
                        )}

                        <Modal.Footer className="shrink-0 px-6 py-4 gap-4">
                            <Button
                                variant="ghost"
                                className="font-black"
                                onPress={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="font-black shadow-accent-md px-8"
                                onPress={() => handleAdd(onAdd)}
                                isDisabled={!isFormValid || isPending}
                                isPending={isPending}
                            >
                                Add Billing Line
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
