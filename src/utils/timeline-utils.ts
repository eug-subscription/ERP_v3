import type { CanvasBlock, TimelineAudience } from '../types/workflow';
import { DEFAULT_AUDIENCE_VISIBILITY, DEFAULT_AUDIENCE_LABELS, DEFAULT_AUDIENCE_DESCRIPTIONS } from '../constants/timeline';

/**
 * Sorts workflow blocks into topological execution order for timeline display.
 * 
 * Handles branching workflows by inserting branch blocks between If/else and Merge blocks.
 * 
 * Algorithm:
 * 1. Separate blocks by branchId (main, photo, video)
 * 2. Find If/else and Merge blocks in main branch
 * 3. Build sorted array: main blocks up to If/else → photo branch → video branch → main blocks from Merge onward
 * 4. If no If/else exists, return blocks sorted by (main branch first, then by index)
 * 
 * @param blocks - Array of canvas blocks to sort
 * @returns Sorted array in logical execution order
 */
export function sortBlocksForTimeline(blocks: CanvasBlock[]): CanvasBlock[] {
    // Edge case: empty or single block
    if (blocks.length <= 1) {
        return [...blocks];
    }

    // Step 1: Separate blocks by branchId
    const mainBlocks = blocks
        .filter(b => b.position.branchId === 'main')
        .sort((a, b) => a.position.index - b.position.index);

    const photoBlocks = blocks
        .filter(b => b.position.branchId === 'photo')
        .sort((a, b) => a.position.index - b.position.index);

    const videoBlocks = blocks
        .filter(b => b.position.branchId === 'video')
        .sort((a, b) => a.position.index - b.position.index);

    // Step 2: Find If/else and Merge blocks in main branch
    const ifElseIndex = mainBlocks.findIndex(b => b.type === 'IF_ELSE');
    const mergeIndex = mainBlocks.findIndex(b => b.type === 'MERGE');

    // Step 3: If no If/else exists, return simple sorted order (main first)
    if (ifElseIndex === -1) {
        return [...mainBlocks, ...photoBlocks, ...videoBlocks];
    }

    // Step 4: Build sorted array with branches inserted between If/else and Merge
    const result: CanvasBlock[] = [];

    // Main blocks up to and including If/else
    result.push(...mainBlocks.slice(0, ifElseIndex + 1));

    // Photo branch blocks
    result.push(...photoBlocks);

    // Video branch blocks
    result.push(...videoBlocks);

    // Main blocks from Merge onward (if Merge exists)
    if (mergeIndex !== -1) {
        result.push(...mainBlocks.slice(mergeIndex));
    } else {
        // Edge case: If/else exists but no Merge — append remaining main blocks
        result.push(...mainBlocks.slice(ifElseIndex + 1));
    }

    return result;
}

/**
 * Returns the default visibility for a workflow block type and audience.
 * 
 * Uses the DEFAULT_AUDIENCE_VISIBILITY map to determine smart defaults.
 * Blocks not in the map, or audiences not specified for a block, default to visible (true).
 * 
 * @param blockType - The workflow block type
 * @param audience - The audience viewing the timeline (client, pro, ops)
 * @returns true if visible by default, false if hidden by default
 * 
 * @example
 * getDefaultVisibility('IF_ELSE', 'client') // returns false
 * getDefaultVisibility('PHOTO_SHOOT', 'client') // returns true
 * getDefaultVisibility('IF_ELSE', 'ops') // returns true
 */
export function getDefaultVisibility(
    blockType: string,
    audience: TimelineAudience
): boolean {
    // Type assertion needed since blockType is string but map keys are specific literals
    const visibility = (DEFAULT_AUDIENCE_VISIBILITY as Record<string, Record<string, boolean>>)[blockType];

    return visibility?.[audience] ?? true;
}

/**
 * Returns the default label for a workflow block type and audience.
 * 
 * Uses the DEFAULT_AUDIENCE_LABELS map to provide audience-specific friendly labels.
 * Falls back to the block's canvas label if no audience-specific default is defined.
 * 
 * @param blockType - The workflow block type
 * @param audience - The audience viewing the timeline (client, pro, ops)
 * @param canvasLabel - The block's original canvas label as fallback
 * @returns The audience-specific label or canvas label
 * 
 * @example
 * getDefaultLabel('PHOTO_SHOOT', 'client', 'Photo shoot') // returns 'Photo Session'
 * getDefaultLabel('PHOTO_SHOOT', 'ops', 'Photo shoot') // returns 'Photo shoot'
 * getDefaultLabel('MATCHING', 'client', 'Matching') // returns 'Matching' (no override)
 */
export function getDefaultLabel(
    blockType: string,
    audience: TimelineAudience,
    canvasLabel: string
): string {
    // Type assertion needed since blockType is string but map keys are specific literals
    const labels = (DEFAULT_AUDIENCE_LABELS as Record<string, Record<string, string>>)[blockType];

    return labels?.[audience] ?? canvasLabel;
}

/**
 * Returns the default description for a workflow block type and audience.
 *
 * Uses the DEFAULT_AUDIENCE_DESCRIPTIONS map to provide audience-specific description templates.
 * Falls back to empty string if no audience-specific default is defined.
 *
 * @param blockType - The workflow block type
 * @param audience - The audience viewing the timeline (client, pro, ops)
 * @returns The audience-specific description template or empty string
 *
 * @example
 * getDefaultDescription('PHOTO_SHOOT', 'client') // returns 'The photoshoot was completed by {User Role and Name}'
 * getDefaultDescription('MATCHING', 'client') // returns '' (no default)
 */
export function getDefaultDescription(
    blockType: string,
    audience: TimelineAudience
): string {
    const descriptions = (DEFAULT_AUDIENCE_DESCRIPTIONS as Record<string, Record<string, string>>)[blockType];

    return descriptions?.[audience] ?? '';
}
