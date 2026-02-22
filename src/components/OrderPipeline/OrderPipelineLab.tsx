import { Card, Skeleton, Alert, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { DEFAULT_AUDIENCE_VISIBILITY } from '../../constants/timeline';
import { CARD_HEADER, ICON_CONTAINER_LG, ICON_SIZE_CONTAINER, JUNCTION_BRANCH_TOP, JUNCTION_BRANCH_WIDTH, JUNCTION_SPINE_SPLIT, PIPELINE_LAB_SIDEBAR_WIDTH, PIPELINE_LINE_HEIGHT, PIPELINE_LINE_WIDTH, TEXT_SECTION_TITLE } from '../../constants/ui-tokens';
import { WorkflowBlockType, BlockStatus } from '../../types/workflow';
import { useOrderWorkflow } from '../../hooks/useOrderWorkflow';
import { buildBlockMeta, buildFlatPipelineTree } from '../../utils/pipeline-resolver';
import { PipelineStep } from './PipelineStep';

/** Pre-build icon/label lookup map from BLOCK_LIBRARY for O(1) access. */
const BLOCK_META = buildBlockMeta();

/** Blocks hidden for the ops audience. */
const OPS_HIDDEN_TYPES = new Set<WorkflowBlockType>(
    (Object.entries(DEFAULT_AUDIENCE_VISIBILITY) as [WorkflowBlockType, Record<string, boolean>][])
        .filter(([, vis]) => vis['ops'] === false)
        .map(([type]) => type)
);

interface OrderPipelineLabProps {
    orderId: string;
}

/**
 * OrderPipelineLab — Linear spine pipeline renderer with indented sub-steps.
 *
 * All steps live on a single continuous spine. When parallel lanes exist
 * (Photo + Video), they are flattened into:
 *   - A group header step (depth 0) per lane
 *   - Indented child steps (depth 1) within each lane
 */
export function OrderPipelineLab({ orderId }: OrderPipelineLabProps) {
    const { data: instance, isLoading, isError, refetch } = useOrderWorkflow(orderId);

    if (isLoading) {
        return (
            <Card className={`${PIPELINE_LAB_SIDEBAR_WIDTH} shrink-0`}>
                <Card.Header className={CARD_HEADER}>
                    <div className="flex items-center gap-4">
                        <div className={ICON_CONTAINER_LG}>
                            <Icon icon="lucide:git-commit-vertical" className={ICON_SIZE_CONTAINER} />
                        </div>
                        <div>
                            <h2 className={TEXT_SECTION_TITLE}>Order Pipeline</h2>
                            <Skeleton className="h-3 w-24 rounded mt-1" />
                        </div>
                    </div>
                </Card.Header>
                <Card.Content className="py-4 px-4 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-3">
                            <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                            <div className="flex-1 space-y-1.5 pt-1">
                                <Skeleton className="h-3 w-32 rounded" />
                                <Skeleton className="h-2.5 w-20 rounded" />
                            </div>
                        </div>
                    ))}
                </Card.Content>
            </Card>
        );
    }

    if (isError || !instance) {
        return (
            <Card className={`${PIPELINE_LAB_SIDEBAR_WIDTH} shrink-0`}>
                <Card.Content className="py-6 px-4 space-y-3">
                    <Alert status="danger">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>Failed to load pipeline</Alert.Title>
                            <Alert.Description>Could not fetch workflow data.</Alert.Description>
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

    // Build fully flat list with depth annotations
    const steps = buildFlatPipelineTree(instance, BLOCK_META, OPS_HIDDEN_TYPES);

    // Count completed / total (exclude group headers from count)
    const countableSteps = steps.filter((s) => !s.isGroupHeader);
    const completedCount = countableSteps.filter((s) => s.status === 'COMPLETED').length;
    const totalCount = countableSteps.length;

    // Group steps into sections: [parent, ...children] or [standalone]
    const sections: { parent: typeof steps[0]; children: typeof steps }[] = [];
    for (const step of steps) {
        if ((step.depth ?? 0) === 0) {
            sections.push({ parent: step, children: [] });
        } else {
            const last = sections[sections.length - 1];
            if (last) last.children.push(step);
        }
    }

    return (
        <Card className={`${PIPELINE_LAB_SIDEBAR_WIDTH} shrink-0`}>
            <Card.Header className={CARD_HEADER}>
                <div className="flex items-center gap-4">
                    <div className={ICON_CONTAINER_LG}>
                        <Icon icon="lucide:workflow" className={ICON_SIZE_CONTAINER} />
                    </div>
                    <div>
                        <h2 className={TEXT_SECTION_TITLE}>Order Pipeline</h2>
                        <p className="text-xs text-default-400 font-medium">
                            {completedCount} of {totalCount} completed
                        </p>
                    </div>
                </div>
            </Card.Header>
            <Card.Content className="p-0">
                <div className="px-4 pb-4 pt-2">
                    {sections.map((section, sIdx) => {
                        const isFirstSection = sIdx === 0;
                        const isLastSection = sIdx === sections.length - 1;
                        const hasChildren = section.children.length > 0;

                        // Parent steps live on the main spine, so prevStatus comes from the previous PARENT
                        const prevSection = sIdx > 0 ? sections[sIdx - 1] : undefined;
                        const prevParentStep = prevSection?.parent;

                        // nextStatus: if has children, the next visible step is the first child
                        const nextStepAfterParent = hasChildren
                            ? section.children[0]
                            : (sIdx < sections.length - 1 ? sections[sIdx + 1].parent : undefined);

                        return (
                            <div key={section.parent.key}>
                                {/* Parent step — sits on the main spine */}
                                <PipelineStep
                                    label={section.parent.label}
                                    status={section.parent.status}
                                    subStatus={section.parent.subStatus}
                                    completedAt={section.parent.completedAt}
                                    nextStatus={nextStepAfterParent?.status}
                                    prevStatus={prevParentStep?.status}
                                    isFirst={isFirstSection}
                                    isLast={isLastSection && !hasChildren}
                                />

                                {/* Child steps — two-spine layout:
                                    Left column = main spine continuation,
                                    horizontal branch → right column = child spine */}
                                {hasChildren && (() => {
                                    const nextSection = sIdx < sections.length - 1 ? sections[sIdx + 1] : undefined;
                                    const parentStatus = section.parent.status;
                                    const nextParentStatus = nextSection?.parent.status;
                                    const firstChildStatus = section.children[0]?.status;

                                    // Helper: connector color between two statuses
                                    // Green = both COMPLETED, Blue = one COMPLETED + one ACTIVE, Grey = anything else
                                    const connectorColor = (a?: BlockStatus, b?: BlockStatus) => {
                                        if (a === 'COMPLETED' && b === 'COMPLETED') return 'bg-success';
                                        if ((a === 'COMPLETED' && b === 'ACTIVE') || (a === 'ACTIVE' && b === 'COMPLETED'))
                                            return 'bg-accent';
                                        return 'bg-default';
                                    };

                                    // Upper spine (above junction): parent → first child branch
                                    const upperColor = connectorColor(parentStatus, firstChildStatus);
                                    // Lower spine (below junction → next parent): parent → next parent
                                    const lowerColor = connectorColor(parentStatus, nextParentStatus);
                                    // Branch: parent → first child
                                    const branchColor = upperColor;
                                    // Faded opacity only on grey (pending) connections
                                    const upperOpacity = upperColor === 'bg-default' ? 'opacity-(--disabled-opacity)' : '';
                                    const lowerOpacity = lowerColor === 'bg-default' ? 'opacity-(--disabled-opacity)' : '';
                                    const branchOpacity = branchColor === 'bg-default' ? 'opacity-(--disabled-opacity)' : '';

                                    return (
                                        <div className="flex w-full">
                                            {/* Main spine continuation column */}
                                            <div className="w-8 shrink-0 relative">
                                                {/* Upper spine: top → junction */}
                                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 ${PIPELINE_LINE_WIDTH} ${upperColor} ${upperOpacity}`} style={{ height: JUNCTION_SPINE_SPLIT }} />
                                                {/* Lower spine: junction → bottom */}
                                                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${PIPELINE_LINE_WIDTH} ${lowerColor} ${lowerOpacity}`} style={{ top: JUNCTION_SPINE_SPLIT }} />
                                                {/* Horizontal branch — stops at child dot's left edge */}
                                                <div className={`absolute left-[calc(50%-1px)] ${PIPELINE_LINE_HEIGHT} ${branchColor} ${branchOpacity}`} style={{ top: JUNCTION_BRANCH_TOP, width: JUNCTION_BRANCH_WIDTH }} />
                                            </div>
                                            {/* Child steps with their own secondary spine */}
                                            <div className="flex-1 min-w-0 relative z-10">
                                                {section.children.map((child, cIdx) => {
                                                    const isLastChild = cIdx === section.children.length - 1;
                                                    const prevChild = cIdx > 0
                                                        ? section.children[cIdx - 1]
                                                        : section.parent;
                                                    const nextChild = cIdx < section.children.length - 1
                                                        ? section.children[cIdx + 1]
                                                        : undefined;

                                                    return (
                                                        <PipelineStep
                                                            key={child.key}
                                                            label={child.label}
                                                            status={child.status}
                                                            subStatus={child.subStatus}
                                                            completedAt={child.completedAt}
                                                            nextStatus={nextChild?.status}
                                                            prevStatus={prevChild?.status}
                                                            isFirst={cIdx === 0}
                                                            isLast={isLastChild}
                                                            depth={1}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        );
                    })}
                </div>
            </Card.Content>
        </Card>
    );
}
