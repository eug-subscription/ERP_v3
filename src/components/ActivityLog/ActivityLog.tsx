import { Alert, Button, Card, ScrollShadow, Skeleton } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useActivityLog } from '../../hooks/useActivityLog';
import {
    ACTIVITY_LOG_SCROLL_HEIGHT,
    CARD_HEADER,
    ICON_CONTAINER_LG,
    ICON_SIZE_CONTAINER,
    TEXT_SECTION_TITLE,
} from '../../constants/ui-tokens';
import { ActivityLogEvent } from '../../types/activity-log';
import { ActivityEvent } from './ActivityEvent';
import { CommentComposer } from './CommentComposer';
import { formatDateGroupLabel } from '../../utils/format-time';



/** Extract the YYYY-MM-DD portion from an ISO timestamp string. */
function toDateKey(iso: string): string {
    return iso.slice(0, 10);
}

interface DateGroup {
    dateKey: string;
    label: string;
    events: ActivityLogEvent[];
}

/** Group a sorted-newest-first list of events into date buckets. */
function groupByDate(events: ActivityLogEvent[]): DateGroup[] {
    const map = new Map<string, ActivityLogEvent[]>();

    for (const event of events) {
        const key = toDateKey(event.timestamp);
        const bucket = map.get(key) ?? [];
        bucket.push(event);
        map.set(key, bucket);
    }

    return Array.from(map.entries())
        .sort(([a], [b]) => b.localeCompare(a)) // newest date first
        .map(([dateKey, groupEvents]) => ({
            dateKey,
            label: formatDateGroupLabel(dateKey),
            events: groupEvents,
        }));
}

interface ActivityLogProps {
    orderId: string;
}

export function ActivityLog({ orderId }: ActivityLogProps) {
    const { data: events, isLoading, isError, refetch } = useActivityLog(orderId);

    const handleCommentSubmit = (_comment: string) => {
        // UI-only placeholder — no persistence
    };

    const sorted = events
        ? [...events].sort(
            (a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        : [];

    const groups = groupByDate(sorted);

    if (isError) {
        return (
            <Card className="flex-1 min-w-0">
                <Card.Header className={CARD_HEADER}>
                    <div className="flex items-center gap-4">
                        <div className={ICON_CONTAINER_LG}>
                            <Icon icon="lucide:activity" className={ICON_SIZE_CONTAINER} />
                        </div>
                        <div className="flex-1">
                            <h2 className={TEXT_SECTION_TITLE}>Activity</h2>
                            <p className="text-xs text-default-400 font-medium">Order history and team comments</p>
                        </div>
                    </div>
                </Card.Header>
                <Card.Content className="py-6 px-4 space-y-3">
                    <Alert status="danger">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>Failed to load activity</Alert.Title>
                            <Alert.Description>Could not fetch activity log data.</Alert.Description>
                        </Alert.Content>
                    </Alert>
                    <Button
                        size="sm"
                        variant="secondary"
                        onPress={() => refetch()}
                        className="w-full"
                    >
                        Retry
                    </Button>
                </Card.Content>
            </Card>
        );
    }

    return (
        <Card className="flex-1 min-w-0">
            <Card.Header className={CARD_HEADER}>
                <div className="flex items-center gap-4">
                    <div className={ICON_CONTAINER_LG}>
                        <Icon icon="lucide:activity" className={ICON_SIZE_CONTAINER} />
                    </div>
                    <div className="flex-1">
                        <h2 className={TEXT_SECTION_TITLE}>Activity</h2>
                        <p className="text-xs text-default-400 font-medium">Order history and team comments</p>
                    </div>
                </div>
            </Card.Header>

            {/* Comment composer sits outside the scroll area */}
            <CommentComposer onSubmit={handleCommentSubmit} />

            <Card.Content className="p-0">
                {isLoading ? (
                    <div className="px-4 py-4 space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                                <div className="flex-1 space-y-1.5 pt-0.5">
                                    <Skeleton className="h-3 w-48 rounded" />
                                    <Skeleton className="h-2.5 w-64 rounded" />
                                </div>
                                <Skeleton className="h-2.5 w-14 rounded shrink-0" />
                            </div>
                        ))}
                    </div>
                ) : groups.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                        <p className="text-sm text-default-400">No activity yet</p>
                    </div>
                ) : (
                    <ScrollShadow hideScrollBar className={`${ACTIVITY_LOG_SCROLL_HEIGHT} px-4 py-4`}>
                        <div>
                            {groups.map((group, groupIdx) => (
                                <div key={group.dateKey}>
                                    {/* Date separator — Option A: hairlines flanking a muted centered label */}
                                    <div className="flex gap-3">
                                        <div className="relative shrink-0 w-8 flex justify-center self-stretch">
                                            <div className="absolute top-0 bottom-0 w-0.5 bg-separator" />
                                        </div>
                                        <div className="flex flex-1 items-center gap-2 py-3">
                                            <div className="flex-1 h-px bg-separator" />
                                            <span className="text-xs font-medium text-default-400 whitespace-nowrap">
                                                {group.label}
                                            </span>
                                            <div className="flex-1 h-px bg-separator" />
                                        </div>
                                    </div>

                                    {/* Events for this date */}
                                    <div>
                                        {group.events.map((event, idx) => {
                                            const isGlobalLast =
                                                groupIdx === groups.length - 1 &&
                                                idx === group.events.length - 1;
                                            return (
                                                <ActivityEvent
                                                    key={event.id}
                                                    event={event}
                                                    isLast={isGlobalLast}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollShadow>
                )}
            </Card.Content>
        </Card>
    );
}
