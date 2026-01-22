import { WorkflowTemplate, WorkflowBlock } from '../types/workflow';

/**
 * Shared Common Blocks
 */
const START_BLOCK: WorkflowBlock = {
    id: 'start',
    type: 'ORDER_CREATED',
    label: 'Order Created',
    category: 'STARTING',
    isEnabled: true,
};

const ITEMS_BLOCK: WorkflowBlock = {
    id: 'items',
    type: 'ITEMS_TO_SHOOT',
    label: 'Items to Shoot',
    category: 'STARTING',
    isEnabled: true,
};

const PAY_BLOCK: WorkflowBlock = {
    id: 'payment',
    type: 'WAIT_PAYMENT',
    label: 'Wait Payment',
    category: 'STARTING',
    isEnabled: true,
};

const PHOTO_PRO_BLOCK: WorkflowBlock = {
    id: 'photo-pro',
    type: 'PRO_ASSIGNING',
    label: 'Pro Assigning (Photo)',
    category: 'STARTING',
    isEnabled: true,
    config: {
        whoHasAccess: 'PROJECT_TEAMS',
        welcomeText: 'Welcome to the project! Please select your slot.',
        proMustBeConfirmed: true,
        photographerSlots: 1,
        videographerSlots: 0,
        defaultPhotoshootDuration: 60,
        defaultVideoshootDuration: 0,
        showProToClient: true,
        minProLevel: 3
    },
};

const VIDEO_PRO_BLOCK: WorkflowBlock = {
    id: 'video-pro',
    type: 'PRO_ASSIGNING',
    label: 'Pro Assigning (Video)',
    category: 'STARTING',
    isEnabled: true,
    config: {
        whoHasAccess: 'MANUAL',
        welcomeText: 'Select a videographer for this session.',
        proMustBeConfirmed: true,
        photographerSlots: 0,
        videographerSlots: 1,
        defaultPhotoshootDuration: 0,
        defaultVideoshootDuration: 120,
        showProToClient: true,
        minProLevel: 4
    },
};

const PHOTO_SHOOT_BLOCK: WorkflowBlock = {
    id: 'photo-shoot',
    type: 'PHOTO_SHOOT',
    label: 'Photo Shoot',
    category: 'PROCESSING',
    isEnabled: true,
};

const VIDEO_SHOOT_BLOCK: WorkflowBlock = {
    id: 'video-shoot',
    type: 'VIDEO_SHOOT',
    label: 'Video Shoot',
    category: 'PROCESSING',
    isEnabled: true,
};

const PHOTO_SST_BLOCK: WorkflowBlock = {
    id: 'photo-sst',
    type: 'SST',
    label: 'Self Selection (SST)',
    category: 'PROCESSING',
    isEnabled: true,
    config: {
        userCanAddNewItem: true,
        domain: 'selection.splento.com',
        resourcePack: 'standard-v1',
        submitMode: 'SINGLE',
        minPhotosToSubmit: 10
    }
};

const RETOUCHER_ASSIGN_BLOCK: WorkflowBlock = {
    id: 'retouch-assign',
    type: 'RETOUCHER_ASSIGNING',
    label: 'Assign Retoucher',
    category: 'PROCESSING',
    isEnabled: true,
    config: {
        whoHasAccess: 'PROJECT_TEAMS',
        welcomeText: 'Please review the guidelines before starting.',
        guidelines: '',
        needAcceptGuidelines: true,
        showRetoucherToClient: false,
        minRetoucherLevel: 2
    }
};

const PHOTO_RETOUCH_BLOCK: WorkflowBlock = {
    id: 'photo-retouch',
    type: 'PHOTO_RETOUCHING',
    label: 'Photo Retouching',
    category: 'PROCESSING',
    isEnabled: true,
};

const VIDEO_RETOUCH_BLOCK: WorkflowBlock = {
    id: 'video-retouch',
    type: 'VIDEO_RETOUCHING',
    label: 'Video Retouching',
    category: 'PROCESSING',
    isEnabled: true,
};

const FILE_RENAME_BLOCK: WorkflowBlock = {
    id: 'file-rename',
    type: 'FILE_RENAMING',
    label: 'File Renaming',
    category: 'PROCESSING',
    isEnabled: true,
    config: {
        autoRenameMode: 'TEMPLATE',
        pattern: '{order_id}_{item_name}_{index}',
        customPrefix: 'SPL',
        includeDate: true
    }
};

const STORAGE_BLOCK: WorkflowBlock = {
    id: 'storage',
    type: 'FILE_STORAGE',
    label: 'Cloud Storage',
    category: 'UNIVERSAL',
    isEnabled: true,
    config: {
        timeToLife: 365
    }
};

const NOTIFY_CLIENT_BLOCK: WorkflowBlock = {
    id: 'notify-client',
    type: 'SEND_NOTIFICATION',
    label: 'Notify Client',
    category: 'UNIVERSAL',
    isEnabled: true,
    config: {
        title: 'Your files are ready!',
        body: 'Check your dashboard to view and download your photos.',
        channel: 'EMAIL'
    }
};

const PHOTO_MATCH_BLOCK: WorkflowBlock = {
    id: 'photo-match',
    type: 'MATCHING',
    label: 'Matching',
    category: 'PROCESSING',
    isEnabled: true,
};

const PHOTO_MODERATION_BLOCK: WorkflowBlock = {
    id: 'photo-mod',
    type: 'MODERATION',
    label: 'Photo Client Approval',
    category: 'UNIVERSAL',
    isEnabled: true,
    config: {
        type: 'CLIENT',
        outcomes: ['APPROVE', 'REVISION'],
        onRevisionStepId: 'photo-shoot',
        maxRevisions: 3,
        whoCanAccess: ['MODERATOR']
    },
};

const PHOTO_DELIVERY_BLOCK: WorkflowBlock = {
    id: 'photo-delivery',
    type: 'SEND_TO_CLIENT',
    label: 'Send Photos to Client',
    category: 'FINALISATION',
    isEnabled: true,
};

const VIDEO_DELIVERY_BLOCK: WorkflowBlock = {
    id: 'video-delivery',
    type: 'SEND_TO_CLIENT',
    label: 'Send Video to Client',
    category: 'FINALISATION',
    isEnabled: true,
};

const MERGE_BLOCK: WorkflowBlock = {
    id: 'merge-all',
    type: 'MERGE',
    label: 'Combine Branches',
    category: 'UNIVERSAL',
    isEnabled: true,
};

/**
 * Workflow Templates
 * Updated to use WorkflowPreset fields while maintaining branches for backward compatibility.
 */
export const mockWorkflowTemplates: WorkflowTemplate[] = [
    {
        id: 'photo-video-prod',
        name: 'Photo + Video Production',
        category: 'PRODUCTION',
        description: 'Full production with independent branches for photo and video including SST and Retouching.',
        enabledBlocks: [
            'ORDER_CREATED',
            'ITEMS_TO_SHOOT',
            'WAIT_PAYMENT',
            'PRO_ASSIGNING',
            'PHOTO_SHOOT',
            'VIDEO_SHOOT',
            'SST',
            'RETOUCHER_ASSIGNING',
            'PHOTO_RETOUCHING',
            'VIDEO_RETOUCHING',
            'FILE_RENAMING',
            'FILE_STORAGE',
            'MATCHING',
            'MODERATION',
            'SEND_TO_CLIENT',
            'MERGE',
            'SEND_NOTIFICATION'
        ],
        blockConfigs: {
            PRO_ASSIGNING: PHOTO_PRO_BLOCK.config,
            SST: PHOTO_SST_BLOCK.config,
            RETOUCHER_ASSIGNING: RETOUCHER_ASSIGN_BLOCK.config,
            FILE_RENAMING: FILE_RENAME_BLOCK.config,
            FILE_STORAGE: STORAGE_BLOCK.config,
            MODERATION: PHOTO_MODERATION_BLOCK.config,
            SEND_NOTIFICATION: NOTIFY_CLIENT_BLOCK.config
        },
        branches: [
            {
                id: 'shared-start',
                name: 'Initial Steps',
                type: 'GENERAL',
                blocks: [START_BLOCK, ITEMS_BLOCK, PAY_BLOCK],
            },
            {
                id: 'photo-branch',
                name: '📸 Photo Branch',
                type: 'PHOTO',
                blocks: [
                    PHOTO_PRO_BLOCK,
                    PHOTO_SHOOT_BLOCK,
                    PHOTO_SST_BLOCK,
                    RETOUCHER_ASSIGN_BLOCK,
                    PHOTO_RETOUCH_BLOCK,
                    FILE_RENAME_BLOCK,
                    STORAGE_BLOCK,
                    PHOTO_MATCH_BLOCK,
                    PHOTO_MODERATION_BLOCK,
                    PHOTO_DELIVERY_BLOCK
                ],
            },
            {
                id: 'video-branch',
                name: '🎬 Video Branch',
                type: 'VIDEO',
                blocks: [VIDEO_PRO_BLOCK, VIDEO_SHOOT_BLOCK, VIDEO_RETOUCH_BLOCK, VIDEO_DELIVERY_BLOCK],
            },
            {
                id: 'shared-end',
                name: 'Completion',
                type: 'GENERAL',
                blocks: [MERGE_BLOCK, NOTIFY_CLIENT_BLOCK]
            }
        ],
    },
    {
        id: 'ai-enhancement',
        name: 'AI Enhancement Only',
        category: 'AI_POWERED',
        description: 'Automated AI enhancement workflow for existing photos.',
        enabledBlocks: [
            'ORDER_CREATED',
            'WAIT_PAYMENT',
            'EXTERNAL_PROCESS',
            'MODERATION',
            'SEND_TO_CLIENT'
        ],
        blockConfigs: {
            EXTERNAL_PROCESS: {
                webhookUrl: 'https://api.splento.com/ai/enhance',
                payloadTemplate: '{\n  "order_id": "{{order.id}}",\n  "callback": "https://hooks.splento.com/ai"\n}'
            },
            MODERATION: {
                type: 'INTERNAL',
                outcomes: ['APPROVE', 'REVISION', 'REJECT'],
                whoCanAccess: ['MODERATOR'],
                maxRevisions: 0
            }
        },
        branches: [
            {
                id: 'ai-branch',
                name: '🤖 AI Workflow',
                type: 'GENERAL',
                blocks: [
                    START_BLOCK,
                    PAY_BLOCK,
                    {
                        id: 'ai-process',
                        type: 'EXTERNAL_PROCESS',
                        label: 'AI Enhancement',
                        category: 'PROCESSING',
                        isEnabled: true,
                        config: {
                            webhookUrl: 'https://api.splento.com/ai/enhance',
                            payloadTemplate: '{\n  "order_id": "{{order.id}}",\n  "callback": "https://hooks.splento.com/ai"\n}'
                        },
                    },
                    {
                        id: 'internal-mod',
                        type: 'MODERATION',
                        label: 'Internal Moderation',
                        category: 'UNIVERSAL',
                        isEnabled: true,
                        config: {
                            type: 'INTERNAL',
                            outcomes: ['APPROVE', 'REVISION', 'REJECT'],
                            whoCanAccess: ['MODERATOR'],
                            maxRevisions: 0
                        },
                    },
                    PHOTO_DELIVERY_BLOCK,
                ],
            },
        ],
    },
    {
        id: 'photo-only',
        name: 'Photo Only',
        category: 'PRODUCTION',
        description: 'Standard photography workflow.',
        enabledBlocks: [
            'ORDER_CREATED',
            'ITEMS_TO_SHOOT',
            'WAIT_PAYMENT',
            'PRO_ASSIGNING',
            'PHOTO_SHOOT',
            'MATCHING',
            'MODERATION',
            'SEND_TO_CLIENT'
        ],
        blockConfigs: {
            PRO_ASSIGNING: PHOTO_PRO_BLOCK.config,
            MODERATION: PHOTO_MODERATION_BLOCK.config
        },
        branches: [
            {
                id: 'photo-only-branch',
                name: 'Photo Workflow',
                type: 'PHOTO',
                blocks: [START_BLOCK, ITEMS_BLOCK, PAY_BLOCK, PHOTO_PRO_BLOCK, PHOTO_SHOOT_BLOCK, PHOTO_MATCH_BLOCK, PHOTO_MODERATION_BLOCK, PHOTO_DELIVERY_BLOCK],
            },
        ],
    },
    {
        id: 'hybrid-complex',
        name: 'Hybrid Managed Workflow',
        category: 'HYBRID',
        description: 'Complex workflow with conditional branching and custom processing.',
        enabledBlocks: [
            'ORDER_CREATED',
            'WAIT_PAYMENT',
            'IF_ELSE',
            'VIDEO_RETOUCHING',
            'SEND_TO_CLIENT'
        ],
        blockConfigs: {
            IF_ELSE: {
                condition: 'has_video',
                truePathStepId: 'video-retouch',
                falsePathStepId: 'photo-delivery',
            }
        },
        branches: [
            {
                id: 'hybrid-main',
                name: 'Main Production',
                type: 'GENERAL',
                blocks: [
                    START_BLOCK,
                    PAY_BLOCK,
                    {
                        id: 'check-video',
                        type: 'IF_ELSE',
                        label: 'Includes Video?',
                        category: 'UNIVERSAL',
                        isEnabled: true,
                        config: {
                            condition: 'has_video',
                            truePathStepId: 'video-retouch',
                            falsePathStepId: 'photo-delivery',
                        },
                    },
                    VIDEO_RETOUCH_BLOCK,
                    PHOTO_DELIVERY_BLOCK,
                ],
            },
        ],
    },
];
