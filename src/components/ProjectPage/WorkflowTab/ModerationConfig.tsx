import {
    Label,
    Select,
    ListBox,
    Description,
    RadioGroup,
    Radio,
    CheckboxGroup,
    Checkbox,
    NumberField
} from '@heroui/react';
import { Icon } from '@iconify/react';
import type {
    ModerationConfig as ModerationConfigType,
    WorkflowBlock,
    ModeratorType,
    ModerationOutcome,
    ModeratorRole
} from '../../../types/workflow';
import { MODERATOR_ROLES } from '../../../data/workflow-options';

interface ModerationConfigProps {
    config: ModerationConfigType;
    availableSteps: WorkflowBlock[];
    onUpdate: (config: ModerationConfigType) => void;
}

/**
 * ModerationConfig Component
 * Manages the settings for a Moderation block, including moderator type, 
 * outcomes, and access control.
 */
export function ModerationConfig({ config, availableSteps, onUpdate }: ModerationConfigProps) {

    const handleUpdate = (updates: Partial<ModerationConfigType>) => {
        onUpdate({ ...config, ...updates });
    };

    const isRevisionEnabled = config.outcomes.includes('REVISION');
    const isRejectEnabled = config.outcomes.includes('REJECT');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
            {/* Moderator Type Selection */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:user-cog" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Moderator Type
                    </Label>
                </div>

                <div className="bg-secondary/5 pt-1 px-4 pb-4 mx-[-1rem] border-y border-separator/10">
                    <RadioGroup
                        value={config.type}
                        onChange={(val) => handleUpdate({ type: val as ModeratorType })}
                        className="gap-4"
                    >
                        <Radio value="INTERNAL" className="data-[selected=true]:border-accent transition-all">
                            <Radio.Control><Radio.Indicator /></Radio.Control>
                            <Radio.Content>
                                <Label className="font-semibold text-sm block">Internal Team</Label>
                                <Description className="text-[10px] block">Managed by project managers</Description>
                            </Radio.Content>
                        </Radio>
                        <Radio value="CLIENT" className="data-[selected=true]:border-accent transition-all">
                            <Radio.Control><Radio.Indicator /></Radio.Control>
                            <Radio.Content>
                                <Label className="font-semibold text-sm block">Client Approval</Label>
                                <Description className="text-[10px] block">Requires customer confirmation</Description>
                            </Radio.Content>
                        </Radio>
                    </RadioGroup>
                </div>
            </section>

            {/* Access Control - Conditional on INTERNAL type */}
            {config.type === 'INTERNAL' && (
                <section className="animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-2 mb-2.5">
                        <Icon icon="lucide:users-2" className="w-4 h-4 text-accent" />
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Who Can Access
                        </Label>
                    </div>
                    <div className="bg-secondary/5 pt-1 px-4 pb-4 mx-[-1rem] border-y border-separator/10">
                        <CheckboxGroup
                            value={config.whoCanAccess || []}
                            onChange={(vals) => handleUpdate({ whoCanAccess: vals as ModeratorRole[] })}
                            className="gap-4"
                        >
                            <div className="flex flex-col gap-4">
                                {MODERATOR_ROLES.map((role) => {
                                    const iconMap: Record<string, string> = {
                                        'MODERATOR': 'lucide:user-check',
                                        'RETOUCHER': 'lucide:wand-2',
                                        'PHOTOGRAPHER': 'lucide:camera'
                                    };
                                    return (
                                        <Checkbox key={role.id} value={role.id}>
                                            <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                                            <div className="flex items-center gap-2">
                                                <Icon icon={iconMap[role.id]} className="w-3.5 h-3.5 opacity-60" />
                                                <Label className="text-sm font-medium">{role.label}</Label>
                                            </div>
                                        </Checkbox>
                                    );
                                })}
                            </div>
                        </CheckboxGroup>
                    </div>
                </section>
            )}

            {/* Outcomes & Steps */}
            <section>
                <div className="flex items-center gap-2 mb-2.5">
                    <Icon icon="lucide:git-pull-request" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Possible Outcomes
                    </Label>
                </div>

                <div className="bg-secondary/5 pt-1 px-4 pb-4 mx-[-1rem] border-y border-separator/10 space-y-6">
                    <CheckboxGroup
                        value={config.outcomes || []}
                        onChange={(vals) => handleUpdate({ outcomes: (vals as string[]).filter((v): v is ModerationOutcome => ['APPROVE', 'REVISION', 'REJECT'].includes(v)) })}
                        className="gap-5"
                    >
                        {/* Approve - Always disabled because it's mandatory in the flow */}
                        <Checkbox value="APPROVE" isDisabled>
                            <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                            <Checkbox.Content>
                                <Label className="font-semibold text-sm">Approve</Label>
                                <Description className="text-[10px]">Proceed to the next workflow block</Description>
                            </Checkbox.Content>
                        </Checkbox>

                        {/* Revision */}
                        <div className="space-y-4">
                            <Checkbox value="REVISION">
                                <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                                <Checkbox.Content>
                                    <Label className="font-semibold text-sm">Request Revision</Label>
                                    <Description className="text-[10px]">Loop back to a previous production step</Description>
                                </Checkbox.Content>
                            </Checkbox>

                            {isRevisionEnabled && (
                                <div className="ml-8 pl-4 border-l-2 border-accent/20 space-y-5 py-1 animate-in slide-in-from-left-2 duration-300">
                                    <Select
                                        placeholder="Select return step"
                                        value={config.onRevisionStepId}
                                        onChange={(id) => handleUpdate({ onRevisionStepId: id as string })}
                                        fullWidth
                                    >
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Return back to:</Label>
                                        <Select.Trigger className="h-10 rounded-xl bg-secondary/20 border-separator/20">
                                            <Select.Value />
                                            <Select.Indicator><Icon icon="lucide:undo-2" className="w-4 h-4 opacity-50" /></Select.Indicator>
                                        </Select.Trigger>
                                        <Select.Popover>
                                            <ListBox>
                                                {availableSteps.map(step => (
                                                    <ListBox.Item key={step.id} id={step.id} textValue={step.label}>
                                                        <Label className="text-sm font-medium">{step.label}</Label>
                                                        <Description className="text-[10px]">{step.category}</Description>
                                                    </ListBox.Item>
                                                ))}
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>

                                    <NumberField
                                        minValue={0}
                                        value={config.maxRevisions}
                                        onChange={(val) => handleUpdate({ maxRevisions: val || 0 })}
                                        className="w-full"
                                    >
                                        <div className="mb-2 px-0.5">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">Max Revisions</Label>
                                            <Description className="text-[10px] block m-0 p-0">Enter 0 for unlimited revisions.</Description>
                                        </div>
                                        <NumberField.Group className="bg-content2 border border-divider rounded-lg overflow-hidden flex items-center h-10">
                                            <NumberField.DecrementButton className="h-full px-1 hover:bg-content3 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                                            <NumberField.Input className="flex-1 bg-transparent px-1 text-sm tabular-nums text-center min-w-0" />
                                            <NumberField.IncrementButton className="h-full px-1 hover:bg-content3 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                                        </NumberField.Group>
                                    </NumberField>
                                </div>
                            )}
                        </div>

                        {/* Reject */}
                        <div className="space-y-4">
                            <Checkbox value="REJECT">
                                <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                                <Checkbox.Content>
                                    <Label className="font-semibold text-sm">Reject</Label>
                                    <Description className="text-[10px]">Terminate the branch or start a rejection flow</Description>
                                </Checkbox.Content>
                            </Checkbox>

                            {isRejectEnabled && (
                                <div className="ml-8 pl-4 border-l-2 border-danger/20 space-y-2 py-1 animate-in slide-in-from-left-2 duration-300">
                                    <Select
                                        placeholder="Select rejection target"
                                        value={config.onRejectBlockId}
                                        onChange={(id) => handleUpdate({ onRejectBlockId: id as string })}
                                        fullWidth
                                    >
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">On rejection:</Label>
                                        <Select.Trigger className="h-10 rounded-xl bg-secondary/20 border-separator/20">
                                            <Select.Value />
                                            <Select.Indicator><Icon icon="lucide:x-circle" className="w-4 h-4 text-danger opacity-70" /></Select.Indicator>
                                        </Select.Trigger>
                                        <Select.Popover>
                                            <ListBox>
                                                <ListBox.Item id="cancel" textValue="Cancel Order">
                                                    <Label className="text-sm font-medium text-danger">Cancel Order</Label>
                                                    <Description className="text-[10px]">Complete termination of order</Description>
                                                </ListBox.Item>
                                                {availableSteps.map(step => (
                                                    <ListBox.Item key={step.id} id={step.id} textValue={step.label}>
                                                        <Label className="text-sm font-medium">{step.label}</Label>
                                                    </ListBox.Item>
                                                ))}
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </CheckboxGroup>
                </div>
            </section>
        </div>
    );
}
