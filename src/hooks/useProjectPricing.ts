import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchProjectPricing,
    updateProjectPricing
} from "../data/mock-project-pricing";
import { ProjectPricingSettings } from "../types/pricing";
import { DEFAULT_STALE_TIME } from "../constants/query-config";

/**
 * useProjectPricing - Hook to fetch pricing settings for a specific project.
 * @param projectId The unique identifier for the project.
 */
export function useProjectPricing(projectId: string) {
    return useQuery({
        queryKey: ["projects", projectId, "pricing"],
        queryFn: () => fetchProjectPricing(projectId),
        staleTime: DEFAULT_STALE_TIME,
        enabled: !!projectId,
    });
}

/**
 * useUpdateProjectPricing - Hook to update pricing settings for a project.
 * Uses optimistic updates to prevent UI flickering during save operations.
 */
export function useUpdateProjectPricing() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (settings: ProjectPricingSettings) => updateProjectPricing(settings),

        onMutate: async (newSettings) => {
            const queryKey = ["projects", newSettings.projectId, "pricing"];

            // Cancel any in-flight refetches to prevent overwriting optimistic update
            await queryClient.cancelQueries({ queryKey });

            // Snapshot current value for rollback
            const previousSettings = queryClient.getQueryData<ProjectPricingSettings>(queryKey);

            // Optimistically update cache with new values
            queryClient.setQueryData(queryKey, newSettings);

            // Return context for rollback
            return { previousSettings };
        },

        onError: (_error, newSettings, context) => {
            // Rollback to previous value on error
            if (context?.previousSettings) {
                queryClient.setQueryData(
                    ["projects", newSettings.projectId, "pricing"],
                    context.previousSettings
                );
            }
        },

        onSettled: (_data, _error, variables) => {
            // Always refetch in background to ensure server consistency
            queryClient.invalidateQueries({
                queryKey: ["projects", variables.projectId, "pricing"]
            });
        },
    });
}
