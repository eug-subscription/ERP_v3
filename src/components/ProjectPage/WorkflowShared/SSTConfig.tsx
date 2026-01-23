import { Label, Description, Select, ListBox, Switch, NumberField, Separator } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { SSTConfig as SSTConfigType } from '../../../types/workflow';
import { SST_DOMAINS, SST_RESOURCE_PACKS } from '../../../data/workflow-options';

interface SSTConfigProps {
    config: SSTConfigType;
    onUpdate: (config: SSTConfigType) => void;
}


/**
 * SSTConfig Component
 * Configures Shoot, Sort, and Transfer (SST) step settings.
 */
export function SSTConfig({ config, onUpdate }: SSTConfigProps) {
    const handleUpdate = (updates: Partial<SSTConfigType>) => {
        onUpdate({ ...config, ...updates });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
            {/* General Settings */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:settings" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        General Settings
                    </Label>
                </div>

                <div className="bg-secondary/5 pt-2 px-4 pb-4 mx-[-1rem] border-y border-separator/10">
                    <Switch
                        isSelected={config.userCanAddNewItem}
                        onChange={(checked) => handleUpdate({ userCanAddNewItem: checked })}
                        className="flex-row-reverse justify-between w-full"
                    >
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                        <div className="flex flex-col gap-0.5">
                            <Label className="text-sm font-semibold block">Flexible Scenarios</Label>
                            <Description className="text-[10px] block m-0 p-0">Allow pro to add new items during the session.</Description>
                        </div>
                    </Switch>
                </div>
            </section>

            {/* Cataloging & Assets */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:database" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Cataloging & Quality
                    </Label>
                </div>

                <div className="bg-secondary/5 p-4 mx-[-1rem] border-y border-separator/10 space-y-5">
                    <Select
                        placeholder="Choose domain..."
                        value={config.domain}
                        onChange={(id) => handleUpdate({ domain: id as string })}
                        fullWidth
                    >
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                            Industry Domain
                        </Label>
                        <Select.Trigger className="h-10 rounded-xl bg-secondary/20 border-separator/20">
                            <Select.Value />
                            <Select.Indicator><Icon icon="lucide:chevron-down" className="w-4 h-4 opacity-50" /></Select.Indicator>
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                {SST_DOMAINS.map(opt => (
                                    <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                                        <Label className="font-medium text-sm">{opt.label}</Label>
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>

                    <Select
                        placeholder="Choose pack..."
                        value={config.resourcePack}
                        onChange={(id) => handleUpdate({ resourcePack: id as string })}
                        fullWidth
                    >
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                            Resource Pack
                        </Label>
                        <Select.Trigger className="h-10 rounded-xl bg-secondary/20 border-separator/20">
                            <Select.Value />
                            <Select.Indicator><Icon icon="lucide:chevron-down" className="w-4 h-4 opacity-50" /></Select.Indicator>
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                {SST_RESOURCE_PACKS.map(opt => (
                                    <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                                        <Label className="font-medium text-sm">{opt.label}</Label>
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </div>
            </section>

            {/* Submission Mode */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:send" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Submission Mode
                    </Label>
                </div>

                <div className="bg-secondary/5 pt-2 px-4 pb-4 mx-[-1rem] border-y border-separator/10 flex flex-col gap-5">
                    <Switch
                        isSelected={config.submitMode === 'BULK'}
                        onChange={(isBulk) => handleUpdate({ submitMode: isBulk ? 'BULK' : 'SINGLE' })}
                        className="flex-row-reverse justify-between w-full"
                    >
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                        <div className="flex flex-col gap-0.5">
                            <Label className="text-sm font-semibold block capitalize">
                                {config.submitMode.toLowerCase()} Submission
                            </Label>
                            <Description className="text-[10px] block m-0 p-0">
                                {config.submitMode === 'SINGLE'
                                    ? 'Items are submitted one-by-one as they are ready.'
                                    : 'Items must be submitted together as a single batch.'}
                            </Description>
                        </div>
                    </Switch>

                    {config.submitMode === 'BULK' && (
                        <>
                            <Separator className="opacity-30" />
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <NumberField
                                    value={config.minPhotosToSubmit || 0}
                                    onChange={(val) => handleUpdate({ minPhotosToSubmit: val })}
                                    minValue={0}
                                    className="w-full"
                                >
                                    <div className="mb-2.5 px-0.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                                            Minimum Photos per Batch
                                        </Label>
                                        <Description className="text-[10px] block m-0 p-0">Enter 0 if no minimum requirement exists.</Description>
                                    </div>
                                    <NumberField.Group className="bg-content2 border border-divider rounded-lg overflow-hidden flex items-center h-10">
                                        <NumberField.DecrementButton className="h-full px-1 hover:bg-content3 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                                        <NumberField.Input className="flex-1 bg-transparent px-1 text-sm tabular-nums text-center min-w-0" />
                                        <NumberField.IncrementButton className="h-full px-1 hover:bg-content3 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                                    </NumberField.Group>
                                </NumberField>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
