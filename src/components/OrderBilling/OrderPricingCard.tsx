import { useMemo } from "react";
import { Card, Chip, Separator, Skeleton, Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useProjectPricing } from "../../hooks/useProjectPricing";
import { useProjectOverrides } from "../../hooks/useProjectOverrides";
import { useRateCards } from "../../hooks/useRateCards";
import { useRateItemLookup } from "../../hooks/useRateItemLookup";
import { Currency } from "../../types/pricing";
import { formatCurrencyAmount } from "../../utils/formatters";

interface OrderPricingCardProps {
    projectId: string;
}

const getCurrencyFlag = (currency: Currency) => {
    switch (currency) {
        case 'EUR': return 'circle-flags:eu';
        case 'GBP': return 'circle-flags:uk';
        case 'USD': return 'circle-flags:us';
        default: return 'circle-flags:us';
    }
};


/**
 * OrderPricingCard - Read-only summary of project pricing shown in the order billing sidebar.
 * Displays the assigned rate card and any custom rate overrides.
 */
export function OrderPricingCard({ projectId }: OrderPricingCardProps) {
    const { data: pricing, isLoading: isPricingLoading } = useProjectPricing(projectId);
    const { data: overrides = [], isLoading: isOverridesLoading } = useProjectOverrides(projectId);
    const { data: rateCards, isLoading: isCardsLoading } = useRateCards(pricing?.currency);
    const { getRateItem } = useRateItemLookup();

    const isLoading = isPricingLoading || isCardsLoading || isOverridesLoading;

    const card = useMemo(() => {
        if (!pricing?.rateCardId || !rateCards) return null;
        return rateCards.find(c => c.id === pricing.rateCardId) ?? null;
    }, [pricing, rateCards]);

    const rateItems = useMemo(() => {
        if (!card) return [];
        return card.entries.map(entry => {
            const item = getRateItem(entry.rateItemId);
            return {
                id: entry.id,
                rateItemId: entry.rateItemId,
                name: item?.displayName || item?.name || "Unknown",
                unitType: item?.unitType || "unit",
                clientRate: entry.clientRate,
                costRate: entry.costRate,
            };
        });
    }, [card, getRateItem]);

    // Build override lookup: rateItemId → override
    const overrideLookup = useMemo(() => {
        const map = new Map<string, { clientRate?: number; costRate?: number; reason: string }>();
        for (const ov of overrides) {
            map.set(ov.rateItemId, { clientRate: ov.clientRate, costRate: ov.costRate, reason: ov.reason });
        }
        return map;
    }, [overrides]);

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

    if (!pricing?.rateCardId || !card) {
        return (
            <Card>
                <Card.Content className="p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[200px]">
                    <div className="p-3 bg-default-100 rounded-full">
                        <Icon icon="lucide:credit-card" className="size-8 text-default-300" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-default-400">No Pricing Configured</h3>
                        <p className="text-xs text-default-400 mt-1">Set up pricing in the project settings.</p>
                    </div>
                    <Link href={`/project/${projectId}/pricing-beta`} className="text-xs font-bold">
                        Configure Pricing
                        <Link.Icon />
                    </Link>
                </Card.Content>
            </Card>
        );
    }

    const currency = card.currency;

    return (
        <Card>
            {/* Header */}
            <Card.Header className="px-6 pt-6 pb-4 flex flex-col items-start bg-default-100/30 border-b border-default-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="size-5 rounded-md bg-accent/10 flex items-center justify-center text-accent">
                        <Icon icon="lucide:ticket" className="size-3" />
                    </div>
                    <span className="t-mini font-bold uppercase tracking-[0.15em] text-accent/60">Project Pricing</span>
                </div>

                <div className="flex items-start justify-between w-full">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Icon icon={getCurrencyFlag(currency)} className="size-5" />
                            <h4 className="text-base font-black tracking-tight">{card.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="t-mini font-bold text-default-400 font-mono">
                                {card.id.toUpperCase()}
                            </span>
                            <Chip size="sm" variant="soft" className="font-mono font-bold t-micro bg-default-100/50 text-default-600 border-none px-1.5 h-5 shrink-0">
                                v{card.version}
                            </Chip>
                        </div>
                    </div>
                </div>

                {/* Tax info chips */}
                <div className="flex gap-2 mt-3">
                    <Chip size="sm" variant="soft" color="accent" className="font-black t-micro h-5 px-2 uppercase tracking-tighter">
                        VAT {pricing.taxTreatment}
                    </Chip>
                    {pricing.taxRate > 0 && (
                        <Chip size="sm" variant="soft" className="font-bold t-micro h-5 px-2">
                            {(pricing.taxRate * 100).toFixed(0)}% Tax
                        </Chip>
                    )}
                </div>
            </Card.Header>

            {/* Rate Items */}
            <Card.Content className="p-6 space-y-5">
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="t-mini font-black uppercase tracking-widest text-default-400">Rate Items</span>
                        <div className="flex gap-4">
                            <span className="t-mini font-black uppercase tracking-widest text-default-400 w-16 text-right">Revenue</span>
                            <span className="t-mini font-black uppercase tracking-widest text-default-400 w-16 text-right">Expense</span>
                        </div>
                    </div>

                    {rateItems.map((item, index) => {
                        const override = overrideLookup.get(item.rateItemId);
                        const effectiveClient = override?.clientRate ?? item.clientRate;
                        const effectiveCost = override?.costRate ?? item.costRate;
                        const hasOverride = !!override;

                        return (
                            <div key={item.id}>
                                <div className="flex items-center justify-between py-2 gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                        <span className="text-xs font-medium text-default-700 truncate">{item.name}</span>
                                        <Chip size="sm" variant="soft" className="t-micro font-bold uppercase shrink-0 px-1.5 h-4">
                                            {item.unitType}
                                        </Chip>
                                        {hasOverride && (
                                            <Chip size="sm" variant="soft" color="warning" className="t-micro font-bold uppercase shrink-0 px-1.5 h-4">
                                                Custom
                                            </Chip>
                                        )}
                                    </div>
                                    <div className="flex gap-4 shrink-0">
                                        <div className="w-16 text-right">
                                            <span className={`text-xs font-bold font-mono ${hasOverride ? 'text-warning' : 'text-default-900'}`}>
                                                {formatCurrencyAmount(effectiveClient, currency)}
                                            </span>
                                            {hasOverride && override?.clientRate != null && (
                                                <span className="block t-micro font-mono text-default-400 line-through">
                                                    {formatCurrencyAmount(item.clientRate, currency)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="w-16 text-right">
                                            <span className={`text-xs font-bold font-mono ${hasOverride ? 'text-warning' : 'text-default-500'}`}>
                                                {formatCurrencyAmount(effectiveCost, currency)}
                                            </span>
                                            {hasOverride && override?.costRate != null && (
                                                <span className="block t-micro font-mono text-default-400 line-through">
                                                    {formatCurrencyAmount(item.costRate, currency)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {index < rateItems.length - 1 && <Separator className="border-default-100" />}
                            </div>
                        );
                    })}
                </div>

                {/* Custom Rates summary */}
                {overrides.length > 0 && (
                    <div className="bg-warning-50/50 border border-warning-100 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Icon icon="lucide:settings-2" className="size-3.5 text-warning" />
                            <span className="t-mini font-black uppercase tracking-widest text-warning-600">
                                {overrides.length} Custom Rate{overrides.length > 1 ? 's' : ''} Active
                            </span>
                        </div>
                        <p className="t-mini text-default-500 font-medium">
                            This project has custom pricing overrides. Items marked with "Custom" use project-specific rates.
                        </p>
                    </div>
                )}

                {/* Link to project pricing */}
                <div className="flex justify-center pt-1">
                    <Link
                        href={`/project/${projectId}/pricing-beta`}
                        className="t-mini font-bold uppercase tracking-[0.15em] text-accent/70 hover:text-accent transition-colors"
                    >
                        <Icon icon="lucide:external-link" className="size-3 mr-1.5" />
                        Configure in Project
                    </Link>
                </div>
            </Card.Content>
        </Card>
    );
}
