import { Avatar, Disclosure } from '@heroui/react';
import { Icon } from '@iconify/react';
import { COMMENT_BUBBLE } from '../../constants/ui-tokens';
import { ActivityLogEvent } from '../../types/activity-log';
import { formatRelativeTime } from '../../utils/format-time';

interface ActivityEventProps {
    event: ActivityLogEvent;
    isLast: boolean;
}

/** Dot background color keyed by event type (not used for COMMENT events). */
const TYPE_DOT_COLOR: Record<ActivityLogEvent['type'], string> = {
    SYSTEM: 'bg-muted',
    STATUS_CHANGE: 'bg-accent',
    COMMENT: '',
    NOTIFICATION: 'bg-warning',
    ERROR: 'bg-danger',
    BATCH: 'bg-accent',
};

/** Icon used inside the dot for non-comment events. */
const TYPE_ICON: Record<ActivityLogEvent['type'], string> = {
    SYSTEM: 'lucide:info',
    STATUS_CHANGE: 'lucide:refresh-cw',
    COMMENT: '',
    NOTIFICATION: 'lucide:bell',
    ERROR: 'lucide:alert-triangle',
    BATCH: 'lucide:layers',
};



function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/** Vertical connector line + optional dot/avatar.
 *  self-stretch ensures the column matches sibling row height so the
 *  absolute line spans the full row without gaps. */
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

function Timestamp({ time }: { time: string }) {
    return (
        <span className="text-xs font-medium text-default-700 whitespace-nowrap shrink-0">
            {time}
        </span>
    );
}

export function ActivityEvent({ event, isLast }: ActivityEventProps) {
    const isComment = event.type === 'COMMENT';
    const hasDescription = Boolean(event.description);
    const time = formatRelativeTime(event.timestamp, 'short');

    /**
     * Three-row layout per event:
     *
     *  ┌─ Title row (items-center, py-2.5) ─────────────────────────┐
     *  │  [left col: connector + dot/avatar (self-center)]           │
     *  │  [right: title text + timestamp]                            │
     *  └─────────────────────────────────────────────────────────────┘
     *  ┌─ Content row (only when description exists) ────────────────┐
     *  │  [left col: connector only]                                 │
     *  │  [right: description / comment bubble]                      │
     *  └─────────────────────────────────────────────────────────────┘
     *  ┌─ Spacer row (h-5, only when !isLast) ──────────────────────┐
     *  │  [left col: connector only — bridges gap to next event]     │
     *  └─────────────────────────────────────────────────────────────┘
     *
     *  py-2.5 on the title row is the key: it gives the row enough
     *  height that the dot (self-center within the left col) aligns
     *  exactly with the title text center, not the combined
     *  title+description block.
     */

    const titleRow = (titleContent: React.ReactNode) => (
        <div className="flex items-center gap-3">
            <LeftCol showLine>
                <DotOrAvatar event={event} />
            </LeftCol>
            <div className="flex flex-1 items-center gap-3 min-w-0 py-2.5">
                <div className="flex-1 min-w-0">{titleContent}</div>
                <Timestamp time={time} />
            </div>
        </div>
    );

    /** Spacer row — bridges the connector line gap between events. */
    const spacerRow = (height: string) =>
        !isLast && (
            <div className={`flex gap-3 ${height}`}>
                <LeftCol showLine />
            </div>
        );

    if (isComment) {
        // Derive a clean display name: prefer actor.name, fall back to event.title
        const displayName = event.actor?.name ?? event.title;

        return (
            <div>
                {titleRow(
                    <p className="text-sm font-semibold text-default-800">{displayName}</p>,
                )}
                {event.description && (
                    <div className="flex gap-3">
                        <LeftCol showLine />
                        <div className="flex-1 min-w-0 pb-1">
                            <div className={COMMENT_BUBBLE}>
                                <p className="text-sm text-foreground leading-relaxed">
                                    {event.description}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {spacerRow('h-3')}
            </div>
        );
    }

    if (hasDescription) {
        return (
            <Disclosure>
                <div>
                    {titleRow(
                        <Disclosure.Heading>
                            <Disclosure.Trigger className="group flex items-center gap-1 text-left p-0 bg-transparent border-none shadow-none hover:bg-transparent focus-visible:ring-0">
                                <span className="text-sm font-medium text-foreground leading-snug">
                                    {event.title}
                                </span>
                                <Disclosure.Indicator className="text-muted shrink-0 transition-transform duration-200 group-data-[expanded=true]:rotate-180">
                                    <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5" />
                                </Disclosure.Indicator>
                            </Disclosure.Trigger>
                        </Disclosure.Heading>,
                    )}
                    <div className="flex gap-3">
                        <LeftCol showLine={!isLast} />
                        <div className="flex-1 min-w-0">
                            <Disclosure.Content>
                                <p className="text-xs text-muted leading-relaxed pb-1">
                                    {event.description}
                                </p>
                            </Disclosure.Content>
                        </div>
                    </div>
                    {spacerRow('h-5')}
                </div>
            </Disclosure>
        );
    }

    /* Simple event — title only, no description */
    return (
        <div>
            {titleRow(
                <p className="text-sm font-medium text-foreground leading-snug">
                    {event.title}
                </p>,
            )}
            {spacerRow('h-5')}
        </div>
    );
}
