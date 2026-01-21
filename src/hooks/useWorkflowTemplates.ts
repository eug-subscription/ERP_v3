import { useQuery } from '@tanstack/react-query';
import { WorkflowTemplate } from '../types/workflow';
import { mockWorkflowTemplates } from '../data/mock-workflow-templates';

/**
 * Fetches available workflow templates from our mock data source.
 * Simulates network latency for realistic UI feedback (skeletons/loading states).
 */
async function fetchWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    return mockWorkflowTemplates;
}

/**
 * TanStack Query hook for accessing workflow templates.
 * Rule #4 (dev_instruction_v3.md): Use useQuery hooks for all data fetching.
 */
export function useWorkflowTemplates() {
    return useQuery({
        queryKey: ['workflow-templates'],
        queryFn: fetchWorkflowTemplates,
        staleTime: 1000 * 60 * 60, // 1 hour - templates are relatively static
    });
}
