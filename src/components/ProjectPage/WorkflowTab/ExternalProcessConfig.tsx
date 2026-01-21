import { TextField, Input, Label, Description, TextArea, Separator, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { ExternalProcessConfig as ExternalProcessConfigType } from '../../../types/workflow';

interface ExternalProcessConfigProps {
    config: ExternalProcessConfigType;
    onUpdate: (config: ExternalProcessConfigType) => void;
}

/**
 * ExternalProcessConfig Component
 * Configures webhook URLs and payload templates for automation blocks.
 */
export function ExternalProcessConfig({ config, onUpdate }: ExternalProcessConfigProps) {
    const handleUpdate = (updates: Partial<ExternalProcessConfigType>) => {
        onUpdate({ ...config, ...updates });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-500">
            {/* Webhook Configuration */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:link" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Webhook Configuration
                    </Label>
                </div>

                <TextField
                    value={config.webhookUrl}
                    onChange={(val) => handleUpdate({ webhookUrl: val })}
                    isRequired
                    fullWidth
                    className="space-y-1.5"
                >
                    <Label className="text-sm font-semibold mb-1">Webhook URL</Label>
                    <Input
                        placeholder="https://zapier.com/hooks/..."
                        className="bg-secondary/10 border-separator/30 focus:border-accent h-11 px-4 rounded-xl"
                    />
                    <Description className="text-[10px] italic">
                        The URL where the workflow will send a POST request when this block is triggered.
                    </Description>
                </TextField>
            </section>

            <Separator className="opacity-30" />

            {/* Custom Payload */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:code" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Payload Template (JSON)
                    </Label>
                </div>

                <TextField
                    value={config.payloadTemplate || ''}
                    onChange={(val) => handleUpdate({ payloadTemplate: val })}
                    fullWidth
                    className="space-y-1.5"
                >
                    <Label className="text-sm font-semibold mb-1">Custom Payload</Label>
                    <TextArea
                        placeholder='{ "orderId": "{{order.id}}", "status": "processing" }'
                        rows={6}
                        className="bg-secondary/10 border-separator/30 rounded-xl p-4 font-mono text-xs focus:ring-1 focus:ring-accent"
                    />
                </TextField>

                <div className="bg-accent/5 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <Icon icon="lucide:info" className="w-4 h-4 text-accent" />
                        <span className="text-xs font-bold text-accent uppercase tracking-wider">Dynamic Variables</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Use double curly braces to inject data from the order:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['order.id', 'order.status', 'project.id', 'client.email'].map((variable) => (
                            <code key={variable} className="px-1.5 py-0.5 rounded bg-background border border-accent/10 text-[9px] text-accent font-mono">
                                {"{{" + variable + "}}"}
                            </code>
                        ))}
                    </div>
                </div>
            </section>

            <Separator className="opacity-30" />

            {/* Connection Test */}
            <section className="bg-secondary/5 border border-separator/20 rounded-2xl p-6 space-y-5">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Icon icon="lucide:cable" className="w-4 h-4 text-accent" />
                        <h4 className="text-sm font-bold">Integration Status</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        When this block is reached, Splento will send a POST request to your URL.
                        Your system can then manage order statuses via our API.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <Button
                        variant="secondary"
                        onPress={() => { /* TODO: Implement webhook test logic */ }}
                        className="w-full sm:w-auto font-semibold px-6 rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                        <Icon icon="lucide:zap" className="w-4 h-4 mr-2 text-accent" />
                        Test Connection
                    </Button>

                    <div className="flex items-center gap-1.5 text-accent hover:underline cursor-pointer transition-all decoration-accent/30 underline-offset-4">
                        <Icon icon="lucide:book-open" className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wide">Developer Docs</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
