import { Card, Skeleton, Chip, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useOrderBillingSummary } from "../../hooks/useOrderBilling";
import { formatPercentage, formatCurrencyAmount } from "../../utils/formatters";

interface OrderBillingSummaryCardProps {
    orderId: string;
    onRetry?: () => void;
}



/**
 * OrderBillingSummaryCard — Premium financial summary for an order.
 * Clear visual hierarchy: Hero Revenue → Expense/Margin → Tax/Total.
 */
export function OrderBillingSummaryCard({ orderId, onRetry }: OrderBillingSummaryCardProps) {
    const { summary, isLoading, isError } = useOrderBillingSummary(orderId);

    if (isLoading) {
        return (
            <Card>
                <Card.Content className="p-6 space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                </Card.Content>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card>
                <Card.Content className="p-8 flex flex-col items-center justify-center gap-4 text-center">
                    <Icon icon="lucide:alert-circle" className="w-12 h-12 text-danger" />
                    <div>
                        <h3 className="text-lg font-black text-danger tracking-tight">Summary Error</h3>
                        <p className="text-sm text-default-500 font-medium">Failed to calculate billing summary.</p>
                    </div>
                    <Button variant="tertiary" size="sm" onPress={onRetry}>
                        Try Again
                    </Button>
                </Card.Content>
            </Card>
        );
    }

    if (!summary) {
        return (
            <Card>
                <Card.Content className="p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[200px]">
                    <div className="p-3 bg-default-100 rounded-full">
                        <Icon icon="lucide:calculator" className="size-8 text-default-300" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-default-400">No Billing Lines</h3>
                        <p className="text-xs text-default-400 mt-1">Add billing lines to see the order summary.</p>
                    </div>
                </Card.Content>
            </Card>
        );
    }

    const taxRateDisplay = summary.hasMixedTaxRates
        ? 'Mixed'
        : `${Math.round(summary.taxRate * 100)}%`;

    const marginIsPositive = summary.absoluteMargin >= 0;

    return (
        <Card>
            {/* ── Header ────────────────────────────────────── */}
            <Card.Header className="px-6 pt-6 pb-4 flex flex-col items-start bg-default-100/30 border-b border-default-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="size-5 rounded-md bg-accent/10 flex items-center justify-center text-accent">
                        <Icon icon="lucide:calculator" className="size-3" />
                    </div>
                    <span className="t-mini font-bold uppercase tracking-[0.15em] text-accent/60">Order Financials</span>
                </div>

                <h4 className="text-base font-black tracking-tight">Order Summary</h4>

                <div className="mt-2">
                    <Chip size="sm" variant="soft" color="accent" className="font-black t-micro h-5 px-2 uppercase tracking-tighter">
                        VAT {summary.taxTreatment}
                    </Chip>
                </div>
            </Card.Header>

            <Card.Content className="p-0">
                {/* ── Hero: Revenue ──────────────────────────── */}
                <div className="mx-4 mt-4 rounded-xl bg-gradient-to-br from-accent/[0.04] to-accent/[0.08] border border-accent/10 px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Icon icon="lucide:trending-up" className="size-3.5 text-accent" />
                        <span className="t-micro font-black uppercase tracking-widest text-accent">
                            Revenue
                        </span>
                    </div>
                    <span className="text-3xl font-black tracking-tight font-mono tabular-nums text-default-900 block">
                        {formatCurrencyAmount(summary.totalClientPreTax, summary.currency)}
                    </span>
                </div>

                {/* ── Secondary: Expense + Margin ──────────── */}
                <div className="mx-4 mt-3 grid grid-cols-2 gap-3">
                    {/* Expense card */}
                    <div className="rounded-xl bg-default-50 border border-default-100 px-4 py-3">
                        <span className="t-micro font-bold uppercase tracking-widest text-default-400 block mb-1.5">
                            Expense
                        </span>
                        <span className="text-base font-black font-mono tabular-nums text-default-700">
                            {formatCurrencyAmount(summary.totalCost, summary.currency)}
                        </span>
                    </div>

                    {/* Margin card */}
                    <div className={`rounded-xl border px-4 py-3 ${marginIsPositive
                        ? 'bg-success-50/50 border-success-100'
                        : 'bg-danger-50/50 border-danger-100'
                        }`}>
                        <span className="t-micro font-bold uppercase tracking-widest text-default-400 block mb-1.5">
                            Margin
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-base font-black font-mono tabular-nums ${marginIsPositive ? 'text-success-600' : 'text-danger-600'
                                }`}>
                                {formatCurrencyAmount(summary.absoluteMargin, summary.currency)}
                            </span>
                            <Chip
                                size="sm"
                                color={marginIsPositive ? "success" : "danger"}
                                variant="soft"
                                className="font-black t-micro h-5 px-1.5"
                            >
                                {formatPercentage(summary.marginPercentage)}
                            </Chip>
                        </div>
                    </div>
                </div>

                {/* ── Footer: Tax + Total ────────────────────── */}
                <div className="mx-4 mt-3 mb-4 rounded-xl bg-default-50 border border-default-100 overflow-hidden">
                    <div className="grid grid-cols-2 divide-x divide-default-100">
                        <div className="px-4 py-3">
                            <span className="t-micro font-bold uppercase tracking-widest text-default-400 block mb-0.5">
                                Tax ({taxRateDisplay})
                            </span>
                            <span className="text-sm font-bold font-mono tabular-nums text-default-600">
                                {formatCurrencyAmount(summary.totalTax, summary.currency)}
                            </span>
                        </div>
                        <div className="px-4 py-3">
                            <span className="t-micro font-bold uppercase tracking-widest text-default-400 block mb-0.5">
                                Total (inc. tax)
                            </span>
                            <span className="text-sm font-black font-mono tabular-nums text-default-900">
                                {formatCurrencyAmount(summary.totalClientIncTax, summary.currency)}
                            </span>
                        </div>
                    </div>
                </div>
            </Card.Content>
        </Card>
    );
}
