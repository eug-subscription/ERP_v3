import { useState } from "react";
import {
    AlertDialog,
    Button,
    TextField,
    Label,
    TextArea,
    FieldError,
    Form,
    toast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { BillingLineInstance } from "../../types/pricing";
import { useVoidBillingLine } from "../../hooks/useBillingLineMutations";
import { useRateItems } from "../../hooks/useRateItems";
import { formatCurrencyAmount } from "../../utils/formatters";

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
                    description: `${lineItemName} removed from active billing.`
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
            <AlertDialog.Backdrop variant="blur">
                <AlertDialog.Container>
                    <AlertDialog.Dialog className="sm:max-w-[440px]">
                        <AlertDialog.CloseTrigger />

                        <AlertDialog.Header>
                            <AlertDialog.Icon status="danger">
                                <Icon icon="lucide:trash-2" className="size-5" />
                            </AlertDialog.Icon>
                            <AlertDialog.Heading>Void billing line?</AlertDialog.Heading>
                            <p className="text-sm text-muted">
                                This will remove <strong>{lineItemName}</strong> ({formatCurrencyAmount(line.lineClientTotalIncTax, line.currency)}) from
                                the order totals and final invoice.
                            </p>
                        </AlertDialog.Header>

                        <Form onSubmit={handleVoid}>
                            <AlertDialog.Body className="overflow-visible">
                                <TextField
                                    isRequired
                                    isInvalid={isInvalid}
                                    className="w-full"
                                >
                                    <Label>Reason for voiding</Label>
                                    <TextArea
                                        placeholder="e.g., duplicate entry, client request, incorrect rate…"
                                        value={voidReason}
                                        onChange={(e) => setVoidReason(e.target.value)}
                                    />
                                    {isInvalid && (
                                        <FieldError>
                                            A reason is required to void a billing line
                                        </FieldError>
                                    )}
                                </TextField>

                                <p className="text-xs text-muted leading-relaxed mt-3">
                                    Voided lines are excluded from order totals and invoices. The record is kept for audit history and can be reviewed but not restored.
                                </p>
                            </AlertDialog.Body>

                            <AlertDialog.Footer>
                                <Button variant="tertiary" onPress={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="danger"
                                    isPending={voidMutation.isPending}
                                >
                                    Void Line
                                </Button>
                            </AlertDialog.Footer>
                        </Form>
                    </AlertDialog.Dialog>
                </AlertDialog.Container>
            </AlertDialog.Backdrop>
        </AlertDialog>
    );
}
