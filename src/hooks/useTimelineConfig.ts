import { useState, useCallback, useMemo } from 'react';
import type {
    CanvasBlock,
    TimelineConfig,
    TimelineAudience,
    TimelineStepOverride,
    TimelineBlockOverrides,
} from '../types/workflow';
import { BLOCK_LIBRARY } from '../data/block-ui-categories';
import { sortBlocksForTimeline, getDefaultVisibility, getDefaultLabel, getDefaultDescription } from '../utils/timeline-utils';

/**
 * Resolved timeline step for a single block instance.
 * Contains default values plus resolved overrides for each audience.
 */
export interface ResolvedTimelineStep {
    blockId: string;
    blockType: string;
    blockIcon: string;
    defaultLabel: string;
    branchId: 'main' | 'photo' | 'video';
    audiences: {
        client: { visible: boolean; label: string; description: string };
        pro: { visible: boolean; label: string; description: string };
        ops: { visible: boolean; label: string; description: string };
    };
}

/**
 * Hook for managing timeline configuration derived from workflow blocks.
 * Provides resolution logic, CRUD operations, and cleanup utilities.
 *
 * @param blocks - Current workflow blocks from the canvas
 * @param initialOverrides - Optional initial timeline configuration
 * @returns Resolved steps, overrides state, and update functions
 */
export function useTimelineConfig(
    blocks: CanvasBlock[],
    initialOverrides?: TimelineConfig
) {
    // Local state for timeline overrides (sparse map)
    const [overrides, setOverrides] = useState<TimelineConfig>(
        initialOverrides ?? { steps: {} }
    );

    /**
     * Resolves visibility and label for a single audience.
     * Applies the resolution logic: overrides[blockId]?.[audience]?.field ?? smart default
     */
    const resolveForAudience = useCallback(
        (
            blockId: string,
            blockType: string,
            defaultLabel: string,
            audience: TimelineAudience
        ): { visible: boolean; label: string; description: string } => {
            const override = overrides.steps[blockId]?.[audience];
            return {
                visible: override?.visible ?? getDefaultVisibility(blockType, audience),
                label: override?.label ?? getDefaultLabel(blockType, audience, defaultLabel),
                description: override?.description ?? getDefaultDescription(blockType, audience),
            };
        },
        [overrides]
    );

    /**
     * Resolves all timeline steps with defaults and overrides applied.
     * Returns an array of steps in topological execution order.
     */
    const resolvedSteps = useMemo<ResolvedTimelineStep[]>(() => {
        return sortBlocksForTimeline(blocks).map((block) => ({
            blockId: block.id,
            blockType: block.type,
            blockIcon: BLOCK_LIBRARY.find(b => b.type === block.type)?.icon ?? 'lucide:circle',
            defaultLabel: block.label,
            branchId: block.position.branchId,
            audiences: {
                client: resolveForAudience(block.id, block.type, block.label, 'client'),
                pro: resolveForAudience(block.id, block.type, block.label, 'pro'),
                ops: resolveForAudience(block.id, block.type, block.label, 'ops'),
            },
        }));
    }, [blocks, resolveForAudience]);

    /**
     * Updates a single override for a specific block and audience.
     * Patches the existing override (merges with current values).
     */
    const updateOverride = useCallback(
        (
            blockId: string,
            audience: TimelineAudience,
            patch: Partial<TimelineStepOverride>
        ) => {
            setOverrides((prev) => {
                const blockOverrides = prev.steps[blockId] ?? {};
                const audienceOverride = blockOverrides[audience] ?? {};

                // Merge the patch into the existing override
                const updatedOverride: TimelineStepOverride = {
                    ...audienceOverride,
                    ...patch,
                };

                // If both visible and label are defaults, remove the override entirely
                const block = blocks.find((b) => b.id === blockId);
                if (!block) {
                    // Block not found, skip pruning and just save the override
                    return {
                        steps: {
                            ...prev.steps,
                            [blockId]: {
                                ...blockOverrides,
                                [audience]: updatedOverride,
                            },
                        },
                    };
                }

                const defaultVisibility = getDefaultVisibility(block.type, audience);
                const isDefaultVisible = (updatedOverride.visible ?? defaultVisibility) === defaultVisibility;
                const defaultLabel = getDefaultLabel(block.type, audience, block.label);
                const isDefaultLabel =
                    !updatedOverride.label || updatedOverride.label === defaultLabel;
                const defaultDescription = getDefaultDescription(block.type, audience);
                const isDefaultDescription =
                    !updatedOverride.description || updatedOverride.description === defaultDescription;

                if (isDefaultVisible && isDefaultLabel && isDefaultDescription) {
                    // Remove this audience override
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [audience]: _removed, ...rest } = blockOverrides;
                    if (Object.keys(rest).length === 0) {
                        // No overrides left for this block, remove the block entry
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { [blockId]: _removedBlock, ...remainingSteps } = prev.steps;
                        return { steps: remainingSteps };
                    }
                    return {
                        steps: {
                            ...prev.steps,
                            [blockId]: rest,
                        },
                    };
                }

                return {
                    steps: {
                        ...prev.steps,
                        [blockId]: {
                            ...blockOverrides,
                            [audience]: updatedOverride,
                        },
                    },
                };
            });
        },
        [blocks]
    );

    /**
     * Clears all overrides for a specific audience.
     */
    const resetAudience = useCallback((audience: TimelineAudience) => {
        setOverrides((prev) => {
            const updatedSteps: Record<string, TimelineBlockOverrides> = {};

            for (const [blockId, blockOverrides] of Object.entries(prev.steps)) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [audience]: _removed, ...rest } = blockOverrides;
                if (Object.keys(rest).length > 0) {
                    updatedSteps[blockId] = rest;
                }
            }

            return { steps: updatedSteps };
        });
    }, []);

    /**
     * Clears all overrides for all audiences.
     */
    const resetAll = useCallback(() => {
        setOverrides({ steps: {} });
    }, []);

    /**
     * Removes overrides for block IDs that no longer exist in the workflow.
     * Used for cleanup when blocks are deleted from the canvas.
     */
    const cleanupRemovedBlocks = useCallback((validBlockIds: string[]) => {
        const validIdSet = new Set(validBlockIds);

        setOverrides((prev) => {
            const cleanedSteps: Record<string, TimelineBlockOverrides> = {};

            for (const [blockId, blockOverrides] of Object.entries(prev.steps)) {
                if (validIdSet.has(blockId)) {
                    cleanedSteps[blockId] = blockOverrides;
                }
            }

            return { steps: cleanedSteps };
        });
    }, []);

    return {
        resolvedSteps,
        overrides,
        updateOverride,
        resetAudience,
        resetAll,
        cleanupRemovedBlocks,
    };
}


