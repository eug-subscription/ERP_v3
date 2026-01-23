import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectWorkflowConfig } from "../types/workflow";
import { toast } from "@heroui/react";

/**
 * Mock API to fetch a project's workflow.
 */
async function fetchProjectWorkflow(projectId: string): Promise<ProjectWorkflowConfig | null> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    // In a real app: return fetch(`/api/projects/${projectId}/workflow`).then(r => r.json());
    console.log(`Fetching workflow for project ${projectId}`);
    return null; // Return null to simulate a new project by default
}

/**
 * Mock API to save a project's workflow.
 */
async function saveProjectWorkflow(config: ProjectWorkflowConfig): Promise<ProjectWorkflowConfig> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // In a real app: 
    // const res = await fetch(`/api/projects/${config.projectId}/workflow`, {
    //   method: 'POST',
    //   body: JSON.stringify(config)
    // });
    // return res.json();
    console.log("Saving workflow config:", config);
    return config;
}

/**
 * Hook to fetch project workflow data.
 */
export function useProjectWorkflow(projectId: string) {
    return useQuery({
        queryKey: ["project-workflow", projectId],
        queryFn: () => fetchProjectWorkflow(projectId),
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook to save project workflow data.
 */
export function useSaveWorkflow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: saveProjectWorkflow,
        onSuccess: (data) => {
            queryClient.setQueryData(["project-workflow", data.projectId], data);
            toast.success("Workflow saved successfully!");
        },
        onError: (error) => {
            console.error("Failed to save workflow:", error);
            toast.danger("Failed to save workflow. Please try again.");
        },
    });
}
