import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    actionLabel?: string;
    actionIcon?: string;
    onAction?: () => void;
}

/**
 * EmptyState - A reusable premium empty state component.
 * Used across lists and tables when no data is available.
 */
export function EmptyState({ icon, title, description, actionLabel, actionIcon, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-premium-lg bg-default-50/5 min-h-[400px] group transition-all duration-500 hover:bg-accent/5">
            <div className="relative mb-8">
                {/* Decorative glow */}
                <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative w-24 h-24 rounded-premium bg-surface shadow-md flex items-center justify-center text-default-400 group-hover:text-accent group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 ring-1 ring-default-200/50">
                    <Icon icon={icon} width={48} className="drop-shadow-sm" />
                </div>
            </div>

            <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">
                {title}
            </h3>

            <p className="text-default-500 max-w-sm mb-10 font-medium leading-relaxed">
                {description}
            </p>

            {actionLabel && onAction && (
                <Button
                    variant="primary"
                    size="lg"
                    onPress={onAction}
                >
                    <Icon icon={actionIcon ?? "lucide:plus"} width={20} className="mr-2" />
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
