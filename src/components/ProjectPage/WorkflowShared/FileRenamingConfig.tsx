import { Label, Description, TextField, Input, RadioGroup, Radio, Switch } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { FileRenamingConfig as FileRenamingConfigType } from '../../../types/workflow';
import { FILE_RENAMING_MODES } from '../../../data/workflow-options';

interface FileRenamingConfigProps {
    config: FileRenamingConfigType;
    onUpdate: (config: FileRenamingConfigType) => void;
}


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
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:shuffle" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Renaming Strategy
                    </Label>
                </div>

                <div className="bg-secondary/5 pt-1 px-4 pb-4 mx-[-1rem] border-y border-separator/10">
                    <RadioGroup
                        value={config.autoRenameMode}
                        onChange={(val: string) => handleUpdate({ autoRenameMode: val as FileRenamingConfigType['autoRenameMode'] })}
                        className="gap-4"
                    >
                        {FILE_RENAMING_MODES.map((mode) => (
                            <Radio key={mode.id} value={mode.id} className="data-[selected=true]:border-accent transition-all">
                                <Radio.Control><Radio.Indicator /></Radio.Control>
                                <Radio.Content>
                                    <Label className="font-semibold text-sm block">{mode.label}</Label>
                                    <Description className="t-mini block line-clamp-2">{mode.description}</Description>
                                </Radio.Content>
                            </Radio>
                        ))}
                    </RadioGroup>
                </div>
            </section>

            {config.autoRenameMode !== 'MANUAL' && (
                <section className="animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-2.5">
                        <Icon icon="lucide:binary" className="w-4 h-4 text-accent" />
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Pattern Settings
                        </Label>
                    </div>

                    <div className="bg-secondary/5 p-4 mx-[-1rem] border-y border-separator/10 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <TextField
                                value={config.customPrefix || ''}
                                onChange={(val) => handleUpdate({ customPrefix: val })}
                                fullWidth
                            >
                                <Label className="t-mini font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Prefix</Label>
                                <Input
                                    placeholder="e.g. PRJ_"
                                    className="bg-secondary/20 border-separator/20 rounded-xl h-10 px-3 text-sm"
                                />
                            </TextField>

                            <TextField
                                value={config.pattern || ''}
                                onChange={(val) => handleUpdate({ pattern: val })}
                                fullWidth
                            >
                                <Label className="t-mini font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Sequence</Label>
                                <Input
                                    placeholder="e.g. 000"
                                    className="bg-secondary/20 border-separator/20 rounded-xl h-10 px-3 text-sm"
                                />
                            </TextField>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Switch
                                isSelected={config.includeDate}
                                onChange={(checked) => handleUpdate({ includeDate: checked })}
                                className="flex-row-reverse justify-between w-full"
                            >
                                <Switch.Control>
                                    <Switch.Thumb />
                                </Switch.Control>
                                <div className="flex flex-col gap-0.5">
                                    <Label className="text-sm font-semibold block">Include Date</Label>
                                    <Description className="t-mini block m-0 p-0">Append YYYYMMDD to filename.</Description>
                                </div>
                            </Switch>

                            <Switch
                                isSelected={config.includeTime}
                                onChange={(checked) => handleUpdate({ includeTime: checked })}
                                className="flex-row-reverse justify-between w-full"
                            >
                                <Switch.Control>
                                    <Switch.Thumb />
                                </Switch.Control>
                                <div className="flex flex-col gap-0.5">
                                    <Label className="text-sm font-semibold block">Include Time</Label>
                                    <Description className="t-mini block m-0 p-0">Append HHMMSS to filename.</Description>
                                </div>
                            </Switch>
                        </div>

                        {/* Live Preview of filename */}
                        <div className="p-4 bg-field/50 rounded-2xl border border-divider/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-accent opacity-70" />
                                <span className="t-mini font-bold uppercase tracking-wider text-muted-foreground">Filename Preview</span>
                            </div>
                            <div className="bg-background/50 p-4 rounded-xl border border-divider/5 flex items-center justify-center min-h-[50px]">
                                <code className="text-xs font-mono text-accent break-all text-center leading-relaxed">
                                    {config.customPrefix || 'PREFIX'}
                                    {config.includeDate ? '_' + new Date().toISOString().split('T')[0].replace(/-/g, '') : ''}
                                    {config.includeTime ? '_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '') : ''}
                                    _
                                    {config.pattern || '001'}
                                    .jpg
                                </code>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
