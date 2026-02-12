import { Card, Button, Skeleton, Chip, Separator } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useOrderBillingSummary } from "../../hooks/useOrderBilling";
import { CurrencyDisplay } from "../pricing/CurrencyDisplay";
import { formatPercentage } from "../../utils/formatters";
import { TYPO_TINY, PRICING_LABEL_CLASSES } from "../../constants/pricing";

interface OrderBillingSummaryCardProps {
    orderId: string;
    onRetry?: () => void;
}

/**
 * OrderBillingSummaryCard - Summary of all billing lines for an order.
 * Provides totals for cost, client billing, tax, and margin.
 */
export function OrderBillingSummaryCard({ orderId, onRetry }: OrderBillingSummaryCardProps) {
    const { state: summaryState } = useOrderBillingSummary(orderId);

    const summary = summaryState.summary;
    const isLoading = summaryState.isLoading;

    if (isLoading) {
        return (
            <Card>
                <Card.Content className="p-8">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <Skeleton className="h-16 w-full rounded-2xl" />
                        <Skeleton className="h-16 w-full rounded-2xl" />
                    </div>
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </Card.Content>
            </Card>
        );
    }

    if (summaryState.isError) {
        return (
            <Card>
                <Card.Content className="p-8 flex flex-col items-center justify-center gap-4 text-center">
                    <Icon icon="lucide:alert-circle" className="w-12 h-12 text-danger" />
                    <div>
                        <h3 className="text-lg font-black text-danger tracking-tight">Summary Error</h3>
                        <p className="text-sm text-default-500 font-medium">Failed to calculate billing summary.</p>
                    </div>
                    <Button
                        variant="danger-soft"
                        className="rounded-xl font-bold h-10 px-6"
                        onPress={onRetry}
                    >
                        <Icon icon="lucide:refresh-cw" className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </Card.Content>
            </Card>
        );
    }

    if (!summary) return null;

    return (
        <Card>
            <Card.Header className="px-8 pt-8 pb-4 flex justify-between items-center bg-default-100/30 border-b border-default-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-accent/10 rounded-xl text-accent shadow-accent-sm">
                        <Icon icon="lucide:calculator" className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black text-default-900 tracking-tight">Order Summary</h3>
                </div>
                <div className="flex gap-2">
                    <Chip size="sm" variant="soft" color="default" className="font-bold t-mini h-6 px-2 uppercase">
                        {summary.currency}
                    </Chip>
                    <Chip
                        size="sm"
                        variant="soft"
                        color="accent"
                        className="font-black t-mini h-6 px-3 uppercase tracking-tighter"
                    >
                        VAT {summary.taxTreatment}
                    </Chip>
                </div>
            </Card.Header>

            <Card.Content className="p-8 space-y-6">
                {/* Primary metrics: Revenue, Expense, Margin */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <span className={`${PRICING_LABEL_CLASSES} block`}>Revenue</span>
                        <CurrencyDisplay amount={summary.totalClientPreTax} currency={summary.currency} size="lg" className="font-black" />
                    </div>
                    <div className="space-y-1">
                        <span className={`${PRICING_LABEL_CLASSES} block`}>Expense</span>
                        <CurrencyDisplay amount={summary.totalCost} currency={summary.currency} size="lg" variant="soft" className="font-black" />
                    </div>
                    <div className="space-y-1">
                        <span className={`${PRICING_LABEL_CLASSES} block`}>Margin</span>
                        <div className="flex items-center gap-2">
                            <CurrencyDisplay amount={summary.absoluteMargin} currency={summary.currency} size="lg" className="text-success font-black" />
                            <Chip size="sm" color="success" variant="soft" className={`font-black h-6 ${TYPO_TINY}`}>
                                {formatPercentage(summary.marginPercentage)}
                            </Chip>
                        </div>
                    </div>
                </div>

                <Separator className="bg-default-100" />

                {/* Secondary metrics: Tax, Total */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <span className={`${PRICING_LABEL_CLASSES} block`}>Tax ({summary.totalClientPreTax > 0 ? (summary.totalTax / summary.totalClientPreTax * 100).toFixed(0) : '0'}%)</span>
                        <CurrencyDisplay amount={summary.totalTax} currency={summary.currency} size="md" variant="soft" className="font-bold" />
                    </div>
                    <div className="space-y-1">
                        <span className={`${PRICING_LABEL_CLASSES} block`}>Total (inc. tax)</span>
                        <CurrencyDisplay amount={summary.totalClientIncTax} currency={summary.currency} size="md" className="font-black" />
                    </div>
                </div>
            </Card.Content>
        </Card>
    );
}
