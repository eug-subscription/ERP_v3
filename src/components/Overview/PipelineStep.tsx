import { Icon } from '@iconify/react';
import { BlockStatus, SubStatusSegment } from '../../types/workflow';

interface PipelineStepProps {
    label: string;
    status: BlockStatus;
    subStatus?: SubStatusSegment[];
    nextStatus?: BlockStatus;
    isFirst: boolean;
    isLast: boolean;
    index?: number;
}

export function PipelineStep({
    label,
    status,
    subStatus,
    nextStatus,
    isFirst,
    isLast,
    index = 0,
}: PipelineStepProps) {
    const isActive = status === 'ACTIVE';
    const isCompleted = status === 'COMPLETED';
    const isNextActive = nextStatus === 'ACTIVE';

    // Track colors: green between completed steps, accent leading into/out of active
    const upperColor = isActive ? 'bg-accent' : isCompleted ? 'bg-success' : 'bg-default';
    const lowerColor = isNextActive ? 'bg-accent' : isCompleted ? 'bg-success' : 'bg-default';

    return (
        <div
            className={`relative flex w-full animate-fade-slide-up motion-reduce:animate-none`}
            style={{ animationDelay: `${index * 40}ms` }}
        >
            {/* Timeline spine — split upper + lower tracks with mask behind dot */}
            <div className="flex flex-col items-center w-6 shrink-0 relative mr-2.5 -my-0.5">
                {/* Tracks */}
                <div className="absolute inset-0 flex justify-center">
                    <div className="flex flex-col h-full items-center">
                        {/* Upper segment */}
                        {!isFirst && (
                            <div className={`w-[2px] h-3 ${upperColor}`} />
                        )}
                        {/* Lower segment */}
                        {!isLast && (
                            <div className={`flex-1 w-[2px] ${isFirst ? 'mt-5' : ''} ${lowerColor}`} />
                        )}
                    </div>
                </div>

                {/* Dot / Icon — surface mask blocks spine behind it */}
                <div className="relative flex items-center justify-center size-5 shrink-0 z-10 mt-[3px]">
                    <div className="absolute z-10 bg-surface rounded-full size-4" />
                    <div className="relative z-20 flex items-center justify-center">
                        {isActive ? (
                            <>
                                <div className="absolute inset-[-4px] bg-accent/15 rounded-full blur-sm animate-pulse" />
                                <Icon icon="lucide:circle-dot" className="size-5 text-accent" />
                            </>
                        ) : isCompleted ? (
                            <Icon icon="lucide:check-circle-2" className="size-5 text-success" />
                        ) : (
                            <Icon icon="lucide:circle" className="size-4 text-muted" />
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className={`flex-1 flex flex-col justify-center min-w-0 ${isActive ? 'pb-3 pt-0.5' : 'pb-2 pt-0.5'}`}>
                <span
                    className={`text-sm truncate ${isActive
                        ? 'text-default-900 font-semibold'
                        : isCompleted
                            ? 'text-default-700 font-medium'
                            : 'text-muted font-medium'
                        }`}
                >
                    {label}
                </span>

                {isActive && subStatus && (
                    <div className="mt-1.5 px-3 py-2 bg-accent/5 border border-accent/10 rounded-lg">
                        <p className="text-xs leading-relaxed text-default-700">
                            {subStatus.map((seg, i) =>
                                seg.type === 'mention' ? (
                                    <span key={i} className="text-accent font-medium">{seg.value}</span>
                                ) : (
                                    <span key={i}>{seg.value}</span>
                                )
                            )}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
