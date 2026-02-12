import { useQuery } from "@tanstack/react-query";
import { DEFAULT_STALE_TIME } from "../constants/query-config";

/**
 * Simulates an asynchronous API fetch to check if a project has confirmed orders.
 * @param projectId The unique identifier for the project.
 * @returns A promise that resolves with a boolean indicating if confirmed orders exist.
 */
async function fetchHasConfirmedOrders(_projectId: string): Promise<boolean> {
    // TODO: Replace this mock implementation with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real app, this would be:
    // const response = await fetch(`/api/projects/${projectId}/has-confirmed-orders`);
    // return response.json();

    // TODO: Hook up to real API endpoint once backend is ready
    return false;
}

/**
 * Hook to check if a project has any confirmed orders.
 * This is used to enforce currency immutability after the first confirmed order.
 * 
 * @param projectId The unique identifier for the project.
 * @returns TanStack Query result with boolean data indicating if confirmed orders exist.
 */
export function useHasConfirmedOrders(projectId: string) {
    return useQuery({
        queryKey: ["projects", projectId, "hasConfirmedOrders"],
        queryFn: () => fetchHasConfirmedOrders(projectId),
        staleTime: DEFAULT_STALE_TIME,
        enabled: !!projectId,
    });
}
