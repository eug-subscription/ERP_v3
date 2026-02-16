import { Chip, Separator } from "@heroui/react";
import { CurrencyDisplay } from "../../pricing/CurrencyDisplay";
import { Currency, RateSource } from "../../../types/pricing";

interface ActivePricing {
    rateSource: RateSource | string;
    taxTreatment: string;
    effectiveQuantity: number;
    finalCost: number;
    finalClient: number;
    currency: Currency;
    lineCostTotal: number;
    lineClientTotalPreTax: number;
    taxRate: number;
    taxAmount: number;
    margin: number;
    lineClientTotalIncTax: number;
}

interface LivePreviewProps {
    activePricing: ActivePricing | null;
    rateItemName?: string;
}

/** Wrapper that triggers a subtle scale animation when `valueKey` changes. */
function AnimatedValue({ valueKey, children }: { valueKey: number; children: React.ReactNode }) {
    return (
        <span key={valueKey} className="inline-block animate-value-update">
            {children}
        </span>
    );
}

/**
 * LivePreview - Compact billing summary with funnel layout.
 * Grid-aligned line breakdown → derived totals → hero total at bottom.
 */
export function LivePreview({ activePricing, rateItemName }: LivePreviewProps) {
    if (!activePricing) return null;

    const taxPercent = Math.round(activePricing.taxRate * 100);
    const marginPercent = activePricing.lineClientTotalPreTax !== 0
        ? Math.round(activePricing.margin / activePricing.lineClientTotalPreTax * 100)
        : 0;

    return (
        <div className="rounded-xl bg-accent/5 border border-accent/10 my-3 animate-in fade-in zoom-in-95 overflow-hidden text-sm">
            {/* Header — Preview label left, rate item chip right */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <div>
                    <span className="text-xs font-black uppercase tracking-widest text-accent">Preview</span>
                    <span className="text-xs text-default-400 ml-1.5 capitalize">· {activePricing.rateSource.split('_').join(' ')}</span>
                </div>
                {rateItemName && (
                    <Chip size="sm" variant="secondary" className="font-semibold">{rateItemName}</Chip>
                )}
            </div>

            <Separator className="bg-accent/10" />

            {/* Line Breakdown — rate × qty = total, grid-aligned columns */}
            <div className="px-4 py-2 grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-1.5 gap-y-1 items-center font-mono text-sm">
                {/* Revenue row */}
                <span className="text-default-500 font-sans mr-auto col-span-6 sm:col-span-1 sm:mr-2">Revenue</span>
                <AnimatedValue valueKey={activePricing.finalClient}>
                    <span className="text-right"><CurrencyDisplay amount={activePricing.finalClient} currency={activePricing.currency} size="sm" variant="soft" /></span>
                </AnimatedValue>
                <span className="text-default-300 text-xs text-center">×</span>
                <span className="text-default-600 tabular-nums text-right">{activePricing.effectiveQuantity}</span>
                <span className="text-default-300 text-xs text-center">=</span>
                <AnimatedValue valueKey={activePricing.lineClientTotalPreTax}>
                    <span className="text-right"><CurrencyDisplay amount={activePricing.lineClientTotalPreTax} currency={activePricing.currency} size="sm" variant="soft" /></span>
                </AnimatedValue>

                {/* Expense row */}
                <span className="text-default-500 font-sans mr-auto col-span-6 sm:col-span-1 sm:mr-2">Expense</span>
                <AnimatedValue valueKey={activePricing.finalCost}>
                    <span className="text-right"><CurrencyDisplay amount={activePricing.finalCost} currency={activePricing.currency} size="sm" variant="soft" /></span>
                </AnimatedValue>
                <span className="text-default-300 text-xs text-center">×</span>
                <span className="text-default-600 tabular-nums text-right">{activePricing.effectiveQuantity}</span>
                <span className="text-default-300 text-xs text-center">=</span>
                <AnimatedValue valueKey={activePricing.lineCostTotal}>
                    <span className="text-right"><CurrencyDisplay amount={activePricing.lineCostTotal} currency={activePricing.currency} size="sm" variant="soft" /></span>
                </AnimatedValue>
            </div>

            <Separator className="bg-accent/10" />

            {/* Footer — Margin, Tax, then Total as punchline */}
            <div className="px-4 py-2.5 flex items-end justify-between">
                <div className="flex gap-3">
                    <div>
                        <span className="text-xs text-default-400">Margin</span>
                        <AnimatedValue valueKey={activePricing.margin}>
                            <div className="flex items-baseline gap-1">
                                <CurrencyDisplay amount={activePricing.margin} currency={activePricing.currency} size="sm" color={activePricing.margin >= 0 ? "success" : "danger"} className="font-bold" />
                                {activePricing.lineClientTotalPreTax !== 0 && (
                                    <span className={`text-xs ${activePricing.margin >= 0 ? 'text-success' : 'text-danger'}`}>
                                        ({marginPercent}%)
                                    </span>
                                )}
                            </div>
                        </AnimatedValue>
                    </div>
                    <div>
                        <span className="text-xs text-default-400">Tax ({taxPercent}%)</span>
                        <AnimatedValue valueKey={activePricing.taxAmount}>
                            <div><CurrencyDisplay amount={activePricing.taxAmount} currency={activePricing.currency} size="sm" variant="soft" /></div>
                        </AnimatedValue>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xs text-default-400">Total (inc. tax)</span>
                    <AnimatedValue valueKey={activePricing.lineClientTotalIncTax}>
                        <div><CurrencyDisplay amount={activePricing.lineClientTotalIncTax} currency={activePricing.currency} size="md" color="accent" className="font-black" /></div>
                    </AnimatedValue>
                </div>
            </div>
        </div>
    );
}
