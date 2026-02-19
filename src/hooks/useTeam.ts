import React from "react";
import { useQuery } from "@tanstack/react-query";
import { mockTeamMembers, TeamMember } from "../data/mock-team";
import { DEFAULT_STALE_TIME, MOCK_API_DELAY } from "../constants/query-config";

async function fetchTeamMembers(): Promise<TeamMember[]> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    return mockTeamMembers;
}

export function useTeam() {
    const query = useQuery({
        queryKey: ["teamMembers"],
        queryFn: fetchTeamMembers,
        staleTime: DEFAULT_STALE_TIME,
    });

    const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set());
    const [page, setPage] = React.useState(1);
    const [isOpen, setIsOpen] = React.useState(false);

    const toggleSelected = (id: string) => {
        const newSelected = new Set(selectedKeys);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedKeys(newSelected);
    };

    const handleAddMember = () => {
        setIsOpen(false);
    };

    return {

        teamMembers: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        selectedKeys,
        page,
        isOpen,

        setSelectedKeys,
        setPage,
        setIsOpen,
        toggleSelected,
        handleAddMember,
    };
}
