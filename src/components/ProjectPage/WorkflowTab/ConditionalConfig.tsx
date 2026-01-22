import { Select, ListBox, Label, Description, RadioGroup, Radio } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { IfElseConfig as IfElseConfigType, WorkflowBlock } from '../../../types/workflow';

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
        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
            {/* Logic Definition */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:git-compare" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Logic Definition
                    </Label>
                </div>

                <div className="bg-secondary/5 pt-1 px-4 pb-4 mx-[-1rem] border-y border-separator/10">
                    <RadioGroup
                        value={config.condition}
                        onChange={(val: string) => handleUpdate({ condition: val })}
                        className="gap-4"
                    >
                        {PREDEFINED_CONDITIONS.map((cond) => (
                            <Radio key={cond.id} value={cond.id} className="data-[selected=true]:border-accent transition-all">
                                <Radio.Control><Radio.Indicator /></Radio.Control>
                                <Radio.Content>
                                    <Label className="font-semibold text-sm block">{cond.label}</Label>
                                    <Description className="text-[10px] block line-clamp-2">{cond.description}</Description>
                                </Radio.Content>
                            </Radio>
                        ))}
                    </RadioGroup>
                </div>
            </section>

            {/* Path Selection */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:split" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Branching Paths
                    </Label>
                </div>

                <div className="space-y-3">
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
    const accentClass = type === 'TRUE' ? 'text-success' : 'text-danger';
    const bgClass = type === 'TRUE' ? 'bg-success/5' : 'bg-danger/5';
    const borderClass = type === 'TRUE' ? 'border-success/10' : 'border-danger/10';

    return (
        <div className={`p-4 mx-[-1rem] border-y ${bgClass} ${borderClass} space-y-3 transition-opacity hover:opacity-90`}>
            <div className={`flex items-center gap-2 ${accentClass}`}>
                <Icon icon={icon} className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </div>

            <Select
                placeholder={isOptional ? "Continue normally" : "Select target block"}
                value={currentValue || ''}
                onChange={(id) => onSelect(id as string)}
                fullWidth
            >
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1 block">
                    Target Block
                </Label>
                <Select.Trigger className="h-10 rounded-xl bg-background/50 border-separator/10">
                    <Select.Value />
                    <Select.Indicator><Icon icon="lucide:chevron-down" className="w-4 h-4 opacity-50" /></Select.Indicator>
                </Select.Trigger>
                <Select.Popover>
                    <ListBox>
                        {isOptional && (
                            <ListBox.Item id="" textValue="Continue normally">
                                <Label className="text-sm font-medium italic opacity-60">Continue normally</Label>
                            </ListBox.Item>
                        )}
                        {availableSteps.map(step => (
                            <ListBox.Item key={step.id} id={step.id} textValue={step.label}>
                                <Label className="text-sm font-medium">{step.label}</Label>
                                <Description className="text-[10px]">{step.category}</Description>
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Select.Popover>
            </Select>
        </div>
    );
}

