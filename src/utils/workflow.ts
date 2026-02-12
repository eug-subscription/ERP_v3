import { WorkflowBlock, CanvasBlock, WorkflowBlockType } from "../types/workflow";
import { STANDARD_BRANCHES } from "../data/branch-structure";

/**
 * Checks whether a block type is allowed in a given workflow branch.
 * Shared by useCanvasOperations (insertion validation) and useWorkflowBuilder (exposed API).
 */
export function isBlockAllowedInBranch(
    blockType: WorkflowBlockType,
    branchId: 'main' | 'photo' | 'video'
): boolean {
    if (branchId === 'photo') {
        const branch = STANDARD_BRANCHES.find(b => b.id === 'photo');
        return branch?.allowedBlockTypes.includes(blockType) || false;
    }
    if (branchId === 'video') {
        const branch = STANDARD_BRANCHES.find(b => b.id === 'video');
        return branch?.allowedBlockTypes.includes(blockType) || false;
    }

    // 'main' branch covers both 'initial' and 'completion'
    const initialBranch = STANDARD_BRANCHES.find(b => b.id === 'initial');
    const completionBranch = STANDARD_BRANCHES.find(b => b.id === 'completion');

    return (initialBranch?.allowedBlockTypes.includes(blockType) ||
        completionBranch?.allowedBlockTypes.includes(blockType)) || false;
}

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
