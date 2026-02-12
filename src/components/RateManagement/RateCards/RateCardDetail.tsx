import { Icon } from "@iconify/react";
import {
    Button,
    Chip,
    toast,
    AlertDialog,
    Breadcrumbs,
    Skeleton
} from "@heroui/react";
import {
    useCreateRateCardEntry,
    useUpdateRateCardEntry,
    useDeleteRateCardEntry
} from "../../../hooks/useAdminPricingMutations";
import { EmptyState } from "../../pricing/EmptyState";
import { RateCardEntry } from "../../../types/pricing";

import { getCurrencyFlagIcon } from "../../../utils/currency";
import { RateDisplay } from "../../pricing/RateDisplay";
import { RateCardEntryEditor } from "./RateCardEntryEditor";
import { Table } from "../../pricing/Table";
import { useState } from "react";
import { METADATA_CLASSES, PRICING_ITEM_TRACKING } from "../../../constants/pricing";
import { useRateItemLookup } from "../../../hooks/useRateItemLookup";
import { parsePricingRules } from "../../../utils/pricing";
import { useRateCards } from "../../../hooks/useRateCards";
import { Link, useNavigate } from "@tanstack/react-router";

interface RateCardDetailProps {
    cardId: string;
}

/**
 * RateCardDetail - Detailed view of a single Rate Card and its entries.
 * Implements Task 2.2.2 and Task 2.2.3 (integrated entry editor).
 */
export function RateCardDetail({ cardId }: RateCardDetailProps) {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<RateCardEntry | undefined>();


    const { data: cards, isLoading } = useRateCards();
    const { getRateItem } = useRateItemLookup();
    const navigate = useNavigate();

    const createEntry = useCreateRateCardEntry();
    const updateEntry = useUpdateRateCardEntry();
    const deleteEntry = useDeleteRateCardEntry();

    const card = cards?.find(c => c.id === cardId);


    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="space-y-6">
                    <Skeleton className="h-10 w-96 rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-12 w-64 rounded-lg" />
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
            </div>
        );
    }


    if (!card) {
        return (
            <EmptyState
                icon="lucide:alert-triangle"
                title="Rate Card Not Found"
                description="The requested rate card could not be found. It may have been deleted or you may not have access to it."
                actionLabel="View All Rate Cards"
                actionIcon="lucide:credit-card"
                onAction={() => navigate({ to: '/rates', search: { tab: 'rate-cards' } })}
            />
        );
    }

    const handleAddEntry = () => {
        setSelectedEntry(undefined);
        setIsEditorOpen(true);
    };

    const handleEditEntry = (entry: RateCardEntry) => {
        setSelectedEntry(entry);
        setIsEditorOpen(true);
    };

    const handleEntrySuccess = (entryData: Partial<RateCardEntry>) => {
        if (selectedEntry) {
            updateEntry.mutate({ cardId: card.id, entry: entryData }, {
                onSuccess: () => {
                    toast("Entry Updated", {
                        variant: "success",
                        description: "Successfully saved changes to rate entry."
                    });
                    setIsEditorOpen(false);
                },
                onError: (error: Error) => {
                    toast("Update Failed", {
                        variant: "danger",
                        description: error.message || "Could not update rate entry."
                    });
                }
            });
        } else {
            createEntry.mutate({ cardId: card.id, entry: entryData }, {
                onSuccess: () => {
                    toast("Entry Added", {
                        variant: "success",
                        description: "Successfully added new entry to the rate card."
                    });
                    setIsEditorOpen(false);
                },
                onError: (error: Error) => {
                    toast("Creation Failed", {
                        variant: "danger",
                        description: error.message || "Could not create rate entry."
                    });
                }
            });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Avant-Garde Document Header */}
            <div className="space-y-6">
                <Breadcrumbs
                    separator={<Icon icon="lucide:chevron-right" className="text-default-300 w-4 h-4" />}
                    className="mb-4"
                >
                    <Breadcrumbs.Item>
                        <Link to="/rates" search={{ tab: "rate-cards" }}>
                            Administration
                        </Link>
                    </Breadcrumbs.Item>
                    <Breadcrumbs.Item>
                        <Link to="/rates" search={{ tab: "rate-cards" }}>
                            Pricing Catalog
                        </Link>
                    </Breadcrumbs.Item>
                    <Breadcrumbs.Item className="text-accent font-bold tracking-tight">{card.name}</Breadcrumbs.Item>
                </Breadcrumbs>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{card.name}</h1>
                            <div className="px-1.5 py-0.5 rounded-md bg-default-100/50 text-default-400 font-mono t-micro font-black uppercase tracking-tighter self-start mt-1.5 border border-default-200/30">
                                V {card.version}.0
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Chip
                                size="sm"
                                color={card.status === 'active' ? 'success' : card.status === 'deprecated' ? 'warning' : 'default'}
                                variant="soft"
                                className="font-medium capitalize px-2 h-6 border-none"
                            >
                                {card.status}
                            </Chip>

                            <div className="h-4 w-px bg-default-200/50 mx-1" />

                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-default-100/40 text-default-600 font-bold t-micro uppercase tracking-wider">
                                <Icon icon={getCurrencyFlagIcon(card.currency)} width={14} className="opacity-70" />
                                {card.currency}
                            </div>

                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/5 text-accent font-bold t-micro uppercase tracking-wider border border-accent/10">
                                <Icon icon="lucide:layers-2" width={12} className="opacity-70" />
                                {card.entries.length} ITEMS
                            </div>

                            <div className="flex items-center gap-1.5 px-2.5 py-1 text-default-400 font-medium t-micro uppercase tracking-widest ml-1">
                                <span className="w-1 h-1 rounded-full bg-default-300 mr-1" />
                                Updated recently
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        size="lg"
                        onPress={handleAddEntry}
                    >
                        <Icon icon="lucide:plus" width={20} className="mr-1" />
                        Add Rate Entry
                    </Button>
                </div>
            </div>

            {/* Rate Line Items Section */}
            <div className="mt-12 mb-6 flex items-center gap-4 px-1">
                <div className="flex items-center gap-3 shrink-0">
                    <h2 className="text-xl font-black tracking-tight text-foreground uppercase">Rate Line Items</h2>
                    <div className="h-4 w-px bg-default-200/50" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-default-100 to-transparent" />
            </div>

            <Table>
                <Table.Header>
                    <tr>
                        <Table.Column isBlack className="w-[32%]">Rate Item Identity</Table.Column>
                        <Table.Column className="w-[28%] px-6">
                            <div className="flex items-center">
                                <span className="w-[88px] text-right">Revenue</span>
                                <span className="w-10 text-center opacity-30">—</span>
                                <span className="w-[80px] text-left">Expense</span>
                            </div>
                        </Table.Column>
                        <Table.Column className="w-[15%]">Margin</Table.Column>
                        <Table.Column className="w-[15%]">Ruleset</Table.Column>
                        <Table.Column align="right" className="w-[10%]">Actions</Table.Column>
                    </tr>
                </Table.Header>
                <Table.Body>
                    {card.entries.length > 0 ? (
                        card.entries.map((entry) => {
                            const rateItem = getRateItem(entry.rateItemId);
                            const rules = parsePricingRules(entry.rulesJson);


                            return (
                                <Table.Row key={entry.id} className="group/item">
                                    <Table.Cell>
                                        <div className="flex flex-col items-start min-w-[200px]">
                                            <span className={`font-bold text-foreground t-compact ${PRICING_ITEM_TRACKING} uppercase`}>
                                                {rateItem?.name || 'Unknown Item'}
                                            </span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`${METADATA_CLASSES} t-micro opacity-60`}>ID: {entry.rateItemId}</span>
                                                <Chip
                                                    size="sm"
                                                    variant="soft"
                                                    className={`font-black uppercase t-micro px-1.5 h-4 bg-default-100 text-default-500 border-none opacity-80`}
                                                >
                                                    {rateItem?.unitType || 'unit'}
                                                </Chip>
                                            </div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <RateDisplay
                                            costRate={entry.costRate}
                                            clientRate={entry.clientRate}
                                            currency={card.currency}
                                            unitType={rateItem?.unitType || 'hour'}
                                            showMargin={false}
                                            size="sm"
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <RateDisplay
                                            costRate={entry.costRate}
                                            clientRate={entry.clientRate}
                                            currency={card.currency}
                                            unitType={rateItem?.unitType || 'hour'}
                                            showMarginOnly
                                            size="sm"
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        {rules ? (
                                            <div className="flex flex-wrap gap-2">
                                                {rules.ruleType === 'minimum' && (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-warning/5 border border-warning/10 text-warning-700 t-mini font-black uppercase tracking-widest transition-colors">
                                                        <Icon icon="lucide:lock" width={12} className="text-warning-500" />
                                                        <span>Min {rules.minimum} {rules.unit || 'units'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-default-200 font-black tracking-widest text-xs ml-4">—</span>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell align="right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="ghost"
                                                className="rounded-full text-accent hover:bg-accent/5 border-none"
                                                onPress={() => handleEditEntry(entry)}
                                                aria-label="Edit entry"
                                            >
                                                <Icon icon="lucide:edit-3" width={16} />
                                            </Button>

                                            <AlertDialog>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="ghost"
                                                    className="rounded-full text-danger hover:bg-danger/5 border-none"
                                                    aria-label={`Remove ${rateItem?.name || 'entry'} from card`}
                                                >
                                                    <Icon icon="lucide:trash-2" width={16} />
                                                </Button>
                                                <AlertDialog.Backdrop className="backdrop-blur-sm bg-black/20">
                                                    <AlertDialog.Container>
                                                        <AlertDialog.Dialog className="max-w-md">
                                                            <AlertDialog.CloseTrigger />
                                                            <AlertDialog.Header>
                                                                <AlertDialog.Icon status="danger" />
                                                                <AlertDialog.Heading>
                                                                    Remove Rate Entry?
                                                                </AlertDialog.Heading>
                                                            </AlertDialog.Header>
                                                            <AlertDialog.Body>
                                                                <p className="text-default-600">
                                                                    Are you sure you want to remove <span className="font-bold text-foreground">"{rateItem?.name}"</span> from this rate card?
                                                                    This action cannot be undone.
                                                                </p>
                                                            </AlertDialog.Body>
                                                            <AlertDialog.Footer>
                                                                <Button
                                                                    slot="close"
                                                                    variant="tertiary"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    slot="close"
                                                                    variant="danger"
                                                                    onPress={() => {
                                                                        deleteEntry.mutate({ cardId: card.id, entryId: entry.id }, {
                                                                            onSuccess: () => {
                                                                                toast("Entry Removed", {
                                                                                    variant: "success",
                                                                                    description: "Rate entry has been removed from the card."
                                                                                });
                                                                            },
                                                                            onError: (error: Error) => {
                                                                                toast("Remove Failed", {
                                                                                    variant: "danger",
                                                                                    description: error.message || "Could not remove rate entry."
                                                                                });
                                                                            }
                                                                        });
                                                                    }}
                                                                >
                                                                    Remove Entry
                                                                </Button>
                                                            </AlertDialog.Footer>
                                                        </AlertDialog.Dialog>
                                                    </AlertDialog.Container>
                                                </AlertDialog.Backdrop>
                                            </AlertDialog>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} className="p-0">
                                <EmptyState
                                    icon="lucide:layers"
                                    title="No Entries Defined"
                                    description="This rate card has no pricing entries yet. Start building your catalog by adding your first rate item mapping."
                                    actionLabel="Add First Entry"
                                    onAction={handleAddEntry}
                                />
                            </td>
                        </tr>
                    )}
                </Table.Body>
            </Table>

            {/* Entry Editor Modal */}
            <RateCardEntryEditor
                isOpen={isEditorOpen}
                onOpenChange={setIsEditorOpen}
                card={card}
                entry={selectedEntry}
                onSuccess={handleEntrySuccess}
            />
        </div>
    );
}
