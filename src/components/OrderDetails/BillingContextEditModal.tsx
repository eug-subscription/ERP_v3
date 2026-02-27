import { useEffect, useState } from 'react';
import { Button, Label, Modal, NumberField, Skeleton, Spinner, toast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useRateItems } from '../../hooks/useRateItems';
import { useEditBillingContext } from '../../hooks/useEditBillingContext';
import { MODAL_WIDTH_MD, MODAL_BACKDROP, TEXT_MODAL_SECTION_LABEL, MODAL_ICON_DEFAULT } from '../../constants/ui-tokens';
import type { BillingLineInstance } from '../../types/pricing';

interface BillingContextEditModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string;
    onRequestAddLine: () => void;
}

function getLineName(line: BillingLineInstance, rateItems: { id: string; name: string; displayName?: string }[]): string {
    const item = rateItems.find((r) => r.id === line.rateItemId);
    return item?.displayName ?? item?.name ?? line.rateItemId;
}

export function BillingContextEditModal({
    isOpen,
    onOpenChange,
    orderId,
    onRequestAddLine,
}: BillingContextEditModalProps) {
    const { lines, isLoading, updateQuantity } = useEditBillingContext(orderId);
    const { data: rateItems = [] } = useRateItems();

    const activeLines = lines.filter((l) => l.status !== 'voided');

    const [drafts, setDrafts] = useState<Map<string, number>>(new Map());

    // Re-initialise drafts each time the modal opens
    useEffect(() => {
        if (isOpen) {
            const initial = new Map(
                activeLines.map((l) => [l.id, l.quantityInput])
            );
            setDrafts(initial);
        }
        // activeLines intentionally omitted — we only reset on open
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    function setDraft(id: string, value: number) {
        setDrafts((prev) => {
            const next = new Map(prev);
            next.set(id, value);
            return next;
        });
    }

    const changedLines = activeLines.filter(
        (l) => drafts.has(l.id) && drafts.get(l.id) !== l.quantityInput
    );

    const isPending = updateQuantity.isPending;
    const pendingId = isPending ? updateQuantity.variables?.id : null;

    async function handleSave() {
        if (changedLines.length === 0) {
            onOpenChange(false);
            return;
        }

        try {
            await Promise.all(
                changedLines.map((line) =>
                    updateQuantity.mutateAsync({ id: line.id, quantityInput: drafts.get(line.id)! })
                )
            );
            toast('Quantities Updated', {
                variant: 'success',
                description: 'Billing line quantities have been saved.',
            });
            onOpenChange(false);
        } catch (error) {
            toast('Update Failed', {
                variant: 'danger',
                description: (error as Error).message || 'Could not update one or more quantities.',
            });
        }
    }

    function handleAddLine() {
        onOpenChange(false);
        onRequestAddLine();
    }

    return (
        <Modal.Backdrop className={MODAL_BACKDROP} isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className={MODAL_WIDTH_MD}>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Icon className={MODAL_ICON_DEFAULT}>
                            <Icon icon="lucide:receipt" className="size-5" />
                        </Modal.Icon>
                        <Modal.Heading>Edit Billing Lines</Modal.Heading>
                    </Modal.Header>

                    <Modal.Body className="flex flex-col gap-4 px-6 pb-2">
                        {isLoading ? (
                            <div className="flex flex-col gap-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : activeLines.length === 0 ? (
                            <p className="text-sm text-default-500 text-center py-4">
                                No active billing lines.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <p className={`${TEXT_MODAL_SECTION_LABEL} mb-1`}>Quantities</p>
                                {activeLines.map((line) => (
                                    <div
                                        key={line.id}
                                        className="flex items-center justify-between py-2 border-b border-default last:border-0"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            {pendingId === line.id && (
                                                <Spinner size="sm" color="accent" />
                                            )}
                                            <span className="text-sm font-medium text-default-700 truncate">
                                                {getLineName(line, rateItems)}
                                            </span>
                                        </div>
                                        <NumberField
                                            name={`qty-${line.id}`}
                                            value={drafts.get(line.id) ?? line.quantityInput}
                                            onChange={(v) => setDraft(line.id, v)}
                                            minValue={0}
                                            step={1}
                                            isDisabled={isPending}
                                            className="shrink-0"
                                        >
                                            <Label className="sr-only">
                                                Quantity for {getLineName(line, rateItems)}
                                            </Label>
                                            <NumberField.Group>
                                                <NumberField.DecrementButton />
                                                <NumberField.Input className="w-16 text-center" />
                                                <NumberField.IncrementButton />
                                            </NumberField.Group>
                                        </NumberField>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="border-t border-default pt-3">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-accent font-semibold"
                                onPress={handleAddLine}
                                isDisabled={isPending}
                            >
                                <Icon icon="lucide:plus" className="size-4" />
                                Add Line Item
                            </Button>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button slot="close" variant="ghost" isDisabled={isPending}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onPress={handleSave}
                            isPending={isPending}
                            isDisabled={isLoading}
                        >
                            Save changes
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
