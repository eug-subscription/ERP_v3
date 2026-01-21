import { useQuery } from '@tanstack/react-query';
import { mockOrderInstance } from '../data/mock-workflow-instance';
import { OrderWorkflowInstance } from '../types/workflow';

/**
 * useOrderWorkflow Hook
 * Fetches the workflow instance for a specific order.
 * Currently uses mock data.
 */
export function useOrderWorkflow(orderId: string) {
    return useQuery<OrderWorkflowInstance>({
        queryKey: ['order-workflow', orderId],
        queryFn: async () => {
            // Simulate network latency
            await new Promise(r => setTimeout(r, 600));
            return mockOrderInstance;
        },
        enabled: !!orderId,
    });
}
