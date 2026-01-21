import {
    ProjectWorkflowConfig,
    WorkflowBranch,
    WorkflowBlock,
    WorkflowPreset
} from "../types/workflow";
import { MASTER_BLOCKS } from "../data/master-blocks";
import { STANDARD_BRANCHES } from "../data/branch-structure";

/**
 * Simple deep merge utility for configuration objects.
 */
function isObject(item: unknown): item is Record<string, unknown> {
    return !!(item && typeof item === 'object' && !Array.isArray(item));
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    const output: Record<string, unknown> = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            const sourceValue = source[key];
            const targetValue = target[key];

            if (isObject(sourceValue)) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: sourceValue });
                } else {
                    output[key] = deepMerge(targetValue as Record<string, unknown>, sourceValue as Record<string, unknown>);
                }
            } else {
                Object.assign(output, { [key]: sourceValue });
            }
        });
    }
    return output;
}

/**
 * Generates a full ProjectWorkflowConfig from a WorkflowPreset.
 * In the unified model, every workflow contains ALL standard blocks defined by branches, 
 * with their enabled/disabled states defined by the preset.
 */
export function generateWorkflowFromPreset(
    preset: WorkflowPreset,
    projectId: string = "new-project"
): ProjectWorkflowConfig {
    const branches: WorkflowBranch[] = STANDARD_BRANCHES.map((branchDef) => {
        const blocks: WorkflowBlock[] = branchDef.allowedBlockTypes.map((type) => {
            const masterBlock = MASTER_BLOCKS[type];
            if (!masterBlock) {
                throw new Error(`Block type ${type} not found in MASTER_BLOCKS`);
            }

            // A block is enabled if:
            // 1. It cannot be disabled (e.g., ORDER_CREATED)
            // 2. It is explicitly listed in the preset's enabledBlocks
            const isEnabled = !masterBlock.canBeDisabled || preset.enabledBlocks.includes(type);

            // Merge config: Preset config overrides master default config
            const baseConfig = masterBlock.config || {};
            const presetConfig = preset.blockConfigs[type] || {};

            // Deep merge of configs to prevent losing nested properties
            const config = deepMerge(baseConfig as Record<string, unknown>, presetConfig as Record<string, unknown>);

            return {
                // Generate a unique instance ID. 
                // We suffix the type and branch to keep it human-readable but unique.
                id: `${type.toLowerCase()}_${branchDef.id}_${Math.random().toString(36).substring(2, 9)}`,
                type: masterBlock.type,
                label: masterBlock.label,
                category: masterBlock.category,
                isEnabled,
                // Only include config if it has keys or exists in master
                ...(Object.keys(config).length > 0 ? { config } : {})
            } as WorkflowBlock;
        });

        // Sort blocks based on preset override or master default position
        const sortedBlocks = [...blocks].sort((a, b) => {
            const posA = preset.blockPositions?.[a.type] ?? MASTER_BLOCKS[a.type].defaultPosition;
            const posB = preset.blockPositions?.[b.type] ?? MASTER_BLOCKS[b.type].defaultPosition;
            return posA - posB;
        });

        return {
            id: branchDef.id,
            name: branchDef.name,
            type: branchDef.type,
            blocks: sortedBlocks
        };
    });

    return {
        projectId,
        templateId: preset.id,
        branches
    };
}
