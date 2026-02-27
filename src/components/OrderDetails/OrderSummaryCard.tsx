import { useState } from 'react';
import { Card, Skeleton, Tag, TagGroup, Tooltip, Button, Separator } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { OrderData } from '../../data/mock-order';
import { formatAbsoluteTime, formatRelativeTime } from '../../utils/format-time';
import {
    TEXT_SECTION_LABEL,
    ICON_SIZE_CONTAINER,
    TOOLTIP_DELAY,
    TEXT_FIELD_LABEL,
    GHOST_EDIT_BUTTON,
} from '../../constants/ui-tokens';
import { TagsEditModal } from './TagsEditModal';

interface OrderSummaryCardProps {
    isLoading: boolean;
    order: OrderData | undefined;
}

interface TimestampWithTooltipProps {
    iso: string;
    ariaLabel: string;
}

function TimestampWithTooltip({ iso, ariaLabel }: TimestampWithTooltipProps) {
    return (
        <Tooltip delay={TOOLTIP_DELAY}>
            <Tooltip.Trigger aria-label={ariaLabel}>
                <span className="text-sm font-semibold text-default-700 cursor-default">
                    {formatRelativeTime(iso)}
                </span>
            </Tooltip.Trigger>
            <Tooltip.Content>
                <p>{formatAbsoluteTime(iso)}</p>
            </Tooltip.Content>
        </Tooltip>
    );
}

export function OrderSummaryCard({ isLoading, order }: OrderSummaryCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    if (isLoading) {
        return (
            <Card className="h-full">
                <Card.Content className="p-5 flex flex-col gap-4">
                    <Skeleton className="h-5 w-32 rounded-lg" />
                    <Skeleton className="h-8 w-3/4 rounded-xl" />
                    <Skeleton className="h-5 w-40 rounded-lg" />
                    <div className="flex gap-6 pt-1">
                        <Skeleton className="h-4 w-28 rounded-lg" />
                        <Skeleton className="h-4 w-28 rounded-lg" />
                    </div>
                </Card.Content>
            </Card>
        );
    }

    if (!order) return null;

    return (
        <>
            <Card className="group h-full">
                <Card.Content className="p-5 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Icon icon="lucide:clipboard-list" className={ICON_SIZE_CONTAINER} />
                            <h3 className={TEXT_SECTION_LABEL}>Order Summary</h3>
                        </div>
                        <Button size="sm" variant="ghost" isIconOnly aria-label="Edit tags" className={GHOST_EDIT_BUTTON} onPress={() => setIsEditOpen(true)}>
                            <Icon icon="lucide:pencil" className="size-3.5" />
                        </Button>
                    </div>

                    {/* Order name */}
                    <div>
                        <p className={`${TEXT_FIELD_LABEL} mb-1.5`}>Name</p>
                        <p className="text-base font-bold text-default-900">
                            {order.orderName || '—'}
                        </p>
                    </div>

                    {/* Tags */}
                    <Separator className="my-1" />
                    <div>
                        <p className={`${TEXT_FIELD_LABEL} mb-1.5`}>Tags</p>
                        <TagGroup aria-label="Order tags" selectionMode="none" size="md">
                            <TagGroup.List
                                items={order.tags}
                                renderEmptyState={() => (
                                    <span className="text-xs text-default-400">No tags</span>
                                )}
                            >
                                {(tag) => (
                                    <Tag key={tag.id} id={tag.id} textValue={tag.text}>
                                        {tag.text}
                                    </Tag>
                                )}
                            </TagGroup.List>
                        </TagGroup>
                    </div>

                    {/* Timestamps */}
                    <Separator className="my-1" />
                    <div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className={`${TEXT_FIELD_LABEL} mb-1.5`}>Created</p>
                                <TimestampWithTooltip iso={order.createdAt} ariaLabel="Created timestamp" />
                            </div>
                            <div>
                                <p className={`${TEXT_FIELD_LABEL} mb-1.5`}>Modified</p>
                                {order.modifiedAt ? (
                                    <TimestampWithTooltip iso={order.modifiedAt} ariaLabel="Modified timestamp" />
                                ) : (
                                    <span className="text-sm font-semibold text-default-700">—</span>
                                )}
                            </div>
                        </div>
                    </div>
                </Card.Content>
            </Card>

            <TagsEditModal
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                orderName={order.orderName}
                currentTags={order.tags}
            />
        </>
    );
}
