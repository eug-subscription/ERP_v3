import { useQuery } from "@tanstack/react-query";
import { getTeamMemberProfile } from "../data/mock-team-member-profile";
import { DEFAULT_STALE_TIME, MOCK_API_DELAY } from "../constants/query-config";
import type { SplTeamMemberProfile } from "../types/team-profile";

// ─── Query function ───────────────────────────────────────────────────────────

async function fetchTeamMember(memberId: string): Promise<SplTeamMemberProfile> {
    // Simulate network latency (replace with real API call in production)
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    return getTeamMemberProfile(memberId);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches the full profile for a single team member by ID.
 * Pre-populated profiles (tm-001, tm-004, tm-008, tm-015, tm-022) return
 * rich data; all others get a generated default derived from `ALL_TEAM_MEMBERS`.
 */
export function useTeamMember(memberId: string) {
    return useQuery<SplTeamMemberProfile>({
        queryKey: ["teamMember", memberId],
        queryFn: () => fetchTeamMember(memberId),
        staleTime: DEFAULT_STALE_TIME,
    });
}
