import React from "react";
import { useQuery } from "@tanstack/react-query";
import { mockTeamMembers, TeamMember } from "../data/mock-team";

async function fetchTeamMembers(): Promise<TeamMember[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockTeamMembers;
}

export function useTeam() {
    const query = useQuery({
        queryKey: ["teamMembers"],
        queryFn: fetchTeamMembers,
    });

    const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set(["2"]));
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
        state: {
            teamMembers: query.data || [],
            isLoading: query.isLoading,
            error: query.error,
            selectedKeys,
            page,
            isOpen,
        },
        actions: {
            setSelectedKeys,
            setPage,
            setIsOpen,
            toggleSelected,
            handleAddMember,
        },
    };
}
