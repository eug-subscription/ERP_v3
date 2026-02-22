import { WorkflowBlockType } from './workflow';

/**
 * Activity log event types for the Timeline tab.
 * Shared type used by mock data, hooks, and UI components.
 */
export interface ActivityLogEvent {
    id: string;
    orderId: string;
    timestamp: string; // ISO 8601
    type: 'SYSTEM' | 'STATUS_CHANGE' | 'COMMENT' | 'NOTIFICATION' | 'ERROR' | 'BATCH';
    blockType?: WorkflowBlockType;
    title: string;
    description?: string;
    actor?: {
        name: string;
        role: string;
        avatar?: string;
    };
    meta?: {
        batchId?: string;
        batchNumber?: number;
        fileCount?: number;
        channel?: string;
        amount?: number;
        currency?: string;
    };
}
