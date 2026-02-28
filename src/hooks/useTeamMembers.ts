import { useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ALL_TEAM_MEMBERS } from "../data/mock-team-members";
import { DEFAULT_STALE_TIME, MOCK_API_DELAY } from "../constants/query-config";
import type {
    SplTeamMember,
    TeamMembersPage,
    TeamMemberStatus,
    TeamRole,
} from "../types/team";

// ─── Filter params ───────────────────────────────────────────────────────────

export interface TeamMemberFilters {
    role: TeamRole | "";
    status: TeamMemberStatus | "all";
    country: string;
    city: string;
}

export interface TeamMemberQueryParams {
    page: number;
    pageSize: number;
    search: string;
    sortKey: keyof SplTeamMember;
    sortDirection: "asc" | "desc";
    filters: TeamMemberFilters;
}

export const DEFAULT_TEAM_QUERY_PARAMS: TeamMemberQueryParams = {
    page: 1,
    pageSize: 50,
    search: "",
    sortKey: "name",
    sortDirection: "asc",
    filters: {
        role: "",
        status: "all",
        country: "",
        city: "",
    },
};

// ─── Simulated server-side processing ────────────────────────────────────────

function processTeamMembers(
    members: SplTeamMember[],
    params: TeamMemberQueryParams,
): TeamMembersPage {
    let result = [...members];

    // 1. Filter by status
    if (params.filters.status !== "all") {
        result = result.filter((m) => m.status === params.filters.status);
    }

    // 2. Filter by role
    if (params.filters.role !== "") {
        result = result.filter((m) => m.role === params.filters.role);
    }

    // 3. Filter by country
    if (params.filters.country !== "") {
        result = result.filter((m) => m.country === params.filters.country);
    }

    // 4. Filter by city
    if (params.filters.city !== "") {
        result = result.filter((m) => m.city === params.filters.city);
    }

    // 5. Global text search (name + email)
    if (params.search) {
        const query = params.search.toLowerCase();
        result = result.filter(
            (m) =>
                m.name.toLowerCase().includes(query) ||
                m.email.toLowerCase().includes(query),
        );
    }

    // 6. Sort
    result.sort((a, b) => {
        const aVal = a[params.sortKey] ?? "";
        const bVal = b[params.sortKey] ?? "";
        if (aVal < bVal) return params.sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return params.sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    // 7. Paginate
    const total = result.length;
    const start = (params.page - 1) * params.pageSize;
    const items = result.slice(start, start + params.pageSize);

    return { items, total, page: params.page, pageSize: params.pageSize };
}

// ─── Query function ──────────────────────────────────────────────────────────

async function fetchTeamMembers(
    params: TeamMemberQueryParams,
): Promise<TeamMembersPage> {
    // Simulate network latency (swap this body for a real API call)
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    return processTeamMembers(ALL_TEAM_MEMBERS, params);
}

// ─── Derived filter options ──────────────────────────────────────────────────

/** Unique countries derived from the full dataset. */
export function useTeamCountryOptions(): string[] {
    return useMemo(
        () => [...new Set(ALL_TEAM_MEMBERS.map((m) => m.country))].sort(),
        [],
    );
}

/** Unique cities derived from the full dataset. */
export function useTeamCityOptions(): string[] {
    return useMemo(
        () => [...new Set(ALL_TEAM_MEMBERS.map((m) => m.city))].sort(),
        [],
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTeamMembers(params: TeamMemberQueryParams) {
    return useQuery<TeamMembersPage>({
        queryKey: ["teamMembers", params],
        queryFn: () => fetchTeamMembers(params),
        staleTime: DEFAULT_STALE_TIME,
        placeholderData: keepPreviousData,
    });
}
