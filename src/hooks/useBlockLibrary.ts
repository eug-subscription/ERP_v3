import { useMemo, useState } from "react";
import { BLOCK_LIBRARY, UI_CATEGORIES, BlockLibraryItem, CategoryMeta } from "../data/block-ui-categories";

export interface UseBlockLibraryReturn {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filteredCategories: CategoryMeta[];
    getBlocksByCategory: (categoryId: string) => BlockLibraryItem[];
}

/**
 * Hook to manage block library state, including search filtering.
 * Returns filtered categories and blocks based on search query.
 */
export function useBlockLibrary(): UseBlockLibraryReturn {
    const [searchQuery, setSearchQuery] = useState("");

    // Memoize the filtered blocks mapping to avoid re-calculation on every render
    const filteredBlocksMap = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        // If no query, return all blocks grouped by category
        if (!query) {
            return BLOCK_LIBRARY.reduce((acc, block) => {
                if (!acc[block.category]) {
                    acc[block.category] = [];
                }
                acc[block.category].push(block);
                return acc;
            }, {} as Record<string, BlockLibraryItem[]>);
        }

        // Otherwise, filter blocks by label or description
        return BLOCK_LIBRARY.reduce((acc, block) => {
            const matches =
                block.label.toLowerCase().includes(query) ||
                block.description.toLowerCase().includes(query);

            if (matches) {
                if (!acc[block.category]) {
                    acc[block.category] = [];
                }
                acc[block.category].push(block);
            }
            return acc;
        }, {} as Record<string, BlockLibraryItem[]>);
    }, [searchQuery]);

    // Memoize filtered categories to only show those that have matching blocks
    const filteredCategories = useMemo(() => {
        return UI_CATEGORIES.filter(category =>
            filteredBlocksMap[category.id] && filteredBlocksMap[category.id].length > 0
        );
    }, [filteredBlocksMap]);

    const getBlocksByCategory = (categoryId: string) => {
        return filteredBlocksMap[categoryId] || [];
    };

    return {
        searchQuery,
        setSearchQuery,
        filteredCategories,
        getBlocksByCategory,
    };
}
