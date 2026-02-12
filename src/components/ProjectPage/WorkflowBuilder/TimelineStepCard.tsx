import { Card, Switch, TextField, Input, TextArea, Chip, Tooltip, cn } from '@heroui/react';
import { Icon } from '@iconify/react';
import { TIMELINE_ICON_SIZES, TIMELINE_SIZES } from '../../../constants/timeline';

interface TimelineStepCardProps {
    blockIcon: string;
    defaultLabel: string;
    visible: boolean;
    label: string;
    isOverridden: boolean;
    audienceDefaultLabel?: string;
    description: string;
    audienceDefaultDescription?: string;
    onVisibleChange: (visible: boolean) => void;
    onLabelChange: (label: string) => void;
    onDescriptionChange: (description: string) => void;
}

/**
 * Individual timeline step card with visibility toggle and label override.
 * Collapses smoothly when hidden, shows override indicator when customized.
 */
export function TimelineStepCard({
    blockIcon,
    defaultLabel,
    visible,
    label,
    isOverridden,
    audienceDefaultLabel,
    description,
    audienceDefaultDescription,
    onVisibleChange,
    onLabelChange,
    onDescriptionChange,
}: TimelineStepCardProps) {
    const handleLabelChange = (value: string) => {
        onLabelChange(value || defaultLabel);
    };

    const handleDescriptionChange = (value: string) => {
        onDescriptionChange(value);
    };

    return (
        <Card>
            <Card.Content className="p-3 flex flex-col gap-3">
                {/* Header: Icon + Block Name + Toggle */}
                <div className="flex items-center gap-3">
                    {/* Block Icon */}
                    <div className={cn("flex items-center justify-center rounded-lg bg-accent/10 shrink-0", TIMELINE_SIZES.ICON_CONTAINER)}>
                        <Icon
                            icon={blockIcon}
                            width={TIMELINE_ICON_SIZES.SM}
                            className="text-accent"
                        />
                    </div>

                    {/* Block Name + Override Indicator */}
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                        <Tooltip delay={400}>
                            <Tooltip.Trigger aria-label={defaultLabel} className="min-w-0 overflow-hidden">
                                <span className="text-xs text-muted block truncate">
                                    {defaultLabel}
                                </span>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                <p>{defaultLabel}</p>
                            </Tooltip.Content>
                        </Tooltip>
                        {isOverridden && (
                            <div
                                className={cn("rounded-full bg-accent shrink-0", TIMELINE_SIZES.OVERRIDE_DOT)}
                                aria-label="Label customized"
                            />
                        )}
                    </div>

                    {/* Visibility Toggle or Hidden Chip */}
                    {visible ? (
                        <Switch
                            size="sm"
                            isSelected={visible}
                            onChange={onVisibleChange}
                            aria-label="Toggle visibility"
                        >
                            <Switch.Control>
                                <Switch.Thumb />
                            </Switch.Control>
                        </Switch>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Chip size="sm" variant="soft" color="default">
                                Hidden
                            </Chip>
                            <Switch
                                size="sm"
                                isSelected={visible}
                                onChange={onVisibleChange}
                                aria-label="Toggle visibility"
                            >
                                <Switch.Control>
                                    <Switch.Thumb />
                                </Switch.Control>
                            </Switch>
                        </div>
                    )}
                </div>

                {/* Label Input (only visible when step is visible) */}
                {visible && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                        <TextField
                            onChange={handleLabelChange}
                            aria-label="Custom label"
                        >
                            <Input
                                value={label}
                                placeholder={defaultLabel}
                                className="text-sm"
                            />
                        </TextField>
                        {audienceDefaultLabel && audienceDefaultLabel !== label && (
                            <p className="text-xs text-default-400 px-1">
                                Default: {audienceDefaultLabel}
                            </p>
                        )}

                        {/* Description TextArea */}
                        <TextField
                            onChange={handleDescriptionChange}
                            aria-label="Step description"
                        >
                            <TextArea
                                value={description}
                                placeholder={audienceDefaultDescription || "Add step description..."}
                                rows={2}
                                className="text-sm"
                            />
                        </TextField>
                        {audienceDefaultDescription && audienceDefaultDescription !== description && (
                            <p className="text-xs text-default-400 px-1">
                                Default: {audienceDefaultDescription}
                            </p>
                        )}
                    </div>
                )}
            </Card.Content>
        </Card>
    );
}
