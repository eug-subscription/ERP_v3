import { Avatar, Button, Tooltip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { getInitials } from '../../utils/format-name';
import { ALL_TEAM_MEMBERS } from '../../data/mock-team-members';
import { TOOLTIP_DELAY } from '../../constants/ui-tokens';

interface MemberRowProps {
    name: string;
    role: string;
    /** Optional avatar URL override. When omitted, looks up by name in ALL_TEAM_MEMBERS. */
    avatarUrl?: string | null;
    /** 'card' = hover bg, Tooltip, larger Avatar; 'modal' = static bg, optional remove button */
    variant: 'card' | 'modal';
    onRemove?: () => void;
    removeLabel?: string;
}

/** Resolve avatar URL: use explicit prop, or fall back to team directory lookup by name. */
function resolveAvatarUrl(name: string, avatarUrl?: string | null): string | null {
    if (avatarUrl !== undefined) return avatarUrl;
    return ALL_TEAM_MEMBERS.find((m) => m.name === name)?.avatarUrl ?? null;
}

/**
 * Shared member row used in team cards and edit modals.
 * Renders an Avatar with photo (when available) or initials fallback,
 * name, role, and optional remove action.
 */
export function MemberRow({ name, role, variant, avatarUrl, onRemove, removeLabel }: MemberRowProps) {
    const isCard = variant === 'card';
    const resolvedAvatar = resolveAvatarUrl(name, avatarUrl);

    return (
        <div
            className={
                isCard
                    ? 'rounded-xl -mx-2 px-2 py-1 transition-colors hover:bg-default/40 cursor-default flex items-center gap-3'
                    : 'flex items-center gap-3 rounded-xl px-3 py-2 bg-default/40'
            }
        >
            <Avatar size={isCard ? 'md' : 'sm'} color="accent" className="shrink-0">
                {resolvedAvatar ? (
                    <Avatar.Image src={resolvedAvatar} alt={name} />
                ) : null}
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
