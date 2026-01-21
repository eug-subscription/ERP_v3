import { OrderWorkflowInstance } from '../types/workflow';

/**
 * Mock Order Workflow Instance Data
 * Represents a live photography order currently in progress.
 */
export const mockOrderInstance: OrderWorkflowInstance = {
    orderId: 'ord-12345',
    status: 'IN_PROGRESS',
    currentBlockIds: ['photo-shoot', 'photo-matching'],
    completedBlockIds: ['order-created', 'wait-payment', 'pro-assigning'],
    blockProgress: {
        'order-created': {
            blockId: 'order-created',
            status: 'COMPLETED',
            completedAt: '2024-03-20T10:00:00Z',
        },
        'wait-payment': {
            blockId: 'wait-payment',
            status: 'COMPLETED',
            completedAt: '2024-03-20T11:30:00Z',
        },
        'pro-assigning': {
            blockId: 'pro-assigning',
            status: 'COMPLETED',
            subStatus: 'Pro Assigned: Maria G.',
            completedAt: '2024-03-20T14:45:00Z',
        },
        'photo-shoot': {
            blockId: 'photo-shoot',
            status: 'ACTIVE',
            subStatus: 'Shooting in progress',
            batches: [
                {
                    id: 'batch-1',
                    batchNumber: 1,
                    fileCount: 450,
                    status: 'UPLOADED',
                    type: 'REGULAR',
                    timestamp: '2024-03-21T15:00:00Z',
                }
            ]
        },
        'photo-matching': {
            blockId: 'photo-matching',
            status: 'ACTIVE',
            subStatus: 'Matching files...',
        }
    }
};
