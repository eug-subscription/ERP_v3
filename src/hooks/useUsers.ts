import { useQuery } from "@tanstack/react-query";
import { mockUsers, User } from "../data/mock-users";

async function fetchUsers(): Promise<User[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockUsers;
}

export function useUsers() {
    return useQuery({
        queryKey: ["users"],
        queryFn: fetchUsers,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}
