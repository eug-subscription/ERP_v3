import { useQuery } from "@tanstack/react-query";
import { ALL_TEAM_MEMBERS } from "../data/mock-team-members";
import type { SplTeamMember } from "../types/team";
import { DEFAULT_STALE_TIME, MOCK_API_DELAY } from "../constants/query-config";

async function fetchTeamMembers(): Promise<SplTeamMember[]> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    return ALL_TEAM_MEMBERS;
}

/** Pure data hook — returns team member query state only. */
export function useTeam() {
    const query = useQuery({
        queryKey: ["teamMembers"],
        queryFn: fetchTeamMembers,
        staleTime: DEFAULT_STALE_TIME,
    });

    return {
        teamMembers: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
