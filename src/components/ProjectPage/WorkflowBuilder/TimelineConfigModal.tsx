import { useState } from 'react';
import {
    Modal,
    Button,
    Card,
    Tabs,
    ScrollShadow,
    Surface,
    Separator,
    Switch,
    Label,
    Chip,
    ButtonGroup,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import type { CanvasBlock, TimelineConfig, TimelineAudience } from '../../../types/workflow';
import { useTimelineConfig } from '../../../hooks/useTimelineConfig';
import { sidebarModalStyles } from '../../../styles/modal-variants';
import { TimelineStepCard } from './TimelineStepCard';
import { TimelinePreview } from './TimelinePreview';
import { TIMELINE_ICON_SIZES, INTERNAL_BLOCK_TYPES } from '../../../constants/timeline';
import { getDefaultLabel, getDefaultDescription } from '../../../utils/timeline-utils';

interface TimelineConfigModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    blocks: CanvasBlock[];
    timelineConfig?: TimelineConfig;
    onSave: (config: TimelineConfig) => void;
}

/**
 * Timeline Configuration Modal — sidebar drawer for configuring timeline visibility and labels.
 * Features audience tabs (Client, Pro, Ops) with live preview of the configured timeline.
 */
export function TimelineConfigModal({
    isOpen,
    onOpenChange,
    blocks,
    timelineConfig,
    onSave,
}: TimelineConfigModalProps) {
    const styles = sidebarModalStyles({ isOpen });
    const [selectedAudience, setSelectedAudience] = useState<TimelineAudience>('client');

    // Initialize timeline configuration hook
    const {
        resolvedSteps,
        overrides,
        updateOverride,
        resetAudience,
    } = useTimelineConfig(blocks, timelineConfig);

    // Calculate visible step counts for each audience
    const stepCounts = {
        client: resolvedSteps.filter(s => s.audiences.client.visible).length,
        pro: resolvedSteps.filter(s => s.audiences.pro.visible).length,
        ops: resolvedSteps.filter(s => s.audiences.ops.visible).length,
    };

    const handleSave = () => {
        onSave(overrides);
    };

    const handleReset = () => {
        resetAudience(selectedAudience);
    };

    const hasVisibleInternal = (audience: TimelineAudience) =>
        resolvedSteps.some(step =>
            (INTERNAL_BLOCK_TYPES as ReadonlyArray<string>).includes(step.blockType) &&
            step.audiences[audience].visible
        );

    const handleToggleInternal = (audience: TimelineAudience, hide: boolean) => {
        resolvedSteps.forEach(step => {
            if ((INTERNAL_BLOCK_TYPES as ReadonlyArray<string>).includes(step.blockType)) {
                updateOverride(step.blockId, audience, { visible: !hide });
            }
        });
    };

    const handleCopyFromAudience = (targetAudience: TimelineAudience, sourceAudience: TimelineAudience) => {
        resolvedSteps.forEach(step => {
            const sourceData = step.audiences[sourceAudience];
            updateOverride(step.blockId, targetAudience, {
                visible: sourceData.visible,
                label: sourceData.label,
                description: sourceData.description,
            });
        });
    };

    // Get preview steps for selected audience
    const previewSteps = resolvedSteps.map(step => ({
        blockId: step.blockId,
        label: step.audiences[selectedAudience].label,
        visible: step.audiences[selectedAudience].visible,
        branchId: step.branchId,
        description: step.audiences[selectedAudience].description,
    }));

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Backdrop className={styles.backdrop()}>
                <Modal.Container>
                    <Modal.Dialog className={styles.dialog()}>
                        <Surface className="w-full h-full bg-transparent flex flex-col overflow-hidden p-0">
                            {/* Header */}
                            <Modal.Header className={styles.header()}>
                                <div className="flex items-center gap-4 min-w-0 shrink-0 pr-8">
                                    <div className={styles.iconWrapper()}>
                                        <Icon icon="lucide:milestone" width={TIMELINE_ICON_SIZES.MD} className="shrink-0" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <Modal.Heading className="text-base font-bold text-foreground leading-tight truncate">
                                            Timeline Configuration
                                        </Modal.Heading>
                                        <p className="text-xs text-default-500 font-medium line-clamp-2 leading-snug">
                                            Configure visibility and labels for each audience
                                        </p>
                                    </div>
                                </div>
                                <Modal.CloseTrigger className={styles.closeButton()}>
                                    <Icon icon="lucide:x" width={TIMELINE_ICON_SIZES.MD} />
                                </Modal.CloseTrigger>
                            </Modal.Header>

                            {/* Body with Tabs and ScrollShadow */}
                            <Modal.Body className={styles.body()}>
                                <ScrollShadow className="h-full px-4 py-5 space-y-5 [scrollbar-gutter:stable]">
                                    {/* Audience Tabs */}
                                    <Tabs
                                        selectedKey={selectedAudience}
                                        onSelectionChange={(key) => setSelectedAudience(key as TimelineAudience)}
                                        variant="primary"
                                    >
                                        <Tabs.ListContainer>
                                            <Tabs.List aria-label="Select audience">
                                                {(['client', 'pro', 'ops'] as TimelineAudience[]).map(audience => (
                                                    <Tabs.Tab key={audience} id={audience}>
                                                        <div className="flex items-center gap-2">
                                                            {audience.charAt(0).toUpperCase() + audience.slice(1)}
                                                            <Chip
                                                                size="sm"
                                                                variant={selectedAudience === audience ? 'soft' : 'primary'}
                                                                color={selectedAudience === audience ? 'accent' : 'default'}
                                                            >
                                                                {stepCounts[audience]}
                                                            </Chip>
                                                        </div>
                                                        <Tabs.Indicator />
                                                    </Tabs.Tab>
                                                ))}
                                            </Tabs.List>
                                        </Tabs.ListContainer>

                                        {/* Panel Content - same for all tabs */}
                                        {(['client', 'pro', 'ops'] as TimelineAudience[]).map((audience) => (
                                            <Tabs.Panel key={audience} id={audience} className="py-2.5 space-y-4">
                                                {/* Action Bar - Premium Utility Panel */}
                                                <Card>
                                                    {/* Row 1: Visibility Toggle */}
                                                    {(audience === 'client' || audience === 'pro') && (
                                                        <div className="px-2 py-1">
                                                            <Switch
                                                                size="sm"
                                                                isSelected={hasVisibleInternal(audience)}
                                                                onChange={() => handleToggleInternal(audience, hasVisibleInternal(audience))}
                                                                aria-label="Toggle internal steps visibility"
                                                                className="w-full justify-between"
                                                            >
                                                                <Label className="t-mini font-bold text-default-400 uppercase tracking-wider">Internal steps</Label>
                                                                <Switch.Control>
                                                                    <Switch.Thumb />
                                                                </Switch.Control>
                                                            </Switch>
                                                        </div>
                                                    )}

                                                    {(audience === 'client' || audience === 'pro') && <Separator className="opacity-50 mx-2" />}

                                                    {/* Row 2: Copy Tools (Tabs-style) */}
                                                    <div className="px-2 py-1 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Icon icon="lucide:copy" width={TIMELINE_ICON_SIZES.XS} className="text-default-400" />
                                                            <span className="t-mini font-bold text-default-400 uppercase tracking-wider">Copy From</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <ButtonGroup size="sm" variant="tertiary" className="bg-default-100/30 rounded-lg p-0.5">
                                                                {(['client', 'pro', 'ops'] as TimelineAudience[])
                                                                    .filter(a => a !== audience)
                                                                    .map(sourceAudience => (
                                                                        <Button
                                                                            key={`copy-${sourceAudience}`}
                                                                            variant="ghost"
                                                                            className="px-3 t-compact font-bold h-6 min-w-0"
                                                                            onPress={() => handleCopyFromAudience(audience, sourceAudience)}
                                                                        >
                                                                            {sourceAudience.charAt(0).toUpperCase() + sourceAudience.slice(1)}
                                                                        </Button>
                                                                    ))}
                                                            </ButtonGroup>
                                                        </div>
                                                    </div>
                                                </Card>
                                                {resolvedSteps.map((step) => {
                                                    const audienceData = step.audiences[audience];
                                                    const hasOverride = !!overrides.steps[step.blockId]?.[audience];

                                                    return (
                                                        <TimelineStepCard
                                                            key={step.blockId}
                                                            blockIcon={step.blockIcon}
                                                            defaultLabel={step.defaultLabel}
                                                            visible={audienceData.visible}
                                                            label={audienceData.label}
                                                            isOverridden={hasOverride}
                                                            audienceDefaultLabel={(() => {
                                                                const audDefault = getDefaultLabel(step.blockType, audience, step.defaultLabel);
                                                                return audDefault !== step.defaultLabel ? audDefault : undefined;
                                                            })()}
                                                            description={audienceData.description}
                                                            audienceDefaultDescription={(() => {
                                                                const audDefault = getDefaultDescription(step.blockType, audience);
                                                                return audDefault !== '' ? audDefault : undefined;
                                                            })()}
                                                            onVisibleChange={(visible) => {
                                                                updateOverride(step.blockId, audience, { visible });
                                                            }}
                                                            onLabelChange={(label) => {
                                                                updateOverride(step.blockId, audience, { label });
                                                            }}
                                                            onDescriptionChange={(description) => {
                                                                updateOverride(step.blockId, audience, { description });
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </Tabs.Panel>
                                        ))}
                                    </Tabs>

                                    {/* Preview Section */}
                                    <div className="space-y-3">
                                        <Separator className="my-2" />
                                        <div className="flex items-center gap-2">
                                            <Icon icon="lucide:eye" width={TIMELINE_ICON_SIZES.SM} className="text-accent" />
                                            <span className={styles.label()}>Preview</span>
                                        </div>
                                        <div className="rounded-lg border border-default-200 bg-default-50/50 p-4">
                                            <TimelinePreview steps={previewSteps} />
                                        </div>
                                    </div>
                                </ScrollShadow>
                            </Modal.Body>

                            {/* Footer */}
                            <Modal.Footer className={styles.footer()}>
                                <Button
                                    variant="ghost"
                                    onPress={handleReset}
                                    className="shrink-0"
                                >
                                    <Icon icon="lucide:rotate-ccw" width={TIMELINE_ICON_SIZES.SM} className="mr-2" />
                                    Reset
                                </Button>
                                <Button
                                    variant="primary"
                                    onPress={handleSave}
                                    className="flex-1"
                                >
                                    Save Changes
                                </Button>
                            </Modal.Footer>
                        </Surface>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
