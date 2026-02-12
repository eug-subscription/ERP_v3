import { Alert, Button, Skeleton, Card, Chip } from "@heroui/react";
import { useRateCards } from "../../../hooks/useRateCards";
import { Icon } from "@iconify/react";
import { CurrencyDisplay } from "../../pricing/CurrencyDisplay";
import { Status } from "../../../types/pricing";
import { EmptyState } from "../../pricing/EmptyState";
import { FilterBar } from "../../pricing/FilterBar";
import { Table } from "../../pricing/Table";
import { useState, useMemo } from "react";

import { METADATA_CLASSES } from "../../../constants/pricing";
import { useNavigate } from "@tanstack/react-router";

interface RateCardsListProps {
    onAdd?: () => void;
}

const getCurrencyIcon = (currency: string) => {
    switch (currency.toUpperCase()) {
        case 'EUR': return "circle-flags:eu";
        case 'GBP': return "circle-flags:uk";
        case 'USD': return "circle-flags:us";
        default: return "lucide:coins";
    }
};

export function RateCardsList({ onAdd }: RateCardsListProps) {
    const navigate = useNavigate();
    const { data: cards, isLoading, isError, refetch } = useRateCards();
    const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
    const [currencyFilter, setCurrencyFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const currencyOptions = useMemo(() => {
        if (!cards) return [{ key: 'all', label: 'All Currencies' }];

        const uniqueCurrencies = Array.from(new Set(cards.map(card => card.currency)));
        return [
            { key: 'all', label: 'All Currencies' },
            ...uniqueCurrencies.map(currency => ({
                key: currency,
                label: currency.toUpperCase()
            }))
        ];
    }, [cards]);

    const filteredCards = useMemo(() => {
        if (!cards) return [];

        let result = [...cards];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(card =>
                card.name.toLowerCase().includes(query)
            );
        }

        // Status Filter
        if (statusFilter !== 'all') {
            result = result.filter(card => card.status === statusFilter);
        }

        // Currency Filter
        if (currencyFilter !== 'all') {
            result = result.filter(card => card.currency === currencyFilter);
        }

        return result;
    }, [cards, searchQuery, statusFilter, currencyFilter]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="rounded-premium-lg bg-default-100/20 shadow-none overflow-hidden h-full">
                            <Card.Header className="p-6 pb-0">
                                <div className="space-y-1.5 flex-1">
                                    <Skeleton className="h-7 w-3/4 rounded-lg" />
                                    <Skeleton className="h-4 w-1/4 rounded-md" />
                                </div>
                                <Skeleton className="h-5 w-10 rounded-full" />
                            </Card.Header>
                            <Card.Content className="p-6">
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-16 rounded-lg" />
                                    <Skeleton className="h-6 w-16 rounded-lg" />
                                </div>
                            </Card.Content>
                            <Card.Footer className="p-6 flex justify-between items-end bg-default-100/30">
                                <div className="space-y-1.5">
                                    <Skeleton className="h-2.5 w-12 rounded-sm" />
                                    <Skeleton className="h-8 w-24 rounded-lg" />
                                </div>
                                <Skeleton className="h-10 w-28 rounded-xl" />
                            </Card.Footer>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <Alert status="danger" className="rounded-2xl">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title className="font-bold">Error Loading Rate Cards</Alert.Title>
                    <Alert.Description>
                        Failed to fetch rate cards. Please try again.
                    </Alert.Description>
                    <Button
                        size="sm"
                        variant="danger-soft"
                        onPress={() => refetch()}
                        className="font-bold mt-2"
                    >
                        Retry
                    </Button>
                </Alert.Content>
            </Alert>
        );
    }

    if (!cards || cards.length === 0) {
        return (
            <EmptyState
                icon="lucide:credit-card"
                title="No Rate Cards"
                description="Create custom rate cards for specific clients, seasons, or projects. You can define unique overrides for any rate item."
                actionLabel="Create First Card"
                onAction={onAdd}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Standardized Filter Bar with View Switcher */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full mb-8">
                <div className="flex-1 w-full">
                    <FilterBar
                        search={{
                            value: searchQuery,
                            onChange: setSearchQuery,
                            placeholder: "Search rate cards..."
                        }}
                        status={{
                            value: statusFilter,
                            onChange: setStatusFilter,
                            options: [
                                { key: 'all', label: 'All' },
                                { key: 'active', label: 'Active' },
                                { key: 'deprecated', label: 'Deprecated' },
                                { key: 'archived', label: 'Archived' }
                            ]
                        }}
                        currency={{
                            value: currencyFilter,
                            onChange: setCurrencyFilter,
                            options: currencyOptions
                        }}
                    />
                </div>
                <div className="flex-shrink-0 p-1.5 rounded-full bg-default-100/40 backdrop-blur-sm border-none flex items-center gap-1 h-[52px] self-start md:self-auto">
                    <Button
                        isIconOnly
                        size="sm"
                        variant={viewMode === 'grid' ? "primary" : "ghost"}
                        className={`rounded-full transition-all w-10 h-10 ${viewMode === 'grid' ? 'bg-accent text-white shadow-sm' : 'text-default-500 hover:bg-default-100'}`}
                        onPress={() => setViewMode('grid')}
                        aria-label="Grid View"
                    >
                        <Icon icon="lucide:layout-grid" width={18} />
                    </Button>
                    <Button
                        isIconOnly
                        size="sm"
                        variant={viewMode === 'list' ? "primary" : "ghost"}
                        className={`rounded-full transition-all w-10 h-10 ${viewMode === 'list' ? 'bg-accent text-white shadow-sm' : 'text-default-500 hover:bg-default-100'}`}
                        onPress={() => setViewMode('list')}
                        aria-label="List View"
                    >
                        <Icon icon="lucide:layout-list" width={18} />
                    </Button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCards.length > 0 ? (
                        filteredCards.map((card) => (
                            <Card
                                key={card.id}
                                className="group relative rounded-premium bg-default-100/40 dark:bg-default-50/5 backdrop-blur-xl hover:bg-default-100/60 dark:hover:bg-default-50/10 transition-all duration-500 shadow-sm hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                            >
                                <Card.Header className="p-5 pb-0 flex flex-col items-start gap-3">
                                    <div className="flex justify-between items-start w-full gap-2">
                                        <div className="space-y-1 min-w-0">
                                            <Card.Title className="text-lg font-black text-default-900 tracking-tightest group-hover:text-accent transition-colors duration-300 break-words leading-tight">
                                                {card.name}
                                            </Card.Title>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <Chip
                                                    size="sm"
                                                    color={card.status === 'active' ? 'success' : card.status === 'deprecated' ? 'warning' : 'default'}
                                                    variant="soft"
                                                    className="font-medium capitalize px-2 h-6 border-none"
                                                >
                                                    {card.status}
                                                </Chip>
                                                <span className="t-micro font-mono font-bold text-default-400 uppercase tracking-tighter truncate max-w-[80px]">
                                                    {card.id}
                                                </span>
                                            </div>
                                        </div>
                                        <Chip
                                            variant="soft"
                                            size="sm"
                                            className="font-mono font-bold t-micro bg-default-100/50 text-default-600 border-none px-1.5 h-5 shrink-0"
                                        >
                                            v{card.version}
                                        </Chip>
                                    </div>
                                </Card.Header>

                                <Card.Content className="p-5 pt-3 pb-5">
                                    <div className="flex flex-wrap gap-1.5">
                                        <div className="flex items-center gap-1 px-2 py-1 bg-default-100/40 dark:bg-default-50/20 rounded-lg border border-white/20 dark:border-default-100/10 transition-colors group-hover:border-accent/10">
                                            <Icon icon={getCurrencyIcon(card.currency)} width={14} className="shrink-0" />
                                            <span className="t-mini font-black text-default-700 uppercase tracking-tight">{card.currency}</span>
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 bg-default-100/40 dark:bg-default-50/20 rounded-lg border border-white/20 dark:border-default-100/10">
                                            <Icon icon="lucide:layers-2" width={12} className="text-default-400" />
                                            <span className="t-mini font-black text-default-700 uppercase tracking-tight">{card.entries.length} Items</span>
                                        </div>
                                    </div>
                                </Card.Content>

                                <Card.Footer className="p-5 flex justify-between items-end bg-default-100/30 dark:bg-default-100/5 group-hover:bg-default-100/50 transition-colors">
                                    <div className="space-y-0">
                                        <span className="t-micro font-black text-default-400 uppercase tracking-widest block leading-none">
                                            Starting Rate
                                        </span>
                                        <CurrencyDisplay
                                            amount={card.entries[0]?.clientRate || 0}
                                            currency={card.currency}
                                            size="sm"
                                            className="font-black text-default-900"
                                        />
                                    </div>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onPress={() => navigate({
                                            to: '/rates/rate-cards/$cardId',
                                            params: { cardId: card.id }
                                        })}
                                    >
                                        View Rates
                                        <Icon icon="lucide:arrow-right" />
                                    </Button>
                                </Card.Footer>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <EmptyState
                                icon="lucide:search-x"
                                title="No Matching Cards"
                                description={statusFilter !== 'all'
                                    ? `We couldn't find any rate cards matching your search in the '${statusFilter}' registry.`
                                    : "No rate cards match your search criteria."
                                }
                                actionLabel="Clear Filters"
                                onAction={() => {
                                    setSearchQuery("");
                                    setStatusFilter('all');
                                    setCurrencyFilter('all');
                                }}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <Table>
                    <Table.Header>
                        <tr>
                            <Table.Column isBlack>Card Identity</Table.Column>
                            <Table.Column align="center">Currency</Table.Column>
                            <Table.Column align="center">Price Points</Table.Column>
                            <Table.Column>Base Premium</Table.Column>
                            <Table.Column>Status</Table.Column>
                            <Table.Column align="right">Actions</Table.Column>
                        </tr>
                    </Table.Header>
                    <Table.Body>
                        {filteredCards.length > 0 ? (
                            filteredCards.map((card) => (
                                <Table.Row key={card.id}>
                                    <Table.Cell>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-default-100/50 rounded-xl text-accent ring-1 ring-default-100 shrink-0">
                                                <Icon icon="lucide:credit-card" width={20} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold t-compact text-foreground truncate tracking-tight uppercase">{card.name}</span>
                                                <span className={`${METADATA_CLASSES} mt-0.5`}>VERSION {card.version}.0</span>
                                            </div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell align="center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Icon icon={getCurrencyIcon(card.currency)} width={16} />
                                            <span className="font-bold text-xs text-default-700">{card.currency}</span>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell align="center">
                                        <div className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-default-100/30 text-default-600 ${METADATA_CLASSES}`}>
                                            {card.entries.length} ITEMS
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <CurrencyDisplay
                                            amount={card.entries[0]?.clientRate || 0}
                                            currency={card.currency}
                                            size="sm"
                                            className="font-bold"
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Chip
                                            size="sm"
                                            color={card.status === 'active' ? 'success' : card.status === 'deprecated' ? 'warning' : 'default'}
                                            variant="soft"
                                            className="font-medium capitalize px-2 h-6 border-none"
                                        >
                                            {card.status}
                                        </Chip>
                                    </Table.Cell>
                                    <Table.Cell align="right">
                                        <div className="flex items-center justify-end">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="ghost"
                                                className="rounded-full bg-default-100/50 text-accent transition-all hover:bg-accent/10 border border-transparent hover:border-accent/20"
                                                onPress={() => navigate({
                                                    to: '/rates/rate-cards/$cardId',
                                                    params: { cardId: card.id }
                                                })}
                                                aria-label={`View ${card.name}`}
                                            >
                                                <Icon icon="lucide:arrow-right" width={16} />
                                            </Button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-0">
                                    <EmptyState
                                        icon="lucide:search-x"
                                        title="No Matching Cards"
                                        description={statusFilter !== 'all'
                                            ? `We couldn't find any rate cards matching your search in the '${statusFilter}' registry.`
                                            : "No rate cards match your search criteria."
                                        }
                                        actionLabel="Clear Filters"
                                        onAction={() => {
                                            setSearchQuery("");
                                            setStatusFilter('all');
                                            setCurrencyFilter('all');
                                        }}
                                    />
                                </td>
                            </tr>
                        )}
                    </Table.Body>
                </Table>
            )}
        </div>
    );
}
