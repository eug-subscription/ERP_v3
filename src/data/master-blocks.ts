import { WorkflowBlock, WorkflowBlockType, ModerationConfig, IfElseConfig, ExternalProcessConfig, SendNotificationConfig, FileStorageConfig, ProAssigningConfig, SSTConfig, RetoucherAssigningConfig, FileRenamingConfig } from "../types/workflow";

/**
 * Branch types supported in the unified model.
 */
export type BranchType = 'PHOTO' | 'VIDEO' | 'GENERAL';

/**
 * Extension of WorkflowBlock with metadata for the master registry.
 */
export interface MasterBlock extends WorkflowBlock {
    canBeDisabled: boolean;
    defaultPosition: number;
    allowedBranches: BranchType[];
}

/**
 * Master Registry of all possible blocks in the system.
 * Every template becomes a preset overlay on this list.
 */
export const MASTER_BLOCKS: Record<WorkflowBlockType, MasterBlock> = {
    ORDER_CREATED: {
        id: "master_order_created",
        type: "ORDER_CREATED",
        label: "Order Created",
        category: "STARTING",
        isEnabled: true,
        canBeDisabled: false,
        defaultPosition: 0,
        allowedBranches: ["GENERAL"]
    },
    ITEMS_TO_SHOOT: {
        id: "master_items_to_shoot",
        type: "ITEMS_TO_SHOOT",
        label: "Items to Shoot",
        category: "STARTING",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 1,
        allowedBranches: ["GENERAL"]
    },
    SST: {
        id: "master_sst",
        type: "SST",
        label: "SST",
        category: "STARTING",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 2,
        allowedBranches: ["GENERAL"],
        config: {
            userCanAddNewItem: false,
            domain: "E-Commerce",
            resourcePack: "Default",
            submitMode: "SINGLE"
        } as SSTConfig
    },
    WAIT_PAYMENT: {
        id: "master_wait_payment",
        type: "WAIT_PAYMENT",
        label: "Wait Payment",
        category: "STARTING",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 3,
        allowedBranches: ["GENERAL"]
    },
    PRO_ASSIGNING: {
        id: "master_pro_assigning",
        type: "PRO_ASSIGNING",
        label: "Pro Assigning",
        category: "STARTING",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 0,
        allowedBranches: ["PHOTO", "VIDEO"],
        config: {
            whoHasAccess: "ALL",
            welcomeText: "Welcome to the project!",
            proMustBeConfirmed: true,
            photographerSlots: 1,
            defaultPhotoshootDuration: 60,
            videographerSlots: 1,
            defaultVideoshootDuration: 60,
            showProToClient: true,
            minProLevel: 3
        } as ProAssigningConfig
    },
    RETOUCHER_ASSIGNING: {
        id: "master_retoucher_assigning",
        type: "RETOUCHER_ASSIGNING",
        label: "Retoucher Assigning",
        category: "STARTING",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 1,
        allowedBranches: ["PHOTO", "VIDEO"],
        config: {
            whoHasAccess: "PROJECT_TEAMS",
            welcomeText: "Instructions for retouching",
            guidelines: "Follow the standard retouching guide.",
            needAcceptGuidelines: true,
            showRetoucherToClient: false,
            minRetoucherLevel: 4
        } as RetoucherAssigningConfig
    },
    PHOTO_SHOOT: {
        id: "master_photo_shoot",
        type: "PHOTO_SHOOT",
        label: "Photo Shoot",
        category: "PROCESSING",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 2,
        allowedBranches: ["PHOTO"]
    },
    VIDEO_SHOOT: {
        id: "master_video_shoot",
        type: "VIDEO_SHOOT",
        label: "Video Shoot",
        category: "PROCESSING",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 2,
        allowedBranches: ["VIDEO"]
    },
    PHOTO_RETOUCHING: {
        id: "master_photo_retouching",
        type: "PHOTO_RETOUCHING",
        label: "Photo Retouching",
        category: "PROCESSING",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 3,
        allowedBranches: ["PHOTO"]
    },
    VIDEO_RETOUCHING: {
        id: "master_video_retouching",
        type: "VIDEO_RETOUCHING",
        label: "Video Retouching",
        category: "PROCESSING",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 3,
        allowedBranches: ["VIDEO"]
    },
    MATCHING: {
        id: "master_matching",
        type: "MATCHING",
        label: "Matching",
        category: "PROCESSING",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 4,
        allowedBranches: ["PHOTO"]
    },
    FILE_RENAMING: {
        id: "master_file_renaming",
        type: "FILE_RENAMING",
        label: "File Renaming",
        category: "PROCESSING",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 5,
        allowedBranches: ["PHOTO", "VIDEO"],
        config: {
            autoRenameMode: "AUTO",
            pattern: "000",
            customPrefix: "Project_",
            includeDate: true
        } as FileRenamingConfig
    },
    MODERATION: {
        id: "master_moderation",
        type: "MODERATION",
        label: "Moderation",
        category: "UNIVERSAL",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 6,
        allowedBranches: ["PHOTO", "VIDEO"],
        config: {
            type: "INTERNAL",
            whoCanAccess: ["MODERATOR"],
            maxRevisions: 3,
            outcomes: ["APPROVE", "REVISION", "REJECT"]
        } as ModerationConfig
    },
    IF_ELSE: {
        id: "master_if_else",
        type: "IF_ELSE",
        label: "If/Else",
        category: "UNIVERSAL",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 7,
        allowedBranches: ["GENERAL", "PHOTO", "VIDEO"],
        config: {
            condition: "has_video",
            truePathStepId: "",
            falsePathStepId: ""
        } as IfElseConfig
    },
    MERGE: {
        id: "master_merge",
        type: "MERGE",
        label: "Merge",
        category: "UNIVERSAL",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 0,
        allowedBranches: ["GENERAL"]
    },
    EXTERNAL_PROCESS: {
        id: "master_external_process",
        type: "EXTERNAL_PROCESS",
        label: "External Process",
        category: "UNIVERSAL",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 8,
        allowedBranches: ["PHOTO", "VIDEO"],
        config: {
            webhookUrl: "https://api.external.com/process",
            payloadTemplate: "{\"id\": \"{{order_id}}\"}"
        } as ExternalProcessConfig
    },
    SEND_NOTIFICATION: {
        id: "master_send_notification",
        type: "SEND_NOTIFICATION",
        label: "Send Notification",
        category: "UNIVERSAL",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 9,
        allowedBranches: ["GENERAL", "PHOTO", "VIDEO"],
        config: {
            title: "Project Update",
            body: "Your project {{project_name}} has reached a new milestone.",
            channel: "EMAIL"
        } as SendNotificationConfig
    },
    SEND_TO_CLIENT: {
        id: "master_send_to_client",
        type: "SEND_TO_CLIENT",
        label: "Send to Client",
        category: "FINALISATION",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 1,
        allowedBranches: ["GENERAL"]
    },
    FILE_STORAGE: {
        id: "master_file_storage",
        type: "FILE_STORAGE",
        label: "File Storage",
        category: "FINALISATION",
        isEnabled: false,
        canBeDisabled: true,
        defaultPosition: 2,
        allowedBranches: ["GENERAL"],
        config: {
            timeToLife: 365
        } as FileStorageConfig
    }
};
