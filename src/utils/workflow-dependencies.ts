import { CanvasBlock } from "../types/workflow";

interface PossiblyDependentConfig {
    onRejectBlockId?: string;
    onApproveStepId?: string;
    onRevisionStepId?: string;
    truePathStepId?: string;
    falsePathStepId?: string;
}

/**
 * Finds all blocks that reference the given blockId in their configuration.
 * @param blockId The ID of the block to check dependencies for.
 * @param allBlocks All blocks currently on the canvas.
 * @returns Array of block labels that depend on the given blockId.
 */
export function getDependentBlocks(blockId: string, allBlocks: CanvasBlock[]): string[] {
    const dependentLabels: string[] = [];

    allBlocks.forEach(block => {
        if (!block.config || block.id === blockId) return;

        // Cast to a narrow interface of possible dependency fields
        const config = block.config as PossiblyDependentConfig;

        const isReferenced =
            config.onRejectBlockId === blockId ||
            config.onApproveStepId === blockId ||
            config.onRevisionStepId === blockId ||
            config.truePathStepId === blockId ||
            config.falsePathStepId === blockId;

        if (isReferenced) {
            dependentLabels.push(block.label);
        }
    });

    return dependentLabels;
}
