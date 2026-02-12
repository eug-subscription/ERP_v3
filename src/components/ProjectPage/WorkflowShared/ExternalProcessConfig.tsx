import { TextField, Input, Label, Description, TextArea, Button, toast } from '@heroui/react';
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
        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
            {/* Webhook Configuration */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:link" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Webhook Configuration
                    </Label>
                </div>

                <div className="bg-secondary/5 p-4 mx-[-1rem] border-y border-separator/10">
                    <TextField
                        value={config.webhookUrl}
                        onChange={(val) => handleUpdate({ webhookUrl: val })}
                        isRequired
                        fullWidth
                    >
                        <Label className="t-mini font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                            Webhook URL
                        </Label>
                        <Input
                            placeholder="https://zapier.com/hooks/..."
                            className="bg-secondary/20 border-separator/20 rounded-xl h-10 px-4 text-sm"
                        />
                        <Description className="t-mini block mt-1">
                            The URL where the workflow will send a POST request when triggered.
                        </Description>
                    </TextField>
                </div>
            </section>

            {/* Custom Payload */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:code" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Payload Template (JSON)
                    </Label>
                </div>

                <div className="bg-secondary/5 p-4 mx-[-1rem] border-y border-separator/10 space-y-4">
                    <TextField
                        value={config.payloadTemplate || ''}
                        onChange={(val) => handleUpdate({ payloadTemplate: val })}
                        fullWidth
                    >
                        <Label className="t-mini font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                            Custom Payload
                        </Label>
                        <TextArea
                            placeholder='{ "orderId": "{{order.id}}", "status": "processing" }'
                            rows={6}
                            className="bg-secondary/20 border-separator/20 rounded-2xl p-4 font-mono text-xs"
                        />
                    </TextField>

                    <div className="bg-field/50 rounded-2xl p-4 border border-divider/10 space-y-3">
                        <div className="flex items-center gap-2">
                            <Icon icon="lucide:info" className="w-4 h-4 text-accent" />
                            <span className="t-mini font-bold text-accent uppercase tracking-wider">Dynamic Variables</span>
                        </div>
                        <p className="t-mini text-muted-foreground leading-relaxed">
                            Inject data from the order using double curly braces:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['order.id', 'order.status', 'project.id', 'client.email'].map((variable) => (
                                <code key={variable} className="px-1.5 py-0.5 rounded bg-background border border-accent/10 t-micro text-accent font-mono">
                                    {"{{" + variable + "}}"}
                                </code>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Connection Test */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:cable" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Integration Testing
                    </Label>
                </div>

                <div className="bg-secondary/5 p-4 mx-[-1rem] border-y border-separator/10 space-y-4">
                    <div className="space-y-1">
                        <Label className="text-sm font-semibold block">Integration Status</Label>
                        <Description className="t-mini block m-0 p-0">
                            When reached, Splento will send a POST request. Manage order statuses via our API.
                        </Description>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            variant="primary"
                            onPress={() => {
                                toast("Webhook Sent", {
                                    variant: "success",
                                    description: `Successfully dispatched test payload to ${config.webhookUrl || 'endpoint'}`
                                });
                            }}
                            className="w-full font-semibold px-6 rounded-xl shadow-sm hover:shadow-md transition-all h-10 text-sm"
                        >
                            <Icon icon="lucide:zap" className="w-4 h-4" />
                            Test Connection
                        </Button>

                        <div className="flex items-center justify-center gap-1.5 text-accent hover:underline cursor-pointer transition-all decoration-accent/30 underline-offset-4 py-2">
                            <Icon icon="lucide:book-open" className="w-4 h-4" />
                            <span className="t-mini font-bold uppercase tracking-wider">Developer Documentation</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
