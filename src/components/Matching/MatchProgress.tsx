import { Card } from "@heroui/react";

interface MatchProgressProps {
    total: number;
    percent: number;
    remaining: number;
}

export function MatchProgress({ total, percent, remaining }: MatchProgressProps) {
    return (
        <Card variant="secondary" className="mb-6">
            <Card.Content className="p-6">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-default-500 font-bold">
                        {remaining} of {total} items left to match
                    </span>
                    <span className="text-xs font-black text-accent">{percent}% complete</span>
                </div>
                <div
                    className="w-full h-2.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: "var(--surface-tertiary)" }}
                >
                    <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${percent}%` }}
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Match progress"
                    />
                </div>
            </Card.Content>
        </Card>
    );
}
