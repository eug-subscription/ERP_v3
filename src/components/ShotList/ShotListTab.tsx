import { useState } from "react";
import { Alert, Button, Card, SearchField, Select, ListBox, Tabs, Tooltip, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useShotList } from "../../hooks/useShotList";
import { ShotListTable } from "./ShotListTable";
import { ShotListTableSkeleton } from "./ShotListTableSkeleton";
import { EmptyState } from "../pricing/EmptyState";
import { AddShotListItemsModal } from "./AddShotListItemsModal";
import { TOOLTIP_DELAY, SEARCH_FIELD_WIDTH, FILTER_SELECT_WIDTH, TEXT_TAB_HEADING } from "../../constants/ui-tokens";
import type { ShotListStatus } from "../../types/shot-list";
import { SHOT_LIST_STATUS_FILTER_LABELS } from "../../constants/shot-list";

type StatusFilter = "all" | ShotListStatus;

export function ShotListTab() {
    const { data: items, isLoading, error } = useShotList();
    const [filter, setFilter] = useState<StatusFilter>("all");
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const filteredItems = items
        ?.filter((item) => filter === "all" || item.status === filter)
        .filter((item) =>
            search === ""
                ? true
                : item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.externalId.toLowerCase().includes(search.toLowerCase())
        ) ?? [];

    const total = items?.length ?? 0;
    const addedByClient = items?.filter((i) => i.creatorRole === "Client").length ?? 0;
    const completed = items?.filter((i) => i.status === "completed").length ?? 0;
    const rejected = items?.filter((i) => i.status === "rejected").length ?? 0;
    const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const rejectedPct = total > 0 ? Math.round((rejected / total) * 100) : 0;

    return (
        <div className="pb-4">
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h2 className={TEXT_TAB_HEADING}>
                        Shot List
                    </h2>
                    <p className="text-sm font-medium text-default-500 mt-1">
                        Manage items to shoot, track progress, and review completed photos.
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="md"
                    onPress={() => setIsAddModalOpen(true)}
                >
                    <Icon icon="lucide:plus" />
                    Add Item
                </Button>
            </header>

            {/* Statistics */}
            {isLoading ? (
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="p-0 shadow-sm">
                            <Card.Content className="px-4 py-3">
                                <Skeleton className="h-3 w-16 rounded-md mb-2" />
                                <Skeleton className="h-6 w-12 rounded-md" />
                            </Card.Content>
                        </Card>
                    ))}
                </div>
            ) : !error && (
                <div className="grid grid-cols-4 gap-3 mb-6">
                    <Card className="p-0 shadow-sm">
                        <Card.Content className="px-4 py-3">
                            <div className="text-xs text-default-500 mb-0.5">Total</div>
                            <div className="text-xl font-bold">{total}</div>
                        </Card.Content>
                    </Card>
                    <Card className="p-0 shadow-sm">
                        <Card.Content className="px-4 py-3">
                            <Tooltip delay={TOOLTIP_DELAY}>
                                <Tooltip.Trigger>
                                    <div className="text-xs text-default-500 mb-0.5 cursor-default border-b border-dashed border-default-300 inline-block">Added by RP</div>
                                </Tooltip.Trigger>
                                <Tooltip.Content>RP — Restaurant Partner (client-side uploads)</Tooltip.Content>
                            </Tooltip>
                            <div className="text-xl font-bold">{addedByClient}</div>
                        </Card.Content>
                    </Card>
                    <Card className="p-0 shadow-sm">
                        <Card.Content className="px-4 py-3">
                            <div className="text-xs text-default-500 mb-0.5">Completed</div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-bold">{completed}</span>
                                <span className="text-sm font-medium text-default-400">/&nbsp;{total}</span>
                                <span className="text-xs text-default-400">·&nbsp;{completedPct}%</span>
                            </div>
                        </Card.Content>
                    </Card>
                    <Card className="p-0 shadow-sm">
                        <Card.Content className="px-4 py-3">
                            <div className="text-xs text-default-500 mb-0.5">Rejected</div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-bold">{rejected}</span>
                                <span className="text-sm font-medium text-default-400">/&nbsp;{total}</span>
                                <span className="text-xs text-default-400">·&nbsp;{rejectedPct}%</span>
                            </div>
                        </Card.Content>
                    </Card>
                </div>
            )}

            {/* Table Controls */}
            <div className="flex items-end gap-3 mb-6 flex-wrap">
                <SearchField
                    name="shot-list-search"
                    variant="secondary"
                    value={search}
                    onChange={setSearch}
                    aria-label="Search shot list"
                >
                    <SearchField.Group>
                        <SearchField.SearchIcon />
                        <SearchField.Input className={SEARCH_FIELD_WIDTH} placeholder="Search by name or ID…" />
                        <SearchField.ClearButton />
                    </SearchField.Group>
                </SearchField>

                <Select
                    aria-label="Filter by creator"
                    className={FILTER_SELECT_WIDTH}
                    placeholder="Filter by creator"
                >
                    <Select.Trigger>
                        <Select.Value>All creators</Select.Value>
                    </Select.Trigger>
                    <Select.Popover>
                        <ListBox>
                            <ListBox.Item id="all">All creators</ListBox.Item>
                            <ListBox.Item id="moderator">Moderators</ListBox.Item>
                            <ListBox.Item id="client">Clients</ListBox.Item>
                        </ListBox>
                    </Select.Popover>
                </Select>

            </div>

            {/* Status Filter Tabs */}
            <div className="mb-6">
                <Tabs
                    selectedKey={filter}
                    onSelectionChange={(key) => setFilter(key as StatusFilter)}
                    aria-label="Shot list status filter"
                >
                    <Tabs.ListContainer>
                        <Tabs.List>
                            {(Object.keys(SHOT_LIST_STATUS_FILTER_LABELS) as StatusFilter[]).map((key, index) => (
                                <Tabs.Tab key={key} id={key}>
                                    {index > 0 && <Tabs.Separator />}
                                    {SHOT_LIST_STATUS_FILTER_LABELS[key]}
                                    <Tabs.Indicator />
                                </Tabs.Tab>
                            ))}
                        </Tabs.List>
                    </Tabs.ListContainer>
                </Tabs>
            </div>

            {/* Content */}
            {isLoading ? (
                <ShotListTableSkeleton />
            ) : error ? (
                <Alert status="danger">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Description>
                            Failed to load shot list items. Please try again later.
                        </Alert.Description>
                    </Alert.Content>
                </Alert>
            ) : filteredItems.length === 0 ? (
                <EmptyState
                    icon="lucide:clipboard-list"
                    title="No items found"
                    description={
                        filter === "all" && search === ""
                            ? "Add items to your shot list to start tracking what needs to be photographed."
                            : "No items match the current filters."
                    }
                    actionLabel={filter === "all" && search === "" ? "Add Item" : undefined}
                    actionIcon="lucide:plus"
                    onAction={filter === "all" && search === "" ? () => setIsAddModalOpen(true) : undefined}
                />
            ) : (
                <ShotListTable items={filteredItems} />
            )}

            <AddShotListItemsModal
                isOpen={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
            />
        </div>
    );
}
