import type { ReactNode } from "react";
import { Breadcrumbs, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { CalendarDateTime } from "@internationalized/date";
import { formatCalendarDate } from "../utils/format-time";

interface OrderPageHeaderProps {
    orderName: string;
    clientName: string;
    projectName: string;
    projectId: string;
    status: string;
    profitMargin: number;
    createdAt: CalendarDateTime;
    actions?: ReactNode;
}

export function OrderPageHeader({
    orderName,
    clientName,
    projectName,
    projectId,
    status,
    profitMargin,
    createdAt,
    actions,
}: OrderPageHeaderProps) {
    return (
        <header className="mb-6">
            <Breadcrumbs className="mb-3">
                <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
                <Breadcrumbs.Item href="/projects">Projects</Breadcrumbs.Item>
                <Breadcrumbs.Item href={`/project/${projectId}`}>
                    {projectName}
                </Breadcrumbs.Item>
                <Breadcrumbs.Item href={`/project/${projectId}/orders`}>
                    Orders
                </Breadcrumbs.Item>
                <Breadcrumbs.Item>{orderName}</Breadcrumbs.Item>
            </Breadcrumbs>
            <div className="flex items-center justify-between gap-4 mb-1">
                <h1 className="text-3xl font-bold">
                    Order: {clientName} | {orderName}
                </h1>
                {actions}
            </div>
            <div className="flex items-center gap-3 mt-2">
                <Chip size="sm" variant="soft" color="default">
                    {projectName}
                </Chip>
                <Chip size="sm" variant="soft" color="success">
                    {status}
                </Chip>
                <Chip size="sm" variant="soft" color="default">
                    {`${profitMargin}% margin`}
                </Chip>
                <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-default-400">
                    <Icon icon="lucide:calendar" className="w-3.5 h-3.5" />
                    Created {formatCalendarDate(createdAt)}
                </span>
            </div>
        </header>
    );
}
