import { useQuery } from "@tanstack/react-query";
import { mockModerationEntries } from "../data/mock-moderation";
import { DEFAULT_STALE_TIME, MOCK_API_DELAY } from "../constants/query-config";
import type { ModerationEntry } from "../types/moderation";

async function fetchModerationEntries(): Promise<ModerationEntry[]> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    return mockModerationEntries;
}

export function useModerationEntries() {
    return useQuery({
        queryKey: ["moderation-entries"],
        queryFn: fetchModerationEntries,
        staleTime: DEFAULT_STALE_TIME,
    });
}
