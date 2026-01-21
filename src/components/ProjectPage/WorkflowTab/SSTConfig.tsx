import { Label, Description, Select, ListBox, Switch, NumberField, Separator } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { SSTConfig as SSTConfigType } from '../../../types/workflow';

interface SSTConfigProps {
    config: SSTConfigType;
    onUpdate: (config: SSTConfigType) => void;
}

import { SST_DOMAINS, SST_RESOURCE_PACKS } from '../../../data/workflow-options';

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
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:settings" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        SST General Settings
                    </Label>
                </div>

                <Switch
                    isSelected={config.userCanAddNewItem}
                    onChange={(checked) => handleUpdate({ userCanAddNewItem: checked })}
                    className="flex-row-reverse justify-between w-full p-4 bg-secondary/5 rounded-2xl border border-separator/10"
                >
                    <Switch.Control>
                        <Switch.Thumb />
                    </Switch.Control>
                    <div className="space-y-0.5">
                        <Label className="text-sm font-semibold italic">Flexible Scenarios</Label>
                        <Description className="text-[10px]">Allow pro to add new items during the session.</Description>
                    </div>
                </Switch>
            </section>

            <Separator className="opacity-30" />

            {/* Cataloging & Assets */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:database" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Cataloging & Quality
                    </Label>
                </div>

                <div className="space-y-4">
                    <Select
                        placeholder="Choose domain..."
                        value={config.domain}
                        onChange={(id) => handleUpdate({ domain: id as string })}
                        className="space-y-2"
                    >
                        <Label className="text-xs font-medium text-muted-foreground ml-1 italic">Industry Domain</Label>
                        <Select.Trigger className="h-11 rounded-xl bg-secondary/10 border-separator/30">
                            <Select.Value />
                            <Select.Indicator><Icon icon="lucide:chevron-down" className="w-4 h-4" /></Select.Indicator>
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
                        className="space-y-2"
                    >
                        <Label className="text-xs font-medium text-muted-foreground ml-1 italic">Resource Pack</Label>
                        <Select.Trigger className="h-11 rounded-xl bg-secondary/10 border-separator/30">
                            <Select.Value />
                            <Select.Indicator><Icon icon="lucide:chevron-down" className="w-4 h-4" /></Select.Indicator>
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

            <Separator className="opacity-30" />

            {/* Submission Logic */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:send" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Submission Mode
                    </Label>
                </div>

                <div className="space-y-4">
                    <Switch
                        isSelected={config.submitMode === 'BULK'}
                        onChange={(isBulk) => handleUpdate({ submitMode: isBulk ? 'BULK' : 'SINGLE' })}
                        className="flex-row-reverse justify-between w-full p-4 bg-accent/5 rounded-2xl border border-accent/10"
                    >
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                        <div className="space-y-0.5">
                            <Label className="text-sm font-semibold capitalize italic">
                                {config.submitMode.toLowerCase()} Submission
                            </Label>
                            <Description className="text-[10px]">
                                {config.submitMode === 'SINGLE'
                                    ? 'Items are submitted one-by-one as they are ready.'
                                    : 'Items must be submitted together as a single batch.'}
                            </Description>
                        </div>
                    </Switch>

                    {config.submitMode === 'BULK' && (
                        <div className="p-4 bg-secondary/5 border border-separator/10 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
                            <NumberField
                                value={config.minPhotosToSubmit || 0}
                                onChange={(val) => handleUpdate({ minPhotosToSubmit: val })}
                                minValue={0}
                                fullWidth
                            >
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <Label className="text-xs font-medium text-muted-foreground italic">Minimum Photos per Batch</Label>
                                    <div className="text-[10px] font-bold text-accent uppercase tracking-tighter">Required</div>
                                </div>
                                <NumberField.Group className="flex items-center gap-1 bg-background border border-separator/20 rounded-xl p-1.5 shadow-sm">
                                    <NumberField.DecrementButton className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">-</NumberField.DecrementButton>
                                    <NumberField.Input className="flex-1 text-center bg-transparent border-none font-bold" />
                                    <NumberField.IncrementButton className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">+</NumberField.IncrementButton>
                                </NumberField.Group>
                                <Description className="text-[10px] mt-2 italic text-muted-foreground ml-1">
                                    Enter 0 if no minimum requirement exists.
                                </Description>
                            </NumberField>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
