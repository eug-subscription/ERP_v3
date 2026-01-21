import { RadioGroup, Radio, Label, Description, TextField, Input, NumberField, Switch, Separator, TextArea } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { RetoucherAssigningConfig as RetoucherAssigningConfigType } from '../../../types/workflow';
import { RETOUCHER_ASSIGNMENT_STRATEGIES } from '../../../data/workflow-options';

interface RetoucherAssigningConfigProps {
    config: RetoucherAssigningConfigType;
    onUpdate: (config: RetoucherAssigningConfigType) => void;
}

/**
 * RetoucherAssigningConfig Component
 * Configures how retouchers are assigned and notified for this step.
 */
export function RetoucherAssigningConfig({ config, onUpdate }: RetoucherAssigningConfigProps) {
    const handleUpdate = (updates: Partial<RetoucherAssigningConfigType>) => {
        onUpdate({ ...config, ...updates });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
            {/* Assignment Strategy */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:user-cog" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Assignment Strategy
                    </Label>
                </div>

                <RadioGroup
                    value={config.whoHasAccess}
                    onChange={(val) => handleUpdate({ whoHasAccess: val as RetoucherAssigningConfigType['whoHasAccess'] })}
                    className="gap-4"
                >
                    {RETOUCHER_ASSIGNMENT_STRATEGIES.map((strategy) => (
                        <Radio key={strategy.id} value={strategy.id} className="data-[selected=true]:border-accent transition-all">
                            <Radio.Control><Radio.Indicator /></Radio.Control>
                            <Radio.Content>
                                <Label className="font-semibold text-sm">{strategy.label}</Label>
                                <Description className="text-[10px]">{strategy.description}</Description>
                            </Radio.Content>
                        </Radio>
                    ))}
                </RadioGroup>
            </section>

            {/* Communication & Guidelines */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:file-text" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Onboarding & Guidelines
                    </Label>
                </div>

                <TextField
                    value={config.welcomeText || ''}
                    onChange={(val) => handleUpdate({ welcomeText: val })}
                    fullWidth
                    className="space-y-1.5"
                >
                    <Label className="text-xs font-medium text-muted-foreground ml-1 italic">Welcome Message</Label>
                    <Input
                        placeholder="Hi! Ready for some retouching? Please follow these steps..."
                        className="bg-secondary/5 border-separator/20 rounded-xl"
                    />
                </TextField>

                <TextField
                    value={config.guidelines || ''}
                    onChange={(val) => handleUpdate({ guidelines: val })}
                    fullWidth
                    className="space-y-1.5"
                >
                    <Label className="text-xs font-medium text-muted-foreground ml-1 italic">Production Guidelines</Label>
                    <TextArea
                        placeholder="1. Keep skin texture natural... 
2. Match background to reference... 
3. Use SRGB color profile..."
                        rows={4}
                        className="bg-secondary/5 border-separator/20 rounded-2xl p-3 text-sm min-h-[120px]"
                    />
                    <Description className="text-[10px] ml-1">Specific technical instructions for this step.</Description>
                </TextField>

                <Switch
                    isSelected={config.needAcceptGuidelines}
                    onChange={(checked) => handleUpdate({ needAcceptGuidelines: checked })}
                    className="flex-row-reverse justify-between w-full px-1"
                >
                    <Switch.Control>
                        <Switch.Thumb />
                    </Switch.Control>
                    <div className="space-y-0.5">
                        <Label className="text-sm font-semibold italic">Enforce Guidelines</Label>
                        <Description className="text-[10px]">Pro must acknowledge reading guidelines before starting.</Description>
                    </div>
                </Switch>
            </section>

            <Separator className="opacity-30" />

            {/* Quality & Client Visibility */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:shield-check" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Quality & Visibility
                    </Label>
                </div>

                <div className="flex flex-col gap-5 bg-secondary/5 p-5 rounded-2xl border border-separator/10">
                    <Switch
                        isSelected={config.showRetoucherToClient}
                        onChange={(checked) => handleUpdate({ showRetoucherToClient: checked })}
                        className="flex-row-reverse justify-between w-full"
                    >
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                        <div className="space-y-0.5">
                            <Label className="text-sm font-semibold italic">Show Retoucher to Client</Label>
                            <Description className="text-[10px]">Client can see who is working on their files.</Description>
                        </div>
                    </Switch>

                    <Separator className="opacity-30" />

                    <NumberField
                        value={config.minRetoucherLevel || 1}
                        onChange={(val) => handleUpdate({ minRetoucherLevel: val })}
                        minValue={1}
                        maxValue={5}
                        className="w-full"
                    >
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="space-y-0.5 flex-1">
                                <Label className="text-sm font-semibold italic">Minimum Skill Level</Label>
                                <Description className="text-[10px]">Required rating for retouchers (1-5 star scale).</Description>
                            </div>
                            <NumberField.Group className="flex items-center gap-1 bg-background border border-separator/20 rounded-lg p-1 w-24 h-9">
                                <NumberField.DecrementButton className="w-6 h-6 rounded bg-secondary/10 flex items-center justify-center text-xs hover:bg-secondary/20 transition-colors">-</NumberField.DecrementButton>
                                <NumberField.Input className="flex-1 text-center bg-transparent border-none text-xs font-bold" />
                                <NumberField.IncrementButton className="w-6 h-6 rounded bg-secondary/10 flex items-center justify-center text-xs hover:bg-secondary/20 transition-colors">+</NumberField.IncrementButton>
                            </NumberField.Group>
                        </div>
                    </NumberField>
                </div>
            </section>
        </div>
    );
}
