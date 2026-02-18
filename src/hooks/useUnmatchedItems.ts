import React from "react";
import { useQuery } from "@tanstack/react-query";
import { mockItems, mockPhotos } from "../data/mock-unmatched-items";
import { Item, Photo, MatchStats } from "../types/matching";
import { MOCK_API_DELAY, DEFAULT_STALE_TIME } from "../constants/query-config";
import { DROP_EXIT_ANIMATION_MS } from "../constants/ui-tokens";

interface MatchingData {
  items: Item[];
  photos: Photo[];
}

async function fetchMatchingData(): Promise<MatchingData> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
  return { items: mockItems, photos: mockPhotos };
}

export function useUnmatchedItems() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["matchingData"],
    queryFn: fetchMatchingData,
    staleTime: DEFAULT_STALE_TIME,
  });

  const items = React.useMemo(() => data?.items ?? [], [data]);
  const photos = React.useMemo(() => data?.photos ?? [], [data]);

  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list");
  const [matchedPhotos, setMatchedPhotos] = React.useState<{ [itemId: string]: string }>({});
  const [dragOverItem, setDragOverItem] = React.useState<string | null>(null);
  const [draggedPhoto, setDraggedPhoto] = React.useState<string | null>(null);
  const [exitingItems, setExitingItems] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const matchedItems = React.useMemo(() => {
    return items.filter((item) => matchedPhotos[item.id]);
  }, [items, matchedPhotos]);

  const unmatchedItems = React.useMemo(() => {
    return items.filter((item) => !matchedPhotos[item.id]);
  }, [items, matchedPhotos]);

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
    setMatchedPhotos((prev) => {
      const newMatched = { ...prev };
      delete newMatched[itemId];
      return newMatched;
    });
  };

  const handleUndoUnmatch = (itemId: string, photoUrl: string) => {
    setMatchedPhotos((prev) => ({ ...prev, [itemId]: photoUrl }));
  };

  const matchStats = React.useMemo((): MatchStats => {
    const totalItems = items.length;
    const matchedCount = Object.keys(matchedPhotos).length;
    const percentComplete = totalItems > 0 ? Math.round((matchedCount / totalItems) * 100) : 0;

    return {
      total: totalItems,
      matched: matchedCount,
      remaining: totalItems - matchedCount,
      percent: percentComplete,
    };
  }, [items, matchedPhotos]);

  const handleDragStart = (
    e: React.DragEvent,
    photo: { id: string; image: string; filename: string }
  ) => {
    const row = e.currentTarget as HTMLElement;
    const rect = row.getBoundingClientRect();
    e.dataTransfer.setDragImage(row, e.clientX - rect.left, e.clientY - rect.top);
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
      }, DROP_EXIT_ANIMATION_MS);
    }, DROP_EXIT_ANIMATION_MS);

    setDragOverItem(null);
    setDraggedPhoto(null);
  };

  return {
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
  };
}
