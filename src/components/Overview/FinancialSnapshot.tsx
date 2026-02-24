import { Card, Skeleton, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link } from '@tanstack/react-router';
import { useOrderBillingSummary } from '../../hooks/useOrderBilling';
import { formatCurrencyAmount, formatPercentage } from '../../utils/formatters';
import { TEXT_SECTION_LABEL } from '../../constants/ui-tokens';

interface FinancialSnapshotProps {
    orderId: string;
}

export function FinancialSnapshot({ orderId }: FinancialSnapshotProps) {
    const { summary, isLoading } = useOrderBillingSummary(orderId);

    const marginPositive = (summary?.marginPercentage ?? 0) >= 0;

    return (
        <Card>
            <Card.Content className="p-5 flex flex-col gap-4">
                {/* ── Header ─────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Icon icon="lucide:calculator" className="size-4 text-default-500" />
                        <h3 className={TEXT_SECTION_LABEL}>Financials</h3>
                    </div>
                    <Link
                        to="/billing"
                        className="text-xs text-default-400 hover:text-accent font-medium transition-colors shrink-0"
                    >
                        View Billing
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-16 w-full rounded-xl" />
                            <Skeleton className="h-16 w-full rounded-xl" />
                        </div>
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                ) : !summary ? (
                    <div className="flex flex-col items-center justify-center py-6 opacity-70">
                        <div className="p-3 bg-default rounded-full mb-3">
                            <Icon icon="lucide:calculator" className="size-6 text-default-300" />
                        </div>
                        <p className="text-sm font-medium text-default-500 text-center">
                            No billing data yet.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* ── Hero: Revenue ──────────────────── */}
                        <div className="rounded-xl bg-gradient-to-br from-accent/[0.04] to-accent/[0.08] border border-accent/10 px-5 py-4">
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

                        {/* ── Secondary: Expense + Margin ────── */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-default/40 border border-default px-4 py-3">
                                <span className="t-micro font-bold uppercase tracking-widest text-default-400 block mb-1.5">
                                    Expense
                                </span>
                                <span className="text-base font-black font-mono tabular-nums text-default-700">
                                    {formatCurrencyAmount(summary.totalCost, summary.currency)}
                                </span>
                            </div>

                            <div
                                className={`rounded-xl border px-4 py-3 ${marginPositive
                                    ? 'bg-success/10 border-success/20'
                                    : 'bg-danger/10 border-danger/20'
                                    }`}
                            >
                                <span className="t-micro font-bold uppercase tracking-widest text-default-400 block mb-1.5">
                                    Margin
                                </span>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                        className={`text-base font-black font-mono tabular-nums ${marginPositive ? 'text-success-600' : 'text-danger-600'
                                            }`}
                                    >
                                        {formatCurrencyAmount(summary.absoluteMargin, summary.currency)}
                                    </span>
                                    <Chip
                                        size="sm"
                                        color={marginPositive ? 'success' : 'danger'}
                                        variant="soft"
                                        className="font-black t-micro h-5 px-1.5"
                                    >
                                        {formatPercentage(summary.marginPercentage)}
                                    </Chip>
                                </div>
                            </div>
                        </div>

                        {/* ── Footer: Tax + Total ─────────────── */}
                        <div className="rounded-xl bg-default/40 border border-default overflow-hidden">
                            <div className="grid grid-cols-2 divide-x divide-default">
                                <div className="px-4 py-3">
                                    <span className="t-micro font-bold uppercase tracking-widest text-default-400 block mb-0.5">
                                        Tax
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
                    </>
                )}
            </Card.Content>
        </Card>
    );
}
