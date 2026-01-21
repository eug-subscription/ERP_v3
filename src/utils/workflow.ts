import { WorkflowBlock, CanvasBlock } from "../types/workflow";

/**
 * Gets a human-readable label for a workflow block.
 * Returns the custom label if set, otherwise falls back to a formatted version of the block type.
 */
export function getBlockLabel(block: WorkflowBlock | CanvasBlock): string {
    if (block.label) return block.label;

    // Fallback: Convert CONST_CASE to Title Case (e.g., ORDER_CREATED -> Order Created)
    return block.type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
