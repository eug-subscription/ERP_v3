import { useQuery } from '@tanstack/react-query';
import { mockOrderInstance } from '../data/mock-workflow-instance';
import { mockBranchedInstance } from '../data/mock-workflow-instance-branched';
import { OrderWorkflowInstance } from '../types/workflow';

/** Map of orderId → mock instance. Add new scenarios here as needed. */
const MOCK_INSTANCES: Record<string, OrderWorkflowInstance> = {
    'ord-12345': mockOrderInstance,
    'ord-branched-001': mockBranchedInstance,
};

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
            return MOCK_INSTANCES[orderId] ?? mockOrderInstance;
        },
        enabled: !!orderId,
    });
}

