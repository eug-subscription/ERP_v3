import React from "react";
import { Tabs, Card, Button, Input, Tooltip, Chip, Separator, TextField } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useUnmatchedItems } from "../hooks/useUnmatchedItems";

export const UnmatchedItems = () => {
  const { state, actions } = useUnmatchedItems();
  const {
    photos,
    viewMode,
    matchedPhotos,
    dragOverItem,
    draggedPhoto,
    exitingItems,
    recentlyUnmatched,
    searchTerm,
    matchedItems,
    unmatchedItems,
    filteredUnmatchedItems,
    matchStats,
    searchInputRef,
  } = state;

  const {
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
  } = actions;

  const renderHighlightedText = (text: string, query: string) => {
    const result = highlightMatch(text, query);
    if (typeof result === "string") return result;

    return result.map((part, index) =>
      index % 2 === 1 ? (
        <span key={index} className="bg-warning-200 text-warning-800 rounded-sm px-0.5">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <section className="mb-8 scroll-mt-32">
      <h2 className="text-lg font-semibold mb-1 text-default-900">Unmatched items to shoot</h2>
      <p className="text-default-600 text-sm mb-4">
        List of dishes or products not matched automatically.
      </p>

      <div className="mb-6 bg-default-50 p-6 rounded-2xl border border-default-200">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-default-700">
            {matchStats.remaining} of {matchStats.total} items left to match
          </span>
          <span className="text-sm font-black text-accent">{matchStats.percent}% complete</span>
        </div>
        <div className="w-full bg-default-200 rounded-full h-2 overflow-hidden shadow-inner">
          <div
            className="bg-accent h-full transition-all duration-700 ease-out shadow-accent-sm"
            style={{ width: `${matchStats.percent}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <Tabs
          selectedKey={viewMode}
          onSelectionChange={(key) => setViewMode(key as "list" | "grid")}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-default-50 border-none shadow-sm">
          <Card.Content className="p-6">
            <h3 className="text-lg font-bold mb-1 text-default-900">Unmatched Photos</h3>
            <p className="text-default-500 text-sm mb-6">Drag and drop photos to match them.</p>

            {viewMode === "list" ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {photos.map((photo, index) => (
                  <React.Fragment key={photo.id}>
                    <div
                      className={`flex items-center gap-4 cursor-grab active:cursor-grabbing group p-2 rounded-xl transition-all hover:bg-default-100/50 hover:scale-[1.01] ${draggedPhoto === photo.id ? "opacity-50" : "opacity-100"}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, photo)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="w-6 flex items-center justify-center text-default-300">
                        <Icon icon="lucide:grip-vertical" className="w-5 h-5" />
                      </div>
                      <div className="w-20 h-20 flex-shrink-0 shadow-premium rounded-xl overflow-hidden border border-default-100">
                        <img
                          src={photo.image}
                          alt={photo.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Tooltip>
                          <Tooltip.Trigger>
                            <h4 className="font-semibold text-default-900 truncate">
                              {renderHighlightedText(photo.filename, searchTerm)}
                            </h4>
                          </Tooltip.Trigger>
                          <Tooltip.Content>{photo.filename}</Tooltip.Content>
                        </Tooltip>
                        <Chip color="accent" variant="soft" size="sm" className="mt-2 font-medium">
                          Drag to match
                        </Chip>
                      </div>
                    </div>
                    {index < photos.length - 1 && <Separator className="my-2 opacity-50" />}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, photo)}
                    onDragEnd={handleDragEnd}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    <Card className="overflow-hidden group relative shadow-premium border-none">
                      <div className="aspect-square">
                        <img
                          src={photo.image}
                          alt={photo.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <p className="text-xs font-bold truncate text-white w-full">
                          {photo.filename}
                        </p>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>

        <div className="space-y-6">
          <Card className="bg-default-50 border-none shadow-sm">
            <Card.Content className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-default-900">Items to Match</h3>
                  <p className="text-default-500 text-sm">Drop photos here.</p>
                </div>
                <Chip color="warning" variant="soft" className="font-bold">
                  {unmatchedItems.length} left
                </Chip>
              </div>

              <div className="sticky top-0 z-10 pt-1 pb-4 bg-default-50">
                <div className="space-y-1">
                  <TextField aria-label="Search items" value={searchTerm} onChange={setSearchTerm}>
                    <Input
                      ref={searchInputRef}
                      placeholder="Search items..."
                      onKeyDown={handleSearchKeyDown}
                      className="w-full h-10 px-4 rounded-xl border border-default-200 shadow-sm bg-white"
                    />
                  </TextField>
                </div>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredUnmatchedItems.length > 0 ? (
                  filteredUnmatchedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 bg-white p-4 rounded-2xl border-2 transition-all duration-300 shadow-sm ${dragOverItem === item.id ? "border-accent ring-4 ring-accent/10 scale-[1.02]" : "border-transparent"} ${exitingItems.includes(item.id) ? "translate-x-[100%] opacity-0" : "translate-x-0 opacity-100"}`}
                      onDragOver={(e) => handleDragOver(e, item.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, item.id)}
                    >
                      <div className="w-16 h-16 flex-shrink-0 shadow-inner rounded-xl overflow-hidden bg-default-100 flex items-center justify-center">
                        {index === 0 && item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon icon="lucide:image" className="w-6 h-6 text-default-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Tooltip>
                          <Tooltip.Trigger>
                            <h4 className="font-bold text-default-900 truncate text-sm">
                              {renderHighlightedText(item.name, searchTerm)}
                            </h4>
                          </Tooltip.Trigger>
                          <Tooltip.Content>{item.name}</Tooltip.Content>
                        </Tooltip>
                        <p className="text-xs text-default-500 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <div className="bg-default-50 p-2 rounded-full border border-default-100">
                        <Icon icon="lucide:arrow-down-to-dot" className="w-5 h-5 text-accent" />
                      </div>
                    </div>
                  ))
                ) : searchTerm ? (
                  <div className="py-20 text-center animate-in fade-in zoom-in-95 duration-300">
                    <Icon
                      icon="lucide:search-x"
                      className="w-12 h-12 text-default-300 mx-auto mb-4"
                    />
                    <p className="text-default-500 font-medium text-sm">
                      No results found for "{searchTerm}"
                    </p>
                    <Button variant="ghost" onPress={handleClearSearch} className="mt-4">
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="py-24 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon icon="lucide:party-popper" className="w-10 h-10 text-success" />
                    </div>
                    <h4 className="font-black text-2xl text-success mb-2">Great job!</h4>
                    <p className="text-default-500">Every single item has been matched.</p>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>

          {matchedItems.length > 0 && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              <Card className="bg-white border border-default-200 shadow-premium overflow-hidden">
                <div className="bg-default-50 px-6 py-4 border-b border-default-200 flex justify-between items-center">
                  <h3 className="font-bold text-default-900">Matched ({matchedItems.length})</h3>
                  <Icon icon="lucide:check-circle-2" className="w-5 h-5 text-success" />
                </div>
                <Card.Content className="p-0">
                  <div className="divide-y divide-default-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {matchedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 hover:bg-default-50/50 transition-colors"
                      >
                        <div className="w-14 h-14 flex-shrink-0 shadow-sm rounded-xl overflow-hidden border border-success-100">
                          <img
                            src={matchedPhotos[item.id]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-default-900 truncate text-sm">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase font-black text-success tracking-widest bg-success/10 px-1.5 py-0.5 rounded">
                              Verified
                            </span>
                          </div>
                        </div>
                        <Button
                          isIconOnly
                          variant="ghost"
                          className="rounded-full hover:bg-danger/10 hover:text-danger hover:border-danger/20"
                          onPress={() => handleUnmatch(item.id)}
                        >
                          <Icon icon="lucide:link-2-off" className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            </div>
          )}
        </div>
      </div>

      {recentlyUnmatched && (
        <div className="fixed bottom-6 right-6 bg-default-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 border border-white/10 backdrop-blur-md animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
            <Icon icon="lucide:undo-2" className="w-4 h-4 text-warning" />
          </div>
          <span className="font-medium">Item unmatched successfully</span>
          <Separator orientation="vertical" className="h-6 bg-white/20" />
          <Button
            variant="ghost"
            onPress={handleUndoUnmatch}
            className="h-auto p-0 min-w-0 bg-transparent text-accent hover:text-accent-400 font-black uppercase text-xs tracking-widest transition-colors"
          >
            Undo
          </Button>
        </div>
      )}
    </section>
  );
};
