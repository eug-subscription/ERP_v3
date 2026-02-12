import { Icon } from "@iconify/react";
import {
    Button,
    Skeleton,
    Alert,
    AlertDialog,
    Chip,
    Tooltip,
} from "@heroui/react";
import { useRateItems } from "../../../hooks/useRateItems";

import { EmptyState } from "../../pricing/EmptyState";
import { useState, useMemo } from "react";
import { RateItem, Status } from "../../../types/pricing";
import { DEFAULT_SKELETON_COUNT, PRICING_ITEM_TRACKING } from "../../../constants/pricing";
import { Table } from "../../pricing/Table";
import { FilterBar } from "../../pricing/FilterBar";
import { DENSITY_CHIP_HEIGHT, TOOLTIP_DELAY } from "../../../constants/ui-tokens";

interface RateItemsListProps {
    onAdd?: () => void;
    onEdit?: (item: RateItem) => void;
    onArchive?: (item: RateItem) => void;
}

export function RateItemsList({ onAdd, onEdit, onArchive }: RateItemsListProps) {
    const { data: items, isLoading, error, refetch } = useRateItems();
    const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof RateItem, direction: 'asc' | 'desc' } | null>({
        key: 'name',
        direction: 'asc'
    });

    const filteredAndSortedItems = useMemo(() => {
        if (!items) return [];

        let result = [...items];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.unitType.toLowerCase().includes(query)
            );
        }

        // Status Filter
        if (statusFilter !== 'all') {
            result = result.filter(item => item.status === statusFilter);
        }

        // Sort
        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Handle undefined values (e.g., optional displayName, description)
                if (aValue === undefined && bValue === undefined) return 0;
                if (aValue === undefined) return 1;  // Push undefined to end
                if (bValue === undefined) return -1; // Push undefined to end

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [items, searchQuery, statusFilter, sortConfig]);

    const handleSort = (key: keyof RateItem) => {
        setSortConfig(prev => {
            if (prev?.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-2xl" />
                {Array.from({ length: DEFAULT_SKELETON_COUNT }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Alert status="danger" className="rounded-2xl">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title className="font-bold">Error Loading Rate Items</Alert.Title>
                    <Alert.Description>
                        Failed to fetch rate items. Please try again.
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

    return (
        <div className="space-y-6">
            {/* Standardized Filter Bar */}
            <div className="mb-8">
                <FilterBar
                    search={{
                        value: searchQuery,
                        onChange: setSearchQuery,
                        placeholder: "Search by item name or type...",
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
                />
            </div>

            {/* Custom ListBox-style Table */}
            <Table>
                <Table.Header>
                    <tr>
                        <Table.Column>
                            <Table.SortButton
                                label="ID"
                                isActive={sortConfig?.key === 'id'}
                                direction={sortConfig?.direction}
                                onPress={() => handleSort('id')}
                            />
                        </Table.Column>
                        <Table.Column isBlack>
                            <Table.SortButton
                                label="Name"
                                isActive={sortConfig?.key === 'name'}
                                direction={sortConfig?.direction}
                                onPress={() => handleSort('name')}
                                isBlack
                            />
                        </Table.Column>
                        <Table.Column>Display Name</Table.Column>
                        <Table.Column>
                            <Table.SortButton
                                label="Unit Type"
                                isActive={sortConfig?.key === 'unitType'}
                                direction={sortConfig?.direction}
                                onPress={() => handleSort('unitType')}
                            />
                        </Table.Column>
                        <Table.Column>Status</Table.Column>
                        <Table.Column align="right">Actions</Table.Column>
                    </tr>
                </Table.Header>
                <Table.Body>
                    {filteredAndSortedItems.length > 0 ? (
                        filteredAndSortedItems.map((item) => (
                            <Table.Row key={item.id}>
                                <Table.Cell>
                                    <span className="font-mono text-xs text-default-500">{item.id}</span>
                                </Table.Cell>
                                <Table.Cell>
                                    {item.description ? (
                                        <Tooltip delay={TOOLTIP_DELAY}>
                                            <Tooltip.Trigger>
                                                <span className={`font-bold t-compact text-foreground ${PRICING_ITEM_TRACKING} cursor-help`}>{item.name}</span>
                                            </Tooltip.Trigger>
                                            <Tooltip.Content className="max-w-xs">
                                                {item.description}
                                            </Tooltip.Content>
                                        </Tooltip>
                                    ) : (
                                        <span className={`font-bold t-compact text-foreground ${PRICING_ITEM_TRACKING}`}>{item.name}</span>
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    <span className={`font-bold t-compact text-foreground ${PRICING_ITEM_TRACKING}`}>
                                        {item.displayName || <span className="italic text-foreground-400">—</span>}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <Chip
                                        size="sm"
                                        variant="soft"
                                        className={`font-medium uppercase t-mini px-2 ${DENSITY_CHIP_HEIGHT} bg-default-100/50 text-default-600 border-none`}
                                    >
                                        {item.unitType}
                                    </Chip>
                                </Table.Cell>
                                <Table.Cell>
                                    <Chip
                                        size="sm"
                                        color={item.status === 'active' ? 'success' : item.status === 'deprecated' ? 'warning' : 'default'}
                                        variant="soft"
                                        className="font-medium capitalize px-2 h-6 border-none"
                                    >
                                        {item.status}
                                    </Chip>
                                </Table.Cell>
                                <Table.Cell align="right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Tooltip delay={TOOLTIP_DELAY}>
                                            <Tooltip.Trigger>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="ghost"
                                                    className="rounded-full bg-default-100/50 text-accent transition-all hover:bg-accent/10 border border-transparent hover:border-accent/20"
                                                    onPress={() => onEdit?.(item)}
                                                    aria-label={`Edit ${item.name}`}
                                                >
                                                    <Icon icon="lucide:edit-3" width={16} />
                                                </Button>
                                            </Tooltip.Trigger>
                                            <Tooltip.Content>Edit Item</Tooltip.Content>
                                        </Tooltip>

                                        <Tooltip delay={TOOLTIP_DELAY}>
                                            <Tooltip.Trigger>
                                                <AlertDialog>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="ghost"
                                                        className="rounded-full bg-default-100/50 text-warning transition-all hover:bg-warning/10 border border-transparent hover:border-warning/20"
                                                        aria-label={`Archive ${item.name}`}
                                                    >
                                                        <Icon icon="lucide:archive" width={16} />
                                                    </Button>
                                                    <AlertDialog.Backdrop className="backdrop-blur-sm bg-black/20">
                                                        <AlertDialog.Container>
                                                            <AlertDialog.Dialog className="max-w-md">
                                                                <AlertDialog.CloseTrigger />
                                                                <AlertDialog.Header>
                                                                    <AlertDialog.Icon status="warning" />
                                                                    <AlertDialog.Heading>
                                                                        Archive Rate Item?
                                                                    </AlertDialog.Heading>
                                                                </AlertDialog.Header>
                                                                <AlertDialog.Body>
                                                                    <p>
                                                                        Are you sure you want to archive <span className="font-bold text-foreground">"{item.name}"</span>?
                                                                        It will no longer be available for new projects, but existing assignments will remain intact.
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
                                                                        onPress={() => onArchive?.(item)}
                                                                    >
                                                                        Archive Item
                                                                    </Button>
                                                                </AlertDialog.Footer>
                                                            </AlertDialog.Dialog>
                                                        </AlertDialog.Container>
                                                    </AlertDialog.Backdrop>
                                                </AlertDialog>
                                            </Tooltip.Trigger>
                                            <Tooltip.Content>Archive Item</Tooltip.Content>
                                        </Tooltip>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="p-0">
                                <EmptyState
                                    icon="lucide:package-search"
                                    title="No Rate Items Found"
                                    description={statusFilter !== 'all'
                                        ? `We couldn't find any rate items marked as '${statusFilter}'. Try changing the filter.`
                                        : "Your pricing catalog is empty. Start by adding your first labor or material rate item."
                                    }
                                    actionLabel={statusFilter !== 'all' ? "Clear Filters" : "Add Rate Item"}
                                    actionIcon={statusFilter !== 'all' ? "lucide:x" : "lucide:plus"}
                                    onAction={statusFilter !== 'all' ? () => setStatusFilter('all') : () => onAdd?.()}
                                />
                            </td>
                        </tr>
                    )}
                </Table.Body>
            </Table>
        </div>
    );
}
