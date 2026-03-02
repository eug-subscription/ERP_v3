import { useQuery } from "@tanstack/react-query";
import { ALL_TEAM_MEMBERS } from "../data/mock-team-members";
import type { SplTeamMember } from "../types/team";
import { DEFAULT_STALE_TIME, MOCK_API_DELAY } from "../constants/query-config";

async function fetchUsers(): Promise<SplTeamMember[]> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    return ALL_TEAM_MEMBERS;
}

export function useUsers() {
    return useQuery({
        queryKey: ["users"],
        queryFn: fetchUsers,
        staleTime: DEFAULT_STALE_TIME,
    });
}
