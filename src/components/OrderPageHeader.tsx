import { Breadcrumbs, Chip } from "@heroui/react";

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
            <h1 className="text-3xl font-bold mb-1">
                Order: {clientName} | {orderName}
            </h1>
            <div className="flex items-center gap-3 mt-2">
                <Chip size="sm" variant="soft" color="default">
                    {`${photoCount} ${photoCount === 1 ? 'photo' : 'photos'}`}
                </Chip>
                <Chip size="sm" variant="soft" color="success">
                    {status}
                </Chip>
                <Chip size="sm" variant="soft" color="default">
                    {`${profitMargin}% margin`}
                </Chip>
            </div>
        </header>
    );
}

