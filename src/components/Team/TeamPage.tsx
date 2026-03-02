import { useState, useDeferredValue } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button, Breadcrumbs, Surface } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FilterBar } from "../pricing/FilterBar";
import { TeamFilters } from "./TeamFilters";
import { TeamTable } from "./TeamTable";
import type { SortableColumn } from "./TeamTable";
import { TeamTableSkeleton } from "./TeamTableSkeleton";
import {
    useTeamMembers,
    useTeamCountryOptions,
    useTeamCityOptions,
    DEFAULT_TEAM_QUERY_PARAMS,
} from "../../hooks/useTeamMembers";
import type { TeamMemberFilters, TeamMemberQueryParams } from "../../hooks/useTeamMembers";
import type { TeamMemberStatus, SplTeamMember } from "../../types/team";

const PAGE_SIZE = DEFAULT_TEAM_QUERY_PARAMS.pageSize;

export function TeamPage() {
    // ── State ────────────────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearch = useDeferredValue(searchQuery);
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<TeamMemberStatus | "all">("all");

    const [sortKey, setSortKey] = useState<keyof SplTeamMember>(
        DEFAULT_TEAM_QUERY_PARAMS.sortKey,
    );
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
        DEFAULT_TEAM_QUERY_PARAMS.sortDirection,
    );

    const [dropdownFilters, setDropdownFilters] = useState<TeamMemberFilters>(
        DEFAULT_TEAM_QUERY_PARAMS.filters,
    );

    // Merge status tab into filters
    const mergedFilters: TeamMemberFilters = {
        ...dropdownFilters,
        status: statusFilter,
    };

    const queryParams: TeamMemberQueryParams = {
        page,
        pageSize: PAGE_SIZE,
        search: deferredSearch,
        sortKey,
        sortDirection,
        filters: mergedFilters,
    };

    // ── Data ─────────────────────────────────────────────────────────────────
    const { data, isLoading } = useTeamMembers(queryParams);
    const countryOptions = useTeamCountryOptions();
    const cityOptions = useTeamCityOptions();

    const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

    const hasActiveFilters =
        deferredSearch !== "" ||
        statusFilter !== "all" ||
        dropdownFilters.role !== "" ||
        dropdownFilters.country !== "" ||
        dropdownFilters.city !== "";

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleEdit = (member: SplTeamMember) =>
        void navigate({ to: "/people/$memberId", params: { memberId: member.id } });

    const handleSort = (key: keyof SplTeamMember) => {
        if (key === sortKey) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDirection("asc");
        }
        setPage(1);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setPage(1);
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value as TeamMemberStatus | "all");
        setPage(1);
    };

    const handleDropdownFiltersChange = (updated: TeamMemberFilters) => {
        setDropdownFilters(updated);
        setPage(1);
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setDropdownFilters(DEFAULT_TEAM_QUERY_PARAMS.filters);
        setPage(1);
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Surface className="min-h-screen bg-surface rounded-none shadow-none pb-20 p-12">
            {/* Header */}
            <header className="mb-10 px-0">
                <Breadcrumbs className="mb-4">
                    <Breadcrumbs.Item>Administration</Breadcrumbs.Item>
                    <Breadcrumbs.Item>Team Directory</Breadcrumbs.Item>
                </Breadcrumbs>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                            Team Directory
                        </h1>
                        <p className="text-default-500 max-w-2xl text-lg">
                            {data
                                ? `${data.total} team member${data.total !== 1 ? "s" : ""} across your organization.`
                                : "Loading team members…"}
                        </p>
                    </div>

                    <Button variant="primary" size="lg" isDisabled>
                        <Icon icon="lucide:user-plus" className="w-5 h-5 mr-1" />
                        Invite Member
                    </Button>
                </div>
            </header>

            {/* Filter bar — search + status tabs */}
            <div className="mb-6">
                <FilterBar
                    search={{
                        value: searchQuery,
                        onChange: handleSearchChange,
                        placeholder: "Search by name or email…",
                    }}
                    status={{
                        value: statusFilter,
                        onChange: handleStatusChange,
                        options: [
                            { key: "all", label: "All" },
                            { key: "active", label: "Active" },
                            { key: "paused", label: "Paused" },
                            { key: "inactive", label: "Inactive" },
                        ],
                    }}
                />
            </div>

            {/* Dropdown filters (role, country, city) */}
            <div className="mb-8">
                <TeamFilters
                    filters={dropdownFilters}
                    onFiltersChange={handleDropdownFiltersChange}
                    countryOptions={countryOptions}
                    cityOptions={cityOptions}
                />
            </div>

            {/* Table or skeleton */}
            {isLoading && !data ? (
                <TeamTableSkeleton />
            ) : (
                <TeamTable
                    members={data?.items ?? []}
                    sortKey={sortKey as SortableColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onClearFilters={handleClearFilters}
                    hasActiveFilters={hasActiveFilters}
                    onEdit={handleEdit}
                />
            )}

            {/* Pagination */}
            {data && totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 px-2">
                    <p className="text-sm text-default-400">
                        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} of {data.total}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            isDisabled={page <= 1}
                            onPress={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            <Icon icon="lucide:chevron-left" className="w-4 h-4 mr-1" />
                            Previous
                        </Button>
                        <span className="text-sm font-medium text-default-600 px-3">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            isDisabled={page >= totalPages}
                            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                            Next
                            <Icon icon="lucide:chevron-right" className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </Surface>
    );
}
