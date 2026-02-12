import { useMemo, useState } from "react";
import {
    Button,
    Skeleton,
    Alert,
    AlertDialog,
    Tooltip,
    Chip
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useProjectOverrides, useRemoveProjectOverride } from "../../../hooks/useProjectOverrides";
import { useRateItems } from "../../../hooks/useRateItems";
import { useRateCards } from "../../../hooks/useRateCards";
import { CurrencyDisplay } from "../../pricing/CurrencyDisplay";
import { EmptyState } from "../../pricing/EmptyState";
import { Table } from "../../pricing/Table";
import { FilterBar } from "../../pricing/FilterBar";
import { ProjectPricingOverride, Currency } from "../../../types/pricing";
import {
    SKELETON_ROW_HEIGHT,
    TOOLTIP_DELAY,
    REVENUE_COLUMN_WIDTH,
    EXPENSE_COLUMN_WIDTH,
    RATE_SEPARATOR_WIDTH,
    PERCENTAGE_DECIMALS,
    MARGIN_PERCENTAGE_DECIMALS,
    CURRENCY_DECIMALS
} from "../../../constants/ui-tokens";
import { PRICING_ITEM_TRACKING, MARGIN_DANGER_THRESHOLD } from "../../../constants/pricing";
import { getCurrencySymbol } from "../../../utils/currency";
import { formatAmount, formatPercentage } from "../../../utils/formatters";

interface ProjectOverridesTableProps {
    projectId: string;
    currency: Currency;
    rateCardId: string;
    onEdit?: (override: ProjectPricingOverride) => void;
    onAdd?: () => void;
}


/**
 * ProjectOverridesTable - Displays and manages project-level rate overrides.
 * Includes visual diffs between base rate card values and overrides.
 */
export function ProjectOverridesTable({
    projectId,
    currency,
    rateCardId,
    onEdit,
    onAdd
}: ProjectOverridesTableProps) {
    const { data: overrides, isLoading: isOverridesLoading, error: overridesError } = useProjectOverrides(projectId);
    const { data: rateItems, isLoading: isItemsLoading } = useRateItems();
    const { data: rateCards, isLoading: isCardsLoading } = useRateCards(currency);
    const deleteMutation = useRemoveProjectOverride();

    // State for delete confirmation dialog
    const [overrideToDelete, setOverrideToDelete] = useState<ProjectPricingOverride | null>(null);

    // Search state for conditional FilterBar
    const [searchQuery, setSearchQuery] = useState("");

    const isLoading = isOverridesLoading || isItemsLoading || isCardsLoading;

    // Find the current rate card to get base prices
    const currentRateCard = useMemo(() => {
        return rateCards?.find(rc => rc.id === rateCardId);
    }, [rateCards, rateCardId]);

    // Filter overrides based on search query
    const filteredOverrides = useMemo(() => {
        if (!overrides) return [];
        if (!searchQuery) return overrides;

        const query = searchQuery.toLowerCase();
        return overrides.filter(override => {
            const rateItem = rateItems?.find(ri => ri.id === override.rateItemId);
            return (
                rateItem?.name.toLowerCase().includes(query) ||
                rateItem?.displayName?.toLowerCase().includes(query) ||
                override.reason.toLowerCase().includes(query)
            );
        });
    }, [overrides, searchQuery, rateItems]);

    const handleRemove = () => {
        if (!overrideToDelete) return;
        deleteMutation.mutate(
            { overrideId: overrideToDelete.id, projectId },
            {
                onSuccess: () => {
                    setOverrideToDelete(null);
                }
            }
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className={`${SKELETON_ROW_HEIGHT} w-full rounded-xl`} />
                <Skeleton className={`${SKELETON_ROW_HEIGHT} w-full rounded-xl`} />
                <Skeleton className={`${SKELETON_ROW_HEIGHT} w-full rounded-xl`} />
            </div>
        );
    }

    if (overridesError) {
        return (
            <Alert status="danger" className="rounded-2xl">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title>Error loading overrides</Alert.Title>
                    <Alert.Description>Could not fetch project overrides.</Alert.Description>
                </Alert.Content>
            </Alert>
        );
    }

    if (!overrides || overrides.length === 0) {
        return (
            <EmptyState
                icon="lucide:settings-2"
                title="No Custom Rates"
                description="Add a custom rate to set project-specific pricing for any rate item."
                actionLabel="Add First Custom Rate"
                actionIcon="lucide:plus"
                onAction={onAdd}
            />
        );
    }

    // Determine if FilterBar should be shown (5+ overrides)
    const showFilterBar = overrides && overrides.length >= 5;

    return (
        <>
            {/* Conditional FilterBar - only shown when 5+ overrides exist */}
            {showFilterBar && (
                <div className="mb-6">
                    <FilterBar
                        search={{
                            value: searchQuery,
                            onChange: setSearchQuery,
                            placeholder: "Search overrides by rate item name...",
                        }}
                    />
                </div>
            )}

            <Table className="min-w-[640px] animate-in fade-in slide-in-from-bottom-2 duration-700">
                <Table.Header>
                    <tr>
                        <Table.Column>Rate Item</Table.Column>
                        <Table.Column className="px-6">
                            <Tooltip delay={TOOLTIP_DELAY}>
                                <Tooltip.Trigger className="cursor-help">
                                    <div className="flex items-center">
                                        <span className={`${REVENUE_COLUMN_WIDTH} text-right`}>Revenue</span>
                                        <span className={`${RATE_SEPARATOR_WIDTH} text-center opacity-30`}>—</span>
                                        <span className={`${EXPENSE_COLUMN_WIDTH} text-left`}>Expense</span>
                                    </div>
                                </Tooltip.Trigger>
                                <Tooltip.Content className="max-w-xs">
                                    Revenue (client rate) and Expense (cost rate) for this override. Shows base rate → override rate with visual indicator.
                                </Tooltip.Content>
                            </Tooltip>
                        </Table.Column>
                        <Table.Column>Margin</Table.Column>
                        <Table.Column className="hidden lg:table-cell w-[200px]">Context / Reason</Table.Column>
                        <Table.Column align="right">Settings</Table.Column>
                    </tr>
                </Table.Header>
                <Table.Body>
                    {filteredOverrides.map((override) => {
                        const rateItem = rateItems?.find(ri => ri.id === override.rateItemId);
                        const baseEntry = currentRateCard?.entries.find(e => e.rateItemId === override.rateItemId);

                        const hasCostOverride = override.costRate !== undefined && baseEntry && override.costRate !== baseEntry.costRate;
                        const hasClientOverride = override.clientRate !== undefined && baseEntry && override.clientRate !== baseEntry.clientRate;

                        // Calculate percentage changes
                        const costPercentChange = hasCostOverride && baseEntry
                            ? ((override.costRate! - baseEntry.costRate) / baseEntry.costRate) * 100
                            : 0;
                        const clientPercentChange = hasClientOverride && baseEntry
                            ? ((override.clientRate! - baseEntry.clientRate) / baseEntry.clientRate) * 100
                            : 0;

                        return (
                            <Table.Row key={override.id}>
                                <Table.Cell>
                                    <div className="flex flex-col gap-1">
                                        <span className={`font-bold t-compact text-foreground uppercase ${PRICING_ITEM_TRACKING}`}>
                                            {rateItem?.displayName || rateItem?.name || "Unknown Item"}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <span className="font-mono text-xs text-default-500">
                                                ID: {override.rateItemId}
                                            </span>
                                            <span className="size-1 rounded-full bg-default-200" />
                                            <Chip
                                                size="sm"
                                                variant="soft"
                                                className="font-medium uppercase px-2 bg-default-100/50 text-default-600 border-none"
                                            >
                                                {rateItem?.unitType}
                                            </Chip>
                                        </div>
                                    </div>
                                </Table.Cell>
                                <Table.Cell className="px-6">
                                    <div className="flex items-center">
                                        {/* Revenue (Client Rate) */}
                                        <div className={`flex flex-col items-end gap-1 ${REVENUE_COLUMN_WIDTH}`}>
                                            <CurrencyDisplay
                                                amount={override.clientRate ?? baseEntry?.clientRate ?? 0}
                                                currency={currency}
                                                variant={hasClientOverride ? "soft" : "secondary"}
                                                color={hasClientOverride ? "success" : "default"}
                                                size="sm"
                                                className="font-black px-2"
                                            />
                                            {hasClientOverride && baseEntry && (
                                                <span className="t-micro text-default-400 text-right whitespace-nowrap">
                                                    {baseEntry.clientRate === 0
                                                        ? <>was {getCurrencySymbol(currency)}0.00</>
                                                        : <>was {getCurrencySymbol(currency)}{formatAmount(baseEntry.clientRate, CURRENCY_DECIMALS)} <span className={clientPercentChange > 0 ? "text-success" : "text-danger"}>
                                                            ({clientPercentChange > 0 ? '+' : ''}{formatPercentage(clientPercentChange, PERCENTAGE_DECIMALS)})
                                                        </span></>
                                                    }
                                                </span>
                                            )}
                                        </div>

                                        {/* Separator */}
                                        <span className={`${RATE_SEPARATOR_WIDTH} text-center opacity-30`}>—</span>

                                        {/* Expense (Cost Rate) */}
                                        <div className={`flex flex-col items-start gap-1 ${EXPENSE_COLUMN_WIDTH}`}>
                                            <CurrencyDisplay
                                                amount={override.costRate ?? baseEntry?.costRate ?? 0}
                                                currency={currency}
                                                variant={hasCostOverride ? "soft" : "secondary"}
                                                color={hasCostOverride ? "warning" : "default"}
                                                size="sm"
                                                className="font-black px-2"
                                            />
                                            {hasCostOverride && baseEntry && (
                                                <span className="t-micro text-default-400 text-left whitespace-nowrap">
                                                    {baseEntry.costRate === 0
                                                        ? <>was {getCurrencySymbol(currency)}0.00</>
                                                        : <>was {getCurrencySymbol(currency)}{formatAmount(baseEntry.costRate, CURRENCY_DECIMALS)} <span className={costPercentChange > 0 ? "text-danger" : "text-success"}>
                                                            ({costPercentChange > 0 ? '+' : ''}{formatPercentage(costPercentChange, PERCENTAGE_DECIMALS)})
                                                        </span></>
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Table.Cell>
                                {/* Margin */}
                                <Table.Cell>
                                    {(() => {
                                        const costRate = override.costRate ?? baseEntry?.costRate ?? 0;
                                        const clientRate = override.clientRate ?? baseEntry?.clientRate ?? 0;
                                        const marginPercentage = clientRate > 0 ? ((clientRate - costRate) / clientRate) * 100 : 0;
                                        const marginAmount = clientRate - costRate;

                                        return (
                                            <span className={`text-xs font-bold tracking-tight ${marginPercentage < MARGIN_DANGER_THRESHOLD ? "text-danger" : "text-success"}`}>
                                                {formatPercentage(marginPercentage, MARGIN_PERCENTAGE_DECIMALS)} / {getCurrencySymbol(currency)}{formatAmount(marginAmount, CURRENCY_DECIMALS)}
                                            </span>
                                        );
                                    })()}
                                </Table.Cell>
                                {/* Context / Reason */}
                                <Table.Cell className="w-[200px]">
                                    <Tooltip delay={TOOLTIP_DELAY}>
                                        <Tooltip.Trigger>
                                            <p className="text-xs text-default-500 leading-normal max-w-[200px] truncate cursor-help">
                                                {override.reason}
                                            </p>
                                        </Tooltip.Trigger>
                                        <Tooltip.Content className="max-w-xs">
                                            {override.reason}
                                        </Tooltip.Content>
                                    </Tooltip>
                                </Table.Cell>
                                <Table.Cell align="right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="ghost"
                                            className="rounded-full bg-default-100/50 text-accent transition-all hover:bg-accent/10"
                                            onPress={() => onEdit?.(override)}
                                            aria-label="Edit override"
                                        >
                                            <Icon icon="lucide:edit-3" width={16} />
                                        </Button>

                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="ghost"
                                            className="rounded-full bg-default-100/50 text-danger transition-all hover:bg-danger/10"
                                            onPress={() => setOverrideToDelete(override)}
                                            aria-label="Remove override"
                                            isDisabled={deleteMutation.isPending}
                                        >
                                            <Icon icon="lucide:trash-2" width={16} />
                                        </Button>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table>

            {/* Delete Confirmation Dialog */}
            <AlertDialog isOpen={!!overrideToDelete} onOpenChange={(isOpen) => !isOpen && setOverrideToDelete(null)}>
                <AlertDialog.Backdrop className="backdrop-blur-sm bg-black/20">
                    <AlertDialog.Container>
                        <AlertDialog.Dialog className="sm:max-w-[400px]">
                            <AlertDialog.CloseTrigger />
                            <AlertDialog.Header>
                                <AlertDialog.Icon status="danger" />
                                <AlertDialog.Heading>Delete Override?</AlertDialog.Heading>
                            </AlertDialog.Header>
                            <AlertDialog.Body>
                                {overrideToDelete && (
                                    <div className="space-y-3">
                                        <p className="text-sm text-default-700">
                                            Are you sure you want to delete this override? This action cannot be undone.
                                        </p>
                                        <div className="p-3 rounded-lg bg-default-50 border border-default-200">
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-xs font-bold text-default-500 uppercase">Rate Item</span>
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {rateItems?.find(ri => ri.id === overrideToDelete.rateItemId)?.name || "Unknown Item"}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {overrideToDelete.costRate !== undefined && (
                                                        <div>
                                                            <span className="text-xs font-bold text-default-500 uppercase">Cost Rate</span>
                                                            <CurrencyDisplay
                                                                amount={overrideToDelete.costRate}
                                                                currency={currency}
                                                                size="sm"
                                                                variant="soft"
                                                                color="warning"
                                                            />
                                                        </div>
                                                    )}
                                                    {overrideToDelete.clientRate !== undefined && (
                                                        <div>
                                                            <span className="text-xs font-bold text-default-500 uppercase">Client Rate</span>
                                                            <CurrencyDisplay
                                                                amount={overrideToDelete.clientRate}
                                                                currency={currency}
                                                                size="sm"
                                                                variant="soft"
                                                                color="success"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </AlertDialog.Body>
                            <AlertDialog.Footer>
                                <Button slot="close" variant="tertiary">
                                    Cancel
                                </Button>
                                <Button
                                    slot="close"
                                    variant="danger"
                                    onPress={handleRemove}
                                    isDisabled={deleteMutation.isPending}
                                    isPending={deleteMutation.isPending}
                                >
                                    Delete Override
                                </Button>
                            </AlertDialog.Footer>
                        </AlertDialog.Dialog>
                    </AlertDialog.Container>
                </AlertDialog.Backdrop>
            </AlertDialog>
        </>
    );
}
