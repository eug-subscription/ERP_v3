import { Alert, Button, Card, Skeleton } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useOrderWorkflow } from '../../hooks/useOrderWorkflow';
import { DEFAULT_AUDIENCE_VISIBILITY } from '../../constants/timeline';
import { CARD_HEADER, ICON_CONTAINER_LG, ICON_SIZE_CONTAINER, PIPELINE_SIDEBAR_WIDTH, TEXT_SECTION_TITLE } from '../../constants/ui-tokens';
import { BLOCK_TYPE_TO_ID, buildBlockMeta } from '../../utils/pipeline-resolver';
import { WorkflowBlockType } from '../../types/workflow';
import { PipelineStep } from './PipelineStep';


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
            <Card className={`${PIPELINE_SIDEBAR_WIDTH} shrink-0`}>
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
            <Card className={`${PIPELINE_SIDEBAR_WIDTH} shrink-0`}>
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

    /** Build ordered step list, skipping blocks hidden from ops audience. */
    const steps = BLOCK_EXECUTION_ORDER.flatMap((blockType) => {
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
            completedAt: progress.completedAt,
        }];
    });

    return (
        <Card className={`${PIPELINE_SIDEBAR_WIDTH} shrink-0`}>
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
                    {steps.map((step, idx) => (
                        <PipelineStep
                            key={step.key}
                            label={step.label}
                            status={step.status}
                            subStatus={step.subStatus}
                            completedAt={step.completedAt}
                            nextStatus={steps[idx + 1]?.status}
                            prevStatus={steps[idx - 1]?.status}
                            isFirst={idx === 0}
                            isLast={idx === steps.length - 1}
                        />
                    ))}
                </div>
            </Card.Content>
        </Card>
    );
}
