import { Avatar, Card, Skeleton } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link } from '@tanstack/react-router';
import { useActivityLog } from '../../hooks/useActivityLog';
import { formatRelativeTime, formatAbsoluteTime } from '../../utils/format-time';
import { TEXT_SECTION_LABEL, COMMENT_BUBBLE } from '../../constants/ui-tokens';
import type { ActivityLogEvent } from '../../types/activity-log';

/** Color-coded dot backgrounds per event type (mirrors ActivityEvent.tsx). */
const TYPE_DOT_COLOR: Record<ActivityLogEvent['type'], string> = {
    SYSTEM: 'bg-muted',
    STATUS_CHANGE: 'bg-accent',
    COMMENT: '',
    NOTIFICATION: 'bg-warning',
    ERROR: 'bg-danger',
    BATCH: 'bg-accent',
};

/** Icon per event type (mirrors ActivityEvent.tsx). */
const TYPE_ICON: Record<ActivityLogEvent['type'], string> = {
    SYSTEM: 'lucide:info',
    STATUS_CHANGE: 'lucide:refresh-cw',
    COMMENT: '',
    NOTIFICATION: 'lucide:bell',
    ERROR: 'lucide:alert-triangle',
    BATCH: 'lucide:layers',
};

const PREVIEW_COUNT = 5;

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/** Vertical connector line column — matches Timeline tab's LeftCol. */
function LeftCol({
    showLine,
    children,
}: {
    showLine: boolean;
    children?: React.ReactNode;
}) {
    return (
        <div className="relative shrink-0 w-8 flex justify-center self-stretch">
            {showLine && <div className="absolute top-0 bottom-0 w-0.5 bg-separator" />}
            {children && <div className="relative z-10 self-center">{children}</div>}
        </div>
    );
}

/** Dot or Avatar depending on event type — mirrors Timeline tab. */
function DotOrAvatar({ event }: { event: ActivityLogEvent }) {
    if (event.type === 'COMMENT' && event.actor) {
        return (
            <Avatar size="sm">
                {event.actor.avatar && (
                    <Avatar.Image src={event.actor.avatar} alt={event.actor.name} />
                )}
                <Avatar.Fallback>{getInitials(event.actor.name)}</Avatar.Fallback>
            </Avatar>
        );
    }
    return (
        <div
            className={`w-7 h-7 rounded-full ${TYPE_DOT_COLOR[event.type]} flex items-center justify-center`}
        >
            <Icon icon={TYPE_ICON[event.type]} className="w-3.5 h-3.5 text-white" />
        </div>
    );
}

interface ActivityFeedPreviewProps {
    orderId: string;
}

export function ActivityFeedPreview({ orderId }: ActivityFeedPreviewProps) {
    const { data, isLoading } = useActivityLog(orderId);

    const rawEvents = data ? [...data].reverse() : [];

    // Ensure at least one comment appears in the preview (if any exist)
    const events = (() => {
        if (!rawEvents.length) return [];

        let slice = rawEvents.slice(0, PREVIEW_COUNT);
        const hasComment = slice.some((e) => e.type === 'COMMENT');

        if (!hasComment) {
            const firstCommentIdx = rawEvents.findIndex((e) => e.type === 'COMMENT');
            if (firstCommentIdx !== -1) {
                slice = [rawEvents[firstCommentIdx], ...rawEvents.slice(0, PREVIEW_COUNT - 1)];
            }
        }

        return slice.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
    })();

    if (isLoading) {
        return (
            <Card className="h-full">
                <Card.Content className="p-5 space-y-4">
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="size-4 rounded" />
                        <Skeleton className="h-3 w-28 rounded" />
                    </div>
                    {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                            <div className="flex-1 space-y-1.5 pt-0.5">
                                <Skeleton className="h-3 w-48 rounded" />
                                <Skeleton className="h-2.5 w-64 rounded" />
                            </div>
                            <Skeleton className="h-2.5 w-14 rounded shrink-0" />
                        </div>
                    ))}
                </Card.Content>
            </Card>
        );
    }

    if (events.length === 0) {
        return (
            <Card className="h-full">
                <Card.Content className="p-5 flex flex-col items-center justify-center py-10">
                    <div className="size-12 rounded-full bg-default flex items-center justify-center mb-3">
                        <Icon icon="lucide:activity" className="size-5 text-muted" />
                    </div>
                    <p className="text-sm font-medium text-muted text-center">
                        No recent activity.
                    </p>
                </Card.Content>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <Card.Content className="p-5 flex-1 flex flex-col gap-4">
                {/* Header — icon + label + link */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Icon icon="lucide:activity" className="size-4 text-default-500" />
                        <h3 className={TEXT_SECTION_LABEL}>Recent Activity</h3>
                    </div>
                    <Link
                        to="/timeline"
                        className="text-xs text-default-400 hover:text-accent font-medium transition-colors shrink-0"
                    >
                        View Timeline
                    </Link>
                </div>

                {/* Timeline-style event list */}
                <div>
                    {events.map((event, idx) => {
                        const isComment = event.type === 'COMMENT' && event.actor;
                        const isLast = idx === events.length - 1;
                        const headline = isComment ? event.actor?.name : event.title;
                        const time = formatRelativeTime(event.timestamp, 'short');

                        return (
                            <div key={event.id}>
                                {/* Title row */}
                                <div className="flex items-center gap-3">
                                    <LeftCol showLine>
                                        <DotOrAvatar event={event} />
                                    </LeftCol>
                                    <div className="flex flex-1 items-center gap-3 min-w-0 py-2">
                                        <p className="flex-1 min-w-0 text-sm font-semibold text-default-800 truncate">
                                            {headline}
                                        </p>
                                        <span
                                            className="text-xs font-medium text-default-700 whitespace-nowrap shrink-0"
                                            title={formatAbsoluteTime(event.timestamp)}
                                        >
                                            {time}
                                        </span>
                                    </div>
                                </div>

                                {/* Description row */}
                                {event.description && (
                                    <div className="flex gap-3">
                                        <LeftCol showLine={!isLast} />
                                        <div className="flex-1 min-w-0 pb-1">
                                            {isComment ? (
                                                <div className={COMMENT_BUBBLE}>
                                                    <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                                                        {event.description}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted leading-relaxed">
                                                    {event.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Spacer row */}
                                {!isLast && (
                                    <div className="flex gap-3 h-3">
                                        <LeftCol showLine />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card.Content>
        </Card>
    );
}
