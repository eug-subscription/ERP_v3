import { Label, Description, Select, ListBox, TextField, Input, Switch, Separator } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { FileRenamingConfig as FileRenamingConfigType } from '../../../types/workflow';

interface FileRenamingConfigProps {
    config: FileRenamingConfigType;
    onUpdate: (config: FileRenamingConfigType) => void;
}

import { FILE_RENAMING_MODES } from '../../../data/workflow-options';

/**
 * FileRenamingConfig Component
 * Manages the settings for automatic or template-based file renaming.
 */
export function FileRenamingConfig({ config, onUpdate }: FileRenamingConfigProps) {
    const handleUpdate = (updates: Partial<FileRenamingConfigType>) => {
        onUpdate({ ...config, ...updates });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
            {/* Rename Mode Section */}
            <Select
                placeholder="Select renaming mode"
                value={config.autoRenameMode}
                onChange={(val) => handleUpdate({ autoRenameMode: val as FileRenamingConfigType['autoRenameMode'] })}
                className="space-y-4"
            >
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Renaming Strategy
                </Label>
                <Select.Trigger className="h-12 rounded-2xl bg-secondary/5 border-separator/20 hover:border-accent/40 transition-colors">
                    <Select.Value />
                    <Select.Indicator><Icon icon="lucide:chevron-down" className="w-4 h-4" /></Select.Indicator>
                </Select.Trigger>
                <Select.Popover>
                    <ListBox>
                        {FILE_RENAMING_MODES.map((mode) => (
                            <ListBox.Item key={mode.id} id={mode.id} textValue={mode.label}>
                                <Label className="text-sm font-semibold">{mode.label}</Label>
                                <Description className="text-[10px]">{mode.description}</Description>
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Select.Popover>
            </Select>

            {config.autoRenameMode !== 'MANUAL' && (
                <>
                    <Separator className="opacity-30" />

                    {/* Pattern Configuration */}
                    <section className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2 mb-1">
                            <Icon icon="lucide:binary" className="w-4 h-4 text-accent" />
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Pattern Settings
                            </Label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextField
                                value={config.customPrefix || ''}
                                onChange={(val) => handleUpdate({ customPrefix: val })}
                                fullWidth
                                className="space-y-1.5"
                            >
                                <Label className="text-xs font-medium text-muted-foreground ml-1 italic">Format Prefix</Label>
                                <Input
                                    placeholder="e.g. PRJ_"
                                    className="bg-secondary/5 border-separator/20 rounded-xl"
                                />
                                <Description className="text-[10px] ml-1">Example: <span className="text-accent underline">PRJ_</span>001.jpg</Description>
                            </TextField>

                            <TextField
                                value={config.pattern || ''}
                                onChange={(val) => handleUpdate({ pattern: val })}
                                fullWidth
                                className="space-y-1.5"
                            >
                                <Label className="text-xs font-medium text-muted-foreground ml-1 italic">Sequence Pattern</Label>
                                <Input
                                    placeholder="e.g. 000"
                                    className="bg-secondary/5 border-separator/20 rounded-xl"
                                />
                                <Description className="text-[10px] ml-1">Defines digit count (000 = 001, 002...)</Description>
                            </TextField>
                        </div>

                        <Switch
                            isSelected={config.includeDate}
                            onChange={(checked) => handleUpdate({ includeDate: checked })}
                            className="flex-row-reverse justify-between w-full p-4 bg-accent/5 rounded-2xl border border-accent/10"
                        >
                            <Switch.Control>
                                <Switch.Thumb />
                            </Switch.Control>
                            <div className="space-y-0.5">
                                <Label className="text-sm font-semibold italic text-accent/90">Include Date</Label>
                                <Description className="text-[10px]">Append current date (YYYYMMDD) to filename.</Description>
                            </div>
                        </Switch>

                        {/* Live Preview of filename */}
                        <div className="p-4 bg-secondary/10 rounded-2xl border border-separator/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preview:</span>
                            </div>
                            <code className="text-sm font-mono text-foreground/80 break-all">
                                {config.customPrefix || 'PREFIX'}
                                {config.includeDate ? '_' + new Date().toISOString().split('T')[0].replace(/-/g, '') : ''}
                                _
                                {config.pattern || '001'}
                                .jpg
                            </code>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
