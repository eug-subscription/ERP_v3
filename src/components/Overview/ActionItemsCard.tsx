import { Card, Skeleton } from '@heroui/react';
import { Link } from '@tanstack/react-router';
import { Icon } from '@iconify/react';
import { useOverviewAlerts } from '../../hooks/useOverviewAlerts';
import { TEXT_SECTION_LABEL } from '../../constants/ui-tokens';
import type { AlertSeverity } from '../../types/overview';

const SEVERITY_STYLES: Record<AlertSeverity, { icon: string; bg: string }> = {
    danger: { icon: 'text-danger', bg: 'bg-danger/10 group-hover:bg-danger/15' },
    warning: { icon: 'text-warning', bg: 'bg-warning/20 group-hover:bg-warning/25' },
    default: { icon: 'text-default-600', bg: 'bg-default group-hover:bg-default/80' },
};

export function ActionItemsCard() {
    const { alerts, isLoading } = useOverviewAlerts();

    if (isLoading) {
        return (
            <Card className="h-full">
                <Card.Content className="p-5 space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="size-4 rounded" />
                        <Skeleton className="h-3 w-28 rounded" />
                    </div>
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-8 w-full rounded-lg" />
                    ))}
                </Card.Content>
            </Card>
        );
    }

    if (!alerts || alerts.length === 0) {
        return null;
    }

    return (
        <Card>
            <Card.Content className="p-5 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 mb-2">
                    <Icon icon="lucide:alert-triangle" className="size-4 text-warning" />
                    <h3 className={TEXT_SECTION_LABEL}>Needs Attention</h3>
                    <span className="ml-auto text-[11px] font-semibold text-default-500 bg-default rounded-full px-2 py-0.5">
                        {alerts.length}
                    </span>
                </div>

                {alerts.map((alert) => {
                    const style = SEVERITY_STYLES[alert.severity];

                    return (
                        <Link
                            key={alert.id}
                            to={alert.linkTo}
                            className="flex items-center gap-2.5 py-1.5 px-1.5 -mx-1.5 rounded-lg hover:bg-default-50 transition-colors group"
                        >
                            <div className={`size-6 rounded-full ${style.bg} flex items-center justify-center shrink-0 transition-colors`}>
                                <Icon icon={alert.icon} className={`size-3.5 ${style.icon}`} />
                            </div>
                            <span className="text-xs font-medium text-default-700 leading-snug flex-1">
                                {alert.text}
                            </span>
                            <Icon
                                icon="lucide:chevron-right"
                                className="size-3.5 text-default-300 group-hover:text-default-500 transition-colors shrink-0"
                            />
                        </Link>
                    );
                })}
            </Card.Content>
        </Card>
    );
}
