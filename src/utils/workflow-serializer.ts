import { CanvasBlock, WorkflowBranch, WorkflowBlock, ProjectWorkflowConfig } from "../types/workflow";

/**
 * Serializes the flat CanvasBlock array from the builder into the branched WorkflowBranch structure
 * required by the ProjectWorkflowConfig.
 * 
 * Mapping logic:
 * - 'main' branch blocks before IF_ELSE go into the 'initial' branch.
 * - 'main' branch blocks after MERGE go into the 'completion' branch.
 * - 'photo' branch blocks go into the 'photo' branch.
 * - 'video' branch blocks go into the 'video' branch.
 */
export function serializeCanvasToBranches(blocks: CanvasBlock[]): WorkflowBranch[] {
    const initialBlocks: WorkflowBlock[] = [];
    const photoBlocks: WorkflowBlock[] = [];
    const videoBlocks: WorkflowBlock[] = [];
    const completionBlocks: WorkflowBlock[] = [];

    const mergeIndex = blocks.findIndex(b => b.type === 'MERGE');

    blocks.forEach((block, index) => {
        // Prepare the base block for storage (removing builder-specific fields)
        const storageBlock: WorkflowBlock = {
            id: block.id,
            type: block.type,
            label: block.label,
            category: block.category,
            isEnabled: block.isEnabled,
            config: block.config
        };

        if (block.position.branchId === 'photo') {
            photoBlocks.push(storageBlock);
        } else if (block.position.branchId === 'video') {
            videoBlocks.push(storageBlock);
        } else {
            // Main branch block: Everything from MERGE onwards is completion, others are initial
            if (mergeIndex !== -1 && index >= mergeIndex) {
                completionBlocks.push(storageBlock);
            } else {
                initialBlocks.push(storageBlock);
            }
        }
    });

    return [
        { id: 'initial', name: 'Initial Steps', type: 'GENERAL', blocks: initialBlocks },
        { id: 'photo', name: '📸 Photo Branch', type: 'PHOTO', blocks: photoBlocks },
        { id: 'video', name: '🎬 Video Branch', type: 'VIDEO', blocks: videoBlocks },
        { id: 'completion', name: 'Completion', type: 'GENERAL', blocks: completionBlocks }
    ];
}

/**
 * Helper to wrap branches into a full ProjectWorkflowConfig
 */
export function serializeCanvasToConfig(
    projectId: string,
    templateId: string,
    blocks: CanvasBlock[]
): ProjectWorkflowConfig {
    return {
        projectId,
        templateId,
        branches: serializeCanvasToBranches(blocks)
    };
}
