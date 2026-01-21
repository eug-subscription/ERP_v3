import { Switch, Button, Tooltip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WorkflowBlock } from '../../../types/workflow';
import { getBlockIcon, CONFIGURABLE_BLOCKS, DESCRIPTION_ONLY_BLOCKS } from '../../../data/workflow-constants';
import { MASTER_BLOCKS } from '../../../data/master-blocks';

interface BlockRowProps {
    block: WorkflowBlock;
    onToggle: (blockId: string) => void;
    onOpenSettings: (block: WorkflowBlock) => void;
    invalidMoveReason?: string | null;
}

/**
 * BlockRow Component
 * Represents a single workflow block within a branch configuration.
 * Handles enabled/disabled/locked states and entry to block settings.
 */
export function BlockRow({ block, onToggle, onOpenSettings, invalidMoveReason }: BlockRowProps) {
    const masterBlock = MASTER_BLOCKS[block.type];
    const isLocked = masterBlock && !masterBlock.canBeDisabled;
    const isConfigurable = CONFIGURABLE_BLOCKS.has(block.type) || DESCRIPTION_ONLY_BLOCKS.has(block.type);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: block.id,
        disabled: isLocked // ORDER_CREATED etc can't be dragged
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    const content = (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-4 transition-all duration-300 ease-out group relative ${invalidMoveReason ? 'ring-2 ring-danger/50 bg-danger/5' :
                isDragging ? 'opacity-50 ring-2 ring-accent/30 bg-accent/5' :
                    !block.isEnabled && !isLocked ? 'opacity-40 bg-secondary/10' : 'opacity-100 bg-transparent'
                }`}
        >
            {/* Invalid Drop Overlay */}
            {invalidMoveReason && (
                <div className="absolute inset-0 bg-danger/5 pointer-events-none z-10" />
            )}

            <div className="flex items-center gap-3 relative z-20">
                {/* Drag Handle: Only for non-locked blocks */}
                {!isLocked && (
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-1 rounded hover:bg-secondary/20 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                    >
                        <Icon icon="lucide:grip-vertical" className="w-4 h-4" />
                    </div>
                )}

                {/* Block Icon */}
                <div className={`p-2 rounded-lg transition-colors duration-200 ${block.isEnabled ? 'bg-accent/10 text-accent' : 'bg-secondary/30 text-muted-foreground'
                    }`}>
                    <Icon
                        icon={getBlockIcon(block.type)}
                        className="w-4 h-4"
                    />
                </div>

                {/* Block Labels */}
                <div className="flex flex-col">
                    <span className={`text-sm font-semibold transition-colors duration-200 ${!block.isEnabled && !isLocked ? 'text-muted-foreground' : 'text-foreground'
                        }`}>
                        {block.label}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
                        {block.category}
                    </span>
                </div>

                {/* Warning Icon for Invalid Drop */}
                {invalidMoveReason && (
                    <div className="ml-2 text-danger animate-pulse">
                        <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4 relative z-20">
                {/* Settings button: only visible when block is enabled and has config/description */}
                {block.isEnabled && isConfigurable && (
                    <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        onPress={() => onOpenSettings(block)}
                        className="rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors duration-200"
                    >
                        <Icon icon="lucide:settings-2" className="w-4 h-4" />
                    </Button>
                )}

                {/* Locked blocks vs Toggle Switch */}
                {isLocked ? (
                    <Tooltip>
                        <Tooltip.Trigger>
                            <div className="p-2 rounded-lg bg-secondary/20 text-muted-foreground cursor-help">
                                <Icon icon="lucide:lock" className="w-4 h-4" />
                            </div>
                        </Tooltip.Trigger>
                        <Tooltip.Content placement="left">
                            <Tooltip.Arrow />
                            Required block
                        </Tooltip.Content>
                    </Tooltip>
                ) : (
                    <Switch
                        isSelected={block.isEnabled}
                        onChange={() => onToggle(block.id)}
                        size="sm"
                    >
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                    </Switch>
                )}
            </div>
        </div>
    );

    if (invalidMoveReason) {
        return (
            <Tooltip isOpen={true}>
                <Tooltip.Trigger>
                    {content}
                </Tooltip.Trigger>
                <Tooltip.Content placement="top" className="px-3 py-2 bg-danger text-white border-none shadow-2xl rounded-xl text-xs font-semibold flex items-center gap-2">
                    <Icon icon="lucide:alert-triangle" className="w-3 h-3" />
                    {invalidMoveReason}
                </Tooltip.Content>
            </Tooltip>
        );
    }

    return content;
}
