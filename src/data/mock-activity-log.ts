import { ActivityLogEvent } from '../types/activity-log';

/**
 * Mock activity log events for order ord-12345.
 * 16 events spanning 3 calendar days (Feb 17-19, 2026).
 * All 6 event types are represented.
 */
export const mockActivityLogEvents: ActivityLogEvent[] = [
    // Day 3: Feb 19 (latest)

    {
        id: 'evt-016',
        orderId: 'ord-12345',
        timestamp: '2026-02-19T11:20:00Z',
        type: 'COMMENT',
        title: 'Comment from Anna K.',
        description: 'Batch 2 needs extra attention on the product edge shadows - client specifically requested clean backgrounds.',
        actor: {
            name: 'Anna K.',
            role: 'Project Manager',
            avatar: 'https://i.pravatar.cc/40?u=annak',
        },
    },
    {
        id: 'evt-015',
        orderId: 'ord-12345',
        timestamp: '2026-02-19T10:45:00Z',
        type: 'STATUS_CHANGE',
        blockType: 'PHOTO_RETOUCHING',
        title: 'Retouching started',
        description: 'Retoucher downloaded source files and began editing.',
    },
    {
        id: 'evt-014',
        orderId: 'ord-12345',
        timestamp: '2026-02-19T09:00:00Z',
        type: 'SYSTEM',
        blockType: 'PHOTO_RETOUCHING',
        title: 'Retoucher check-in confirmed',
        description: 'Dmitri V. accepted the retouching assignment and confirmed guidelines.',
        actor: {
            name: 'Dmitri V.',
            role: 'Retoucher',
        },
    },
    {
        id: 'evt-013',
        orderId: 'ord-12345',
        timestamp: '2026-02-19T08:00:00Z',
        type: 'ERROR',
        blockType: 'PHOTO_SHOOT',
        title: 'Batch #2 upload failed - retrying',
        description: 'Network timeout during upload of 120 files. Automatic retry scheduled in 5 minutes.',
        meta: {
            batchId: 'batch-2',
            batchNumber: 2,
            fileCount: 120,
        },
    },

    // Day 2: Feb 18

    {
        id: 'evt-012',
        orderId: 'ord-12345',
        timestamp: '2026-02-18T16:00:00Z',
        type: 'STATUS_CHANGE',
        blockType: 'PHOTO_SHOOT',
        title: 'Photo shoot completed',
        description: 'Photographer wrapped up on-site. All files handed over.',
        actor: {
            name: 'Maria G.',
            role: 'Photographer',
        },
    },
    {
        id: 'evt-011',
        orderId: 'ord-12345',
        timestamp: '2026-02-18T15:30:00Z',
        type: 'BATCH',
        blockType: 'PHOTO_SHOOT',
        title: 'Batch #2 upload started',
        description: '120 additional files uploading via SST.',
        meta: {
            batchId: 'batch-2',
            batchNumber: 2,
            fileCount: 120,
        },
    },
    {
        id: 'evt-010',
        orderId: 'ord-12345',
        timestamp: '2026-02-18T15:00:00Z',
        type: 'COMMENT',
        title: 'Comment from Maria G.',
        description: 'Added a second batch - found extra SKUs in the brief that were not in the original item list.',
        actor: {
            name: 'Maria G.',
            role: 'Photographer',
            avatar: 'https://i.pravatar.cc/40?u=mariag',
        },
    },
    {
        id: 'evt-009',
        orderId: 'ord-12345',
        timestamp: '2026-02-18T13:00:00Z',
        type: 'BATCH',
        blockType: 'PHOTO_SHOOT',
        title: 'Batch #1 uploaded',
        description: '450 files successfully uploaded and available for matching.',
        meta: {
            batchId: 'batch-1',
            batchNumber: 1,
            fileCount: 450,
        },
    },
    {
        id: 'evt-008',
        orderId: 'ord-12345',
        timestamp: '2026-02-18T10:00:00Z',
        type: 'NOTIFICATION',
        title: 'Client notified - shoot in progress',
        description: 'Automated notification sent to client: photographer is on-site.',
        meta: {
            channel: 'EMAIL',
        },
    },
    {
        id: 'evt-007',
        orderId: 'ord-12345',
        timestamp: '2026-02-18T09:30:00Z',
        type: 'SYSTEM',
        blockType: 'PHOTO_SHOOT',
        title: 'Photo shoot started',
        description: 'Photographer Maria G. checked in on-site and began shooting.',
    },

    // Day 1: Feb 17 (oldest)

    {
        id: 'evt-006',
        orderId: 'ord-12345',
        timestamp: '2026-02-17T14:45:00Z',
        type: 'STATUS_CHANGE',
        blockType: 'PRO_ASSIGNING',
        title: 'Photographer assigned',
        description: 'Maria G. (Level 4) accepted the assignment.',
        actor: {
            name: 'Maria G.',
            role: 'Photographer',
        },
    },
    {
        id: 'evt-005',
        orderId: 'ord-12345',
        timestamp: '2026-02-17T10:30:00Z',
        type: 'STATUS_CHANGE',
        blockType: 'WAIT_PAYMENT',
        title: 'Payment confirmed',
        description: 'Invoice #INV-8821 paid in full.',
        meta: {
            amount: 1240,
            currency: 'EUR',
        },
    },
    {
        id: 'evt-004',
        orderId: 'ord-12345',
        timestamp: '2026-02-17T10:00:00Z',
        type: 'NOTIFICATION',
        title: 'Payment reminder sent to client',
        description: 'Automated invoice reminder dispatched.',
        meta: {
            channel: 'SMS',
        },
    },
    {
        id: 'evt-003',
        orderId: 'ord-12345',
        timestamp: '2026-02-17T09:15:00Z',
        type: 'SYSTEM',
        blockType: 'ITEMS_TO_SHOOT',
        title: 'Items to shoot defined',
        description: '42 SKUs confirmed across 3 product categories.',
    },
    {
        id: 'evt-002',
        orderId: 'ord-12345',
        timestamp: '2026-02-17T09:05:00Z',
        type: 'NOTIFICATION',
        title: 'Order confirmation sent to client',
        description: 'Welcome email dispatched with shoot details and timeline.',
        meta: {
            channel: 'EMAIL',
        },
    },
    {
        id: 'evt-001',
        orderId: 'ord-12345',
        timestamp: '2026-02-17T09:00:00Z',
        type: 'SYSTEM',
        blockType: 'ORDER_CREATED',
        title: 'Order created',
        description: 'New photography order initialized for Acme Corp - 42 SKU product shoot.',
    },
];
