import { useMemo, useState } from "react";
import { Card, Chip, Separator, Button, Link, Disclosure } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRateCards } from "../../../hooks/useRateCards";
import { useRateItemLookup } from "../../../hooks/useRateItemLookup";
import { Currency } from "../../../types/pricing";

const SHOW_THRESHOLD = 5;

interface RateCardTicketProps {
    cardId: string | null;
}

/**
 * RateCardTicket - Premium "Digital Ticket" preview of selected Rate Card.
 * Displays rate card details with refined typography, spacing, and micro-interactions.
 */
export function RateCardTicket({ cardId }: RateCardTicketProps) {
    const { data: cards } = useRateCards();
    const { getRateItem } = useRateItemLookup();
    const [showAllItems, setShowAllItems] = useState(false);

    const card = useMemo(() => {
        if (!cardId || !cards) return null;
        return cards.find(c => c.id === cardId);
    }, [cardId, cards]);

    // Map all entries to items - MUST be before early return
    const allItems = useMemo(() => {
        if (!card) return [];
        return card.entries.map(entry => {
            const item = getRateItem(entry.rateItemId);
            return {
                id: entry.id,
                name: item?.displayName || item?.name || "Unknown Item",
                clientRate: entry.clientRate,
                costRate: entry.costRate,
                unitType: item?.unitType || "unit",
                currency: card.currency
            };
        });
    }, [card, getRateItem]);

    // Show items based on toggle state
    const displayItems = showAllItems ? allItems : allItems.slice(0, SHOW_THRESHOLD);
    const hiddenCount = Math.max(0, allItems.length - SHOW_THRESHOLD);
    const hasMoreItems = allItems.length > SHOW_THRESHOLD;

    const formatCurrency = (val: number, cur: Currency) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: cur,
            minimumFractionDigits: 2
        }).format(val);
    };

    // Get currency flag icon
    const getCurrencyFlag = (currency: Currency) => {
        switch (currency) {
            case 'EUR':
                return 'circle-flags:eu';
            case 'GBP':
                return 'circle-flags:uk';
            case 'USD':
                return 'circle-flags:us';
            default:
                return 'circle-flags:us';
        }
    };

    if (!card) {
        return <RateCardTicketSkeleton />;
    }

    return (
        <Card
            variant="default"
            className="rounded-3xl border-none overflow-hidden h-full flex flex-col animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
            style={{ boxShadow: 'var(--surface-shadow)' }}
        >
            <Card.Header className="p-6 flex flex-col items-start relative">
                <div className="flex items-center gap-2 mb-3">
                    <div className="size-5 rounded-md bg-accent/10 flex items-center justify-center text-accent">
                        <Icon icon="lucide:ticket" className="size-3" />
                    </div>
                    <span className="t-mini font-bold uppercase tracking-[0.15em] text-accent/60">Selected Rate</span>
                </div>

                <div className="flex items-start justify-between w-full">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Icon icon={getCurrencyFlag(card.currency)} className="size-5" />
                            <h4 className="text-lg font-black tracking-tight">{card.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-default-400 font-mono">ID: {card.id.toUpperCase()}</span>
                            <Chip size="sm" variant="soft" className="font-mono font-bold t-micro bg-default-100/50 text-default-600 border-none px-1.5 h-5 shrink-0">
                                v{card.version}
                            </Chip>
                        </div>
                    </div>

                    <Button
                        isIconOnly
                        variant="tertiary"
                        size="sm"
                        onPress={() => window.open(`/rates/rate-cards/${card.id}`, '_blank')}
                        aria-label="View rate card details in new tab"
                    >
                        <Icon icon="lucide:external-link" className="size-4" />
                    </Button>
                </div>

                {/* Decorative perforation effect */}
                <div className="absolute -bottom-1 left-0 right-0 flex justify-between px-[-8px] pointer-events-none">
                    <div className="size-4 rounded-full bg-default-100 -ml-2 shadow-inner" />
                    <Separator className="w-full mx-2 my-auto border-dashed border-default-200" />
                    <div className="size-4 rounded-full bg-default-100 -mr-2 shadow-inner" />
                </div>
            </Card.Header>

            <Card.Content className="p-6 flex-1 space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black uppercase tracking-widest text-default-400">Rate Items</span>
                        <div className="flex gap-6">
                            <span className="text-xs font-black uppercase tracking-widest text-default-400 w-20 text-right">Revenue</span>
                            <span className="text-xs font-black uppercase tracking-widest text-default-400 w-20 text-right">Expense</span>
                        </div>
                    </div>

                    <div>
                        {/* First 5 items always visible */}
                        {displayItems.slice(0, SHOW_THRESHOLD).map((item, index) => (
                            <div key={item.id}>
                                <div className="flex items-center justify-between py-3 gap-3">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <span className="text-sm font-medium text-default-700 truncate">{item.name}</span>
                                        <Chip size="sm" variant="soft" className="t-micro font-bold uppercase shrink-0 px-2">
                                            {item.unitType}
                                        </Chip>
                                    </div>
                                    <div className="flex gap-6 shrink-0">
                                        <span className="text-sm font-bold font-mono text-default-900 w-20 text-right">
                                            {formatCurrency(item.clientRate, item.currency)}
                                        </span>
                                        <span className="text-sm font-bold font-mono text-default-500 w-20 text-right">
                                            {formatCurrency(item.costRate, item.currency)}
                                        </span>
                                    </div>
                                </div>
                                {index < Math.min(displayItems.length, SHOW_THRESHOLD) - 1 && (
                                    <Separator className="border-default-100" />
                                )}
                            </div>
                        ))}

                        {/* Hidden items with Disclosure */}
                        {hasMoreItems && (
                            <Disclosure isExpanded={showAllItems} onExpandedChange={setShowAllItems}>
                                <Disclosure.Content>
                                    <Disclosure.Body>
                                        {allItems.slice(SHOW_THRESHOLD).map((item, index) => (
                                            <div key={item.id}>
                                                {index === 0 && <Separator className="border-default-100" />}
                                                <div className="flex items-center justify-between py-3 gap-3">
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                        <span className="text-sm font-medium text-default-700 truncate">{item.name}</span>
                                                        <Chip size="sm" variant="soft" className="t-micro font-bold uppercase shrink-0 px-2">
                                                            {item.unitType}
                                                        </Chip>
                                                    </div>
                                                    <div className="flex gap-6 shrink-0">
                                                        <span className="text-sm font-bold font-mono text-default-900 w-20 text-right">
                                                            {formatCurrency(item.clientRate, item.currency)}
                                                        </span>
                                                        <span className="text-sm font-bold font-mono text-default-500 w-20 text-right">
                                                            {formatCurrency(item.costRate, item.currency)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {index < allItems.slice(SHOW_THRESHOLD).length - 1 && (
                                                    <Separator className="border-default-100" />
                                                )}
                                            </div>
                                        ))}
                                    </Disclosure.Body>
                                </Disclosure.Content>
                                <Disclosure.Heading>
                                    <Button
                                        slot="trigger"
                                        variant="ghost"
                                        fullWidth
                                        className="text-xs font-bold uppercase tracking-[0.15em] py-3 rounded-xl gap-2"
                                    >
                                        <Disclosure.Indicator />
                                        {showAllItems ? 'Show Less' : `Show ${hiddenCount} More`}
                                    </Button>
                                </Disclosure.Heading>
                            </Disclosure>
                        )}
                    </div>
                </div>
            </Card.Content>
        </Card>
    );
}

/**
 * RateCardTicketSkeleton - Empty state when no card is selected.
 * Shows a ghost outline of the ticket waiting to be filled.
 */
function RateCardTicketSkeleton() {
    return (
        <Card className="min-h-[400px]">
            <Card.Content className="p-12 flex flex-col items-center justify-center text-center h-full gap-6">
                <div className="space-y-4">
                    <Icon icon="lucide:ticket" className="size-16 text-default-300 mx-auto" />
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight text-default-400">
                            No Rate Card Selected
                        </h3>
                        <p className="text-xs text-default-400 mt-2 max-w-xs">
                            Select a rate card to preview pricing
                        </p>
                    </div>
                </div>
                <Link href="/rates?tab=rate-cards" target="_blank" className="text-xs font-bold">
                    Manage Rate Cards
                    <Link.Icon />
                </Link>
            </Card.Content>
        </Card>
    );
}
