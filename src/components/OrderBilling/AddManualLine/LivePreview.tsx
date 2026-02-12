import { Separator } from "@heroui/react";
import { CurrencyDisplay } from "../../pricing/CurrencyDisplay";
import { Currency } from "../../../types/pricing";

interface ActivePricing {
    rateSource: string;
    taxTreatment: string;
    effectiveQuantity: number;
    finalCost: number;
    finalClient: number;
    currency: Currency;
    lineClientTotalPreTax: number;
    taxRate: number;
    taxAmount: number;
    margin: number;
    lineClientTotalIncTax: number;
}

interface LivePreviewProps {
    activePricing: ActivePricing | null;
}

export function LivePreview({ activePricing }: LivePreviewProps) {
    if (!activePricing) return null;

    return (
        <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 mt-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-accent">Live Preview</h4>
                <div className="flex gap-2">
                    <span className="t-mini font-black bg-accent/10 px-2 py-0.5 rounded-full text-accent uppercase">
                        {activePricing.rateSource.replace('_', ' ')}
                    </span>
                    <span className="t-mini font-black bg-default-100 px-2 py-0.5 rounded-full text-default-600 uppercase">
                        {activePricing.taxTreatment}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <span className="t-mini font-bold text-default-400 uppercase block">Effective Qty</span>
                    <span className="font-mono font-black text-default-900">{activePricing.effectiveQuantity}</span>
                </div>
                <div>
                    <span className="t-mini font-bold text-default-400 uppercase block">Final Expense Rate</span>
                    <CurrencyDisplay amount={activePricing.finalCost} currency={activePricing.currency} size="sm" variant="soft" />
                </div>
                <div>
                    <span className="t-mini font-bold text-default-400 uppercase block">Final Revenue Rate</span>
                    <CurrencyDisplay amount={activePricing.finalClient} currency={activePricing.currency} size="sm" color="accent" />
                </div>
                <div className="text-right">
                    <span className="t-mini font-bold text-default-400 uppercase block">Pre-tax Total</span>
                    <CurrencyDisplay amount={activePricing.lineClientTotalPreTax} currency={activePricing.currency} size="sm" color="accent" className="font-black" />
                </div>
            </div>

            <Separator className="my-3 bg-accent/10" />

            <div className="flex items-center justify-between">
                <div className="flex gap-4">
                    <div>
                        <span className="t-mini font-bold text-default-400 uppercase block">Tax ({activePricing.taxRate * 100}%)</span>
                        <CurrencyDisplay amount={activePricing.taxAmount} currency={activePricing.currency} size="sm" variant="soft" />
                    </div>
                    <div>
                        <span className="t-mini font-bold text-default-400 uppercase block">Margin</span>
                        <CurrencyDisplay amount={activePricing.margin} currency={activePricing.currency} size="sm" className="text-success font-bold" />
                    </div>
                </div>
                <div className="text-right">
                    <span className="t-mini font-bold text-default-400 uppercase block">Final Total (Inc. Tax)</span>
                    <CurrencyDisplay amount={activePricing.lineClientTotalIncTax} currency={activePricing.currency} size="md" color="accent" className="font-black" />
                </div>
            </div>
        </div>
    );
}
