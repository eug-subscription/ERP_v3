import React from "react";
import { Card, Chip, Tooltip, SearchField, Button, ScrollShadow } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TOOLTIP_DELAY } from "../../constants/ui-tokens";
import { Item } from "../../types/matching";
import { renderHighlightedText } from "../../utils/highlightText";
import { EmptyState } from "../pricing/EmptyState";

interface ItemMatchPanelProps {
    unmatchedItems: Item[];
    filteredItems: Item[];
    dragOverItem: string | null;
    draggedPhoto: string | null;
    exitingItems: string[];
    searchTerm: string;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    onSearchChange: (value: string) => void;
    onSearchKeyDown: (e: React.KeyboardEvent) => void;
    onClearSearch: () => void;
    onDragOver: (e: React.DragEvent, itemId: string) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent, itemId: string) => void;
    highlightMatch: (text: string, query: string) => string | string[];
}

export function ItemMatchPanel({
    unmatchedItems,
    filteredItems,
    dragOverItem,
    draggedPhoto,
    exitingItems,
    searchTerm,
    searchInputRef,
    onSearchChange,
    onSearchKeyDown,
    onClearSearch,
    onDragOver,
    onDragLeave,
    onDrop,
    highlightMatch,
}: ItemMatchPanelProps) {
    return (
        <Card variant="secondary" className="h-full">
            <Card.Header className="px-4 pt-5 pb-0 flex-row justify-between items-start">
                <div>
                    <h3 className="text-sm font-black text-default-900">Items to Match</h3>
                    <p className="text-xs text-default-400 font-medium">Drop photos onto items to match them.</p>
                </div>
                <Chip color="warning" variant="soft">
                    {unmatchedItems.length} left
                </Chip>
            </Card.Header>

            <Card.Content className="px-4 pb-4 pt-4">
                <div className="sticky top-0 z-10 pt-1 pb-4 bg-inherit">
                    <SearchField
                        aria-label="Search items"
                        value={searchTerm}
                        onChange={onSearchChange}
                        onClear={onClearSearch}
                    >
                        <SearchField.Group>
                            <SearchField.SearchIcon />
                            <SearchField.Input
                                ref={searchInputRef}
                                placeholder="Search items..."
                                onKeyDown={onSearchKeyDown}
                                className="w-full"
                            />
                            <SearchField.ClearButton />
                        </SearchField.Group>
                    </SearchField>
                </div>

                {filteredItems.length > 0 ? (
                    <ScrollShadow className="max-h-[560px] pr-2 p-1 -m-1" hideScrollBar>
                        <div className="space-y-4">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center gap-3 bg-surface p-4 rounded-2xl border-2 transition-all duration-300 ${dragOverItem === item.id ? "border-accent border-solid ring-4 ring-accent/10 scale-[1.02]" : draggedPhoto ? "border-accent/30 border-dashed bg-accent/5" : "border-dashed border-default-200"} ${exitingItems.includes(item.id) ? "translate-x-[100%] opacity-0" : "translate-x-0 opacity-100"}`}
                                    onDragOver={(e) => onDragOver(e, item.id)}
                                    onDragLeave={onDragLeave}
                                    onDrop={(e) => onDrop(e, item.id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <Tooltip delay={TOOLTIP_DELAY}>
                                            <Tooltip.Trigger>
                                                <h4 className="font-bold text-default-900 truncate text-sm">
                                                    {renderHighlightedText(item.name, searchTerm, highlightMatch)}
                                                </h4>
                                            </Tooltip.Trigger>
                                            <Tooltip.Content>{item.name}</Tooltip.Content>
                                        </Tooltip>
                                        <Tooltip delay={TOOLTIP_DELAY}>
                                            <Tooltip.Trigger>
                                                <p className="text-xs text-default-500 truncate mt-0.5">
                                                    {item.description}
                                                </p>
                                            </Tooltip.Trigger>
                                            <Tooltip.Content>{item.description}</Tooltip.Content>
                                        </Tooltip>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollShadow>
                ) : searchTerm ? (
                    <div className="py-20 text-center animate-in fade-in zoom-in-95 duration-300">
                        <Icon
                            icon="lucide:search-x"
                            className="w-12 h-12 text-default-300 mx-auto mb-4"
                        />
                        <p className="text-default-500 font-medium text-sm">
                            No results found for "{searchTerm}"
                        </p>
                        <Button variant="ghost" onPress={onClearSearch} className="mt-4">
                            Clear search
                        </Button>
                    </div>
                ) : (
                    <EmptyState
                        icon="lucide:party-popper"
                        title="Great job!"
                        description="Every single item has been matched."
                    />
                )}
            </Card.Content>
        </Card>
    );
}
