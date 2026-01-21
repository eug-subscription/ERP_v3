/**
 * Workflow System Types
 * Based on WORKFLOW_TAB_SPECIFICATION.md
 */

/**
 * Result of a workflow validation check.
 */
export interface ValidationError {
    blockId?: string;
    type: WorkflowBlockType;
    message: string;
    level: 'ERROR' | 'WARNING';
    suggestion?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * All possible types of blocks that can exist in a workflow.
 */
export type WorkflowBlockType =
    | 'ORDER_CREATED'
    | 'ITEMS_TO_SHOOT'
    | 'SST'
    | 'PRO_ASSIGNING'
    | 'RETOUCHER_ASSIGNING'
    | 'WAIT_PAYMENT'
    | 'PHOTO_SHOOT'
    | 'VIDEO_SHOOT'
    | 'PHOTO_RETOUCHING'
    | 'VIDEO_RETOUCHING'
    | 'MATCHING'
    | 'SEND_TO_CLIENT'
    | 'FILE_STORAGE'
    | 'FILE_RENAMING'
    | 'MODERATION'
    | 'IF_ELSE'
    | 'MERGE'
    | 'EXTERNAL_PROCESS'
    | 'SEND_NOTIFICATION';

/**
 * Functional category of a workflow block used for UI grouping.
 */
export type BlockCategory = 'STARTING' | 'PROCESSING' | 'FINALISATION' | 'UNIVERSAL';

/**
 * Classification for workflow templates.
 */
export type TemplateCategory = 'PRODUCTION' | 'AI_POWERED' | 'HYBRID';

/**
 * Type of moderator: Internal team member or the Client themselves.
 */
export type ModeratorType = 'INTERNAL' | 'CLIENT';

/**
 * Possible outcomes of a moderation step.
 */
export type ModerationOutcome = 'APPROVE' | 'REVISION' | 'REJECT';

/**
 * Specific roles that can be granted access to internal moderation.
 */
export type ModeratorRole = 'MODERATOR' | 'RETOUCHER' | 'PHOTOGRAPHER';

/**
 * Configuration for the Moderation block.
 */
export interface ModerationConfig {
    /** Whether moderation is done by Splento staff or the client. */
    type: ModeratorType;
    /** Roles that have access to the moderation UI (only for INTERNAL type). */
    whoCanAccess?: ModeratorRole[];
    /** Maximum number of revision cycles allowed. 0 = unlimited. */
    maxRevisions: number;
    /** The block ID to jump to if the files are rejected. */
    onRejectBlockId?: string;
    /** Allowed outcomes for this specific moderation step. */
    outcomes: ModerationOutcome[];
    /** Step to proceed to on approval (usually next in sequence). */
    onApproveStepId?: string;
    /** Step to jump back to when revision is requested. */
    onRevisionStepId?: string;
}

/**
 * Configuration for conditional branching (If/Else).
 */
export interface IfElseConfig {
    /** Logic condition string (e.g., 'has_video'). */
    condition: string;
    /** Block ID to follow if condition is true. */
    truePathStepId: string;
    /** Block ID to follow if condition is false. */
    falsePathStepId?: string;
}

/**
 * Configuration for calling an external API or webhook.
 */
export interface ExternalProcessConfig {
    /** URL of the external service. */
    webhookUrl: string;
    /** JSON string or template for the request body. */
    payloadTemplate?: string;
}

/**
 * Configuration for automated notifications.
 */
export interface SendNotificationConfig {
    /** Subject or header of the notification. Supports variables like {{project_name}}. */
    title: string;
    /** Main message content. Supports variables. */
    body: string;
    /** Delivery method for the notification. */
    channel: 'EMAIL' | 'SMS' | 'APP';
}

/**
 * Configuration for file retention and cloud storage.
 */
export interface FileStorageConfig {
    /** Number of days before files are deleted. 0 = stored indefinitely. */
    timeToLife: number;
}

/**
 * Configuration for Assigning Professionals (Photographers/Videographers).
 */
export interface ProAssigningConfig {
    /** Selection strategy: open to all, project-specific team, or manual selection. */
    whoHasAccess: 'ALL' | 'PROJECT_TEAMS' | 'MANUAL';
    /** Message shown to the pro when they are assigned. */
    welcomeText?: string;
    /** If true, PM must confirm the pro's selection. */
    proMustBeConfirmed: boolean;
    /** Number of photographer slots required. */
    photographerSlots: number;
    /** Default expected duration for the photoshoot in minutes. */
    defaultPhotoshootDuration: number;
    /** Number of videographer slots required. */
    videographerSlots: number;
    /** Default expected duration for the videoshoot in minutes. */
    defaultVideoshootDuration: number;
    /** Whether the client can see the pro profile/details. */
    showProToClient: boolean;
    /** Minimum required pro rating level (1-5). */
    minProLevel?: number;
}

/**
 * Configuration for Shoot, Sort, and Transfer (SST) tool.
 */
export interface SSTConfig {
    /** Whether the pro can add new items to the order during SST. */
    userCanAddNewItem: boolean;
    /** Industry-specific domain for the SST UI. */
    domain: string;
    /** UI/Asset pack used for the selection interface. */
    resourcePack: string;
    /** SINGLE = items submitted one-by-one; BULK = items submitted in batches. */
    submitMode: 'SINGLE' | 'BULK';
    /** Only applied in BULK mode. Minimum items required for submission. */
    minPhotosToSubmit?: number;
}

/**
 * Configuration for assigning retouchers.
 */
export interface RetoucherAssigningConfig {
    /** Message shown to the retoucher when assigned. */
    welcomeText?: string;
    /** Selection strategy for the retoucher. */
    whoHasAccess: 'ALL' | 'PROJECT_TEAMS' | 'MANUAL';
    /** Technical instructions for the retouching process. */
    guidelines: string;
    /** If true, retoucher must accept guidelines before starting. */
    needAcceptGuidelines: boolean;
    /** Whether the client can see who is retouching their assets. */
    showRetoucherToClient: boolean;
    /** Minimum rating requirement for the retoucher. */
    minRetoucherLevel?: number;
}

/**
 * Configuration for automatic file renaming.
 */
export interface FileRenamingConfig {
    /** Rename mode: manual, sequential auto-naming, or template-based. */
    autoRenameMode: 'MANUAL' | 'AUTO' | 'TEMPLATE';
    /** Pattern for numbering (e.g. '000'). */
    pattern: string;
    /** String to prepend to all filenames. */
    customPrefix: string;
    /** If true, appends current date in YYYYMMDD format. */
    includeDate: boolean;
}

/**
 * Type-specific configuration payload.
 */
export type BlockConfig =
    | ModerationConfig
    | IfElseConfig
    | ExternalProcessConfig
    | SendNotificationConfig
    | FileStorageConfig
    | ProAssigningConfig
    | SSTConfig
    | RetoucherAssigningConfig
    | FileRenamingConfig;

/**
 * A Preset configuration that overlays on the full workflow structure.
 * Every template in the system is now defined as a WorkflowPreset.
 */
export interface WorkflowPreset {
    /** Unique identifier for the preset. */
    id: string;
    /** Human-readable name (e.g., "Photo Only"). */
    name: string;
    /** Logical category (PRODUCTION, AI, etc.). */
    category: TemplateCategory;
    /** Multi-line description of what this workflow is for. */
    description: string;

    /** 
     * Which blocks should be enabled by default. 
     * ORDER_CREATED is always enabled regardless of this list.
     */
    enabledBlocks: WorkflowBlockType[];

    /** 
     * Optional custom positions for blocks within their branches.
     * Format: { [WorkflowBlockType]: positionIndex }
     */
    blockPositions?: Partial<Record<WorkflowBlockType, number>>;

    /** 
     * Preset configurations for specific blocks.
     * These override the default configs in MASTER_BLOCKS.
     */
    blockConfigs: Partial<Record<WorkflowBlockType, BlockConfig>>;
}

/**
 * A single atomic step in a workflow.
 */
export interface WorkflowBlock {
    /** Unique identifier for the block. */
    id: string;
    /** Type of logic this block performs. */
    type: WorkflowBlockType;
    /** Human-readable name of the block. */
    label: string;
    /** Category for grouping in the UI. */
    category: BlockCategory;
    /** Whether the block is enabled in the current configuration. */
    isEnabled: boolean;
    /** Type-specific configuration payload. */
    config?: BlockConfig;
}

/**
 * A logical branch within a workflow (e.g., Photo branch vs Video branch).
 */
export interface WorkflowBranch {
    /** Unique identifier for the branch. */
    id: string;
    /** Display name of the branch. */
    name: string;
    /** Predominant asset type of the branch. */
    type: 'PHOTO' | 'VIDEO' | 'GENERAL';
    /** Ordered list of blocks in this branch. */
    blocks: WorkflowBlock[];
}

/**
 * Static definition for a standard branch in the unified model.
 */
export interface BranchDefinition {
    id: string;
    name: string;
    type: 'PHOTO' | 'VIDEO' | 'GENERAL';
    allowedBlockTypes: WorkflowBlockType[];
}

/**
 * A predefined workflow template used as a base.
 */
export interface WorkflowTemplate extends WorkflowPreset {
    /** Existing branches kept for backward compatibility if needed */
    branches?: WorkflowBranch[];
}

/**
 * The final configuration for a specific project's workflow.
 */
export interface ProjectWorkflowConfig {
    projectId: string;
    templateId: string;
    branches: WorkflowBranch[];
}

/**
 * Position of a block on the canvas
 */
export interface CanvasBlockPosition {
    id: string;
    branchId: 'main' | 'photo' | 'video';
    index: number;
}

/**
 * State of a block on the canvas in the visual builder
 */
export interface CanvasBlock extends WorkflowBlock {
    position: CanvasBlockPosition;
    validationState: 'valid' | 'warning' | 'error' | 'unconfigured';
    validationMessage?: string;
}

/**
 * Complete state of the workflow builder canvas
 */
export interface WorkflowCanvasState {
    blocks: CanvasBlock[];
    selectedBlockId: string | null;
    isDragging: boolean;
    hasUnsavedChanges: boolean;
    lastAddedBlockId: string | null;
}

// Order Instance Tracking Types

/**
 * Execution status of a block for a specific order.
 */
export type BlockStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

/**
 * A batch of files moving through a block together.
 */
export interface OrderBatch {
    id: string;
    batchNumber: number;
    fileCount: number;
    status: string;
    type: 'REGULAR' | 'REVISION';
    timestamp: string;
}

/**
 * Progress tracking data for a specific block in a live order.
 */
export interface OrderBlockProgress {
    blockId: string;
    status: BlockStatus;
    /** Optional detailed status (e.g., 'Retouching (3/10 done)'). */
    subStatus?: string;
    /** Track multiple batches through the same block (e.g., for revisions). */
    batches?: OrderBatch[];
    completedAt?: string;
}

/**
 * A live instance of a workflow for a specific order.
 */
export interface OrderWorkflowInstance {
    orderId: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'CANCELLED';
    /** IDs of blocks currently being processed. */
    currentBlockIds: string[];
    /** IDs of blocks that have been fully finished. */
    completedBlockIds: string[];
    /** Detailed progress for each block. */
    blockProgress: Record<string, OrderBlockProgress>;
}
