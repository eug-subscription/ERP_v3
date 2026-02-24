import { Avatar, Card, Skeleton } from '@heroui/react';
import { Link } from '@tanstack/react-router';
import { Icon } from '@iconify/react';
import { useMessages } from '../../hooks/useMessages';
import { formatRelativeTime, formatAbsoluteTime } from '../../utils/format-time';
import { TEXT_SECTION_LABEL, COMMENT_BUBBLE } from '../../constants/ui-tokens';

const PREVIEW_COUNT = 2;

export function MessagesPreview() {
    const { data, isLoading } = useMessages();

    if (isLoading) {
        return (
            <Card>
                <Card.Content className="p-5 space-y-4">
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="size-4 rounded" />
                        <Skeleton className="h-3 w-20 rounded" />
                    </div>
                    {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <Skeleton className="size-8 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2 pt-1">
                                <Skeleton className="h-3.5 w-24 rounded" />
                                <Skeleton className="h-3 w-full rounded" />
                            </div>
                        </div>
                    ))}
                </Card.Content>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <Card.Content className="p-5 flex flex-col items-center justify-center py-10">
                    <div className="size-12 rounded-full bg-default flex items-center justify-center mb-3">
                        <Icon icon="lucide:message-circle" className="size-5 text-muted" />
                    </div>
                    <p className="text-sm font-medium text-muted text-center">
                        No messages yet.
                    </p>
                </Card.Content>
            </Card>
        );
    }

    const preview = [...data].slice(-PREVIEW_COUNT);

    return (
        <Card>
            <Card.Content className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Icon icon="lucide:message-circle" className="size-4 text-default-500" />
                        <h3 className={TEXT_SECTION_LABEL}>Messages</h3>
                    </div>
                    <Link
                        to="/messages"
                        className="text-xs text-default-400 hover:text-accent font-medium transition-colors shrink-0"
                    >
                        View Messages
                    </Link>
                </div>

                {preview.map((msg) => {
                    const isCurrentUser = msg.isCurrentUser;
                    const bubbleClass = isCurrentUser
                        ? `${COMMENT_BUBBLE} !rounded-tl-2xl !rounded-tr-sm`
                        : COMMENT_BUBBLE;

                    return (
                        <div key={msg.id} className={`flex gap-3 items-start ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                            <Avatar size="sm" className="shrink-0 mt-0.5">
                                <Avatar.Image
                                    src={msg.user.avatar}
                                    alt={msg.user.name}
                                />
                                <Avatar.Fallback>
                                    {msg.user.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                </Avatar.Fallback>
                            </Avatar>
                            <div className={`flex flex-col gap-1 min-w-0 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-baseline gap-2 mb-0.5 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-xs font-semibold text-default-900 truncate">
                                        {msg.user.name}
                                    </span>
                                    <span
                                        className="t-mini tracking-wide text-muted font-normal shrink-0"
                                        title={formatAbsoluteTime(msg.time)}
                                    >
                                        {formatRelativeTime(msg.time)}
                                    </span>
                                </div>
                                <div className={bubbleClass}>
                                    <p className="text-sm leading-snug line-clamp-2 text-default-700">
                                        {msg.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </Card.Content>
        </Card>
    );
}
