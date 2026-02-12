import { Label, Description, RadioGroup, Radio, TextField, Input, TextArea } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { SendNotificationConfig as SendNotificationConfigType } from '../../../types/workflow';
import { NOTIFICATION_CHANNELS } from '../../../data/workflow-options';

interface SendNotificationConfigProps {
    config: SendNotificationConfigType;
    onUpdate: (config: SendNotificationConfigType) => void;
}

/**
 * SendNotificationConfig Component
 * Configures outgoing communications for notification blocks.
 */
export function SendNotificationConfig({ config, onUpdate }: SendNotificationConfigProps) {
    const handleUpdate = (updates: Partial<SendNotificationConfigType>) => {
        onUpdate({ ...config, ...updates });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
            {/* Channel Selection */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:message-square" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Communication Channel
                    </Label>
                </div>

                <div className="bg-secondary/5 pt-1 px-4 pb-4 mx-[-1rem] border-y border-separator/10">
                    <RadioGroup
                        value={config.channel}
                        onChange={(val: string) => handleUpdate({ channel: val as SendNotificationConfigType['channel'] })}
                        className="gap-4"
                    >
                        {NOTIFICATION_CHANNELS.map((channel) => {
                            const iconMap: Record<string, string> = {
                                'EMAIL': 'lucide:mail',
                                'SMS': 'lucide:smartphone',
                                'APP': 'lucide:bell'
                            };
                            return (
                                <Radio key={channel.id} value={channel.id} className="data-[selected=true]:border-accent transition-all">
                                    <Radio.Control><Radio.Indicator /></Radio.Control>
                                    <Radio.Content>
                                        <div className="flex items-center gap-2">
                                            <Icon icon={iconMap[channel.id]} className="w-3.5 h-3.5 opacity-60" />
                                            <Label className="font-semibold text-sm">{channel.label}</Label>
                                        </div>
                                    </Radio.Content>
                                </Radio>
                            );
                        })}
                    </RadioGroup>
                </div>
            </section>

            {/* Notification Content */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:pen-tool" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Message Template
                    </Label>
                </div>

                <div className="bg-secondary/5 p-4 mx-[-1rem] border-y border-separator/10 space-y-5">
                    <TextField
                        value={config.title || ''}
                        onChange={(val) => handleUpdate({ title: val })}
                        fullWidth
                    >
                        <Label className="t-mini font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Subject / Title</Label>
                        <Input
                            placeholder="e.g. Action Required: Your photos are ready"
                            className="bg-secondary/20 border-separator/20 rounded-xl h-10 px-3 text-sm"
                        />
                    </TextField>

                    <TextField
                        value={config.body || ''}
                        onChange={(val) => handleUpdate({ body: val })}
                        fullWidth
                    >
                        <Label className="t-mini font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Message Body</Label>
                        <TextArea
                            placeholder="Hi {{user_name}}, your project has reached a new stage..."
                            className="bg-secondary/20 border-separator/20 rounded-xl p-3 text-sm min-h-[100px] leading-relaxed"
                        />
                        <Description className="t-mini block mt-1.5 opacity-60 italic">
                            Tip: Variables like {"{{project_name}}"} are supported.
                        </Description>
                    </TextField>
                </div>
            </section>

            {/* Hint Box */}
            <div className="bg-accent/5 p-4 mx-[-1rem] border-y border-accent/10 flex gap-4 items-start animate-in zoom-in-95 duration-300">
                <div className="p-2 bg-accent/10 rounded-xl text-accent">
                    <Icon icon="lucide:sparkles" className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                    <span className="t-mini font-bold uppercase tracking-widest text-accent/80">Dynamic Context</span>
                    <p className="t-mini text-muted-foreground/80 leading-relaxed font-medium">
                        Use <code className="text-accent underline font-mono">{"{{client_name}}"}</code> or <code className="text-accent underline font-mono">{"{{order_id}}"}</code>
                        to personalize your message automatically for each recipient.
                    </p>
                </div>
            </div>
        </div>
    );
}
