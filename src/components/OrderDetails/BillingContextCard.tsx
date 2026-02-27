import { useCallback, useMemo, useState } from 'react';
import { Card, Chip, Skeleton, Button, toast, Separator } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link } from '@tanstack/react-router';
import type { ScopeLine } from '../../hooks/useOrderDetails';
import type { TaxTreatment } from '../../types/pricing';
import { TEXT_SECTION_LABEL, ICON_SIZE_CONTAINER, TEXT_TINY_MUTED_BOLD, BILLING_COLUMN_WIDTH, GHOST_EDIT_BUTTON } from '../../constants/ui-tokens';
import { formatCurrencyAmount } from '../../utils/formatters';
import { DEFAULT_CURRENCY, MARGIN_THRESHOLD_GOOD, MARGIN_THRESHOLD_ACCEPTABLE } from '../../constants/billing';
import { BillingContextEditModal } from './BillingContextEditModal';
import { AddManualLineModal } from '../OrderBilling/AddManualLineModal';
import { useEditBillingContext } from '../../hooks/useEditBillingContext';

interface BillingContextCardProps {
    isLoading: boolean;
    orderTypes: string[];
    taxTreatment: TaxTreatment | null;
    scopeLines: ScopeLine[];
    orderId: string;
    projectId: string;
}

export function BillingContextCard({
    isLoading,
    orderTypes: _orderTypes,
    taxTreatment,
    scopeLines,
    orderId,
    projectId,
}: BillingContextCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const { addManualLine } = useEditBillingContext(orderId);

    const currency = scopeLines[0]?.currency ?? DEFAULT_CURRENCY;
    const fmt = useCallback(
        (amount: number) => formatCurrencyAmount(amount, currency, 0),
        [currency],
    );
    const grandRevenue = useMemo(
        () => scopeLines.reduce((sum, l) => sum + l.lineTotal, 0),
        [scopeLines],
    );
    const grandExpense = useMemo(
        () => scopeLines.reduce((sum, l) => sum + l.lineCostTotal, 0),
        [scopeLines],
    );
    const margin = useMemo(
        () => grandRevenue > 0 ? ((grandRevenue - grandExpense) / grandRevenue) * 100 : 0,
        [grandRevenue, grandExpense],
    );
    const absProfit = grandRevenue - grandExpense;
    const marginColor = margin >= MARGIN_THRESHOLD_GOOD ? 'success' : margin >= MARGIN_THRESHOLD_ACCEPTABLE ? 'warning' : 'danger';

    if (isLoading) {
        return (
            <Card className="h-full">
                <Card.Content className="p-5 flex flex-col gap-4">
                    <Skeleton className="h-5 w-32 rounded-lg" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-24 w-full rounded-xl" />
                </Card.Content>
            </Card>
        );
    }

    const isEmpty = scopeLines.length === 0;

    return (
        <>
            <Card className="group h-full">
                <Card.Content className="p-5 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Icon icon="lucide:receipt" className={ICON_SIZE_CONTAINER} />
                            <h3 className={TEXT_SECTION_LABEL}>Billing Context</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                isIconOnly
                                aria-label="Edit billing lines"
                                className={GHOST_EDIT_BUTTON}
                                onPress={() => setIsEditOpen(true)}
                            >
                                <Icon icon="lucide:pencil" className="size-3.5" />
                            </Button>
                            <Link
                                to="/billing"
                                className="text-xs text-default-400 hover:text-accent font-medium transition-colors shrink-0"
                            >
                                View Billing
                            </Link>
                        </div>
                    </div>

                    {/* Chips row — VAT treatment + margin */}
                    {(taxTreatment || !isEmpty) && (
                        <div className="flex flex-wrap gap-1.5">
                            {taxTreatment && (
                                <Chip
                                    size="sm"
                                    variant="soft"
                                    color="accent"
                                    className="font-black t-micro h-5 px-2 uppercase tracking-tighter"
                                >
                                    VAT {taxTreatment}
                                </Chip>
                            )}
                            {!isEmpty && (
                                <Chip
                                    size="sm"
                                    variant="soft"
                                    color={marginColor}
                                    className="font-black t-micro h-5 px-2 uppercase tracking-tighter"
                                >
                                    {margin.toFixed(0)}% margin
                                </Chip>
                            )}
                        </div>
                    )}

                    {/* Scope lines */}
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center py-4 gap-2 text-default-400">
                            <Icon icon="lucide:receipt" className="size-6" />
                            <p className="text-sm font-medium">No billing lines</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {/* Column headers */}
                            <div className="flex items-center justify-between mb-1">
                                <span className={TEXT_TINY_MUTED_BOLD}>Rate Items</span>
                                <div className="flex gap-4">
                                    <span className={`${TEXT_TINY_MUTED_BOLD} ${BILLING_COLUMN_WIDTH} text-right`}>Qty</span>
                                    <span className={`${TEXT_TINY_MUTED_BOLD} ${BILLING_COLUMN_WIDTH} text-right`}>Revenue</span>
                                    <span className={`${TEXT_TINY_MUTED_BOLD} ${BILLING_COLUMN_WIDTH} text-right`}>Expense</span>
                                </div>
                            </div>

                            {/* Rows */}
                            <div className="flex flex-col">
                                {scopeLines.map((line, index) => (
                                    <div key={line.id}>
                                        <div className="flex items-center justify-between py-2 gap-2">
                                            <span className="text-xs font-medium text-default-700 truncate flex-1">{line.name}</span>
                                            <div className="flex gap-4 shrink-0 tabular-nums">
                                                <span className={`${BILLING_COLUMN_WIDTH} text-right text-xs font-medium text-default-400`}>
                                                    {line.quantity}&nbsp;{line.unit}{line.quantity !== 1 ? 's' : ''}
                                                </span>
                                                <span className={`${BILLING_COLUMN_WIDTH} text-right text-xs font-bold font-mono text-default-900`}>
                                                    {fmt(line.lineTotal)}
                                                </span>
                                                <span className={`${BILLING_COLUMN_WIDTH} text-right text-xs font-bold font-mono text-default-500`}>
                                                    {fmt(line.lineCostTotal)}
                                                </span>
                                            </div>
                                        </div>
                                        {index < scopeLines.length - 1 && (
                                            <Separator className="my-1" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Footer totals */}
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center mt-1">
                                <span className={TEXT_TINY_MUTED_BOLD}>
                                    {scopeLines.length} line item{scopeLines.length !== 1 ? 's' : ''}
                                </span>
                                <div className="flex gap-4 tabular-nums">
                                    <span className={BILLING_COLUMN_WIDTH} />
                                    <span className={`${BILLING_COLUMN_WIDTH} text-right text-sm font-bold font-mono text-default-900`}>
                                        {fmt(grandRevenue)}
                                    </span>
                                    <span className={`${BILLING_COLUMN_WIDTH} text-right text-sm font-bold font-mono text-default-500`}>
                                        {fmt(grandExpense)}
                                    </span>
                                </div>
                            </div>
                            {/* Profit */}
                            <Separator className="my-2" />
                            <div className="flex items-center justify-between">
                                <span className={TEXT_TINY_MUTED_BOLD}>Profit</span>
                                <span className={`text-sm font-bold font-mono tabular-nums ${absProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                                    {fmt(absProfit)}
                                </span>
                            </div>
                        </div>
                    )}
                </Card.Content>
            </Card>

            <BillingContextEditModal
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                orderId={orderId}
                onRequestAddLine={() => setIsAddOpen(true)}
            />

            <AddManualLineModal
                orderId={orderId}
                projectId={projectId}
                isOpen={isAddOpen}
                onOpenChange={setIsAddOpen}
                isPending={addManualLine.isPending}
                onAdd={(line) =>
                    addManualLine.mutate(line, {
                        onSuccess: () => {
                            toast('Line Added', {
                                variant: 'success',
                                description: 'Manual billing line successfully added.',
                            });
                            setIsAddOpen(false);
                        },
                        onError: (error: Error) => {
                            toast('Add Failed', {
                                variant: 'danger',
                                description: error.message || 'Could not add billing line.',
                            });
                        },
                    })
                }
            />
        </>
    );
}
