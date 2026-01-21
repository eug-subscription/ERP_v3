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
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:message-square" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Communication Channel
                    </Label>
                </div>

                <RadioGroup
                    value={config.channel}
                    onChange={(val) => handleUpdate({ channel: val as SendNotificationConfigType['channel'] })}
                    orientation="horizontal"
                    className="gap-6"
                >
                    {NOTIFICATION_CHANNELS.map((channel) => (
                        <Radio key={channel.id} value={channel.id} className="data-[selected=true]:border-accent transition-all">
                            <Radio.Control><Radio.Indicator /></Radio.Control>
                            <Label className="text-sm font-semibold">{channel.label}</Label>
                        </Radio>
                    ))}
                </RadioGroup>
            </section>

            {/* Notification Content */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:pen-tool" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Notification Content
                    </Label>
                </div>

                <TextField
                    value={config.title || ''}
                    onChange={(val) => handleUpdate({ title: val })}
                    fullWidth
                    className="space-y-1.5"
                >
                    <Label className="text-xs font-medium text-muted-foreground ml-1">Subject / Title</Label>
                    <Input
                        placeholder="e.g. Action Required: Your photos are ready"
                        className="bg-secondary/5 border-separator/20 rounded-xl"
                    />
                    <Description className="text-[10px] ml-1">Short overview for emails or push notification header.</Description>
                </TextField>

                <TextField
                    value={config.body || ''}
                    onChange={(val) => handleUpdate({ body: val })}
                    fullWidth
                    className="space-y-1.5"
                >
                    <Label className="text-xs font-medium text-muted-foreground ml-1">Message Body</Label>
                    <TextArea
                        placeholder="Hi {{user_name}}, your project has reached a new stage..."
                        rows={4}
                        className="bg-secondary/5 border-separator/20 rounded-2xl p-3 text-sm min-h-[120px]"
                    />
                    <Description className="text-[10px] ml-1 italic">
                        Use {"{{variable_name}}"} for dynamic content.
                    </Description>
                </TextField>
            </section>

            <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 flex items-start gap-4">
                <div className="p-2 bg-accent/10 rounded-xl text-accent">
                    <Icon icon="lucide:zap" className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">Dynamic Variables</span>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        You can use project-specific variables like <code className="text-accent underline font-mono">{"{{project_name}}"}</code>,
                        <code className="text-accent underline font-mono">{"{{client_name}}"}</code>, and <code className="text-accent underline font-mono">{"{{order_id}}"}</code>.
                    </p>
                </div>
            </div>
        </div>
    );
}
