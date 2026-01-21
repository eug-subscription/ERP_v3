import { WorkflowBlockType, ProjectWorkflowConfig, ValidationError, ValidationResult } from "../types/workflow";

/**
 * Definition of dependency rules for a specific block type.
 */
export interface BlockDependency {
    blockType: WorkflowBlockType;
    /** Must be enabled in the workflow if this block is enabled. */
    requires?: WorkflowBlockType[];
    /** Must appear before this block in the flow sequence. */
    mustComeAfter?: WorkflowBlockType[];
    /** Cannot coexist with these blocks. */
    mutuallyExclusive?: WorkflowBlockType[];
    /** This block should be auto-enabled if any of these are enabled. */
    enabledIf?: WorkflowBlockType[];
    /** This block should be auto-disabled if all of these are disabled. */
    disabledIf?: WorkflowBlockType[];
}

/**
 * Master set of dependency rules based on UNIFIED_TEMPLATE_MODEL_DESIGN.md.
 */
export const ACTION_DEPENDENCIES: BlockDependency[] = [
    {
        blockType: 'PHOTO_SHOOT',
        requires: ['PRO_ASSIGNING'],
        mustComeAfter: ['PRO_ASSIGNING']
    },
    {
        blockType: 'VIDEO_SHOOT',
        requires: ['PRO_ASSIGNING'],
        mustComeAfter: ['PRO_ASSIGNING']
    },
    {
        blockType: 'PHOTO_RETOUCHING',
        requires: ['RETOUCHER_ASSIGNING'],
        mustComeAfter: ['RETOUCHER_ASSIGNING', 'PHOTO_SHOOT']
    },
    {
        blockType: 'VIDEO_RETOUCHING',
        requires: ['RETOUCHER_ASSIGNING'],
        mustComeAfter: ['RETOUCHER_ASSIGNING', 'VIDEO_SHOOT'],
        disabledIf: ['VIDEO_SHOOT']
    },
    {
        blockType: 'MATCHING',
        requires: ['PHOTO_SHOOT'],
        mustComeAfter: ['PHOTO_SHOOT']
    },
    {
        blockType: 'MERGE',
        mustComeAfter: ['PHOTO_RETOUCHING', 'VIDEO_RETOUCHING', 'MODERATION']
    }
];

/**
 * Validates a workflow configuration against defined dependency rules.
 * @param config The project workflow configuration to validate.
 */
export function validateWorkflow(config: ProjectWorkflowConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const enabledBlockTypes = new Set<WorkflowBlockType>();

    // 1. Gather all enabled block types
    config.branches.forEach(branch => {
        branch.blocks.forEach(block => {
            if (block.isEnabled) {
                enabledBlockTypes.add(block.type);
            }
        });
    });

    // 2. Check Global Requirements
    if (!enabledBlockTypes.has('ORDER_CREATED')) {
        errors.push({
            type: 'ORDER_CREATED',
            message: "Order Created block is mandatory and cannot be disabled.",
            level: 'ERROR'
        });
    }

    if (!enabledBlockTypes.has('SEND_TO_CLIENT')) {
        errors.push({
            type: 'SEND_TO_CLIENT',
            message: "At least one 'Send to Client' block is required.",
            level: 'ERROR'
        });
    }

    // 3. Check Specific Dependencies
    ACTION_DEPENDENCIES.forEach(dep => {
        // Find all enabled blocks of this type to associate error with specific instances
        const blocksOfType = config.branches
            .flatMap(b => b.blocks)
            .filter(b => b.isEnabled && b.type === dep.blockType);

        if (blocksOfType.length > 0) {
            blocksOfType.forEach(block => {
                // A. Check 'requires'
                dep.requires?.forEach(req => {
                    if (!enabledBlockTypes.has(req)) {
                        errors.push({
                            blockId: block.id,
                            type: block.type,
                            message: `${block.label} requires ${req} to be enabled.`,
                            level: 'ERROR',
                            suggestion: `Enable ${req}`
                        });
                    }
                });

                // B. Check sequence constraints (mustComeAfter)
                dep.mustComeAfter?.forEach(predecessor => {
                    if (!enabledBlockTypes.has(predecessor)) {
                        errors.push({
                            blockId: block.id,
                            type: block.type,
                            message: `${block.label} must come after ${predecessor}.`,
                            level: 'WARNING',
                            suggestion: `Enable ${predecessor} before ${block.label}`
                        });
                    }
                });
            });
        }
    });

    return {
        isValid: errors.filter(e => e.level === 'ERROR').length === 0,
        errors
    };
}

/**
 * Automatically fixes common validation errors in a workflow.
 * @param config The current workflow configuration.
 * @returns A new configuration with fixes applied.
 */
export function autoFixWorkflow(config: ProjectWorkflowConfig): ProjectWorkflowConfig {
    const validation = validateWorkflow(config);
    if (validation.isValid && validation.errors.length === 0) return config;

    let fixedConfig = { ...config };

    // 1. Fix missing mandatory blocks (ORDER_CREATED, SEND_TO_CLIENT)
    const enabledBlockTypes = new Set<WorkflowBlockType>();
    fixedConfig.branches.forEach(branch => {
        branch.blocks.forEach(block => {
            if (block.isEnabled) enabledBlockTypes.add(block.type);
        });
    });

    if (!enabledBlockTypes.has('ORDER_CREATED')) {
        fixedConfig = {
            ...fixedConfig,
            branches: fixedConfig.branches.map(branch => ({
                ...branch,
                blocks: branch.blocks.map(block =>
                    block.type === 'ORDER_CREATED' ? { ...block, isEnabled: true } : block
                )
            }))
        };
    }

    if (!enabledBlockTypes.has('SEND_TO_CLIENT')) {
        // Find the first SEND_TO_CLIENT block and enable it
        fixedConfig = {
            ...fixedConfig,
            branches: fixedConfig.branches.map(branch => ({
                ...branch,
                blocks: branch.blocks.map(block =>
                    block.type === 'SEND_TO_CLIENT' ? { ...block, isEnabled: true } : block
                )
            }))
        };
    }

    // 2. Fix missing dependencies (requires)
    validation.errors.forEach(error => {
        if (error.suggestion?.startsWith('Enable')) {
            // Find the block type to enable from the error message or suggestion
            // In a robust system we'd have a mapping, but for now we can infer
            const typeToEnable = ACTION_DEPENDENCIES.find(d =>
                error.message.includes(d.blockType) || error.suggestion?.includes(d.blockType)
            )?.requires?.[0];

            if (typeToEnable) {
                fixedConfig = {
                    ...fixedConfig,
                    branches: fixedConfig.branches.map(branch => ({
                        ...branch,
                        blocks: branch.blocks.map(block =>
                            block.type === typeToEnable ? { ...block, isEnabled: true } : block
                        )
                    }))
                };
            }
        }
    });

    return fixedConfig;
}
