import { Avatar, Button, Tooltip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { getInitials } from '../../utils/format-name';
import { TOOLTIP_DELAY } from '../../constants/ui-tokens';

interface MemberRowProps {
    name: string;
    role: string;
    /** 'card' = hover bg, Tooltip, larger Avatar; 'modal' = static bg, optional remove button */
    variant: 'card' | 'modal';
    onRemove?: () => void;
    removeLabel?: string;
}

/**
 * Shared member row used in team cards and edit modals.
 * Renders an Avatar with initials, name, role, and optional remove action.
 */
export function MemberRow({ name, role, variant, onRemove, removeLabel }: MemberRowProps) {
    const isCard = variant === 'card';

    return (
        <div
            className={
                isCard
                    ? 'rounded-xl -mx-2 px-2 py-1 transition-colors hover:bg-default/40 cursor-default flex items-center gap-3'
                    : 'flex items-center gap-3 rounded-xl px-3 py-2 bg-default/40'
            }
        >
            <Avatar size={isCard ? 'md' : 'sm'} color="accent" className="shrink-0">
                <Avatar.Fallback>{getInitials(name)}</Avatar.Fallback>
            </Avatar>

            <div className={`flex flex-col ${isCard ? 'gap-0.5' : 'flex-1'} min-w-0`}>
                {isCard ? (
                    <Tooltip delay={TOOLTIP_DELAY}>
                        <Tooltip.Trigger>
                            <p className="text-sm font-bold text-default-900 truncate">
                                {name}
                            </p>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            <p>{role}</p>
                        </Tooltip.Content>
                    </Tooltip>
                ) : (
                    <span className="text-sm font-bold text-default-900 truncate">
                        {name}
                    </span>
                )}
                <p className={`text-xs text-default-500 truncate${isCard ? ' font-medium' : ''}`}>
                    {role}
                </p>
            </div>

            {!isCard && onRemove && (
                <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    aria-label={removeLabel ?? `Remove ${name}`}
                    className="text-default-400 hover:text-danger hover:bg-danger/10 shrink-0"
                    onPress={onRemove}
                >
                    <Icon icon="lucide:x" className="size-3.5" />
                </Button>
            )}
        </div>
    );
}
