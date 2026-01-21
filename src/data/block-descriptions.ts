export const BLOCK_DESCRIPTIONS: Record<string, { description: string; details: string[]; icon: string }> = {
    ORDER_CREATED: {
        description: 'This is the starting point of the workflow. It triggers when a new order is received and enters the system.',
        details: [
            'Order data ingestion',
            'Initial system verification',
            'Automatic workflow generation'
        ],
        icon: 'lucide:box-select'
    },
    ITEMS_TO_SHOOT: {
        description: 'This block monitors the order for the appearance of "Items to Shoot". Once the list is available, the workflow automatically proceeds.',
        details: [
            'Waits for items data from API or manual entry',
            'Synchronizes with the order item list',
            'Prevents production start without defined items'
        ],
        icon: 'lucide:list-todo'
    },
    WAIT_PAYMENT: {
        description: 'The workflow pauses here until the required payment has been confirmed by the billing system.',
        details: [
            'Real-time payment status monitoring',
            'Automatic transition upon payment confirmation',
            'Notifications for expired payment links'
        ],
        icon: 'lucide:credit-card'
    },
    PHOTO_SHOOT: {
        description: 'Dedicated phase for photography production. Tracks on-site progress and photographer statuses.',
        details: [
            'Check-in/Check-out tracking',
            'Automated reminders for photographers',
            'Client progress updates via SMS/Email'
        ],
        icon: 'lucide:camera'
    },
    VIDEO_SHOOT: {
        description: 'Dedicated phase for videography production. Tracks on-site progress and videographer statuses.',
        details: [
            'Production status monitoring',
            'Equipment and setup reminders',
            'Client arrival notifications'
        ],
        icon: 'lucide:video'
    },
    PHOTO_RETOUCHING: {
        description: 'The post-production phase where original photos are edited according to guidelines.',
        details: [
            'Retouching time tracking',
            'Deadline monitoring and alerts',
            'Batch upload synchronization'
        ],
        icon: 'lucide:wand-sparkles'
    },
    VIDEO_RETOUCHING: {
        description: 'The editing phase for video content. Includes cutting, color grading, and final rendering.',
        details: [
            'Video editing progress tracking',
            'Revision cycle management',
            'Final delivery preparation'
        ],
        icon: 'lucide:film'
    },
    MATCHING: {
        description: 'Ensures all uploaded files are correctly matched with their respective items and metadata.',
        details: [
            'Automated metadata verification',
            'File-to-item relationship mapping',
            'Error detection for unmatched files'
        ],
        icon: 'lucide:puzzle'
    },
    SEND_TO_CLIENT: {
        description: 'Final delivery block. Triggers notifications to the client that their order or specific batch is ready.',
        details: [
            'Batch notification management',
            'Download link generation',
            'Project completion signaling'
        ],
        icon: 'lucide:send'
    },
    IF_ELSE: {
        description: 'Conditional logic that splits the workflow into parallel paths based on specific criteria.',
        details: [
            'Automatic Photo/Video branch splitting',
            'Logic-based routing (e.g., Express vs Standard)',
            'Dynamic workflow expansion'
        ],
        icon: 'lucide:split'
    },
    MERGE: {
        description: 'Recombines parallel workflow branches into a single path once all conditions are met.',
        details: [
            'Synchronized branch waiting',
            'Ensures all parts are ready before finalization',
            'Unified transition out of split logic'
        ],
        icon: 'lucide:merge'
    }
};
