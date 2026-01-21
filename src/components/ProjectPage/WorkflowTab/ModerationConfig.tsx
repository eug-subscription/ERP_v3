import {
    Label,
    Select,
    ListBox,
    Description,
    RadioGroup,
    Radio,
    CheckboxGroup,
    Checkbox,
    NumberField,
    Separator
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
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:user-cog" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Moderator Type
                    </Label>
                </div>
                <RadioGroup
                    value={config.type}
                    onChange={(val) => handleUpdate({ type: val as ModeratorType })}
                    orientation="horizontal"
                    className="gap-4"
                >
                    <Radio value="INTERNAL" className="data-[selected=true]:border-accent transition-all">
                        <Radio.Control>
                            <Radio.Indicator />
                        </Radio.Control>
                        <Radio.Content>
                            <Label className="font-semibold text-sm">Internal Team</Label>
                            <Description className="text-[10px]">Managed by project managers</Description>
                        </Radio.Content>
                    </Radio>
                    <Radio value="CLIENT" className="data-[selected=true]:border-accent transition-all">
                        <Radio.Control>
                            <Radio.Indicator />
                        </Radio.Control>
                        <Radio.Content>
                            <Label className="font-semibold text-sm">Client Approval</Label>
                            <Description className="text-[10px]">Requires customer confirmation</Description>
                        </Radio.Content>
                    </Radio>
                </RadioGroup>
            </section>

            {/* Access Control - Conditional on INTERNAL type */}
            {config.type === 'INTERNAL' && (
                <section className="space-y-4 py-4 px-4 bg-secondary/5 border border-separator/20 rounded-2xl animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-2 mb-1">
                        <Icon icon="lucide:shield-lock" className="w-4 h-4 text-accent" />
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Who Can Access
                        </Label>
                    </div>
                    <CheckboxGroup
                        value={config.whoCanAccess || []}
                        onChange={(vals) => handleUpdate({ whoCanAccess: vals as ModeratorRole[] })}
                        className="gap-4"
                    >
                        <div className="flex flex-row gap-4">
                            {MODERATOR_ROLES.map((role) => (
                                <Checkbox key={role.id} value={role.id}>
                                    <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                                    <Label className="text-sm font-medium">{role.label}</Label>
                                </Checkbox>
                            ))}
                        </div>
                    </CheckboxGroup>
                </section>
            )}

            <Separator className="opacity-30" />

            {/* Outcomes & Steps */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:git-pull-request" className="w-4 h-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Possible Outcomes
                    </Label>
                </div>

                <CheckboxGroup
                    value={config.outcomes || []}
                    onChange={(vals) => handleUpdate({ outcomes: (vals as string[]).filter((v): v is ModerationOutcome => ['APPROVE', 'REVISION', 'REJECT'].includes(v)) })}
                    className="gap-4"
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
                    <div className="space-y-3">
                        <Checkbox value="REVISION">
                            <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                            <Checkbox.Content>
                                <Label className="font-semibold text-sm">Request Revision</Label>
                                <Description className="text-[10px]">Loop back to a previous production step</Description>
                            </Checkbox.Content>
                        </Checkbox>

                        {isRevisionEnabled && (
                            <div className="ml-8 pl-4 border-l-2 border-accent/20 space-y-4 py-1 animate-in slide-in-from-left-2 duration-300">
                                <Select
                                    placeholder="Select return step"
                                    value={config.onRevisionStepId}
                                    onChange={(id) => handleUpdate({ onRevisionStepId: id as string })}
                                    className="space-y-2"
                                >
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight ml-1">Return back to:</Label>
                                    <Select.Trigger className="h-9 rounded-xl bg-secondary/10 border-separator/30 text-xs shadow-sm hover:bg-secondary/20 transition-colors">
                                        <Select.Value />
                                        <Select.Indicator><Icon icon="lucide:undo-2" className="w-3 h-3" /></Select.Indicator>
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
                                    className="max-w-[140px] space-y-2"
                                >
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight ml-1">Max Revisions:</Label>
                                    <NumberField.Group className="bg-secondary/10 border-separator/30 rounded-xl">
                                        <NumberField.DecrementButton />
                                        <NumberField.Input className="text-xs font-bold" />
                                        <NumberField.IncrementButton />
                                    </NumberField.Group>
                                    <Description className="text-[8px] italic ml-1">0 = Unlimited</Description>
                                </NumberField>
                            </div>
                        )}
                    </div>

                    {/* Reject */}
                    <div className="space-y-3">
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
                                    className="space-y-2"
                                >
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight ml-1">On rejection:</Label>
                                    <Select.Trigger className="h-9 rounded-xl bg-secondary/10 border-separator/30 text-xs shadow-sm hover:bg-secondary/20 transition-colors">
                                        <Select.Value />
                                        <Select.Indicator><Icon icon="lucide:x-circle" className="w-3 h-3 text-danger" /></Select.Indicator>
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
            </section>
        </div>
    );
}
