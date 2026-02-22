import { OrderWorkflowInstance } from '../types/workflow';

/**
 * Mock Order Workflow Instance — Photo + Video (Branched)
 *
 * Demonstrates a workflow with parallel Photo and Video tracks:
 *   Initial: ORDER_CREATED ✅ → ITEMS_TO_SHOOT ✅ → WAIT_PAYMENT ✅ → PRO_ASSIGNING ✅ → RETOUCHER_ASSIGNING ✅
 *   Fork (IF_ELSE):
 *     Photo lane: PHOTO_SHOOT ✅ → MATCHING ✅ → PHOTO_RETOUCHING ✅ → Internal Moderation ● → Client Moderation ○
 *     Video lane: VIDEO_SHOOT ● → Video Editing ○ → Internal Moderation ○ → Client Moderation ○
 *   Merge:
 *     MODERATION ○ → SEND_TO_CLIENT ○
 *
 * Note: Internal/Client Moderation are MODERATION blocks renamed per audience.
 *       Video Editing is VIDEO_RETOUCHING renamed. They reuse existing types
 *       (SST, EXTERNAL_PROCESS, FILE_STORAGE, FILE_RENAMING) for demo purposes.
 */
export const mockBranchedInstance: OrderWorkflowInstance = {
    orderId: 'ord-branched-001',
    status: 'IN_PROGRESS',
    currentBlockIds: ['internal-moderation-photo', 'video-shoot'],
    completedBlockIds: [
        'order-created',
        'items-to-shoot',
        'wait-payment',
        'pro-assigning',
        'retoucher-assigning',
        'photo-shoot',
        'matching',
        'photo-retouching',
    ],
    blockProgress: {
        // ── Initial linear steps ──────────────────────────
        'order-created': {
            blockId: 'order-created',
            status: 'COMPLETED',
            subStatus: [
                { type: 'text', value: 'Order created via Booking Platform by ' },
                { type: 'mention', value: 'Sarah M. (PM)', userId: 'usr-sarah' },
            ],
            completedAt: '2024-07-15T09:00:00Z',
        },
        'items-to-shoot': {
            blockId: 'items-to-shoot',
            status: 'COMPLETED',
            subStatus: [
                { type: 'mention', value: 'Sarah M. (PM)', userId: 'usr-sarah' },
                { type: 'text', value: ' confirmed items with client' },
            ],
            completedAt: '2024-07-15T09:15:00Z',
        },
        'wait-payment': {
            blockId: 'wait-payment',
            status: 'COMPLETED',
            subStatus: [
                { type: 'text', value: 'Payment received — order confirmed' },
            ],
            completedAt: '2025-09-20T10:30:00Z',
        },
        'pro-assigning': {
            blockId: 'pro-assigning',
            status: 'COMPLETED',
            subStatus: [
                { type: 'mention', value: 'Sarah M. (PM)', userId: 'usr-sarah' },
                { type: 'text', value: ' assigned ' },
                { type: 'mention', value: 'Maria G. (Photographer)', userId: 'usr-maria' },
                { type: 'text', value: ' and ' },
                { type: 'mention', value: 'Tom R. (Videographer)', userId: 'usr-tom' },
            ],
            completedAt: '2026-01-22T14:45:00Z',
        },
        'retoucher-assigning': {
            blockId: 'retoucher-assigning',
            status: 'COMPLETED',
            subStatus: [
                { type: 'mention', value: 'Sarah M. (PM)', userId: 'usr-sarah' },
                { type: 'text', value: ' assigned ' },
                { type: 'mention', value: 'Alex K. (Retoucher)', userId: 'usr-alex' },
            ],
            completedAt: '2026-01-23T10:00:00Z',
        },

        // ── Photo lane ───────────────────────────────────
        'photo-shoot': {
            blockId: 'photo-shoot',
            status: 'COMPLETED',
            subStatus: [
                { type: 'text', value: 'Photoshoot completed by ' },
                { type: 'mention', value: 'Maria G. (Photographer)', userId: 'usr-maria' },
            ],
            completedAt: '2026-02-18T16:00:00Z',
        },
        'matching': {
            blockId: 'matching',
            status: 'COMPLETED',
            subStatus: [
                { type: 'text', value: 'Photos matched to items by ' },
                { type: 'mention', value: 'Maria G. (Photographer)', userId: 'usr-maria' },
            ],
            completedAt: '2026-02-19T07:00:00Z',
        },
        'photo-retouching': {
            blockId: 'photo-retouching',
            status: 'COMPLETED',
            subStatus: [
                { type: 'mention', value: 'Alex K. (Retoucher)', userId: 'usr-alex' },
                { type: 'text', value: ' finished retouching 570 photos' },
            ],
            completedAt: '2026-02-19T15:00:00Z',
        },
        // Internal Moderation (photo) — uses SST type
        'internal-moderation-photo': {
            blockId: 'internal-moderation-photo',
            status: 'ACTIVE',
            subStatus: [
                { type: 'mention', value: 'Sarah M. (PM)', userId: 'usr-sarah' },
                { type: 'text', value: ' is reviewing retouched photos' },
            ],
        },
        // Client Moderation (photo) — uses EXTERNAL_PROCESS type
        'client-moderation-photo': {
            blockId: 'client-moderation-photo',
            status: 'PENDING',
        },

        // ── Video lane ───────────────────────────────────
        'video-shoot': {
            blockId: 'video-shoot',
            status: 'ACTIVE',
            subStatus: [
                { type: 'mention', value: 'Tom R. (Videographer)', userId: 'usr-tom' },
                { type: 'text', value: ' is filming on location' },
            ],
        },
        // Video Editing — uses VIDEO_RETOUCHING type (renamed)
        'video-retouching': {
            blockId: 'video-retouching',
            status: 'PENDING',
        },
        // Internal Moderation (video) — uses FILE_STORAGE type
        'internal-moderation-video': {
            blockId: 'internal-moderation-video',
            status: 'PENDING',
        },
        // Client Moderation (video) — uses FILE_RENAMING type
        'client-moderation-video': {
            blockId: 'client-moderation-video',
            status: 'PENDING',
        },

        // ── Post-merge linear steps ──────────────────────
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
