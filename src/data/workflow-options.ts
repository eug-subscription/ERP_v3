/**
 * Workflow Configuration Options
 * Centralized constants for dropdowns, radio groups, and selectors
 * used across the Workflow Builder.
 */

export const SST_DOMAINS = [
    { id: 'fashion', label: 'Fashion / Apparel' },
    { id: 'electronics', label: 'Electronics / Tech' },
    { id: 'home', label: 'Home / Decor' },
    { id: 'food', label: 'Food / Beverages' },
];

export const SST_RESOURCE_PACKS = [
    { id: 'standard', label: 'Standard Pack' },
    { id: 'premium-v1', label: 'Premium V1' },
    { id: 'ghost-mannequin', label: 'Ghost Mannequin' },
    { id: 'lifestyle', label: 'Lifestyle / On-location' },
];

export const FILE_RENAMING_MODES = [
    { id: 'MANUAL', label: 'Manual Input', description: 'User provides filename during upload' },
    { id: 'AUTO', label: 'Automatic (Sequential)', description: 'System generates names automatically' },
    { id: 'TEMPLATE', label: 'Template-based', description: 'Use predefined patterns and variables' },
];

export const PRO_ASSIGNMENT_STRATEGIES = [
    {
        id: 'MANUAL',
        label: 'Manual Selection',
        description: 'Project manager must manually select the creator.'
    },
    {
        id: 'ALL',
        label: 'Open Invitation',
        description: 'Send notification to all eligible pros in the region.'
    },
    {
        id: 'PROJECT_TEAMS',
        label: 'Project Teams',
        description: "Only choose from pros already assigned to this project's teams."
    }
];

export const RETOUCHER_ASSIGNMENT_STRATEGIES = [
    {
        id: 'MANUAL',
        label: 'Manual Selection',
        description: 'Production manager manually selects the retoucher.'
    },
    {
        id: 'ALL',
        label: 'Open Marketplace',
        description: 'Invite all retouchers meeting the quality requirements.'
    },
    {
        id: 'PROJECT_TEAMS',
        label: 'Direct Team',
        description: 'Only choose from retouchers in the project specific team.'
    }
];

export const MODERATOR_ROLES = [
    { id: 'MODERATOR', label: 'Moderators' },
    { id: 'RETOUCHER', label: 'Retouchers' },
    { id: 'PHOTOGRAPHER', label: 'Photographers' },
];

export const NOTIFICATION_CHANNELS = [
    { id: 'EMAIL', label: 'Email' },
    { id: 'SMS', label: 'SMS' },
    { id: 'APP', label: 'In-app Notification' },
];

export const DELIVERY_SCHEDULES = [
    { id: 'real-time', label: 'Real-time', description: 'As files are processed' },
    { id: 'same-day', label: 'Same day', description: 'By end of working day' },
    { id: 'plus-1', label: '+1 business day' },
    { id: 'plus-2', label: '+2 business days' },
];
