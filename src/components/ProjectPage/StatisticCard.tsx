import { Card } from "@heroui/react";

interface StatisticCardProps {
    title: string;
    value: string;
    change?: string;
    isPositive?: boolean;
}

export function StatisticCard({
    title,
    value,
    change,
    isPositive = true,
}: StatisticCardProps) {
    return (
        <Card className="p-0 shadow-sm">
            <Card.Content className="p-6">
                <div className="text-sm text-default-500 mb-2">{title}</div>
                <div className="text-3xl font-bold mb-1">{value}</div>
                {change && (
                    <div
                        className={`text-sm ${isPositive ? "text-success" : "text-danger"
                            }`}
                    >
                        {change}
                    </div>
                )}
            </Card.Content>
        </Card>
    );
}
