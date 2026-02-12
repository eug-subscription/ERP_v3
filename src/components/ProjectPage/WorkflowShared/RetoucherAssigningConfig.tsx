import { RadioGroup, Radio, Label, Description, TextField, Input, NumberField, Switch, Separator, InputGroup, Button } from '@heroui/react';
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
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:user-cog" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Assignment Strategy
                    </Label>
                </div>

                <div className="bg-secondary/5 pt-1 px-4 pb-4 mx-[-1rem] border-y border-separator/10">
                    <RadioGroup
                        value={config.whoHasAccess}
                        onChange={(val) => handleUpdate({ whoHasAccess: val as RetoucherAssigningConfigType['whoHasAccess'] })}
                        className="gap-4 p-0"
                    >
                        {RETOUCHER_ASSIGNMENT_STRATEGIES.map((strategy) => (
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

            {/* Communication & Guidelines */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:file-text" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Onboarding & Guidelines
                    </Label>
                </div>

                <div className="bg-secondary/5 p-4 mx-[-1rem] border-y border-separator/10 space-y-4">
                    <TextField
                        value={config.welcomeText || ''}
                        onChange={(val) => handleUpdate({ welcomeText: val })}
                        fullWidth
                    >
                        <Label className="t-mini font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                            Welcome Message
                        </Label>
                        <Input
                            placeholder="Hi! Ready for some retouching? Please follow these steps..."
                            className="bg-secondary/20 border-separator/20 rounded-xl"
                        />
                    </TextField>

                    <TextField
                        value={config.guidelines || ''}
                        onChange={(val) => handleUpdate({ guidelines: val })}
                        fullWidth
                    >
                        <Label className="t-mini font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                            Production Guidelines
                        </Label>
                        <InputGroup
                            fullWidth
                            className="flex flex-col bg-surface border border-divider rounded-3xl overflow-hidden shadow-sm transition-all focus-within:shadow-md focus-within:border-accent/40"
                        >
                            <InputGroup.TextArea
                                placeholder="Assign tasks or ask anything..."
                                rows={4}
                                className="w-full bg-transparent p-4 text-sm resize-none border-none outline-none focus:ring-0 min-h-[120px] text-foreground placeholder:text-default-400/60"
                            />
                            <div className="flex w-full items-center justify-between px-3 pb-3">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Attach file"
                                    className="rounded-full text-default-400 hover:text-accent hover:bg-accent/10"
                                >
                                    <Icon icon="lucide:paperclip" className="w-5 h-5" />
                                </Button>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="primary"
                                    aria-label="Add guideline"
                                    isDisabled={!config.guidelines?.trim()}
                                    className="rounded-full shadow-accent-sm w-8 h-8"
                                >
                                    <Icon icon="lucide:arrow-up" className="w-4 h-4" />
                                </Button>
                            </div>
                        </InputGroup>
                        <Description className="t-mini block mt-1">Specific technical instructions for this step.</Description>
                    </TextField>

                    <Switch
                        isSelected={config.needAcceptGuidelines}
                        onChange={(checked) => handleUpdate({ needAcceptGuidelines: checked })}
                        className="flex-row-reverse justify-between w-full"
                    >
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                        <div className="flex flex-col gap-0.5">
                            <Label className="text-sm font-semibold block">Enforce Guidelines</Label>
                            <Description className="t-mini block m-0 p-0">Pro must acknowledge reading guidelines before starting.</Description>
                        </div>
                    </Switch>
                </div>
            </section>

            {/* Quality & Client Visibility */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:shield-check" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Quality & Visibility
                    </Label>
                </div>

                <div className="bg-secondary/5 pt-2 px-4 pb-4 mx-[-1rem] border-y border-separator/10 flex flex-col gap-4">
                    <Switch
                        isSelected={config.showRetoucherToClient}
                        onChange={(checked) => handleUpdate({ showRetoucherToClient: checked })}
                        className="flex-row-reverse justify-between w-full"
                    >
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                        <div className="flex flex-col gap-0.5">
                            <Label className="text-sm font-semibold block">Show Retoucher to Client</Label>
                            <Description className="t-mini block m-0 p-0">Allow clients to see who is working on their files.</Description>
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
                        <div className="mb-2.5">
                            <Label className="t-mini font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                                Minimum Skill Level
                            </Label>
                            <Description className="t-mini block m-0 p-0">Required rating for retouchers (1-5 star scale).</Description>
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
