import React from "react";
import {
    Modal,
    Button,
    TextField,
    Input,
    Label,
    Skeleton
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAddManualLine } from "../../hooks/useAddManualLine";
import { ValidationAlerts } from "./AddManualLine/ValidationAlerts";
import { RateItemForm } from "./AddManualLine/RateItemForm";
import { ModifierAdjustments } from "./AddManualLine/ModifierAdjustments";
import { LivePreview } from "./AddManualLine/LivePreview";
import { NewBillingLinePayload } from "../../types/pricing";

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
        formState,
        setters,
        derivedData,
        handlers,
        validation,
    } = useAddManualLine({ orderId, projectId });

    const {
        selectedTypeId,
        quantity,
        clientModifier,
        clientReasonCode,
        costModifier,
        costReasonCode,
        note,
    } = formState;

    const {
        setSelectedTypeId,
        setQuantity,
        setClientModifier,
        setClientReasonCode,
        setCostModifier,
        setCostReasonCode,
        setNote,
    } = setters;

    const {
        availableRateItems,
        activePricing,
        isLoading,
        pricingSettings,
        rateCards,
        reasonCodes,
    } = derivedData;

    const { handleAdd, resetForm } = handlers;
    const { isFormValid } = validation;

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        onOpenChange(open);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog className="max-w-2xl overflow-visible">
                        <Modal.CloseTrigger />
                        <Modal.Header className="flex items-center gap-4">
                            <div className="bg-accent/10 text-accent shrink-0 p-2 rounded-full">
                                <Icon icon="lucide:plus-circle" className="size-5" />
                            </div>
                            <Modal.Heading className="text-2xl font-bold leading-tight">Add Billing Line</Modal.Heading>
                        </Modal.Header>

                        <Modal.Body className="p-8 space-y-8 overflow-visible">
                            <div className="contents">
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

                                        <ModifierAdjustments
                                            clientModifier={clientModifier}
                                            setClientModifier={setClientModifier}
                                            clientReasonCode={clientReasonCode}
                                            setClientReasonCode={setClientReasonCode}
                                            costModifier={costModifier}
                                            setCostModifier={setCostModifier}
                                            costReasonCode={costReasonCode}
                                            setCostReasonCode={setCostReasonCode}
                                            reasonCodes={reasonCodes}
                                        />

                                        <TextField
                                            value={note}
                                            onChange={setNote}
                                            className="w-full"
                                        >
                                            <Label className="leading-normal">Note (Optional)</Label>
                                            <Input placeholder="Add a reason or context for this manual addition..." />
                                        </TextField>

                                        <LivePreview activePricing={activePricing} />
                                    </React.Fragment>
                                )}
                            </div>
                        </Modal.Body>

                        <Modal.Footer className="p-8 gap-4">
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
