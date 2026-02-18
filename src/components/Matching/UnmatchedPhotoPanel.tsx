import React from "react";
import { Tabs, Card, Tooltip, Chip, ScrollShadow } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TOOLTIP_DELAY, PANEL_SCROLL_HEIGHT } from "../../constants/ui-tokens";
import { Photo } from "../../types/matching";
import { renderHighlightedText } from "../../utils/highlightText";

interface UnmatchedPhotoPanelProps {
    photos: Photo[];
    viewMode: "list" | "grid";
    draggedPhoto: string | null;
    searchTerm: string;
    onViewModeChange: (mode: "list" | "grid") => void;
    onDragStart: (e: React.DragEvent, photo: Photo) => void;
    onDragEnd: () => void;
    highlightMatch: (text: string, query: string) => string | string[];
}

/**
 * Left panel displaying unmatched photos in list or grid view
 */
export function UnmatchedPhotoPanel({
    photos,
    viewMode,
    draggedPhoto,
    searchTerm,
    onViewModeChange,
    onDragStart,
    onDragEnd,
    highlightMatch,
}: UnmatchedPhotoPanelProps) {
    return (
        <Card variant="secondary">
            <Card.Header className="px-4 pt-5 pb-0 flex-row justify-between items-start">
                <div>
                    <h3 className="text-sm font-black mb-1 text-default-900">Unmatched Photos</h3>
                    <p className="text-xs text-default-400 font-medium">
                        Drag and drop photos to match them.
                    </p>
                </div>
                <Chip color="accent" variant="soft">
                    {photos.length} photos
                </Chip>
            </Card.Header>

            <div className="px-4 pt-3">
                <Tabs
                    selectedKey={viewMode}
                    onSelectionChange={(key) => onViewModeChange(key as "list" | "grid")}
                    aria-label="Photo view mode"
                >
                    <Tabs.ListContainer>
                        <Tabs.List>
                            <Tabs.Tab id="list">
                                List view
                                <Tabs.Indicator />
                            </Tabs.Tab>
                            <Tabs.Tab id="grid">
                                Grid view
                                <Tabs.Indicator />
                            </Tabs.Tab>
                        </Tabs.List>
                    </Tabs.ListContainer>
                </Tabs>
            </div>

            <Card.Content className="px-4 pb-4 pt-4">
                <div className={`${PANEL_SCROLL_HEIGHT} overflow-hidden`}>
                    {viewMode === "list" ? (
                        <ScrollShadow className="h-full p-1 -m-1" hideScrollBar>
                            <div className="space-y-4">
                                {photos.map((photo) => (
                                    <div
                                        key={photo.id}
                                        className={`flex items-center gap-2 bg-surface py-3 px-4 rounded-2xl border border-default-100 cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-default-200 hover:scale-[1.01] ${draggedPhoto === photo.id ? "opacity-50" : "opacity-100"}`}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, photo)}
                                        onDragEnd={onDragEnd}
                                    >
                                        <Icon icon="lucide:grip-vertical" className="w-4 h-4 text-default-300 flex-shrink-0" />
                                        <div className="w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden border border-default-100">
                                            <img
                                                src={photo.image}
                                                alt={photo.filename}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Tooltip delay={TOOLTIP_DELAY}>
                                                <Tooltip.Trigger>
                                                    <h4 className="text-xs font-medium font-mono text-default-600 truncate">
                                                        {renderHighlightedText(photo.filename.replace(/\.[^/.]+$/, ""), searchTerm, highlightMatch)}
                                                    </h4>
                                                </Tooltip.Trigger>
                                                <Tooltip.Content>{photo.filename}</Tooltip.Content>
                                            </Tooltip>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollShadow>
                    ) : (
                        <ScrollShadow className="h-full pr-2" hideScrollBar>
                            <div className="grid grid-cols-2 gap-3">
                                {photos.map((photo) => (
                                    <div
                                        key={photo.id}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, photo)}
                                        onDragEnd={onDragEnd}
                                        className={`cursor-grab active:cursor-grabbing group transition-opacity ${draggedPhoto === photo.id ? "opacity-50" : "opacity-100"}`}
                                    >
                                        <div className="aspect-square rounded-xl overflow-hidden border border-default-100 hover:border-accent/30 transition-all hover:shadow-accent-sm hover:scale-[1.01] relative">
                                            <img
                                                src={photo.image}
                                                alt={photo.filename}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm rounded-md p-1">
                                                <Icon icon="lucide:grip-vertical" className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                        <p className="text-xs font-medium text-default-600 mt-1.5 line-clamp-1">
                                            {photo.filename.replace(/\.[^/.]+$/, "")}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ScrollShadow>
                    )}
                </div>
            </Card.Content>
        </Card>
    );
}
