import { Select, ListBox, Label, Description, Separator } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { IfElseConfig as IfElseConfigType, WorkflowBlock } from '../../../types/workflow';
import { getCategoryIcon } from '../../../data/workflow-constants';

interface ConditionalConfigProps {
    config: IfElseConfigType;
    availableSteps: WorkflowBlock[];
    onUpdate: (config: IfElseConfigType) => void;
}

const PREDEFINED_CONDITIONS = [
    { id: 'payment_received', label: 'Payment is Received', description: 'Checks if invoice status is "Paid"' },
    { id: 'has_video', label: 'Order Includes Video', description: 'Checks if video services are selected' },
    { id: 'client_is_vip', label: 'Client is VIP', description: 'Checks client loyalty tier' },
    { id: 'is_rush_order', label: 'Is Rush Order', description: 'Checks if turnaround is < 24h' },
];

/**
 * ConditionalConfig Component
 * Configures the logic for the If/Else branching blocks.
 * 
 * DESIGN PHILOSOPHY:
 * - High-contrast visual paths (Success for True, Danger for False).
 * - Direct, semantic iconography.
 * - Compound component pattern for Select implementation.
 */
export function ConditionalConfig({ config, availableSteps, onUpdate }: ConditionalConfigProps) {
    const handleUpdate = (updates: Partial<IfElseConfigType>) => {
        onUpdate({ ...config, ...updates });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-500">
            {/* Logic Definition */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1 px-1">
                    <div className="p-1 px-2 rounded-lg bg-accent/10 border border-accent/20">
                        <Icon icon="lucide:git-compare" className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Logic Definition
                    </Label>
                </div>

                <div className="space-y-3 bg-secondary/5 p-5 rounded-2xl border border-separator/30">
                    <Label className="text-sm font-semibold block px-1">Condition to Evaluate</Label>
                    <Select
                        placeholder="Choose condition to check..."
                        value={config.condition}
                        onChange={(id) => handleUpdate({ condition: id as string })}
                    >
                        <Select.Trigger className="h-12 rounded-xl bg-background border-separator/50 shadow-sm px-4">
                            <Select.Value />
                            <Select.Indicator>
                                <Icon icon="lucide:chevron-down" className="w-4 h-4 opacity-40" />
                            </Select.Indicator>
                        </Select.Trigger>
                        <Select.Popover className="rounded-2xl shadow-premium border-separator/50">
                            <ListBox className="p-2">
                                {PREDEFINED_CONDITIONS.map(cond => (
                                    <ListBox.Item
                                        key={cond.id}
                                        id={cond.id}
                                        textValue={cond.label}
                                        className="rounded-xl px-4 py-2.5 data-[hover=true]:bg-accent/5"
                                    >
                                        <div className="space-y-0.5">
                                            <Label className="font-semibold text-sm cursor-pointer">{cond.label}</Label>
                                            <Description className="text-xs opacity-60 italic">{cond.description}</Description>
                                        </div>
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </div>
            </section>

            <Separator className="opacity-30" />

            {/* Path Selection */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-1 px-1">
                    <div className="p-1 px-2 rounded-lg bg-accent/10 border border-accent/20">
                        <Icon icon="lucide:split" className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Branching Paths
                    </Label>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* True Path */}
                    <CardPath
                        type="TRUE"
                        label="If True (Yes)"
                        icon="lucide:check-circle-2"
                        currentValue={config.truePathStepId}
                        availableSteps={availableSteps}
                        onSelect={(id) => handleUpdate({ truePathStepId: id })}
                    />

                    {/* False Path */}
                    <CardPath
                        type="FALSE"
                        label="If False (No)"
                        icon="lucide:x-circle"
                        currentValue={config.falsePathStepId}
                        availableSteps={availableSteps}
                        onSelect={(id) => handleUpdate({ falsePathStepId: id })}
                        isOptional
                    />
                </div>
            </section>
        </div>
    );
}

interface CardPathProps {
    type: 'TRUE' | 'FALSE';
    label: string;
    icon: string;
    currentValue: string | undefined;
    availableSteps: WorkflowBlock[];
    onSelect: (id: string) => void;
    isOptional?: boolean;
}

function CardPath({ type, label, icon, currentValue, availableSteps, onSelect, isOptional }: CardPathProps) {
    const bgClass = type === 'TRUE' ? 'bg-success/5' : 'bg-danger/5';
    const borderClass = type === 'TRUE' ? 'border-success/20' : 'border-danger/20';
    const accentTextClass = type === 'TRUE' ? 'text-success' : 'text-danger';
    const triggerBorderClass = type === 'TRUE' ? 'border-success/30' : 'border-danger/30';

    return (
        <div className={`${bgClass} rounded-2xl p-5 border ${borderClass} space-y-4 transition-all hover:bg-opacity-10`}>
            <div className={`flex items-center gap-2 ${accentTextClass}`}>
                <Icon icon={icon} className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground/50 px-1">
                    {isOptional ? 'Jump to block (Optional):' : 'Jump to block:'}
                </Label>
                <Select
                    placeholder={isOptional ? "Continue normally" : "Select target block"}
                    value={currentValue || ''}
                    onChange={(id) => onSelect(id as string)}
                >
                    <Select.Trigger className={`h-11 rounded-xl bg-background border shadow-sm px-4 ${triggerBorderClass}`}>
                        <Select.Value />
                        <Select.Indicator>
                            <Icon icon="lucide:chevron-down" className="w-4 h-4 opacity-40" />
                        </Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover className="rounded-2xl shadow-premium border-separator/50">
                        <ListBox className="p-2">
                            {isOptional && (
                                <ListBox.Item id="" textValue="Continue normally" className="rounded-xl px-4 py-3 data-[hover=true]:bg-secondary/10">
                                    <div className="flex items-center gap-2">
                                        <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 opacity-50" />
                                        <Label className="text-sm font-medium italic opacity-60">Continue normally</Label>
                                    </div>
                                </ListBox.Item>
                            )}
                            {availableSteps.map(step => (
                                <ListBox.Item
                                    key={step.id}
                                    id={step.id}
                                    textValue={step.label}
                                    className="rounded-xl px-4 py-2.5 data-[hover=true]:bg-accent/5"
                                >
                                    <div className="flex flex-col">
                                        <Label className="text-sm font-medium cursor-pointer">{step.label}</Label>
                                        <div className="flex items-center gap-1.5 opacity-40">
                                            <Icon icon={getCategoryIcon(step.category)} className="w-2.5 h-2.5" />
                                            <span className="text-[9px] uppercase tracking-wide font-bold">{step.category}</span>
                                        </div>
                                    </div>
                                </ListBox.Item>
                            ))}
                        </ListBox>
                    </Select.Popover>
                </Select>
            </div>
        </div>
    );
}

