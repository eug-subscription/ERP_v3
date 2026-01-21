import { Label, Description, NumberField, Separator } from '@heroui/react';
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
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:hard-drive" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Storage Retention
                    </Label>
                </div>

                <div className="bg-secondary/5 border border-separator/10 rounded-2xl p-6 space-y-6">
                    <NumberField
                        value={config.timeToLife}
                        onChange={(val) => handleUpdate({ timeToLife: val })}
                        minValue={0}
                        fullWidth
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-semibold italic">Time to Life</Label>
                                <Description className="text-[10px]">How many days to keep files after the step is completed.</Description>
                            </div>
                            <div className="text-xs font-bold px-2 py-1 bg-accent/10 text-accent rounded-lg border border-accent/20">
                                {config.timeToLife === 0 ? 'Indefinite' : `${config.timeToLife} Days`}
                            </div>
                        </div>

                        <NumberField.Group className="flex items-center gap-1 bg-background border border-separator/20 rounded-xl p-1.5 shadow-sm focus-within:border-accent/50 transition-colors">
                            <NumberField.DecrementButton className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors">
                                <Icon icon="lucide:minus" className="w-4 h-4" />
                            </NumberField.DecrementButton>

                            <NumberField.Input className="flex-1 text-center bg-transparent border-none text-lg font-bold" />

                            <NumberField.IncrementButton className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors">
                                <Icon icon="lucide:plus" className="w-4 h-4" />
                            </NumberField.IncrementButton>
                        </NumberField.Group>

                        <Description className="text-[10px] mt-3 flex items-center gap-1.5 text-muted-foreground italic">
                            <Icon icon="lucide:info" className="w-3.5 h-3.5" />
                            Set to <span className="font-bold text-accent">0</span> to disable automatic deletion (archived forever).
                        </Description>
                    </NumberField>
                </div>
            </section>

            <Separator className="opacity-30" />

            {/* Cost Info */}
            <div className="bg-warning/5 rounded-2xl p-4 border border-warning/20 flex gap-4 items-start">
                <div className="p-2 bg-warning/10 rounded-xl text-warning">
                    <Icon icon="lucide:alert-circle" className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-warning/80">Cost Optimization</span>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Extended retention policies (TTL {'>'} 90 days) or choosing "Indefinite" storage
                        will incur higher cloud storage fees. We recommend 30-60 days for raw assets.
                    </p>
                </div>
            </div>
        </div>
    );
}
