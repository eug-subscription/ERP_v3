import {
    OrderWorkflowInstance,
    WorkflowBlockType,
    PipelineStepNode,
} from '../types/workflow';
import { BLOCK_LIBRARY } from '../data/block-ui-categories';

/**
 * Build the icon/label lookup map from BLOCK_LIBRARY.
 * Includes ORDER_CREATED which is not in BLOCK_LIBRARY.
 */
export function buildBlockMeta(): Map<WorkflowBlockType, { icon: string; label: string }> {
    const meta = new Map(BLOCK_LIBRARY.map((b) => [b.type, { icon: b.icon, label: b.label }]));
    meta.set('ORDER_CREATED', { icon: 'lucide:package', label: 'Order Created' });
    return meta;
}

/**
 * Block-ID → WorkflowBlockType mapping.
 * Multiple IDs can map to the same type (e.g. renamed MODERATION blocks).
 */
export const BLOCK_ID_TO_TYPE: Record<string, WorkflowBlockType> = {
    'order-created': 'ORDER_CREATED',
    'items-to-shoot': 'ITEMS_TO_SHOOT',
    'wait-payment': 'WAIT_PAYMENT',
    'pro-assigning': 'PRO_ASSIGNING',
    'retoucher-assigning': 'RETOUCHER_ASSIGNING',
    'photo-shoot': 'PHOTO_SHOOT',
    'video-shoot': 'VIDEO_SHOOT',
    'matching': 'MATCHING',
    'photo-retouching': 'PHOTO_RETOUCHING',
    'video-retouching': 'VIDEO_RETOUCHING',
    'internal-moderation-photo': 'MODERATION',
    'client-moderation-photo': 'MODERATION',
    'internal-moderation-video': 'MODERATION',
    'client-moderation-video': 'MODERATION',
    'moderation': 'MODERATION',
    'send-to-client': 'SEND_TO_CLIENT',
};

/** Reverse lookup (type → first matching ID). Used only for type-based lane orders. */
export const BLOCK_TYPE_TO_ID: Record<string, string> = Object.fromEntries(
    Object.entries(BLOCK_ID_TO_TYPE).map(([id, type]) => [type, id])
);

/** Canonical execution order for linear steps before the fork (by type). */
const PRE_FORK_ORDER: WorkflowBlockType[] = [
    'ORDER_CREATED',
    'ITEMS_TO_SHOOT',
    'WAIT_PAYMENT',
    'PRO_ASSIGNING',
    'RETOUCHER_ASSIGNING',
];

/** Photo lane execution order (by block ID — supports duplicate types). */
const PHOTO_LANE_IDS: string[] = [
    'photo-shoot',
    'matching',
    'photo-retouching',
    'internal-moderation-photo',
    'client-moderation-photo',
];

/** Video lane execution order (by block ID). */
const VIDEO_LANE_IDS: string[] = [
    'video-shoot',
    'video-retouching',
    'internal-moderation-video',
    'client-moderation-video',
];

/** Linear steps after the merge (by type). */
const POST_MERGE_ORDER: WorkflowBlockType[] = [
    'MODERATION',
    'SEND_TO_CLIENT',
];

/** Per-ID label/icon overrides for renamed blocks. */
const BLOCK_ID_LABEL_OVERRIDES: Record<string, { label: string; icon?: string }> = {
    'video-retouching': { label: 'Video Editing', icon: 'lucide:film' },
    'internal-moderation-photo': { label: 'Internal Moderation', icon: 'lucide:shield-check' },
    'client-moderation-photo': { label: 'Client Moderation', icon: 'lucide:user-check' },
    'internal-moderation-video': { label: 'Internal Moderation', icon: 'lucide:shield-check' },
    'client-moderation-video': { label: 'Client Moderation', icon: 'lucide:user-check' },
};

/** Helper: resolve a block type to a PipelineStepNode if data exists. */
function resolveStep(
    blockType: WorkflowBlockType,
    instance: OrderWorkflowInstance,
    blockMeta: Map<WorkflowBlockType, { icon: string; label: string }>,
    hiddenTypes: Set<WorkflowBlockType>,
): PipelineStepNode | null {
    if (hiddenTypes.has(blockType)) return null;

    const blockId = BLOCK_TYPE_TO_ID[blockType];
    if (!blockId) return null;

    const progress = instance.blockProgress[blockId];
    if (!progress) return null;

    const meta = blockMeta.get(blockType);
    if (!meta) return null;

    return {
        kind: 'step',
        key: blockId,
        label: meta.label,
        icon: meta.icon,
        status: progress.status,
        subStatus: progress.subStatus,
        completedAt: progress.completedAt,
        batches: progress.batches,
    };
}

/** Helper: resolve a block by its ID. Supports per-ID label overrides. */
function resolveStepById(
    blockId: string,
    instance: OrderWorkflowInstance,
    blockMeta: Map<WorkflowBlockType, { icon: string; label: string }>,
    hiddenTypes: Set<WorkflowBlockType>,
): PipelineStepNode | null {
    const blockType = BLOCK_ID_TO_TYPE[blockId];
    if (!blockType || hiddenTypes.has(blockType)) return null;

    const progress = instance.blockProgress[blockId];
    if (!progress) return null;

    const override = BLOCK_ID_LABEL_OVERRIDES[blockId];
    const meta = blockMeta.get(blockType);
    if (!meta && !override) return null;

    return {
        kind: 'step',
        key: blockId,
        label: override?.label ?? meta?.label ?? blockId,
        icon: override?.icon ?? meta?.icon ?? 'lucide:circle',
        status: progress.status,
        subStatus: progress.subStatus,
        completedAt: progress.completedAt,
        batches: progress.batches,
    };
}

/** Helper: resolve a list of block types to PipelineStepNode[]. */
function resolveSteps(
    order: WorkflowBlockType[],
    instance: OrderWorkflowInstance,
    blockMeta: Map<WorkflowBlockType, { icon: string; label: string }>,
    hiddenTypes: Set<WorkflowBlockType>,
): PipelineStepNode[] {
    return order.flatMap((type) => {
        const step = resolveStep(type, instance, blockMeta, hiddenTypes);
        return step ? [step] : [];
    });
}

/** Helper: resolve a list of block IDs to PipelineStepNode[]. */
function resolveStepsById(
    ids: string[],
    instance: OrderWorkflowInstance,
    blockMeta: Map<WorkflowBlockType, { icon: string; label: string }>,
    hiddenTypes: Set<WorkflowBlockType>,
): PipelineStepNode[] {
    return ids.flatMap((id) => {
        const step = resolveStepById(id, instance, blockMeta, hiddenTypes);
        return step ? [step] : [];
    });
}

/**
 * Detect whether the instance has blocks belonging to both Photo and Video lanes.
 */
function hasBranching(instance: OrderWorkflowInstance): boolean {
    const hasPhoto = PHOTO_LANE_IDS.some((id) => instance.blockProgress[id]);
    const hasVideo = VIDEO_LANE_IDS.some((id) => instance.blockProgress[id]);
    return hasPhoto && hasVideo;
}



/**
 * Build a fully flat PipelineStepNode[] where every step lives on a single spine.
 *
 * Fork lanes are flattened:
 *   - The first step of each lane becomes the group header (depth 0)
 *   - Its child steps become depth-1 indented steps below
 */
export function buildFlatPipelineTree(
    instance: OrderWorkflowInstance,
    blockMeta: Map<WorkflowBlockType, { icon: string; label: string }>,
    hiddenTypes: Set<WorkflowBlockType>,
): PipelineStepNode[] {
    if (!hasBranching(instance)) {
        const preFork = resolveSteps(PRE_FORK_ORDER, instance, blockMeta, hiddenTypes);
        const photoSteps = resolveStepsById(PHOTO_LANE_IDS, instance, blockMeta, hiddenTypes);
        const videoSteps = resolveStepsById(VIDEO_LANE_IDS, instance, blockMeta, hiddenTypes);
        const postMerge = resolveSteps(POST_MERGE_ORDER, instance, blockMeta, hiddenTypes);
        return [...preFork, ...photoSteps, ...videoSteps, ...postMerge];
    }

    const result: PipelineStepNode[] = [];

    // 1. Pre-fork linear steps (depth 0)
    result.push(...resolveSteps(PRE_FORK_ORDER, instance, blockMeta, hiddenTypes));

    // 2. Flatten each lane
    const laneConfigs: { ids: string[]; label: string; branchType: string }[] = [
        { ids: PHOTO_LANE_IDS, label: 'photo shoot', branchType: 'PHOTO' },
        { ids: VIDEO_LANE_IDS, label: 'video shoot', branchType: 'VIDEO' },
    ];

    for (const lane of laneConfigs) {
        const childSteps = resolveStepsById(lane.ids, instance, blockMeta, hiddenTypes);
        if (childSteps.length === 0) continue;

        // First step of the lane serves as the group header (depth 0)
        const [headerStep, ...restSteps] = childSteps;
        result.push({ ...headerStep, depth: 0, isGroupHeader: true });

        // Remaining steps are indented children (depth 1)
        for (const child of restSteps) {
            result.push({ ...child, depth: 1 });
        }
    }

    // 3. Post-merge linear steps (depth 0)
    result.push(...resolveSteps(POST_MERGE_ORDER, instance, blockMeta, hiddenTypes));

    return result;
}
