import { WorkflowBlockType, BlockCategory } from '../types/workflow';

/**
 * All blocks that have a dedicated configuration UI.
 */
export const CONFIGURABLE_BLOCKS = new Set<WorkflowBlockType>([
    'MODERATION',
    'EXTERNAL_PROCESS',
    'IF_ELSE',
    'PRO_ASSIGNING',
    'FILE_STORAGE',
    'SST',
    'RETOUCHER_ASSIGNING',
    'FILE_RENAMING',
    'SEND_NOTIFICATION'
]);

/**
 * Blocks that only show a description panel without editable settings.
 */
export const DESCRIPTION_ONLY_BLOCKS = new Set<WorkflowBlockType>([
    'ORDER_CREATED',
    'ITEMS_TO_SHOOT',
    'WAIT_PAYMENT',
    'PHOTO_SHOOT',
    'VIDEO_SHOOT',
    'PHOTO_RETOUCHING',
    'VIDEO_RETOUCHING',
    'MATCHING',
    'SEND_TO_CLIENT',
    'MERGE'
]);

/**
 * Returns the appropriate icon name for a given block type.
 */
export const getBlockIcon = (type: string): string => {
    switch (type) {
        case 'ORDER_CREATED': return 'lucide:box-select';
        case 'MODERATION': return 'lucide:shield-check';
        case 'EXTERNAL_PROCESS': return 'lucide:zap';
        case 'IF_ELSE': return 'lucide:split';
        case 'PRO_ASSIGNING': return 'lucide:user-plus';
        case 'FILE_STORAGE': return 'lucide:hard-drive';
        case 'SEND_NOTIFICATION': return 'lucide:bell';
        case 'SST': return 'lucide:layers';
        case 'RETOUCHER_ASSIGNING': return 'lucide:user-cog';
        case 'FILE_RENAMING': return 'lucide:type';
        case 'MERGE': return 'lucide:merge';
        case 'MATCHING': return 'lucide:puzzle';
        case 'SEND_TO_CLIENT': return 'lucide:send';
        case 'ITEMS_TO_SHOOT': return 'lucide:list-todo';
        case 'PHOTO_SHOOT': return 'lucide:camera';
        case 'VIDEO_SHOOT': return 'lucide:video';
        case 'PHOTO_RETOUCHING': return 'lucide:wand-sparkles';
        case 'VIDEO_RETOUCHING': return 'lucide:film';
        case 'WAIT_PAYMENT': return 'lucide:credit-card';
        default: return 'lucide:settings';
    }
};

/**
 * Returns the icon for a block category.
 */
export const getCategoryIcon = (category: BlockCategory): string => {
    switch (category) {
        case 'STARTING': return 'lucide:play';
        case 'PROCESSING': return 'lucide:cpu';
        case 'FINALISATION': return 'lucide:check-square';
        case 'UNIVERSAL': return 'lucide:globe';
        default: return 'lucide:box';
    }
};

/**
 * Layout constants for the WorkflowPreview diagram.
 * Used to avoid magic numbers in SVG path calculations.
 */
export const WORKFLOW_LAYOUT = {
    BLOCK_WIDTH: 256,         // Total width of a block slot
    NODE_WIDTH: 224,          // Width of the actual block card
    CONNECTOR_WIDTH: 32,      // Width of horizontal connectors
    ROW_GAP: 64,              // Vertical gap between rows in a branch
    STAGE_GAP: 128,           // Flex gap between branches
    BRIDGE_HEIGHT: 168,       // Total height of the inter-branch bridge
    NODE_CENTER_X: 112,       // Center point of a node (NODE_WIDTH / 2)
};
