import React from "react";
import { mockItems, mockPhotos } from "../data/mock-unmatched-items";

export function useUnmatchedItems() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list");
  const [matchedPhotos, setMatchedPhotos] = React.useState<{ [itemId: string]: string }>({});
  const [dragOverItem, setDragOverItem] = React.useState<string | null>(null);
  const [draggedPhoto, setDraggedPhoto] = React.useState<string | null>(null);
  const [exitingItems, setExitingItems] = React.useState<string[]>([]);
  const [recentlyUnmatched, setRecentlyUnmatched] = React.useState<{
    itemId: string;
    photoUrl: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const matchedItems = React.useMemo(() => {
    return mockItems.filter((item) => matchedPhotos[item.id]);
  }, [matchedPhotos]);

  const unmatchedItems = React.useMemo(() => {
    return mockItems.filter((item) => !matchedPhotos[item.id]);
  }, [matchedPhotos]);

  const filteredUnmatchedItems = React.useMemo(() => {
    if (!searchTerm.trim()) return unmatchedItems;

    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    return unmatchedItems.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedSearchTerm) ||
        item.description.toLowerCase().includes(normalizedSearchTerm)
    );
  }, [unmatchedItems, searchTerm]);

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts;
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClearSearch();
    }
  };

  const handleUnmatch = (itemId: string) => {
    const photoUrl = matchedPhotos[itemId];
    setRecentlyUnmatched({ itemId, photoUrl });

    setMatchedPhotos((prev) => {
      const newMatched = { ...prev };
      delete newMatched[itemId];
      return newMatched;
    });

    setTimeout(() => {
      setRecentlyUnmatched(null);
    }, 5000);
  };

  const handleUndoUnmatch = () => {
    if (recentlyUnmatched) {
      setMatchedPhotos((prev) => ({
        ...prev,
        [recentlyUnmatched.itemId]: recentlyUnmatched.photoUrl,
      }));
      setRecentlyUnmatched(null);
    }
  };

  const matchStats = React.useMemo(() => {
    const totalItems = mockItems.length;
    const matchedCount = Object.keys(matchedPhotos).length;
    const percentComplete = totalItems > 0 ? Math.round((matchedCount / totalItems) * 100) : 0;

    return {
      total: totalItems,
      matched: matchedCount,
      remaining: totalItems - matchedCount,
      percent: percentComplete,
    };
  }, [matchedPhotos]);

  const handleDragStart = (
    e: React.DragEvent,
    photo: { id: string; image: string; filename: string }
  ) => {
    e.dataTransfer.setData("photoId", photo.id);
    e.dataTransfer.setData("photoImage", photo.image);
    e.dataTransfer.setData("photoFilename", photo.filename);
    e.dataTransfer.effectAllowed = "copy";
    setDraggedPhoto(photo.id);
  };

  const handleDragEnd = () => {
    setDraggedPhoto(null);
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    setDragOverItem(itemId);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    const photoImage = e.dataTransfer.getData("photoImage");

    setExitingItems((prev) => [...prev, itemId]);

    setTimeout(() => {
      setMatchedPhotos((prev) => ({ ...prev, [itemId]: photoImage }));
      setTimeout(() => {
        setExitingItems((prev) => prev.filter((id) => id !== itemId));
      }, 500);
    }, 500);

    setDragOverItem(null);
    setDraggedPhoto(null);
  };

  return {
    state: {
      items: mockItems,
      photos: mockPhotos,
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
    },
    actions: {
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
    },
  };
}
