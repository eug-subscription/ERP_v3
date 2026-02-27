import { useMemo, useState, useCallback } from "react";
import {
    ComboBox,
    Input,
    Label,
    ListBox,
    Spinner,
    Alert,
    Description,
    Link,
    Key
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRateCards } from "../../../hooks/useRateCards";
import { Currency, RateCard } from "../../../types/pricing";

const getCurrencyFlag = (currency: Currency) => {
    switch (currency) {
        case 'EUR': return 'circle-flags:eu';
        case 'GBP': return 'circle-flags:uk';
        case 'USD': return 'circle-flags:us';
        default: return 'lucide:coins';
    }
};

interface RateCardComboBoxProps {
    selectedCardId: string | null;
    onChange: (cardId: string | null, currency: Currency | null) => void;
}

/**
 * RateCardComboBox - Searchable selector for Rate Cards.
 * Uses HeroUI v3 ComboBox with simplified structure to avoid beta bugs.
 */
export function RateCardComboBox({
    selectedCardId,
    onChange
}: RateCardComboBoxProps) {
    const { data: rateCards, isLoading, error } = useRateCards();

    // Create a stable Map for O(1) lookups
    const cardMap = useMemo<Map<string, RateCard>>(() => {
        const map = new Map<string, RateCard>();
        if (!rateCards) return map;
        rateCards.forEach(card => {
            if (card.status === 'active') {
                map.set(card.id, card);
            }
        });
        return map;
    }, [rateCards]);

    // Active cards as array for rendering - sorted by currency then name
    const activeCards = useMemo(() => {
        return Array.from(cardMap.values()).sort((a, b) => {
            if (a.currency !== b.currency) return a.currency.localeCompare(b.currency);
            return a.name.localeCompare(b.name);
        });
    }, [cardMap]);

    // Get selected card from stable Map (O(1) lookup)
    const selectedCard = useMemo(() => {
        if (!selectedCardId) return null;
        return cardMap.get(selectedCardId) ?? null;
    }, [cardMap, selectedCardId]);

    // Local input state - what user types
    const [inputText, setInputText] = useState("");

    // Display value: show card name if selected, otherwise show what user typed
    const displayValue = selectedCard ? selectedCard.name : inputText;

    // Handle selection - uses stable cardMap lookup
    const handleSelectionChange = useCallback((key: Key | null) => {
        if (key === null) {
            setInputText("");
            onChange(null, null);
            return;
        }
        const card = cardMap.get(key as string);
        if (card) {
            setInputText(""); // Clear input after selection
            onChange(card.id, card.currency);
        }
    }, [cardMap, onChange]);

    // Handle input change
    const handleInputChange = useCallback((value: string) => {
        setInputText(value);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center gap-3 py-2 px-1">
                <Spinner size="sm" color="accent" />
                <p className="text-xs text-default-500 font-medium">Loading rate cards...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert status="danger" className="rounded-2xl border-none bg-danger/10">
                <Alert.Content className="text-xs font-bold uppercase tracking-tight">
                    Failed to load Rate Cards
                </Alert.Content>
            </Alert>
        );
    }

    return (
        <ComboBox
            className="w-full"
            selectedKey={selectedCardId ?? undefined}
            inputValue={displayValue}
            onSelectionChange={handleSelectionChange}
            onInputChange={handleInputChange}
            menuTrigger="focus"
        >
            <Label className="t-mini font-bold uppercase tracking-[0.15em] text-default-400">Assign Rate Card</Label>

            <ComboBox.InputGroup className="relative">
                {selectedCard && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        <Icon icon={getCurrencyFlag(selectedCard.currency)} className="size-5" />
                    </div>
                )}
                <Input
                    placeholder="Search rate cards..."
                    className={selectedCard ? "pl-12" : ""}
                />
                <ComboBox.Trigger />
            </ComboBox.InputGroup>

            {/* Selected Card Summary - uses HeroUI Description with default styling */}
            {selectedCard && (
                <Description>
                    v{selectedCard.version}.0 · {selectedCard.entries.length} item{selectedCard.entries.length !== 1 ? 's' : ''} · {selectedCard.id.slice(0, 6)}
                </Description>
            )}
            <ComboBox.Popover className="w-(--trigger-width)">
                <ListBox className="p-1 max-h-[300px] overflow-y-auto">
                    {activeCards.map(card => {
                        return (
                            <ListBox.Item
                                key={card.id}
                                id={card.id}
                                textValue={`${card.name} ${card.currency} ${card.id}`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Icon
                                            icon={getCurrencyFlag(card.currency)}
                                            className="size-4"
                                        />
                                        <span className="font-medium text-sm">
                                            {card.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-default-400">
                                        {card.entries.length} items · {card.id.slice(0, 6)}
                                    </span>
                                </div>
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                        );
                    })}

                    {activeCards.length === 0 && (
                        <div className="p-4 text-center text-sm text-default-400">
                            No rate cards available
                        </div>
                    )}
                </ListBox>

                {/* Footer: Manage Rate Cards link */}
                <div className="border-t border-default-100 px-3 py-2">
                    <Link
                        href="/rates?tab=rate-cards"
                        target="_blank"
                        className="t-mini font-bold uppercase tracking-[0.15em] text-default-400 hover:text-accent no-underline transition-colors"
                    >
                        Manage Rate Cards
                        <Link.Icon />
                    </Link>
                </div>
            </ComboBox.Popover>
        </ComboBox>
    );
}
