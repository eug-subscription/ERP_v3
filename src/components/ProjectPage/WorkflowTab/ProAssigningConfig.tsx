import { RadioGroup, Radio, Label, Description, TextField, Input, NumberField, Switch, Separator } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { ProAssigningConfig as ProAssigningConfigType } from '../../../types/workflow';
import { PRO_ASSIGNMENT_STRATEGIES } from '../../../data/workflow-options';

interface ProAssigningConfigProps {
    config: ProAssigningConfigType;
    onUpdate: (config: ProAssigningConfigType) => void;
}

/**
 * ProAssigningConfig Component
 * Configures how professionals are assigned to this production step.
 */
export function ProAssigningConfig({ config, onUpdate }: ProAssigningConfigProps) {
    const handleUpdate = (updates: Partial<ProAssigningConfigType>) => {
        onUpdate({ ...config, ...updates });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
            {/* Assignment Strategy */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:users" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Assignment Strategy
                    </Label>
                </div>

                <RadioGroup
                    value={config.whoHasAccess}
                    onChange={(val) => handleUpdate({ whoHasAccess: val as ProAssigningConfigType['whoHasAccess'] })}
                    className="gap-4"
                >
                    {PRO_ASSIGNMENT_STRATEGIES.map((strategy) => (
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

            {/* Messaging */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:message-square" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Communication
                    </Label>
                </div>

                <TextField
                    value={config.welcomeText || ''}
                    onChange={(val) => handleUpdate({ welcomeText: val })}
                    fullWidth
                >
                    <Label className="text-xs font-medium mb-1.5">Welcome Message</Label>
                    <Input
                        placeholder="Welcome to the project! Please review guidelines..."
                        className="bg-secondary/5 border-separator/20 rounded-xl"
                    />
                    <Description className="text-[10px] mt-1">Message shown to the professional upon assignment.</Description>
                </TextField>
            </section>

            {/* Capacity & Duration */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:clock" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Capacity & Duration
                    </Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <NumberField
                        value={config.photographerSlots}
                        onChange={(val) => handleUpdate({ photographerSlots: val })}
                        minValue={0}
                        className="space-y-1.5"
                    >
                        <Label className="text-xs font-medium ml-1">Photo Slots</Label>
                        <NumberField.Group className="flex items-center gap-1 bg-secondary/5 border border-separator/20 rounded-xl p-1">
                            <NumberField.DecrementButton className="w-8 h-8 rounded-lg bg-background shadow-sm hover:bg-secondary/10 flex items-center justify-center">-</NumberField.DecrementButton>
                            <NumberField.Input className="flex-1 text-center bg-transparent border-none text-sm" />
                            <NumberField.IncrementButton className="w-8 h-8 rounded-lg bg-background shadow-sm hover:bg-secondary/10 flex items-center justify-center">+</NumberField.IncrementButton>
                        </NumberField.Group>
                    </NumberField>

                    <NumberField
                        value={config.videographerSlots}
                        onChange={(val) => handleUpdate({ videographerSlots: val })}
                        minValue={0}
                        className="space-y-1.5"
                    >
                        <Label className="text-xs font-medium ml-1">Video Slots</Label>
                        <NumberField.Group className="flex items-center gap-1 bg-secondary/5 border border-separator/20 rounded-xl p-1">
                            <NumberField.DecrementButton className="w-8 h-8 rounded-lg bg-background shadow-sm hover:bg-secondary/10 flex items-center justify-center">-</NumberField.DecrementButton>
                            <NumberField.Input className="flex-1 text-center bg-transparent border-none text-sm" />
                            <NumberField.IncrementButton className="w-8 h-8 rounded-lg bg-background shadow-sm hover:bg-secondary/10 flex items-center justify-center">+</NumberField.IncrementButton>
                        </NumberField.Group>
                    </NumberField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <NumberField
                        value={config.defaultPhotoshootDuration}
                        onChange={(val) => handleUpdate({ defaultPhotoshootDuration: val })}
                        minValue={0}
                    >
                        <Label className="text-xs font-medium mb-1.5">Photo Dur. (min)</Label>
                        <NumberField.Group className="flex items-center gap-1 bg-secondary/5 border border-separator/20 rounded-xl p-1">
                            <NumberField.DecrementButton className="w-8 h-8 rounded-lg bg-background shadow-sm hover:bg-secondary/10 flex items-center justify-center">-</NumberField.DecrementButton>
                            <NumberField.Input className="flex-1 text-center bg-transparent border-none text-sm" />
                            <NumberField.IncrementButton className="w-8 h-8 rounded-lg bg-background shadow-sm hover:bg-secondary/10 flex items-center justify-center">+</NumberField.IncrementButton>
                        </NumberField.Group>
                    </NumberField>

                    <NumberField
                        value={config.defaultVideoshootDuration}
                        onChange={(val) => handleUpdate({ defaultVideoshootDuration: val })}
                        minValue={0}
                    >
                        <Label className="text-xs font-medium mb-1.5">Video Dur. (min)</Label>
                        <NumberField.Group className="flex items-center gap-1 bg-secondary/5 border border-separator/20 rounded-xl p-1">
                            <NumberField.DecrementButton className="w-8 h-8 rounded-lg bg-background shadow-sm hover:bg-secondary/10 flex items-center justify-center">-</NumberField.DecrementButton>
                            <NumberField.Input className="flex-1 text-center bg-transparent border-none text-sm" />
                            <NumberField.IncrementButton className="w-8 h-8 rounded-lg bg-background shadow-sm hover:bg-secondary/10 flex items-center justify-center">+</NumberField.IncrementButton>
                        </NumberField.Group>
                    </NumberField>
                </div>
            </section>

            {/* Visibility & Quality */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:eye" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Visibility & Quality
                    </Label>
                </div>

                <div className="flex flex-col gap-4 bg-secondary/5 p-4 rounded-2xl border border-separator/10">
                    <Switch
                        isSelected={config.proMustBeConfirmed}
                        onChange={(checked) => handleUpdate({ proMustBeConfirmed: checked })}
                        className="flex-row-reverse justify-between w-full"
                    >
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                        <div className="space-y-0.5">
                            <Label className="text-sm font-semibold">Pro Must Confirm</Label>
                            <Description className="text-[10px]">Require pro to manually accept assignment.</Description>
                        </div>
                    </Switch>

                    <Separator className="opacity-30" />

                    <Switch
                        isSelected={config.showProToClient}
                        onChange={(checked) => handleUpdate({ showProToClient: checked })}
                        className="flex-row-reverse justify-between w-full"
                    >
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                        <div className="space-y-0.5">
                            <Label className="text-sm font-semibold">Show Pro to Client</Label>
                            <Description className="text-[10px]">Allow clients to see pro profile and details.</Description>
                        </div>
                    </Switch>

                    <Separator className="opacity-30" />

                    <NumberField
                        value={config.minProLevel || 1}
                        onChange={(val) => handleUpdate({ minProLevel: val })}
                        minValue={1}
                        maxValue={5}
                        className="w-full"
                    >
                        <div className="flex items-center justify-between mb-2 px-1">
                            <div className="space-y-0.5 flex-1">
                                <Label className="text-sm font-semibold">Minimum Pro Level</Label>
                                <Description className="text-[10px]">Filter pros by their system rating (1-5).</Description>
                            </div>
                            <NumberField.Group className="flex items-center gap-1 bg-background border border-separator/20 rounded-lg p-1 w-24 h-9">
                                <NumberField.DecrementButton className="w-6 h-6 rounded bg-secondary/10 flex items-center justify-center text-xs">-</NumberField.DecrementButton>
                                <NumberField.Input className="flex-1 text-center bg-transparent border-none text-xs font-bold" />
                                <NumberField.IncrementButton className="w-6 h-6 rounded bg-secondary/10 flex items-center justify-center text-xs">+</NumberField.IncrementButton>
                            </NumberField.Group>
                        </div>
                    </NumberField>
                </div>
            </section>
        </div>
    );
}
