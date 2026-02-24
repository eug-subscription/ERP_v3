import { Card, Skeleton } from '@heroui/react';
import { Link } from '@tanstack/react-router';
import { Icon } from '@iconify/react';
import { useShotList } from '../../hooks/useShotList';
import { useUnmatchedItems } from '../../hooks/useUnmatchedItems';
import { useUpload } from '../../hooks/useUpload';
import { TEXT_SECTION_LABEL } from '../../constants/ui-tokens';

interface MetricCardProps {
    label: string;
    icon: string;
    value: string;
    sub?: string;
    linkTo: string;
    valueClassName?: string;
    isLoading: boolean;
}

function MetricCard({ label, icon, value, sub, linkTo, valueClassName, isLoading }: MetricCardProps) {
    return (
        <Link to={linkTo} className="flex-1 min-w-0 group">
            <Card className="h-full transition-colors group-hover:bg-default-50">
                <Card.Content className="p-5 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                        <Icon icon={icon} className="size-4 text-default-500" />
                        <span className={TEXT_SECTION_LABEL}>{label}</span>
                    </div>
                    {isLoading ? (
                        <>
                            <Skeleton className="h-7 w-20 rounded mt-1" />
                            <Skeleton className="h-4 w-14 rounded" />
                        </>
                    ) : (
                        <div className="flex flex-col gap-0.5 mt-1">
                            <span className={`text-2xl font-black tracking-tight ${valueClassName ?? 'text-default-900'}`}>
                                {value}
                            </span>
                            {sub && (
                                <span className="text-xs text-default-400 font-medium truncate mt-0.5">
                                    {sub}
                                </span>
                            )}
                        </div>
                    )}
                </Card.Content>
            </Card>
        </Link>
    );
}

interface MetricsStripProps {
    orderId: string;
}

export function MetricsStrip({ orderId: _orderId }: MetricsStripProps) {
    const { data: shotItems, isLoading: shotLoading } = useShotList();
    const { matchStats, isLoading: matchLoading } = useUnmatchedItems();
    const { fileCounts, isLoading: uploadLoading } = useUpload();

    const completedShots = (shotItems ?? []).filter(
        (item) => item.status === 'completed',
    ).length;
    const totalShots = (shotItems ?? []).length;

    return (
        <div className="flex gap-4">
            <MetricCard
                label="Shot List"
                icon="lucide:camera"
                value={`${completedShots}/${totalShots}`}
                sub={totalShots > 0 ? `${Math.round((completedShots / totalShots) * 100)}% complete` : undefined}
                linkTo="/items"
                isLoading={shotLoading}
            />
            <MetricCard
                label="Match Rate"
                icon="lucide:link"
                value={`${matchStats.percent}%`}
                sub={matchStats.remaining > 0 ? `${matchStats.remaining} left` : 'All matched'}
                linkTo="/items"
                isLoading={matchLoading}
            />
            <MetricCard
                label="Uploads"
                icon="lucide:upload"
                value={
                    fileCounts.all > 0 && fileCounts.completed === fileCounts.all
                        ? 'All uploaded'
                        : `${fileCounts.completed}/${fileCounts.all}`
                }
                sub={fileCounts.failed > 0 ? `${fileCounts.failed} failed` : undefined}
                linkTo="/uploading"
                valueClassName={fileCounts.failed > 0 ? 'text-danger' : 'text-default-900'}
                isLoading={uploadLoading}
            />
        </div>
    );
}
