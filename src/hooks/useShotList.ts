import { useQuery } from "@tanstack/react-query";
import { MOCK_SHOT_LIST } from "../data/mock-shot-list";
import { DEFAULT_STALE_TIME, MOCK_API_DELAY } from "../constants/query-config";
import type { ShotListItem } from "../types/shot-list";

async function fetchShotListItems(): Promise<ShotListItem[]> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    return MOCK_SHOT_LIST;
}

export function useShotList() {
    return useQuery({
        queryKey: ["shot-list"],
        queryFn: fetchShotListItems,
        staleTime: DEFAULT_STALE_TIME,
    });
}
