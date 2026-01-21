import { useState } from 'react';
import { Card, Label, Select, ListBox, Description, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { WorkflowBranch, WorkflowBlock } from '../../../types/workflow';
import { MASTER_BLOCKS } from '../../../data/master-blocks';
import { ACTION_DEPENDENCIES } from '../../../data/block-dependencies';

import { DELIVERY_SCHEDULES } from '../../../data/workflow-options';

import { BlockRow } from './BlockRow';

/**
 * Validates if the proposed move is logically sound.
 */
function getInvalidMoveReason(activeId: string, overId: string, blocks: WorkflowBlock[]): string | null {
    if (!activeId || !overId || activeId === overId) return null;

    const oldIndex = blocks.findIndex(b => b.id === activeId);
    const newIndex = blocks.findIndex(b => b.id === overId);
    if (oldIndex === -1 || newIndex === -1) return null;

    const newBlocks = arrayMove([...blocks], oldIndex, newIndex);

    // 1. ORDER_CREATED must be at index 0
    const currentFirstBlock = newBlocks[0];
    if (MASTER_BLOCKS[currentFirstBlock.type]?.type === 'ORDER_CREATED') {
        // This is fine
    } else if (newBlocks.some(b => b.type === 'ORDER_CREATED')) {
        return "Order Created must always be the first step.";
    }

    // 2. Logic Order (Processing -> Finalisation)
    let reachedFinalisation = false;
    for (const block of newBlocks) {
        const category = MASTER_BLOCKS[block.type]?.category;
        if (category === 'FINALISATION') {
            reachedFinalisation = true;
        } else if (reachedFinalisation && category === 'PROCESSING') {
            return "Production steps must come before delivery steps.";
        }
    }

    // 3. Specific Dependencies (mustComeAfter)
    for (let i = 0; i < newBlocks.length; i++) {
        const block = newBlocks[i];
        const dep = ACTION_DEPENDENCIES.find(d => d.blockType === block.type);
        if (dep?.mustComeAfter) {
            for (const predecessorType of dep.mustComeAfter) {
                const predecessorIndex = newBlocks.findIndex(b => b.type === predecessorType);
                // Only care if both blocks are enabled in this branch
                if (predecessorIndex !== -1 && predecessorIndex > i) {
                    const predecessorLabel = MASTER_BLOCKS[predecessorType]?.label || predecessorType;
                    return `${block.label} must come after ${predecessorLabel}.`;
                }
            }
        }
    }

    return null;
}

interface BranchConfigProps {
    branch: WorkflowBranch;
    onToggleBlock: (blockId: string) => void;
    onOpenSettings: (block: WorkflowBlock) => void;
    onReorderBlocks: (branchId: string, oldIndex: number, newIndex: number) => void;
    className?: string;
}

/**
 * BranchConfig Component
 * Manages the configuration for a specific workflow branch (Photo, Video, etc.).
 */
export function BranchConfig({
    branch,
    onToggleBlock,
    onOpenSettings,
    onReorderBlocks,
    className
}: BranchConfigProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);

    const isPhoto = branch.type === 'PHOTO';
    const isVideo = branch.type === 'VIDEO';

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Prevent accidental drags when clicking icons
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const branchIcon = isPhoto ? 'lucide:camera' : isVideo ? 'lucide:video' : 'lucide:git-branch';
    const accentColor = isPhoto ? 'text-accent' : isVideo ? 'text-success' : 'text-default-500';

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        setOverId(event.over?.id as string || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setOverId(null);

        if (over && active.id !== over.id) {
            const oldIndex = branch.blocks.findIndex((b) => b.id === active.id);
            const newIndex = branch.blocks.findIndex((b) => b.id === over.id);

            const invalidReason = getInvalidMoveReason(active.id as string, over.id as string, branch.blocks);

            if (!invalidReason) {
                onReorderBlocks(branch.id, oldIndex, newIndex);
            }
        }
    };

    return (
        <div className={`space-y-4 animate-in fade-in slide-in-from-left-2 duration-500 ${className}`}>
            {/* Branch Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Icon icon={branchIcon} className={`w-5 h-5 ${accentColor}`} />
                    <h3 className="font-bold text-lg tracking-tight uppercase text-foreground/80">
                        {branch.name}
                    </h3>
                </div>
                <Chip size="sm" variant="soft" color={isPhoto ? 'accent' : isVideo ? 'success' : 'default'}>
                    {branch.blocks.filter(b => b.isEnabled).length} active steps
                </Chip>
            </div>

            {/* Blocks List Card */}
            <Card variant="secondary" className="border-none shadow-sm overflow-hidden">
                <Card.Content className="p-0">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis]}
                    >
                        <SortableContext
                            items={branch.blocks.map(b => b.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="divide-y divide-separator/10">
                                {branch.blocks.map((block) => (
                                    <BlockRow
                                        key={block.id}
                                        block={block}
                                        onToggle={onToggleBlock}
                                        onOpenSettings={onOpenSettings}
                                        invalidMoveReason={
                                            overId === block.id && activeId && activeId !== block.id
                                                ? getInvalidMoveReason(activeId, block.id, branch.blocks)
                                                : null
                                        }
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </Card.Content>

                {/* Branch-level Delivery Settings */}
                <Card.Footer className="bg-secondary/5 border-t border-separator/10 p-4 space-y-4 flex flex-col items-stretch">
                    <Select
                        defaultSelectedKey={isPhoto ? 'same-day' : 'plus-2'}
                        className="w-full"
                    >
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Delivery Schedule
                        </Label>
                        <Select.Trigger className="h-10 rounded-xl bg-background border-separator/40 hover:border-accent/50 transition-colors">
                            <Select.Value />
                            <Select.Indicator>
                                <Icon icon="lucide:clock" className="w-3.5 h-3.5" />
                            </Select.Indicator>
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                {DELIVERY_SCHEDULES.map((option) => (
                                    <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                                        <Label className="font-semibold cursor-pointer">{option.label}</Label>
                                        {option.description && (
                                            <Description className="text-[10px]">{option.description}</Description>
                                        )}
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </Card.Footer>
            </Card>
        </div>
    );
}
