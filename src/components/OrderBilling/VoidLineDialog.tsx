import { useState } from "react";
import {
    AlertDialog,
    Button,
    Chip,
    Separator,
    TextField,
    Label,
    TextArea,
    FieldError,
    Form,
    toast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { BillingLineInstance } from "../../types/pricing";
import { CurrencyDisplay } from "../pricing/CurrencyDisplay";
import { useVoidBillingLine } from "../../hooks/useBillingLineMutations";
import { useRateItems } from "../../hooks/useRateItems";

interface VoidLineDialogProps {
    line: BillingLineInstance | null;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function VoidLineDialog({
    line,
    isOpen,
    onOpenChange
}: VoidLineDialogProps) {
    const [voidReason, setVoidReason] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const voidMutation = useVoidBillingLine();
    const { data: rateItems = [] } = useRateItems();

    if (!line) return null;

    const item = rateItems.find(t => t.id === line.rateItemId);
    const lineItemName = item?.displayName || item?.name || line.rateItemId;

    const handleVoid = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);

        if (!voidReason.trim()) return;

        voidMutation.mutate({
            id: line.id,
            voidReason: voidReason.trim()
        }, {
            onSuccess: () => {
                toast("Line voided", {
                    variant: "danger",
                    description: `Removed ${line.id} from active billing.`
                });
                setVoidReason("");
                setIsSubmitted(false);
                onOpenChange(false);
            },
            onError: (error: Error) => {
                toast("Void Action Failed", {
                    variant: "danger",
                    description: error.message || "Could not void billing line."
                });
            }
        });
    };

    const handleClose = () => {
        setVoidReason("");
        setIsSubmitted(false);
        onOpenChange(false);
    };

    const isInvalid = isSubmitted && !voidReason.trim();

    return (
        <AlertDialog isOpen={isOpen} onOpenChange={handleClose}>
            <AlertDialog.Backdrop>
                <AlertDialog.Container>
                    <AlertDialog.Dialog className="sm:max-w-[500px] rounded-premium border border-default-200 shadow-2xl overflow-hidden bg-background">
                        <AlertDialog.CloseTrigger />

                        <AlertDialog.Header className="flex items-center gap-4 p-8 bg-danger-50/50 border-b border-danger-100">
                            <div className="p-3 bg-danger-100 rounded-2xl ring-1 ring-danger-200">
                                <AlertDialog.Icon status="danger" className="text-danger" />
                            </div>
                            <div>
                                <AlertDialog.Heading className="text-2xl font-black text-default-900 tracking-tight">
                                    Void Billing Line
                                </AlertDialog.Heading>
                                <p className="text-danger-700 font-medium text-sm">
                                    Remove this line from billing
                                </p>
                            </div>
                        </AlertDialog.Header>

                        <Form onSubmit={handleVoid}>
                            <AlertDialog.Body className="p-8 space-y-6">
                                <div className="p-5 rounded-2xl bg-default-50 border border-default-100 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="text-tiny font-black text-default-400 uppercase tracking-widest mb-1">
                                                Billing Item
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-default-900 text-lg">
                                                    {lineItemName}
                                                </span>
                                                <Chip size="sm" variant="soft" color="warning" className="font-black px-2 uppercase t-mini">
                                                    {line.status}
                                                </Chip>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <h4 className="text-tiny font-black text-default-400 uppercase tracking-widest mb-1">
                                                Total Value
                                            </h4>
                                            <CurrencyDisplay
                                                amount={line.lineClientTotalIncTax}
                                                currency={line.currency}
                                                size="md"
                                                color="accent"
                                                className="font-black"
                                            />
                                        </div>
                                    </div>

                                    <Separator className="bg-default-200/50" />

                                    <TextField
                                        isRequired
                                        isInvalid={isInvalid}
                                        className="w-full"
                                    >
                                        <Label className="text-tiny font-black text-default-400 uppercase tracking-widest mb-2 block">
                                            Reason for Voiding
                                        </Label>
                                        <TextArea
                                            placeholder="Explain why this line is being voided (e.g., duplicate entry, client request...)"
                                            value={voidReason}
                                            onChange={(e) => setVoidReason(e.target.value)}
                                            className="min-h-[100px] rounded-xl border-default-200 focus:border-danger ring-danger/20"
                                        />
                                        {isInvalid && <FieldError className="text-danger text-xs font-bold mt-1">Please provide a reason for voiding this line</FieldError>}
                                    </TextField>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl bg-danger-50 border border-danger-200/50 font-medium">
                                    <Icon icon="lucide:info" className="w-5 h-5 text-danger mt-0.5 shrink-0" />
                                    <p className="text-xs text-danger-700 leading-relaxed">
                                        Voiding will remove this amount from the order totals. The record will be kept for audit history but will not be included in the final invoice.
                                    </p>
                                </div>
                            </AlertDialog.Body>

                            <AlertDialog.Footer className="px-8 py-6 bg-default-50/50 border-t border-default-100 gap-3">
                                <Button
                                    variant="tertiary"
                                    className="font-bold h-12 px-6 rounded-xl hover:bg-default-100"
                                    onPress={handleClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="font-bold h-12 px-8 rounded-xl shadow-lg shadow-danger-200/50 bg-danger text-white border-none"
                                    isPending={voidMutation.isPending}
                                >
                                    <Icon icon="lucide:trash-2" className="w-5 h-5 mr-2" />
                                    Void Billing Line
                                </Button>
                            </AlertDialog.Footer>
                        </Form>
                    </AlertDialog.Dialog>
                </AlertDialog.Container>
            </AlertDialog.Backdrop>
        </AlertDialog>
    );
}
