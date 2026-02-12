import { Alert, Separator } from '@heroui/react';
import { Icon } from '@iconify/react';

interface BlockDescriptionPanelProps {
    title: string;
    icon: string;
    description: string;
    details?: string[];
}

/**
 * BlockDescriptionPanel Component
 * Displays informational content for blocks that do not have configurable settings.
 * Follows HeroUI v3 Beta 3 compound component patterns and design system.
 */
export function BlockDescriptionPanel({ title, icon, description, details }: BlockDescriptionPanelProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-500">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 px-1">
                <Icon icon={icon} className="w-5 h-5 text-accent" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                    {title}
                </h4>
            </div>

            {/* Informational Alert */}
            <Alert status="accent" className="bg-accent/5 border-accent/20 rounded-2xl p-5 shadow-sm">
                <Alert.Indicator>
                    <Icon icon="lucide:info" className="w-5 h-5 text-accent" />
                </Alert.Indicator>
                <Alert.Content>
                    <Alert.Title className="text-sm font-bold text-foreground mb-1">
                        Operational Logic
                    </Alert.Title>
                    <Alert.Description className="text-xs text-muted-foreground/90 leading-relaxed">
                        {description}
                    </Alert.Description>
                </Alert.Content>
            </Alert>

            {/* Operational Details List */}
            {details && details.length > 0 && (
                <div className="space-y-4 px-2 pt-2">
                    <div className="flex items-center gap-2">
                        <Separator className="flex-1 opacity-20" />
                        <span className="t-mini font-bold uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">
                            Key Functions
                        </span>
                        <Separator className="flex-1 opacity-20" />
                    </div>
                    <ul className="space-y-3 px-1 list-none">
                        {details.map((detail, index) => (
                            <li key={index} className="flex items-start gap-3 text-xs text-muted-foreground/80 hover:text-foreground transition-colors group">
                                <div className="mt-1 flex-shrink-0">
                                    <Icon
                                        icon="lucide:arrow-right-circle"
                                        className="w-3.5 h-3.5 text-accent/40 group-hover:text-accent transition-colors"
                                    />
                                </div>
                                <span className="leading-normal">{detail}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
