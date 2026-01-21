import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button, Tooltip } from '@heroui/react';
import { ProjectWorkflowConfig, WorkflowBlock, WorkflowBranch, OrderWorkflowInstance, OrderBlockProgress, ValidationResult, ValidationError } from '../../../types/workflow';
import { getBlockIcon, WORKFLOW_LAYOUT } from '../../../data/workflow-constants';

interface WorkflowPreviewProps {
    config: ProjectWorkflowConfig | null;
    instance?: OrderWorkflowInstance | null;
    validation?: ValidationResult;
}

/**
 * WorkflowPreview Component
 * A visual, live-updating diagram of the active project workflow.
 * 
 * ULTRATHINK:
 * - Dynamic SVG Connectors: Uses calculated paths between blocks to show flow.
 * - CSS Animations: Replaces Framer Motion with Tailwind v4 + standard CSS for performance.
 * - Visual Semanticity: Uses branch-specific colors (Photo=Blue, Video=Purple, Shared=Neutral).
 */
export function WorkflowPreview({ config, instance, validation }: WorkflowPreviewProps) {
    if (!config) {
        return <WorkflowPreviewPlaceholder />;
    }

    // --- Global Flow Logic ---
    let globalHotBranchIndex = -1;
    let globalHotBlockIndex = -1;
    let isTransitioningToNextBranch = false;

    for (let i = 0; i < config.branches.length; i++) {
        const branch = config.branches[i];
        const lastCompletedIndex = [...branch.blocks].reverse().findIndex(b => instance?.blockProgress[b.id]?.status === 'COMPLETED');
        const isBranchFullyCompleted = branch.blocks.every(b => instance?.blockProgress[b.id]?.status === 'COMPLETED');

        if (!isBranchFullyCompleted) {
            globalHotBranchIndex = i;
            globalHotBlockIndex = lastCompletedIndex === -1 ? 0 : branch.blocks.length - 1 - lastCompletedIndex;
            break;
        } else if (i < config.branches.length - 1) {
            // Check if we are pulsing TOWARDS the next branch
            const nextBranch = config.branches[i + 1];
            const nextFirstBlockStarted = instance?.blockProgress[nextBranch.blocks[0].id]?.status !== 'PENDING';
            if (!nextFirstBlockStarted) {
                globalHotBranchIndex = i;
                isTransitioningToNextBranch = true;
                break;
            }
        }
    }

    return (
        <div className="relative w-full h-full min-h-[800px] p-8 pb-32 overflow-auto scrollbar-hide">
            <div className="flex flex-col gap-32">
                {config.branches.map((branch, branchIndex) => (
                    <BranchFlow
                        key={branch.id}
                        branch={branch}
                        instance={instance}
                        isLast={branchIndex === config.branches.length - 1}
                        hotBlockIndex={branchIndex === globalHotBranchIndex && !isTransitioningToNextBranch ? globalHotBlockIndex : -1}
                        isHotBranchLink={branchIndex === globalHotBranchIndex && isTransitioningToNextBranch}
                        validationErrors={validation?.errors}
                    />
                ))}
            </div>

            {/* Visual Legend */}
            <div className="sticky bottom-0 mt-20 flex items-center justify-center gap-8 bg-background/60 backdrop-blur-xl border border-separator/20 p-5 rounded-3xl shadow-2xl z-40 max-w-fit mx-auto animate-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-3 group">
                    <div className="w-5 h-5 rounded-lg bg-background border-2 border-accent shadow-[0_0_15px_rgba(var(--heroui-primary-rgb),0.4)] transition-transform group-hover:scale-110" />
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Enabled</span>
                        <span className="text-[9px] text-muted-foreground font-medium">Included in workflow</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-separator/20" />
                <div className="flex items-center gap-3 group">
                    <div className="w-5 h-5 rounded-lg border-2 border-dashed border-separator/30 bg-secondary/10 opacity-40 transition-transform group-hover:scale-110" />
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-widest opacity-40">Disabled</span>
                        <span className="text-[9px] text-muted-foreground font-medium">Available but inactive</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-separator/20" />
                <div className="flex items-center gap-3 group">
                    <div className="relative w-8 h-1 bg-accent/30 rounded-full shadow-[0_0_10px_rgba(var(--heroui-primary-rgb),0.3)] overflow-hidden">
                        <div className="absolute inset-0 bg-accent animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-widest text-accent">Active Flow</span>
                        <span className="text-[9px] text-muted-foreground font-medium">Current processing path</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BranchFlow({ branch, instance, isLast, hotBlockIndex, isHotBranchLink, validationErrors }: {
    branch: WorkflowBranch;
    instance?: OrderWorkflowInstance | null;
    isLast: boolean;
    hotBlockIndex: number;
    isHotBranchLink: boolean;
    validationErrors?: ValidationError[];
}) {
    const isAllDisabled = branch.blocks.every(b => !b.isEnabled);
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldCollapse = isAllDisabled && !isExpanded;

    const isPhoto = branch.type === 'PHOTO';
    const isVideo = branch.type === 'VIDEO';
    const accentColor = isPhoto ? 'bg-blue-500' : isVideo ? 'bg-purple-500' : 'bg-accent';
    const textColor = isPhoto ? 'text-blue-500' : isVideo ? 'text-purple-500' : 'text-accent';

    const isBranchFullyCompleted = branch.blocks.every(b => instance?.blockProgress[b.id]?.status === 'COMPLETED');

    return (
        <div className={`relative space-y-10 animate-fadeIn transition-all duration-500 ${shouldCollapse ? 'opacity-60' : ''}`}>
            {/* Stage Title / Collapsed Placeholder */}
            {shouldCollapse ? (
                <Button
                    variant="ghost"
                    className="group flex h-auto items-center justify-between w-full max-w-[512px] p-4 rounded-2xl border border-dashed border-separator/30 bg-secondary/5 hover:bg-secondary/10 transition-all duration-300 whitespace-normal text-left"
                    onPress={() => setIsExpanded(true)}
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${accentColor}/10 ${textColor} border border-current opacity-40`}>
                            <Icon
                                icon={isPhoto ? 'lucide:camera' : isVideo ? 'lucide:clapperboard' : 'lucide:git-branch'}
                                className="w-5 h-5"
                            />
                        </div>
                        <div className="flex-1 flex flex-col">
                            <h4 className="text-[14px] font-bold uppercase tracking-wider opacity-60">
                                {branch.name}
                            </h4>
                            <span className="text-[10px] text-muted-foreground font-medium italic">
                                {branch.blocks.length} blocks available but inactive
                            </span>
                        </div>
                    </div>
                    <div className="p-2 rounded-xl opacity-40 group-hover:opacity-100 transition-opacity">
                        <Icon icon="lucide:chevron-down" className="w-4 h-4" />
                    </div>
                </Button>
            ) : (
                <div className="flex items-center justify-between max-w-[512px]">
                    <div className="flex items-center gap-3 ml-2 relative z-20">
                        <div className={`p-1.5 rounded-xl ${accentColor}/10 ${textColor} border border-current opacity-20`}>
                            <Icon
                                icon={isPhoto ? 'lucide:camera' : isVideo ? 'lucide:clapperboard' : 'lucide:git-branch'}
                                className="w-4 h-4"
                            />
                        </div>
                        <h4 className="text-[12px] font-black uppercase tracking-[0.25em] opacity-40">
                            {branch.name}
                        </h4>
                        {isAllDisabled && isExpanded && (
                            <span className="text-[10px] text-muted-foreground font-medium italic opacity-40 ml-2">
                                (Showing disabled blocks)
                            </span>
                        )}
                    </div>
                    {isAllDisabled && isExpanded && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-[10px] font-bold uppercase tracking-wider opacity-40 hover:opacity-100 h-7"
                            onPress={() => setIsExpanded(false)}
                        >
                            Collapse
                        </Button>
                    )}
                </div>
            )}

            {/* Stage Blocks */}
            {!shouldCollapse && (
                <div className="flex flex-wrap gap-y-16 relative w-fit max-w-[512px] animate-in fade-in slide-in-from-top-4 duration-500">
                    {branch.blocks.map((block, index) => {
                        const isEven = index % 2 === 0;
                        const isNextExist = index < branch.blocks.length - 1;
                        const isHot = index === hotBlockIndex;

                        return (
                            <div key={block.id} className="flex items-center w-[256px] relative min-h-[64px]">
                                <WorkflowNode
                                    block={block}
                                    branchType={branch.type}
                                    progress={instance?.blockProgress[block.id]}
                                    errors={validationErrors?.filter(e => e.blockId === block.id)}
                                />

                                {/* Horizontal Pulse Line */}
                                {isEven && isNextExist && (
                                    <div
                                        className="absolute z-0 h-px items-center flex"
                                        style={{
                                            left: `${WORKFLOW_LAYOUT.NODE_WIDTH}px`,
                                            width: `${WORKFLOW_LAYOUT.CONNECTOR_WIDTH}px`
                                        }}
                                    >
                                        <ConnectorLine
                                            direction="HORIZONTAL"
                                            isActive={block.isEnabled && branch.blocks[index + 1].isEnabled}
                                            isFlowing={isHot}
                                        />
                                    </div>
                                )}

                                {/* Row Wrap Pulse Line */}
                                {!isEven && isNextExist && (
                                    <div
                                        className="absolute z-0"
                                        style={{
                                            bottom: `-${WORKFLOW_LAYOUT.ROW_GAP}px`,
                                            left: `${WORKFLOW_LAYOUT.NODE_CENTER_X}px`,
                                            width: `${WORKFLOW_LAYOUT.BLOCK_WIDTH}px`,
                                            height: `${WORKFLOW_LAYOUT.ROW_GAP}px`
                                        }}
                                    >
                                        <ConnectorLine
                                            direction="WRAP"
                                            isActive={block.isEnabled && branch.blocks[index + 1].isEnabled}
                                            isFlowing={isHot}
                                        />
                                    </div>
                                )}

                                {/* Inter-Stage Bridge (Only from the VERY last block) */}
                                {!isLast && !isNextExist && (
                                    <div
                                        className="absolute z-0 left-0"
                                        style={{
                                            bottom: `-${WORKFLOW_LAYOUT.BRIDGE_HEIGHT}px`,
                                            height: `${WORKFLOW_LAYOUT.BRIDGE_HEIGHT}px`,
                                            width: `${WORKFLOW_LAYOUT.BLOCK_WIDTH}px`
                                        }}
                                    >
                                        <ConnectorLine
                                            direction="BRANCH_LINK"
                                            isActive={isBranchFullyCompleted}
                                            isFlowing={isHotBranchLink}
                                            exitPosition={isEven ? 'LEFT' : 'RIGHT'}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function ConnectorLine({ direction, isActive, isFlowing, exitPosition }: {
    direction: 'HORIZONTAL' | 'VERTICAL' | 'WRAP' | 'BRANCH_LINK',
    isActive: boolean,
    isFlowing: boolean,
    exitPosition?: 'LEFT' | 'RIGHT'
}) {
    if (direction === 'HORIZONTAL') {
        const path = `M 0 8 L ${WORKFLOW_LAYOUT.CONNECTOR_WIDTH} 8`;
        return (
            <svg className="w-8 h-4 overflow-visible pointer-events-none">
                <path
                    d={path}
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    className={`transition-all duration-500 ${isActive ? 'text-accent opacity-40 shadow-glow' : 'text-separator opacity-10 stroke-dashed'}`}
                    strokeDasharray={isActive ? "0" : "6 6"}
                />
                {isFlowing && (
                    <circle r="4" fill="currentColor" className="text-accent shadow-[0_0_12px_currentColor]">
                        <animateMotion
                            dur="1.2s"
                            repeatCount="indefinite"
                            path={path}
                        />
                    </circle>
                )}
            </svg>
        );
    }

    if (direction === 'WRAP') {
        const path = `M 0 0 C 0 ${WORKFLOW_LAYOUT.ROW_GAP * 0.625}, -${WORKFLOW_LAYOUT.BLOCK_WIDTH} ${WORKFLOW_LAYOUT.ROW_GAP * 0.375}, -${WORKFLOW_LAYOUT.BLOCK_WIDTH} ${WORKFLOW_LAYOUT.ROW_GAP}`;
        return (
            <svg className="w-full h-full overflow-visible pointer-events-none">
                <path
                    d={path}
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    className={`transition-all duration-500 ${isActive ? 'text-accent opacity-40 shadow-glow' : 'text-separator opacity-10 stroke-dashed'}`}
                    strokeDasharray={isActive ? "0" : "6 6"}
                />
                {isFlowing && (
                    <circle r="4.5" fill="currentColor" className="text-accent shadow-[0_0_14px_currentColor]">
                        <animateMotion
                            dur="2.5s"
                            repeatCount="indefinite"
                            path={path}
                        />
                    </circle>
                )}
            </svg>
        );
    }

    if (direction === 'BRANCH_LINK') {
        // Precise Stage Bridge curve
        // Start center of last block (NODE_CENTER_X, 0)
        // Target is next branch first block top-center
        const targetX = exitPosition === 'LEFT' ? WORKFLOW_LAYOUT.NODE_CENTER_X : WORKFLOW_LAYOUT.NODE_CENTER_X - WORKFLOW_LAYOUT.BLOCK_WIDTH;
        const path = `M ${WORKFLOW_LAYOUT.NODE_CENTER_X} 0 C ${WORKFLOW_LAYOUT.NODE_CENTER_X} ${WORKFLOW_LAYOUT.BRIDGE_HEIGHT * 0.6}, ${targetX} ${WORKFLOW_LAYOUT.BRIDGE_HEIGHT * 0.6}, ${targetX} ${WORKFLOW_LAYOUT.BRIDGE_HEIGHT}`;

        return (
            <svg className="w-full h-full overflow-visible pointer-events-none">
                <path
                    d={path}
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    className={`transition-all duration-500 ${isActive ? 'text-accent opacity-30 shadow-glow' : 'text-separator opacity-10 stroke-dashed'}`}
                    strokeDasharray={isActive ? "0" : "6 6"}
                />
                {isFlowing && (
                    <circle r="5" fill="currentColor" className="text-accent shadow-[0_0_15px_currentColor]">
                        <animateMotion
                            dur="3.5s"
                            repeatCount="indefinite"
                            path={path}
                        />
                    </circle>
                )}
            </svg>
        );
    }

    return null;
}

function WorkflowNode({ block, branchType, progress, errors }: {
    block: WorkflowBlock;
    branchType: string;
    progress?: OrderBlockProgress;
    errors?: ValidationError[];
}) {
    const isEnabled = block.isEnabled;
    const isPhoto = branchType === 'PHOTO';
    const isVideo = branchType === 'VIDEO';
    const accentColorClass = isPhoto ? 'text-blue-500' : isVideo ? 'text-purple-500' : 'text-accent';
    const glowColorClass = isPhoto ? 'shadow-blue-500/10' : isVideo ? 'shadow-purple-500/10' : 'shadow-accent/10';

    const status = progress?.status || 'PENDING';
    const isCompleted = status === 'COMPLETED';
    const isActive = status === 'ACTIVE';

    const hasErrors = errors && errors.some(e => e.level === 'ERROR');
    const hasWarnings = errors && errors.some(e => e.level === 'WARNING');
    const borderClass = hasErrors ? 'border-danger ring-2 ring-danger/20' : hasWarnings ? 'border-warning ring-2 ring-warning/20' : 'border-separator/40';

    return (
        <div className="relative flex items-center transition-all duration-500 group z-10 h-full">
            <div
                className={`w-[224px] p-2.5 rounded-xl border transition-all duration-300 ${isEnabled
                    ? `bg-background ${borderClass} shadow-lg ${glowColorClass}`
                    : 'bg-secondary/5 border-dashed border-separator/20 opacity-40 grayscale'
                    } ${isCompleted ? 'ring-2 ring-success/20' : ''} ${isActive ? 'ring-2 ring-accent/30 animate-pulse-subtle' : ''}`}
            >
                <div className="flex items-center gap-3">
                    {/* Leading Icon */}
                    <div className={`p-2 rounded-xl shrink-0 ${isEnabled ? accentColorClass + ' bg-accent/5' : 'bg-secondary/10 text-muted-foreground'}`}>
                        <Icon icon={getBlockIcon(block.type)} className="w-5 h-5" />
                    </div>

                    {/* Title & Subtitle Stack */}
                    <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center justify-between gap-1.5">
                            <div className={`text-[13px] font-bold truncate leading-tight ${isEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {block.label}
                            </div>

                            {/* Badges on right side */}
                            {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" title="Live" />
                            )}
                            {isCompleted && (
                                <Icon icon="lucide:check" className="w-3.5 h-3.5 text-success shrink-0" />
                            )}
                        </div>
                        <div className="text-[9px] font-bold tracking-wider uppercase opacity-40 truncate">
                            {block.category}
                        </div>
                    </div>

                    {/* Validation Warnings Indicators */}
                    {(hasErrors || hasWarnings) && (
                        <div className="absolute -left-1.5 -top-1.5 z-30">
                            <Tooltip>
                                <Tooltip.Trigger>
                                    <Button
                                        variant="ghost"
                                        className={`p-0 w-6 h-6 min-w-0 rounded-full shadow-lg ${hasErrors ? 'bg-danger text-white animate-pulse' : 'bg-warning text-black'}`}
                                    >
                                        <Icon
                                            icon={hasErrors ? "lucide:alert-circle" : "lucide:alert-triangle"}
                                            className="w-3.5 h-3.5"
                                        />
                                    </Button>
                                </Tooltip.Trigger>
                                <Tooltip.Content className="p-2 max-w-[200px]">
                                    <Tooltip.Arrow />
                                    <div className="space-y-1.5">
                                        {errors?.map((error, i) => (
                                            <div key={i} className="flex gap-2">
                                                <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${error.level === 'ERROR' ? 'bg-danger' : 'bg-warning'}`} />
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[11px] font-bold leading-tight">{error.message}</span>
                                                    {error.suggestion && (
                                                        <span className="text-[10px] opacity-70 italic">{error.suggestion}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Tooltip.Content>
                            </Tooltip>
                        </div>
                    )}

                    {/* Meta indicators */}
                    {progress?.batches && (
                        <div className="absolute -top-2 -right-2 bg-background border border-separator/30 px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                            <Icon icon="lucide:files" className="w-2.5 h-2.5 text-muted-foreground" />
                            <span className="text-[8px] font-bold">{progress.batches.length}</span>
                        </div>
                    )}
                </div>

                {/* Optional Status Snippet (Sub-status) */}
                {progress?.subStatus && status !== 'PENDING' && (
                    <div className="mt-2 pt-1.5 border-t border-separator/10 flex items-center gap-1 overflow-hidden">
                        <Icon icon="lucide:info" className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                        <span className="text-[9px] text-muted-foreground truncate">{progress.subStatus}</span>
                    </div>
                )}
            </div>

            {/* Conditional Indicators Overlay */}
            {block.type === 'IF_ELSE' && isEnabled && (
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                    <div className="text-[7px] font-black text-success uppercase bg-success/10 border border-success/20 px-1 rounded shadow-sm">Yes</div>
                    <div className="text-[7px] font-black text-danger uppercase bg-danger/10 border border-danger/20 px-1 rounded shadow-sm">No</div>
                </div>
            )}
        </div>
    );
}

function WorkflowPreviewPlaceholder() {
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-4 rounded-2xl p-12">
            <div className="relative animate-fadeIn">
                <div className="p-6 rounded-3xl bg-secondary/10 text-secondary-foreground animate-pulse">
                    <Icon icon="lucide:layout-template" className="w-16 h-16 opacity-20" />
                </div>
                <Icon icon="lucide:sparkles" className="absolute -top-2 -right-2 w-8 h-8 text-accent animate-bounce" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
                    Awaiting Neural Synthesis
                </h3>
                <p className="text-muted-foreground max-w-xs text-sm">
                    Select a production template to initialize the visual flow engine.
                </p>
            </div>
        </div>
    );
}
