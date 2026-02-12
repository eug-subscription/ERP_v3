import { Breadcrumbs } from "@heroui/react";
import { StatisticCard } from "./shared/StatisticCard";

interface OrderPageHeaderProps {
    orderName: string;
    clientName: string;
    projectName: string;
    projectId: string;
    status: string;
    photoCount: number;
    profitMargin: number;
}

export function OrderPageHeader({
    orderName,
    clientName,
    projectName,
    projectId,
    status,
    photoCount,
    profitMargin,
}: OrderPageHeaderProps) {
    return (
        <header className="mb-8">
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
            <h1 className="text-3xl font-bold mb-1">
                Order: {clientName} | {orderName}
            </h1>
            <p className="text-default-500">
                Manage order details, billing, and team assignments.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-8">
                <StatisticCard title="Photos" value={photoCount.toString()} />
                <StatisticCard title="Status" value={status} />
                <StatisticCard
                    title="Profit Margin"
                    value={`${profitMargin}%`}
                />
            </div>
        </header>
    );
}
