import { WorkflowBlockType } from "../types/workflow";

/**
 * Functional category of a workflow block used for UI grouping in the builder.
 */
export type BlockCategoryUI =
    | 'SETUP_ONBOARDING'
    | 'GATES_PREREQUISITES'
    | 'PRODUCTION_PROCESSING'
    | 'FLOW_CONTROL'
    | 'QUALITY_ASSURANCE'
    | 'ASSET_MANAGEMENT'
    | 'DELIVERY_NOTIFICATIONS';

/**
 * Metadata for a UI category, including visual tokens.
 */
export interface CategoryMeta {
    id: BlockCategoryUI;
    label: string;
    description: string;
    color: string;
    icon: string;
}

/**
 * Metadata for a block in the builder library.
 */
export interface BlockLibraryItem {
    type: WorkflowBlockType;
    category: BlockCategoryUI;
    label: string;
    description: string;
    icon: string;
}

/**
 * All 7 UI categories with their visual tokens per specification.
 */
export const UI_CATEGORIES: CategoryMeta[] = [
    {
        id: 'SETUP_ONBOARDING',
        label: 'Setup & Onboarding',
        description: 'Configure project and assign team.',
        color: 'var(--color-cat-setup)',
        icon: 'lucide:user-plus'
    },
    {
        id: 'GATES_PREREQUISITES',
        label: 'Gates & Prerequisites',
        description: 'Conditions that must be met first.',
        color: 'var(--color-cat-gates)',
        icon: 'lucide:shield-check'
    },
    {
        id: 'PRODUCTION_PROCESSING',
        label: 'Production & Processing',
        description: 'Capture, process, and retouch.',
        color: 'var(--color-cat-prod)',
        icon: 'lucide:camera'
    },
    {
        id: 'FLOW_CONTROL',
        label: 'Flow Control',
        description: 'Branch, merge, and route workflows.',
        color: 'var(--color-cat-flow)',
        icon: 'lucide:git-branch'
    },
    {
        id: 'QUALITY_ASSURANCE',
        label: 'Quality Assurance',
        description: 'Review and approve assets.',
        color: 'var(--color-cat-qa)',
        icon: 'lucide:check-circle'
    },
    {
        id: 'ASSET_MANAGEMENT',
        label: 'Asset Management',
        description: 'Handle files and storage.',
        color: 'var(--color-cat-asset)',
        icon: 'lucide:box'
    },
    {
        id: 'DELIVERY_NOTIFICATIONS',
        label: 'Delivery & Notifications',
        description: 'Send assets and notify stakeholders.',
        color: 'var(--color-cat-delivery)',
        icon: 'lucide:send'
    },
];

/**
 * Mapping all available workflow blocks (except ORDER_CREATED) to UI categories.
 * Based on specification section 3.3.
 */
export const BLOCK_LIBRARY: BlockLibraryItem[] = [
    // SETUP_ONBOARDING
    {
        type: 'PRO_ASSIGNING',
        category: 'SETUP_ONBOARDING',
        label: 'Pro Assigning',
        description: 'Assign professionals to the project',
        icon: 'lucide:user-check'
    },
    {
        type: 'RETOUCHER_ASSIGNING',
        category: 'SETUP_ONBOARDING',
        label: 'Retoucher Assigning',
        description: 'Onboard and assign retouchers',
        icon: 'lucide:user-cog'
    },
    {
        type: 'SST',
        category: 'SETUP_ONBOARDING',
        label: 'SST',
        description: 'Shoot, Sort, and Transfer tool',
        icon: 'lucide:zap'
    },

    // GATES_PREREQUISITES
    {
        type: 'ITEMS_TO_SHOOT',
        category: 'GATES_PREREQUISITES',
        label: 'Items to shoot',
        description: 'Define items requiring production',
        icon: 'lucide:list-checks'
    },
    {
        type: 'WAIT_PAYMENT',
        category: 'GATES_PREREQUISITES',
        label: 'Wait payment',
        description: 'Pause flow until payment received',
        icon: 'lucide:credit-card'
    },
    {
        type: 'MATCHING',
        category: 'GATES_PREREQUISITES',
        label: 'Matching',
        description: 'Match assets to order items',
        icon: 'lucide:link'
    },

    // PRODUCTION_PROCESSING
    {
        type: 'PHOTO_SHOOT',
        category: 'PRODUCTION_PROCESSING',
        label: 'Photo shoot',
        description: 'Physical or remote photography session',
        icon: 'lucide:camera'
    },
    {
        type: 'VIDEO_SHOOT',
        category: 'PRODUCTION_PROCESSING',
        label: 'Video shoot',
        description: 'Physical or remote videography session',
        icon: 'lucide:video'
    },
    {
        type: 'PHOTO_RETOUCHING',
        category: 'PRODUCTION_PROCESSING',
        label: 'Photo Retouching',
        description: 'Image editing and post-processing',
        icon: 'lucide:image'
    },
    {
        type: 'VIDEO_RETOUCHING',
        category: 'PRODUCTION_PROCESSING',
        label: 'Video Retouching',
        description: 'Video editing and post-processing',
        icon: 'lucide:film'
    },
    {
        type: 'EXTERNAL_PROCESS',
        category: 'PRODUCTION_PROCESSING',
        label: 'External process',
        description: 'Call external API or webhook',
        icon: 'lucide:external-link'
    },

    // FLOW_CONTROL
    {
        type: 'IF_ELSE',
        category: 'FLOW_CONTROL',
        label: 'If/else',
        description: 'Conditional branching logic',
        icon: 'lucide:git-branch'
    },
    {
        type: 'MERGE',
        category: 'FLOW_CONTROL',
        label: 'Merge',
        description: 'Rejoin parallel workflow lanes',
        icon: 'lucide:git-merge'
    },

    // QUALITY_ASSURANCE
    {
        type: 'MODERATION',
        category: 'QUALITY_ASSURANCE',
        label: 'Moderation',
        description: 'Review and approve/reject assets',
        icon: 'lucide:shield-check'
    },

    // ASSET_MANAGEMENT
    {
        type: 'FILE_RENAMING',
        category: 'ASSET_MANAGEMENT',
        label: 'File renaming',
        description: 'Automatic asset renaming logic',
        icon: 'lucide:case-sensitive'
    },
    {
        type: 'FILE_STORAGE',
        category: 'ASSET_MANAGEMENT',
        label: 'File storage',
        description: 'Archive and cloud storage retention',
        icon: 'lucide:database'
    },

    // DELIVERY_NOTIFICATIONS
    {
        type: 'SEND_TO_CLIENT',
        category: 'DELIVERY_NOTIFICATIONS',
        label: 'Send to client',
        description: 'Final delivery of assets to client',
        icon: 'lucide:check-circle-2'
    },
    {
        type: 'SEND_NOTIFICATION',
        category: 'DELIVERY_NOTIFICATIONS',
        label: 'Send notification',
        description: 'Automated email/SMS notification',
        icon: 'lucide:bell'
    },
];
