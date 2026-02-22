import { Card, Skeleton, Alert, Button, toast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useUnmatchedItems } from "../../hooks/useUnmatchedItems";
import { MatchProgress } from "./MatchProgress";
import { UnmatchedPhotoPanel } from "./UnmatchedPhotoPanel";
import { ItemMatchPanel } from "./ItemMatchPanel";
import { MatchedItemsSection } from "./MatchedItemsSection";
import {
    CARD_HEADER,
    ICON_CONTAINER_LG,
    ICON_SIZE_CONTAINER,
    TEXT_SECTION_TITLE,
} from "../../constants/ui-tokens";

/**
 * Main matching tab component - orchestrates photo-to-item matching workflow
 * Wrapped in Card with proper header following project design standards
 */
export function MatchingTab() {
    const {
        photos,
        isLoading,
        isError,
        refetch,
        viewMode,
        matchedPhotos,
        dragOverItem,
        draggedPhoto,
        exitingItems,
        searchTerm,
        matchedItems,
        unmatchedItems,
        filteredUnmatchedItems,
        matchStats,
        searchInputRef,
        setViewMode,
        setSearchTerm,
        handleClearSearch,
        handleSearchKeyDown,
        handleUnmatch,
        handleUndoUnmatch,
        highlightMatch,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDragLeave,
        handleDrop,
    } = useUnmatchedItems();

    if (isError) {
        return (
            <Alert status="danger" className="rounded-2xl">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title className="font-bold">Error Loading Matching Data</Alert.Title>
                    <Alert.Description>Failed to fetch matching data. Please try again.</Alert.Description>
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
        <Card className="mb-8 scroll-mt-32">
            <Card.Header className={CARD_HEADER}>
                <div className="flex items-center gap-4">
                    <div className={ICON_CONTAINER_LG}>
                        <Icon icon="lucide:link-2" className={ICON_SIZE_CONTAINER} />
                    </div>
                    <div className="flex-1">
                        <h2 className={TEXT_SECTION_TITLE}>Matching</h2>
                        <p className="text-xs text-default-400 font-medium">Match unmatched photos to their corresponding items.</p>
                    </div>
                </div>
            </Card.Header>

            <Card.Content className="p-8">
                {isLoading ? (
                    <div className="space-y-6">
                        <Skeleton className="h-16 rounded-xl" />
                        <div className="grid grid-cols-2 gap-6">
                            <Skeleton className="h-96 rounded-xl" />
                            <Skeleton className="h-96 rounded-xl" />
                        </div>
                    </div>
                ) : (
                    <>
                        <MatchProgress total={matchStats.total} percent={matchStats.percent} remaining={matchStats.remaining} />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 items-stretch">
                            <div className="order-2 lg:order-1 h-full">
                                <UnmatchedPhotoPanel
                                    photos={photos}
                                    viewMode={viewMode}
                                    draggedPhoto={draggedPhoto}
                                    searchTerm={searchTerm}
                                    onViewModeChange={setViewMode}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    highlightMatch={highlightMatch}
                                />
                            </div>

                            <div className="order-1 lg:order-2 h-full">
                                <ItemMatchPanel
                                    unmatchedItems={unmatchedItems}
                                    filteredItems={filteredUnmatchedItems}
                                    dragOverItem={dragOverItem}
                                    draggedPhoto={draggedPhoto}
                                    exitingItems={exitingItems}
                                    searchTerm={searchTerm}
                                    searchInputRef={searchInputRef}
                                    onSearchChange={setSearchTerm}
                                    onSearchKeyDown={handleSearchKeyDown}
                                    onClearSearch={handleClearSearch}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    highlightMatch={highlightMatch}
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <MatchedItemsSection
                                matchedItems={matchedItems}
                                matchedPhotos={matchedPhotos}
                                onUnmatch={(itemId) => {
                                    const photoUrl = matchedPhotos[itemId];
                                    handleUnmatch(itemId);
                                    toast.warning("Item unmatched", {
                                        actionProps: {
                                            children: "Undo",
                                            onPress: () => handleUndoUnmatch(itemId, photoUrl),
                                        },
                                        description: "Item unmatched successfully",
                                    });
                                }}
                            />
                        </div>
                    </>
                )}
            </Card.Content>
        </Card>
    );
}
