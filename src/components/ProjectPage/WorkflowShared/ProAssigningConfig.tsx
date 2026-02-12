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
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:users" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Assignment Strategy
                    </Label>
                </div>

                <div className="bg-secondary/5 pt-1 px-4 pb-4 mx-[-1rem] border-y border-separator/10">
                    <RadioGroup
                        value={config.whoHasAccess}
                        onChange={(val) => handleUpdate({ whoHasAccess: val as ProAssigningConfigType['whoHasAccess'] })}
                        className="gap-4 p-0"
                    >
                        {PRO_ASSIGNMENT_STRATEGIES.map((strategy) => (
                            <Radio key={strategy.id} value={strategy.id} className="data-[selected=true]:border-accent transition-all">
                                <Radio.Control><Radio.Indicator /></Radio.Control>
                                <Radio.Content>
                                    <Label className="font-semibold text-sm block">{strategy.label}</Label>
                                    <Description className="t-mini block">{strategy.description}</Description>
                                </Radio.Content>
                            </Radio>
                        ))}
                    </RadioGroup>
                </div>
            </section>

            {/* Messaging */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:message-square" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Communication
                    </Label>
                </div>

                <div className="bg-secondary/5 p-4 mx-[-1rem] border-y border-separator/10">
                    <TextField
                        value={config.welcomeText || ''}
                        onChange={(val) => handleUpdate({ welcomeText: val })}
                        fullWidth
                    >
                        <Label className="t-mini font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                            Welcome Message
                        </Label>
                        <Input
                            placeholder="Welcome to the project! Please review guidelines..."
                            className="bg-secondary/20 border-separator/20 rounded-xl"
                        />
                        <Description className="t-mini block mt-1">Message shown to the professional upon assignment.</Description>
                    </TextField>
                </div>
            </section>

            {/* Capacity & Duration */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:clock" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Capacity & Duration
                    </Label>
                </div>

                <div className="bg-secondary/5 p-4 mx-[-1rem] border-y border-separator/10 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <NumberField
                            value={config.photographerSlots}
                            onChange={(val) => handleUpdate({ photographerSlots: val })}
                            minValue={0}
                            className="w-full"
                        >
                            <Label className="t-mini font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                                Photo Slots
                            </Label>
                            <NumberField.Group className="bg-field border border-divider rounded-lg overflow-hidden flex items-center h-10">
                                <NumberField.DecrementButton className="h-full px-1 hover:bg-field-hover flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                                <NumberField.Input className="flex-1 bg-transparent px-1 text-sm tabular-nums text-center min-w-0" />
                                <NumberField.IncrementButton className="h-full px-1 hover:bg-field-hover flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                            </NumberField.Group>
                        </NumberField>

                        <NumberField
                            value={config.videographerSlots}
                            onChange={(val) => handleUpdate({ videographerSlots: val })}
                            minValue={0}
                            className="w-full"
                        >
                            <Label className="t-mini font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                                Video Slots
                            </Label>
                            <NumberField.Group className="bg-field border border-divider rounded-lg overflow-hidden flex items-center h-10">
                                <NumberField.DecrementButton className="h-full px-1 hover:bg-field-hover flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                                <NumberField.Input className="flex-1 bg-transparent px-1 text-sm tabular-nums text-center min-w-0" />
                                <NumberField.IncrementButton className="h-full px-1 hover:bg-field-hover flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                            </NumberField.Group>
                        </NumberField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <NumberField
                            value={config.defaultPhotoshootDuration}
                            onChange={(val) => handleUpdate({ defaultPhotoshootDuration: val })}
                            minValue={0}
                            className="w-full"
                        >
                            <Label className="t-mini font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                                Photo Dur. (min)
                            </Label>
                            <NumberField.Group className="bg-field border border-divider rounded-lg overflow-hidden flex items-center h-10">
                                <NumberField.DecrementButton className="h-full px-1 hover:bg-field-hover flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                                <NumberField.Input className="flex-1 bg-transparent px-1 text-sm tabular-nums text-center min-w-0" />
                                <NumberField.IncrementButton className="h-full px-1 hover:bg-field-hover flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                            </NumberField.Group>
                        </NumberField>

                        <NumberField
                            value={config.defaultVideoshootDuration}
                            onChange={(val) => handleUpdate({ defaultVideoshootDuration: val })}
                            minValue={0}
                            className="w-full"
                        >
                            <Label className="t-mini font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                                Video Dur. (min)
                            </Label>
                            <NumberField.Group className="bg-field border border-divider rounded-lg overflow-hidden flex items-center h-10">
                                <NumberField.DecrementButton className="h-full px-1 hover:bg-field-hover flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                                <NumberField.Input className="flex-1 bg-transparent px-1 text-sm tabular-nums text-center min-w-0" />
                                <NumberField.IncrementButton className="h-full px-1 hover:bg-field-hover flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                            </NumberField.Group>
                        </NumberField>
                    </div>
                </div>
            </section>

            {/* Visibility & Quality */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:eye" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Visibility & Quality
                    </Label>
                </div>

                <div className="bg-secondary/5 pt-2 px-4 pb-4 mx-[-1rem] border-y border-separator/10 flex flex-col gap-4">
                    <Switch
                        isSelected={config.proMustBeConfirmed}
                        onChange={(checked) => handleUpdate({ proMustBeConfirmed: checked })}
                        className="flex-row-reverse justify-between w-full"
                    >
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                        <div className="flex flex-col gap-0.5">
                            <Label className="text-sm font-semibold block">Pro Must Confirm</Label>
                            <Description className="t-mini block m-0 p-0">Require pro to manually accept assignment.</Description>
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
                        <div className="flex flex-col gap-0.5">
                            <Label className="text-sm font-semibold block">Show Pro to Client</Label>
                            <Description className="t-mini block m-0 p-0">Allow clients to see pro profile and details.</Description>
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
                        <div className="mb-2.5">
                            <Label className="t-mini font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                                Minimum Pro Level
                            </Label>
                            <Description className="t-mini block m-0 p-0">Filter pros by their system rating (1-5).</Description>
                        </div>
                        <NumberField.Group className="bg-field border border-divider rounded-lg overflow-hidden flex items-center h-10">
                            <NumberField.DecrementButton className="h-full px-1 hover:bg-field-hover flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                            <NumberField.Input className="flex-1 bg-transparent px-1 text-sm tabular-nums text-center min-w-0" />
                            <NumberField.IncrementButton className="h-full px-1 hover:bg-field-hover flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                        </NumberField.Group>
                    </NumberField>
                </div>
            </section>
        </div>
    );
}
