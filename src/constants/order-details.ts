import type { WorkflowBlockType } from "../types/workflow";

/**
 * Maps workflow block types to human-readable service category labels.
 * Used by useOrderDetails to derive orderTypes from billing line rateItemIds.
 * Add new entries here when new WorkflowBlockType values are introduced.
 */
export const BLOCK_TYPE_TO_CATEGORY: Partial<Record<WorkflowBlockType, string>> = {
    PHOTO_SHOOT: "Photography",
    PHOTO_RETOUCHING: "Photography",
    VIDEO_SHOOT: "Videography",
    VIDEO_RETOUCHING: "Videography",
};
