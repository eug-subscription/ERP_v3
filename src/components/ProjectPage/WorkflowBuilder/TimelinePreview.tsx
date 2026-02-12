import { Icon } from '@iconify/react';
import { cn, Tooltip } from '@heroui/react';
import { TIMELINE_ICON_SIZES, TIMELINE_SIZES, BRANCH_LABELS } from '../../../constants/timeline';

interface TimelinePreviewStep {
    blockId: string;
    label: string;
    visible: boolean;
    branchId: 'main' | 'photo' | 'video';
    description: string;
}

interface TimelinePreviewProps {
    steps: TimelinePreviewStep[];
}

interface Segment {
    type: 'steps' | 'branch-header';
    branchId?: 'photo' | 'video';
    steps?: TimelinePreviewStep[];
}

/**
 * Timeline preview component displaying visible steps in a vertical timeline.
 * Shows a live preview of what the selected audience will see.
 * Groups steps by branch with section headers for photo/video branches.
 */
export function TimelinePreview({ steps }: TimelinePreviewProps) {
    // Filter to only visible steps
    const visibleSteps = steps.filter((step) => step.visible);

    // Empty state
    if (visibleSteps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className={cn("rounded-full bg-default-100 flex items-center justify-center mb-3", TIMELINE_SIZES.EMPTY_STATE_ICON)}>
                    <Icon
                        icon="lucide:eye-off"
                        width={TIMELINE_ICON_SIZES.MD}
                        className="text-muted"
                    />
                </div>
                <p className="text-sm text-muted text-center">
                    No steps visible for this audience
                </p>
            </div>
        );
    }

    // Group steps into segments by branch

    const segments: Segment[] = [];
    let currentBranch: 'main' | 'photo' | 'video' | null = null;
    let currentSteps: TimelinePreviewStep[] = [];

    for (const step of visibleSteps) {
        // Detect branch transition
        if (step.branchId !== currentBranch) {
            // Flush current steps if any
            if (currentSteps.length > 0) {
                segments.push({ type: 'steps', steps: currentSteps });
                currentSteps = [];
            }

            // Add branch header if entering photo/video branch
            if (step.branchId === 'photo' || step.branchId === 'video') {
                segments.push({ type: 'branch-header', branchId: step.branchId });
            }

            currentBranch = step.branchId;
        }

        currentSteps.push(step);
    }

    // Flush remaining steps
    if (currentSteps.length > 0) {
        segments.push({ type: 'steps', steps: currentSteps });
    }

    // Render segments
    let globalIndex = 0;

    return (
        <div className="relative py-2">
            <div className="space-y-4">
                {segments.map((segment) => {
                    if (segment.type === 'branch-header' && segment.branchId) {
                        const branchInfo = BRANCH_LABELS[segment.branchId];
                        return (
                            <div key={`header-${segment.branchId}`} className="relative flex items-start gap-3">
                                {/* Timeline Line Container */}
                                <div className="relative flex flex-col items-center shrink-0">
                                    {/* Connecting line before header */}
                                    <div
                                        className="absolute bottom-[50%] w-[2px] h-[calc(50%+0.5rem)] bg-gradient-to-b from-accent/60 to-accent/30"
                                        style={{
                                            top: 'calc(-0.5rem - 50%)',
                                        }}
                                    />

                                    {/* Branch header indicator */}
                                    <div className="relative z-10">
                                        <div className={cn("relative rounded-full bg-default-100 border-2 border-default-200 flex items-center justify-center", TIMELINE_SIZES.TIMELINE_DOT_OUTER)}>
                                            <Icon icon={branchInfo.icon} width={TIMELINE_ICON_SIZES.XS} className="text-default-400" />
                                        </div>
                                    </div>

                                    {/* Connecting line after header */}
                                    <div
                                        className="absolute top-[50%] w-[2px] h-[calc(50%+0.5rem)] bg-gradient-to-b from-accent/30 to-accent/60"
                                        style={{
                                            bottom: 'calc(-0.5rem - 50%)',
                                        }}
                                    />
                                </div>

                                {/* Branch Label */}
                                <div className="flex-1 pt-0.5 text-xs font-semibold uppercase tracking-wider text-default-400">
                                    {branchInfo.label}
                                </div>
                            </div>
                        );
                    }

                    // Render steps segment
                    if (segment.type === 'steps' && segment.steps) {
                        return segment.steps.map((step) => {
                            const isFirst = globalIndex === 0;
                            const isLast = globalIndex === visibleSteps.length - 1;
                            const isBranched = step.branchId !== 'main';
                            globalIndex++;

                            return (
                                <div key={step.blockId} className="relative flex items-start gap-3 group">
                                    {/* Timeline Line Container */}
                                    <div className="relative flex flex-col items-center shrink-0">
                                        {/* Line Before (if not first) */}
                                        {!isFirst && (
                                            <div
                                                className="absolute bottom-[50%] w-[2px] h-[calc(50%+0.5rem)] bg-gradient-to-b from-accent/60 to-accent/30"
                                                style={{
                                                    top: 'calc(-0.5rem - 50%)',
                                                }}
                                            />
                                        )}

                                        {/* Timeline Dot */}
                                        <div className="relative z-10">
                                            {/* Hover glow effect */}
                                            <div className="absolute inset-0 bg-accent/20 rounded-full blur-md scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {/* Outer ring */}
                                            <div className={cn("relative rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center", TIMELINE_SIZES.TIMELINE_DOT_OUTER)}>
                                                {/* Inner dot */}
                                                <div className={cn("rounded-full bg-accent", TIMELINE_SIZES.TIMELINE_DOT_INNER)} />
                                            </div>
                                        </div>

                                        {/* Line After (if not last) */}
                                        {!isLast && (
                                            <div
                                                className="absolute top-[50%] w-[2px] h-[calc(50%+0.5rem)] bg-gradient-to-b from-accent/30 to-accent/60"
                                                style={{
                                                    bottom: 'calc(-0.5rem - 50%)',
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Step Label and Description */}
                                    <div
                                        className={cn(
                                            "flex-1 pt-0.5 flex flex-col gap-1 transition-all duration-200",
                                            isBranched && "ml-4"
                                        )}
                                    >
                                        <div className="text-sm text-foreground/80 group-hover:text-foreground">
                                            {step.label}
                                        </div>
                                        {step.description && (
                                            <Tooltip delay={400}>
                                                <Tooltip.Trigger className="text-left">
                                                    <div className="text-xs text-default-400 line-clamp-1">
                                                        {step.description}
                                                    </div>
                                                </Tooltip.Trigger>
                                                <Tooltip.Content>
                                                    <p className="max-w-xs">{step.description}</p>
                                                </Tooltip.Content>
                                            </Tooltip>
                                        )}
                                        <div className="text-xs text-default-300 font-mono">
                                            12:00 UTC • Jan 1, 2024
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    }

                    return null;
                })}
            </div>
        </div>
    );
}
