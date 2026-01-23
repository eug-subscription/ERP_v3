import { Label, Description, NumberField } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { FileStorageConfig as FileStorageConfigType } from '../../../types/workflow';

interface FileStorageConfigProps {
    config: FileStorageConfigType;
    onUpdate: (config: FileStorageConfigType) => void;
}

/**
 * FileStorageConfig Component
 * Configures retention policies for files generated or uploaded during the workflow.
 */
export function FileStorageConfig({ config, onUpdate }: FileStorageConfigProps) {
    const handleUpdate = (updates: Partial<FileStorageConfigType>) => {
        onUpdate({ ...config, ...updates });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
            {/* Retention Settings */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:hard-drive" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Storage Retention
                    </Label>
                </div>

                <div className="bg-secondary/5 p-4 mx-[-1rem] border-y border-separator/10">
                    <NumberField
                        value={config.timeToLife}
                        onChange={(val) => handleUpdate({ timeToLife: val })}
                        minValue={0}
                        fullWidth
                    >
                        <div className="flex items-center justify-between mb-2 px-0.5">
                            <div className="space-y-0.5">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Time to Life</Label>
                                <Description className="text-[10px] block m-0 p-0 text-muted-foreground/60">Days to keep files after completion.</Description>
                            </div>
                            {config.timeToLife === 0 && (
                                <div className="text-[10px] font-bold px-2 py-0.5 bg-accent/10 text-accent rounded-full border border-accent/20 uppercase tracking-tight animate-in fade-in zoom-in-95 duration-200">
                                    Indefinite
                                </div>
                            )}
                        </div>

                        <NumberField.Group className="bg-content2 border border-divider rounded-lg overflow-hidden flex items-center h-10">
                            <NumberField.DecrementButton className="h-full px-1 hover:bg-content3 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                            <NumberField.Input className="flex-1 bg-transparent px-1 text-sm tabular-nums text-center min-w-0" />
                            <NumberField.IncrementButton className="h-full px-1 hover:bg-content3 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                        </NumberField.Group>

                        <div className="mt-3 px-1 flex items-start gap-1.5 opacity-60">
                            <Icon icon="lucide:info" className="w-3 h-3 mt-0.5" />
                            <p className="text-[10px] leading-tight m-0 p-0 italic">Set to 0 to disable automatic deletion (archived forever).</p>
                        </div>
                    </NumberField>
                </div>
            </section>

            {/* Cost Info */}
            <div className="bg-warning/5 p-4 mx-[-1rem] border-y border-warning/10 flex gap-4 items-start animate-in slide-in-from-bottom-2 duration-300">
                <div className="p-2 bg-warning/10 rounded-xl text-warning">
                    <Icon icon="lucide:zap" className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-warning/80">Infrastructure Note</span>
                    <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-medium">
                        Extended retention policies (TTL {'>'} 90 days) will incur higher cloud storage fees.
                        We recommend 30-60 days for raw assets.
                    </p>
                </div>
            </div>
        </div>
    );
}
