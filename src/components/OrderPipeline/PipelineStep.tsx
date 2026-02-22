import { Card, Disclosure } from '@heroui/react';
import { Icon } from '@iconify/react';
import { BlockStatus, SubStatusSegment } from '../../types/workflow';
import { formatRelativeTime, formatAbsoluteTime } from '../../utils/format-time';
import { PIPELINE_DOT_OFFSET, PIPELINE_LINE_WIDTH, PIPELINE_TRACK_HEIGHT, PIPELINE_TRACK_MARGIN } from '../../constants/ui-tokens';

interface PipelineStepProps {
    label: string;
    status: BlockStatus;
    subStatus?: SubStatusSegment[];
    completedAt?: string;
    nextStatus?: BlockStatus;
    prevStatus?: BlockStatus;
    isFirst: boolean;
    isLast: boolean;
    /** 0 (default) = main spine level, 1 = indented child step with smaller dot. */
    depth?: number;
}

const STATUS_CONFIG: Record<BlockStatus, { icon: string; color: string; pulse: boolean }> = {
    COMPLETED: { icon: 'lucide:check-circle-2', color: 'text-success', pulse: false },
    ACTIVE: { icon: 'lucide:circle-dot', color: 'text-accent', pulse: true },
    PENDING: { icon: 'lucide:circle', color: 'text-muted', pulse: false },
    FAILED: { icon: 'lucide:x-circle', color: 'text-danger', pulse: false },
};

/** Resets Disclosure.Trigger's button defaults + adds layout & focus-visible styling. */
const DISCLOSURE_TRIGGER_RESET = [
    'flex flex-col items-start w-full gap-0',         // layout
    'p-0 bg-transparent border-none shadow-none',     // reset button defaults
    'hover:bg-transparent',                           // prevent hover flash
    'focus-visible:ring-2 focus-visible:ring-accent focus:outline-none rounded-lg',
    'group',
].join(' ');



export function PipelineStep({
    label,
    status,
    subStatus,
    completedAt,
    nextStatus,
    prevStatus,
    isFirst,
    isLast,
    depth = 0,
}: PipelineStepProps) {
    const isChild = depth > 0;
    const cfg = STATUS_CONFIG[status];

    const isActive = status === 'ACTIVE';
    const isNextActive = nextStatus === 'ACTIVE';

    // Semantic color logic:
    // A segment is blue if it connects into or out of an ACTIVE step.
    // The upper half is blue ONLY if the CURRENT step is ACTIVE.
    const isUpperBlue = isActive;

    // The lower half is blue ONLY if the NEXT step is ACTIVE.
    const isLowerBlue = isNextActive;

    // A segment is green if it connects two COMPLETED steps.
    const isUpperGreen = status === 'COMPLETED' && prevStatus === 'COMPLETED';
    const isLowerGreen = status === 'COMPLETED' && nextStatus === 'COMPLETED';
    const hasSubtitle = !!(completedAt && status === 'COMPLETED');
    const ts = hasSubtitle ? formatRelativeTime(completedAt!, 'short') : null;
    const tsAbsolute = hasSubtitle ? formatAbsoluteTime(completedAt!) : null;

    return (
        <div className={`relative transition-all duration-300 group flex w-full py-1 ${isActive ? 'z-10' : ''} ${status === 'PENDING' ? 'opacity-(--disabled-opacity)' : ''}`}>
            {/* Left chronology column */}
            <div className="flex flex-col items-start w-8 shrink-0 relative -my-2">
                {/* Single-layer tracks — each segment gets its final color directly (no overlay stacking) */}
                <div className="absolute inset-0 flex justify-center w-full">
                    <div className="flex flex-col h-full items-center">
                        {/* Upper track */}
                        {!isFirst && (
                            <div className={`${PIPELINE_LINE_WIDTH} ${PIPELINE_TRACK_HEIGHT} ${isUpperGreen ? 'bg-success'
                                : isUpperBlue ? 'bg-accent'
                                    : 'bg-default'
                                }`} />
                        )}
                        {/* Lower track */}
                        {!isLast && (
                            <div className={`flex-1 ${PIPELINE_LINE_WIDTH} ${isFirst ? PIPELINE_TRACK_MARGIN : ''} ${isLowerGreen ? 'bg-success'
                                : isLowerBlue ? 'bg-accent'
                                    : `bg-default ${status !== 'PENDING' && nextStatus === 'PENDING' ? 'opacity-(--disabled-opacity)' : ''}`
                                }`} />
                        )}
                    </div>
                </div>

                {/* 3. The Dot */}
                <div className={`relative flex items-center justify-center w-8 h-8 shrink-0 z-10 ${PIPELINE_DOT_OFFSET}`}>
                    {/* Glow — lives outside overflow-hidden so it is not clipped */}
                    {isActive && !isChild && (
                        <div className="absolute inset-x-[-8px] inset-y-[-8px] bg-accent/15 rounded-full blur-lg animate-pulse pointer-events-none" />
                    )}
                    {/* Inner mask to block the line from showing inside the icon */}
                    <div className={`absolute z-10 bg-surface rounded-full ${isChild ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    <div className="relative z-20 flex items-center justify-center w-full h-full">
                        <Icon
                            icon={cfg.icon}
                            className={`${isChild ? 'w-[18px] h-[18px]' : 'w-6 h-6'} ${cfg.color} ${cfg.pulse ? 'animate-pulse' : ''}`}
                        />
                    </div>
                </div>
            </div>

            {/* Right content column */}
            <Card variant={isActive ? 'default' : 'secondary'} className={`min-w-0 flex-1 transition-all duration-300 rounded-lg ${isChild ? 'ml-3 ' : ''}${isActive
                ? 'bg-accent/5 shadow-premium-sm border-accent/20'
                : 'shadow-sm hover:shadow-md'
                }`}>
                <Card.Content className="p-0">
                    <Disclosure className="w-full" defaultExpanded={isActive}>
                        <Disclosure.Heading>
                            <Disclosure.Trigger className={DISCLOSURE_TRIGGER_RESET}>
                                <div className="flex items-center gap-1.5 w-full">
                                    <span className={`text-sm tracking-tight transition-colors ${status === 'PENDING' ? 'text-muted font-medium' :
                                        isActive ? 'text-default-900 font-semibold' : 'text-default-700 font-medium'
                                        }`}>
                                        {label}
                                    </span>
                                    {subStatus && (
                                        <div className="text-default-300 group-hover:text-default-500 transition-colors ml-auto mr-2">
                                            <Disclosure.Indicator />
                                        </div>
                                    )}
                                </div>

                                {/* Always visible Timeline Date */}
                                {ts && (
                                    <div className="flex items-center gap-1.5 mt-1 opacity-80" title={tsAbsolute ?? undefined}>
                                        <span className="t-mini font-medium text-default-500 tracking-wider">
                                            {ts}
                                        </span>
                                    </div>
                                )}
                            </Disclosure.Trigger>
                        </Disclosure.Heading>

                        {subStatus && (
                            <Disclosure.Content>
                                <div className="pt-1">
                                    <p className={`text-xs leading-relaxed ${isActive ? 'text-accent font-medium' : 'text-muted'}`}>
                                        {subStatus.map((seg, i) =>
                                            seg.type === 'mention' ? (
                                                <span
                                                    key={i}
                                                    className="text-xs font-semibold text-accent cursor-pointer hover:underline"
                                                >
                                                    {seg.value}
                                                </span>
                                            ) : (
                                                <span key={i}>{seg.value}</span>
                                            )
                                        )}
                                    </p>
                                </div>
                            </Disclosure.Content>
                        )}
                    </Disclosure>
                </Card.Content>
            </Card>
        </div>
    );
}
