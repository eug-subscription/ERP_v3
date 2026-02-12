import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import {
    fetchProjectOverrides,
    deleteProjectOverride,
    addProjectOverride,
    updateProjectOverride
} from "../data/mock-project-pricing";
import { DEFAULT_STALE_TIME } from "../constants/query-config";

/**
 * useProjectOverrides - Hook to fetch rate overrides for a specific project.
 * @param projectId The unique identifier for the project.
 */
export function useProjectOverrides(projectId: string) {
    return useQuery({
        queryKey: ["projects", projectId, "overrides"],
        queryFn: () => fetchProjectOverrides(projectId),
        staleTime: DEFAULT_STALE_TIME,
        enabled: !!projectId,
    });
}

/**
 * useRemoveProjectOverride - Hook to remove a project-level rate override.
 */
export function useRemoveProjectOverride() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ overrideId, projectId }: { overrideId: string; projectId: string }) =>
            deleteProjectOverride(overrideId, projectId),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ["projects", projectId, "overrides"] });
            queryClient.invalidateQueries({ queryKey: ["projects", projectId, "pricing"] });
            toast("Override Removed", {
                variant: "success",
                description: "Rate override has been deleted successfully"
            });
        },
        onError: () => {
            toast("Delete Failed", {
                variant: "danger",
                description: "Failed to remove rate override. Please try again."
            });
        },
    });
}

/**
 * useAddProjectOverride - Hook to add a new project-level rate override.
 */
export function useAddProjectOverride() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addProjectOverride,
        onSuccess: (_, override) => {
            queryClient.invalidateQueries({ queryKey: ["projects", override.projectId, "overrides"] });
            queryClient.invalidateQueries({ queryKey: ["projects", override.projectId, "pricing"] });
            toast("Override Added", {
                variant: "success",
                description: "New rate override has been created successfully"
            });
        },
        onError: () => {
            toast("Creation Failed", {
                variant: "danger",
                description: "Failed to add rate override. Please try again."
            });
        },
    });
}

/**
 * useUpdateProjectOverride - Hook to update an existing project-level rate override.
 */
export function useUpdateProjectOverride() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProjectOverride,
        onSuccess: (_, override) => {
            queryClient.invalidateQueries({ queryKey: ["projects", override.projectId, "overrides"] });
            queryClient.invalidateQueries({ queryKey: ["projects", override.projectId, "pricing"] });
            toast("Override Updated", {
                variant: "success",
                description: "Rate override has been updated successfully"
            });
        },
        onError: () => {
            toast("Update Failed", {
                variant: "danger",
                description: "Failed to update rate override. Please try again."
            });
        },
    });
}
