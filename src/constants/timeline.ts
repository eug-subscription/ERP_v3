/**
 * Timeline UI constants for consistent sizing across components
 */
export const TIMELINE_ICON_SIZES = {
    /** Extra-small icon size for utility bar labels (12px) */
    XS: 12,
    /** Small-medium icon for utility bar actions (13px) */
    SM_MD: 13,
    /** Standard icon size for timeline UI elements (16px) */
    SM: 16,
    /** Medium icon size for headers and primary actions (20px) */
    MD: 20,
    /** Large icon size for emphasis (24px) */
    LG: 24,
} as const;

export const TIMELINE_SIZES = {
    /** Icon container size for timeline step cards */
    ICON_CONTAINER: 'w-8 h-8',
    /** Override indicator dot size */
    OVERRIDE_DOT: 'w-1.5 h-1.5',
    /** Timeline preview dot outer ring size */
    TIMELINE_DOT_OUTER: 'w-5 h-5',
    /** Timeline preview dot inner circle size */
    TIMELINE_DOT_INNER: 'w-2 h-2',
    /** Empty state icon container size */
    EMPTY_STATE_ICON: 'w-12 h-12',
} as const;

/**
 * Default visibility settings for workflow blocks per audience.
 * 
 * Only defines entries where the default is NOT visible (false).
 * Omitted entries default to visible (true).
 * 
 * - Client: Hides internal/technical blocks
 * - Pro: Hides flow-control and matching blocks
 * - Ops: Sees everything (no entries, all default to true)
 */
export const DEFAULT_AUDIENCE_VISIBILITY = {
    IF_ELSE: { client: false, pro: false },
    MERGE: { client: false, pro: false },
    SST: { client: false },
    FILE_STORAGE: { client: false },
    FILE_RENAMING: { client: false },
    EXTERNAL_PROCESS: { client: false, pro: false },
    MATCHING: { client: false, pro: false },
    RETOUCHER_ASSIGNING: { client: false },
} as const;

/**
 * Internal block types that should typically be hidden for client/pro audiences.
 * Used by batch actions like "Hide internal steps".
 */
export const INTERNAL_BLOCK_TYPES = [
    'IF_ELSE', 'MERGE', 'SST', 'FILE_STORAGE',
    'FILE_RENAMING', 'EXTERNAL_PROCESS', 'MATCHING',
] as const;

/**
 * Display labels and icons for workflow branches.
 * 
 * Used in the timeline preview to visually group and label
 * steps that belong to conditional branches (photo/video paths).
 * 
 * The 'main' branch has no label and is not displayed.
 */
export const BRANCH_LABELS: Record<string, { label: string; icon: string }> = {
    photo: { label: 'Photo', icon: 'lucide:camera' },
    video: { label: 'Video', icon: 'lucide:video' },
};

/**
 * Default audience-specific labels for workflow blocks.
 * 
 * Provides human-friendly labels for different audiences without manual configuration.
 * Only defines entries where the label should differ from the block's technical name.
 * 
 * - Client: Gets friendly, non-technical labels
 * - Pro: Uses technical names (no entries needed)
 * - Ops: Uses technical names (no entries needed)
 * 
 * Omitted entries fall back to the block's canvas label.
 */
export const DEFAULT_AUDIENCE_LABELS: Partial<Record<string, Partial<Record<string, string>>>> = {
    ORDER_CREATED: { client: 'Order Received' },
    PRO_ASSIGNING: { client: 'Photographer Assigned' },
    PHOTO_SHOOT: { client: 'Photo Session' },
    VIDEO_SHOOT: { client: 'Video Session' },
    PHOTO_RETOUCHING: { client: 'Photo Enhancement' },
    VIDEO_RETOUCHING: { client: 'Video Enhancement' },
    MODERATION: { client: 'Quality Review' },
    SEND_TO_CLIENT: { client: 'Ready for Delivery' },
    SEND_NOTIFICATION: { client: 'Status Update' },
};

/**
 * Default audience-specific description templates for workflow blocks.
 *
 * Provides contextual descriptions for each audience. Uses placeholder tokens
 * like {User Role and Name}, {Source}, {Channel} that will be substituted at runtime.
 *
 * Omitted entries fall back to empty string (no description).
 */
export const DEFAULT_AUDIENCE_DESCRIPTIONS: Partial<Record<string, Partial<Record<string, string>>>> = {
    ORDER_CREATED: {
        client: 'This order was created via {Source} by {User Role and Name}',
        pro: 'Order created by {User Role and Name}',
        ops: 'Order created via {Source} by {User Role and Name}',
    },
    PRO_ASSIGNING: {
        client: '{User Role and Name} assigned a professional to the order',
        pro: '{User Role and Name} sent an offer to a Pro',
        ops: '{User Role and Name} manually assigned {User Role and Name} to the order',
    },
    PHOTO_SHOOT: {
        client: 'The photoshoot was completed by {User Role and Name}',
        pro: '{User Role and Name} started the photoshoot',
        ops: '{User Role and Name} started the photoshoot',
    },
    VIDEO_SHOOT: {
        client: 'The video shoot was completed by {User Role and Name}',
        pro: '{User Role and Name} started the video shoot',
        ops: '{User Role and Name} started the video shoot',
    },
    PHOTO_RETOUCHING: {
        client: 'Photos are being enhanced by {User Role and Name}',
        pro: '{User Role and Name} downloaded photos and started editing',
        ops: '{User Role and Name} downloaded photos and started editing',
    },
    VIDEO_RETOUCHING: {
        client: 'Videos are being enhanced by {User Role and Name}',
        pro: '{User Role and Name} downloaded videos and started editing',
        ops: '{User Role and Name} downloaded videos and started editing',
    },
    MODERATION: {
        client: '{User Role and Name} started reviewing all edited files',
        pro: '{User Role and Name} started reviewing all edited files',
        ops: '{User Role and Name} started reviewing all edited files',
    },
    SEND_TO_CLIENT: {
        client: 'All files were approved and are ready for delivery',
        pro: 'Files delivered to client',
        ops: 'Files sent to client for approval',
    },
    SEND_NOTIFICATION: {
        client: 'A status update was sent',
        ops: '{User Role and Name} sent a notification via {Channel}',
    },
};
