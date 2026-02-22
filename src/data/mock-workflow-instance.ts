import { OrderWorkflowInstance } from '../types/workflow';

/**
 * Mock Order Workflow Instance Data
 * Represents a live photography "Photo Only" order currently in progress.
 * 9-block workflow: 6 completed, 1 active (PHOTO_RETOUCHING), 2 pending.
 */
export const mockOrderInstance: OrderWorkflowInstance = {
    orderId: 'ord-12345',
    status: 'IN_PROGRESS',
    currentBlockIds: ['photo-retouching'],
    completedBlockIds: [
        'order-created',
        'items-to-shoot',
        'wait-payment',
        'pro-assigning',
        'photo-shoot',
        'matching',
    ],
    blockProgress: {
        'order-created': {
            blockId: 'order-created',
            status: 'COMPLETED',
            subStatus: [
                { type: 'text', value: 'This order was created via Booking Platform by ' },
                { type: 'mention', value: 'Sarah M. (PM)', userId: 'usr-sarah' },
            ],
            completedAt: '2024-07-15T09:00:00Z', // 19 months ago → "15 Jul 2024"
        },
        'items-to-shoot': {
            blockId: 'items-to-shoot',
            status: 'COMPLETED',
            subStatus: [
                { type: 'mention', value: 'Sarah M. (PM)', userId: 'usr-sarah' },
                { type: 'text', value: ' started confirming the order details with the client' },
            ],
            completedAt: '2024-07-15T09:15:00Z', // 19 months ago → "15 Jul 2024"
        },
        'wait-payment': {
            blockId: 'wait-payment',
            status: 'COMPLETED',
            subStatus: [
                { type: 'text', value: 'Order has been confirmed and is being scheduled' },
            ],
            completedAt: '2025-09-20T10:30:00Z', // 5 months ago → "20 Sep · 10:30"
        },
        'pro-assigning': {
            blockId: 'pro-assigning',
            status: 'COMPLETED',
            subStatus: [
                { type: 'mention', value: 'Sarah M. (PM)', userId: 'usr-sarah' },
                { type: 'text', value: ' manually assigned ' },
                { type: 'mention', value: 'Maria G. (Photographer)', userId: 'usr-maria' },
                { type: 'text', value: ' to the order' },
            ],
            completedAt: '2026-01-22T14:45:00Z', // last month → "22 Jan · 14:45"
        },
        'photo-shoot': {
            blockId: 'photo-shoot',
            status: 'COMPLETED',
            subStatus: [
                { type: 'text', value: 'The photoshoot was completed by ' },
                { type: 'mention', value: 'Maria G. (Photographer)', userId: 'usr-maria' },
            ],
            completedAt: '2026-02-18T16:00:00Z', // yesterday → "Yesterday · 16:00"
            batches: [
                {
                    id: 'batch-1',
                    batchNumber: 1,
                    fileCount: 450,
                    status: 'UPLOADED',
                    type: 'REGULAR',
                    timestamp: '2026-02-18T13:00:00Z',
                },
                {
                    id: 'batch-2',
                    batchNumber: 2,
                    fileCount: 120,
                    status: 'UPLOADING',
                    type: 'REGULAR',
                    timestamp: '2026-02-18T15:30:00Z',
                },
            ],
        },
        'photo-retouching': {
            blockId: 'photo-retouching',
            status: 'ACTIVE',
            subStatus: [
                { type: 'mention', value: 'Alex K. (Retoucher)', userId: 'usr-alex' },
                { type: 'text', value: ' downloaded photos and started editing' },
            ],
        },
        'matching': {
            blockId: 'matching',
            status: 'COMPLETED',
            subStatus: [
                { type: 'text', value: 'Photos were uploaded to the platform by ' },
                { type: 'mention', value: 'Maria G. (Photographer)', userId: 'usr-maria' },
                { type: 'text', value: ' via SST' },
            ],
            completedAt: '2026-02-19T07:00:00Z', // today → "16h ago"
        },
        'moderation': {
            blockId: 'moderation',
            status: 'PENDING',
        },
        'send-to-client': {
            blockId: 'send-to-client',
            status: 'PENDING',
        },
    },
};
