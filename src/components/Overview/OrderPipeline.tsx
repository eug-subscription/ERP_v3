import { Alert, Button, Card, Skeleton } from '@heroui/react';
import { Link } from '@tanstack/react-router';
import { Icon } from '@iconify/react';
import { useOrderWorkflow } from '../../hooks/useOrderWorkflow';
import { DEFAULT_AUDIENCE_VISIBILITY } from '../../constants/timeline';
import { BLOCK_TYPE_TO_ID, buildBlockMeta } from '../../utils/pipeline-resolver';
import { WorkflowBlockType, BlockStatus, SubStatusSegment } from '../../types/workflow';
import { PipelineStep } from './PipelineStep';
import { TEXT_SECTION_LABEL } from '../../constants/ui-tokens';

/**
 * Canonical execution order for a "Photo Only" workflow.
 * Determines the top-to-bottom order steps are rendered in the pipeline.
 */
const BLOCK_EXECUTION_ORDER: WorkflowBlockType[] = [
    'ORDER_CREATED',
    'ITEMS_TO_SHOOT',
    'WAIT_PAYMENT',
    'PRO_ASSIGNING',
    'PHOTO_SHOOT',
    'MATCHING',
    'PHOTO_RETOUCHING',
    'MODERATION',
    'SEND_TO_CLIENT',
];

/** Blocks hidden for the ops audience (from DEFAULT_AUDIENCE_VISIBILITY). */
const OPS_HIDDEN_TYPES = new Set<WorkflowBlockType>(
    (Object.entries(DEFAULT_AUDIENCE_VISIBILITY) as [WorkflowBlockType, Record<string, boolean>][])
        .filter(([, vis]) => vis['ops'] === false)
        .map(([type]) => type)
);

/** Pre-build icon/label lookup map from BLOCK_LIBRARY for O(1) access. */
const BLOCK_META = buildBlockMeta();

interface OrderPipelineProps {
    orderId: string;
}

export function OrderPipeline({ orderId }: OrderPipelineProps) {
    const { data: instance, isLoading, isError, refetch } = useOrderWorkflow(orderId);

    const completedCount = instance?.completedBlockIds.length ?? 0;
    const totalCount = instance ? Object.keys(instance.blockProgress).length : 0;

    if (isLoading) {
        return (
            <Card className="h-full">
                <Card.Content className="p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Icon icon="lucide:git-pull-request" className="size-4 text-default-400" />
                        <span className={TEXT_SECTION_LABEL}>Order Pipeline</span>
                    </div>
                    <Skeleton className="h-3 w-24 rounded" />
                    <div className="space-y-3 pt-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="size-5 rounded-full shrink-0" />
                                <Skeleton className="h-4 w-28 rounded" />
                            </div>
                        ))}
                    </div>
                </Card.Content>
            </Card>
        );
    }

    if (isError || !instance) {
        return (
            <Card className="h-full">
                <Card.Content className="p-5 space-y-3">
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

    /** Build ordered step list, skipping blocks hidden from ops audience. */
    const rawSteps = BLOCK_EXECUTION_ORDER.flatMap((blockType) => {
        if (OPS_HIDDEN_TYPES.has(blockType)) return [];

        const blockId = BLOCK_TYPE_TO_ID[blockType];
        if (!blockId) return [];

        const progress = instance.blockProgress[blockId];
        if (!progress) return [];

        const meta = BLOCK_META.get(blockType);
        if (!meta) return [];

        return [{
            key: blockId,
            label: meta.label,
            status: progress.status,
            subStatus: progress.subStatus,
        }];
    });

    const displaySteps: { key: string; label: string; status: BlockStatus; subStatus?: SubStatusSegment[] }[] = [];
    const firstNonCompletedIdx = rawSteps.findIndex(s => s.status !== 'COMPLETED');

    if (firstNonCompletedIdx === -1) {
        displaySteps.push({
            key: 'all-completed',
            label: 'All steps completed',
            status: 'COMPLETED' as const,
            subStatus: undefined,
        });
    } else {
        if (firstNonCompletedIdx > 1) {
            displaySteps.push({
                key: 'grouped-completed',
                label: `${firstNonCompletedIdx} steps completed`,
                status: 'COMPLETED' as const,
                subStatus: undefined,
            });
        } else if (firstNonCompletedIdx === 1) {
            displaySteps.push(rawSteps[0]);
        }

        displaySteps.push(rawSteps[firstNonCompletedIdx]);

        if (firstNonCompletedIdx + 1 < rawSteps.length) {
            displaySteps.push(rawSteps[firstNonCompletedIdx + 1]);
        }

        const remaining = rawSteps.length - (firstNonCompletedIdx + 2);
        if (remaining > 1) {
            displaySteps.push({
                key: 'grouped-pending',
                label: `${remaining} more steps`,
                status: 'PENDING' as const,
                subStatus: undefined,
            });
        } else if (remaining === 1) {
            displaySteps.push(rawSteps[firstNonCompletedIdx + 2]);
        }
    }

    return (
        <Card className="h-full flex flex-col">
            <Card.Content className="p-5 flex-1">
                <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2 text-default-500">
                        <Icon icon="lucide:git-pull-request" className="size-4" />
                        <h2 className={TEXT_SECTION_LABEL}>Order Pipeline</h2>
                    </div>
                    <Link
                        to="/timeline"
                        className="text-xs text-default-400 hover:text-accent font-medium transition-colors shrink-0"
                    >
                        View Timeline
                    </Link>
                </div>
                <p className="text-xs font-medium text-default-900 mb-3">
                    {completedCount} of {totalCount} completed
                </p>

                <div className="flex flex-col">
                    {displaySteps.map((step, idx) => (
                        <PipelineStep
                            key={step.key}
                            label={step.label}
                            status={step.status}
                            subStatus={step.subStatus}
                            nextStatus={displaySteps[idx + 1]?.status}
                            isFirst={idx === 0}
                            isLast={idx === displaySteps.length - 1}
                            index={idx}
                        />
                    ))}
                </div>
            </Card.Content>
        </Card>
    );
}
