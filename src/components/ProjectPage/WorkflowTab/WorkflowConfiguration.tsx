import { Separator, Button, Modal } from '@heroui/react';
import { Icon } from '@iconify/react';
import { TemplateSelector } from './TemplateSelector';
import { BranchConfig } from './BranchConfig';
import { ModerationConfig } from './ModerationConfig';
import { ExternalProcessConfig } from './ExternalProcessConfig';
import { ConditionalConfig } from './ConditionalConfig';
import { ProAssigningConfig } from './ProAssigningConfig';
import { FileStorageConfig } from './FileStorageConfig';
import { SendNotificationConfig } from './SendNotificationConfig';
import { SSTConfig } from './SSTConfig';
import { RetoucherAssigningConfig } from './RetoucherAssigningConfig';
import { FileRenamingConfig } from './FileRenamingConfig';
import { BlockDescriptionPanel } from './BlockDescriptionPanel';
import { Alert } from '@heroui/react';
import { useWorkflowConfiguration } from '../../../hooks/useWorkflowConfiguration';
import {
    WorkflowTemplate,
    ProjectWorkflowConfig,
    ValidationResult,
    ModerationConfig as ModerationConfigType,
    ExternalProcessConfig as ExternalProcessConfigType,
    IfElseConfig as IfElseConfigType,
    ProAssigningConfig as ProAssigningConfigType,
    FileStorageConfig as FileStorageConfigType,
    SendNotificationConfig as SendNotificationConfigType,
    SSTConfig as SSTConfigType,
    RetoucherAssigningConfig as RetoucherAssigningConfigType,
    FileRenamingConfig as FileRenamingConfigType
} from '../../../types/workflow';

import { BLOCK_DESCRIPTIONS } from '../../../data/block-descriptions';

import { getBlockIcon, CONFIGURABLE_BLOCKS, DESCRIPTION_ONLY_BLOCKS } from '../../../data/workflow-constants';

interface WorkflowConfigurationProps {
    config: ProjectWorkflowConfig | null;
    selectedTemplate: WorkflowTemplate | null;
    onTemplateSelect: (template: WorkflowTemplate) => void;
    onConfigChange: (config: ProjectWorkflowConfig) => void;
    onValidationChange?: (result: ValidationResult) => void;
}

/**
 * WorkflowConfiguration Component
 * Left panel of the Workflow Builder. Handles template selection and branch-level block toggles.
 */
export function WorkflowConfiguration({
    config,
    selectedTemplate,
    onTemplateSelect,
    onConfigChange,
    onValidationChange
}: WorkflowConfigurationProps) {
    const {
        editingBlock,
        setEditingBlock,
        validation,
        showConfirmSwitch,
        setShowConfirmSwitch,
        handleTemplateSelect: internalHandleTemplateSelect,
        confirmTemplateSwitch,
        cancelTemplateSwitch,
        toggleBlock,
        reorderBlocks,
        updateBlockConfig
    } = useWorkflowConfiguration({
        initialConfig: config,
        onConfigChange,
        onTemplateSelect,
        onValidationChange
    });


    return (
        <div className="space-y-6">
            {/* Template Selector Section */}
            <section className="space-y-4">
                <TemplateSelector
                    selectedId={selectedTemplate?.id}
                    onSelect={internalHandleTemplateSelect}
                />
                {selectedTemplate && (
                    <p className="text-sm text-muted-foreground px-1 italic">
                        Configuring based on "{selectedTemplate.name}"
                    </p>
                )}
            </section>

            <Separator className="opacity-50" />

            {/* Branch Configuration Area */}
            <div className="space-y-8 pb-4">
                {!config ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 bg-secondary/5 rounded-2xl border border-dashed border-separator">
                        <div className="p-3 rounded-full bg-secondary/10 text-muted-foreground">
                            <Icon icon="lucide:mouse-pointer-click" className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-muted-foreground max-w-[200px]">
                            Select a base template above to begin configuring your workflow.
                        </p>
                    </div>
                ) : (
                    config.branches.map((branch) => (
                        <BranchConfig
                            key={branch.id}
                            branch={branch}
                            onToggleBlock={(blockId) => toggleBlock(branch.id, blockId)}
                            onOpenSettings={(block) => setEditingBlock({ branchId: branch.id, block })}
                            onReorderBlocks={reorderBlocks}
                        />
                    ))
                )}

                {/* Validation Alerts */}
                {config && validation.errors.length > 0 && (
                    <div className="space-y-3 pt-4 animate-in fade-in slide-in-from-top-2">
                        {validation.errors.map((error, idx) => (
                            <Alert
                                key={`${error.type}-${idx}`}
                                status={error.level === 'ERROR' ? 'danger' : 'warning'}
                            >
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Title className="text-sm font-semibold">
                                        {error.message}
                                    </Alert.Title>
                                    {error.suggestion && (
                                        <Alert.Description className="text-xs opacity-80 italic">
                                            Tip: {error.suggestion}
                                        </Alert.Description>
                                    )}
                                </Alert.Content>
                            </Alert>
                        ))}
                    </div>
                )}
            </div>

            {/* Settings Modal */}
            <Modal
                isOpen={!!editingBlock}
                onOpenChange={() => setEditingBlock(null)}
            >
                <Modal.Backdrop className="backdrop-blur-sm bg-background/30">
                    <Modal.Container>
                        <Modal.Dialog className="max-w-2xl bg-background/80 backdrop-blur-xl border border-separator/50 shadow-2xl rounded-3xl">
                            <Modal.CloseTrigger />
                            <Modal.Header className="flex items-center gap-3">
                                <Modal.Icon className="p-2 bg-accent/10 rounded-xl text-accent">
                                    <Icon
                                        icon={getBlockIcon(editingBlock?.block.type || '')}
                                        className="w-5 h-5"
                                    />
                                </Modal.Icon>
                                <div>
                                    <Modal.Heading className="text-xl font-bold">{editingBlock?.block.label} Settings</Modal.Heading>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                                        Branch: {config?.branches.find(b => b.id === editingBlock?.branchId)?.name}
                                    </p>
                                </div>
                            </Modal.Header>

                            <Modal.Body className="py-6 px-8">
                                {editingBlock?.block.type === 'MODERATION' && (
                                    <ModerationConfig
                                        config={editingBlock.block.config as ModerationConfigType}
                                        availableSteps={config?.branches.find(b => b.id === editingBlock.branchId)?.blocks.filter(b => b.id !== editingBlock.block.id) || []}
                                        onUpdate={(newConfig) => updateBlockConfig(editingBlock.branchId, editingBlock.block.id, newConfig)}
                                    />
                                )}

                                {editingBlock?.block.type === 'EXTERNAL_PROCESS' && (
                                    <ExternalProcessConfig
                                        config={editingBlock.block.config as ExternalProcessConfigType}
                                        onUpdate={(newConfig) => updateBlockConfig(editingBlock.branchId, editingBlock.block.id, newConfig)}
                                    />
                                )}

                                {editingBlock?.block.type === 'IF_ELSE' && (
                                    <ConditionalConfig
                                        config={editingBlock.block.config as IfElseConfigType}
                                        availableSteps={config?.branches.find(b => b.id === editingBlock.branchId)?.blocks.filter(b => b.id !== editingBlock.block.id) || []}
                                        onUpdate={(newConfig: IfElseConfigType) => updateBlockConfig(editingBlock.branchId, editingBlock.block.id, newConfig)}
                                    />
                                )}

                                {editingBlock?.block.type === 'PRO_ASSIGNING' && (
                                    <ProAssigningConfig
                                        config={editingBlock.block.config as ProAssigningConfigType}
                                        onUpdate={(newConfig) => updateBlockConfig(editingBlock.branchId, editingBlock.block.id, newConfig)}
                                    />
                                )}

                                {editingBlock?.block.type === 'FILE_STORAGE' && (
                                    <FileStorageConfig
                                        config={editingBlock.block.config as FileStorageConfigType}
                                        onUpdate={(newConfig) => updateBlockConfig(editingBlock.branchId, editingBlock.block.id, newConfig)}
                                    />
                                )}

                                {editingBlock?.block.type === 'SEND_NOTIFICATION' && (
                                    <SendNotificationConfig
                                        config={editingBlock.block.config as SendNotificationConfigType}
                                        onUpdate={(newConfig) => updateBlockConfig(editingBlock.branchId, editingBlock.block.id, newConfig)}
                                    />
                                )}

                                {editingBlock?.block.type === 'SST' && (
                                    <SSTConfig
                                        config={editingBlock.block.config as SSTConfigType}
                                        onUpdate={(newConfig) => updateBlockConfig(editingBlock.branchId, editingBlock.block.id, newConfig)}
                                    />
                                )}

                                {editingBlock?.block.type === 'RETOUCHER_ASSIGNING' && (
                                    <RetoucherAssigningConfig
                                        config={editingBlock.block.config as RetoucherAssigningConfigType}
                                        onUpdate={(newConfig) => updateBlockConfig(editingBlock.branchId, editingBlock.block.id, newConfig)}
                                    />
                                )}

                                {editingBlock?.block.type === 'FILE_RENAMING' && (
                                    <FileRenamingConfig
                                        config={editingBlock.block.config as FileRenamingConfigType}
                                        onUpdate={(newConfig) => updateBlockConfig(editingBlock.branchId, editingBlock.block.id, newConfig)}
                                    />
                                )}

                                {editingBlock?.block.type && DESCRIPTION_ONLY_BLOCKS.has(editingBlock.block.type) && (
                                    <BlockDescriptionPanel
                                        title={editingBlock.block.label}
                                        icon={BLOCK_DESCRIPTIONS[editingBlock.block.type]?.icon || 'lucide:info'}
                                        description={BLOCK_DESCRIPTIONS[editingBlock.block.type]?.description || ''}
                                        details={BLOCK_DESCRIPTIONS[editingBlock.block.type]?.details || []}
                                    />
                                )}

                                {editingBlock?.block.type &&
                                    !CONFIGURABLE_BLOCKS.has(editingBlock.block.type) &&
                                    !DESCRIPTION_ONLY_BLOCKS.has(editingBlock.block.type) && (
                                        <div className="py-12 text-center text-muted-foreground italic text-sm">
                                            No configuration available for this block.
                                        </div>
                                    )}
                            </Modal.Body>

                            <Modal.Footer className="border-t border-separator/20 bg-secondary/5 p-6 rounded-b-3xl">
                                <Button variant="ghost" onPress={() => setEditingBlock(null)} className="rounded-xl">
                                    Close Settings
                                </Button>
                                <Button variant="primary" onPress={() => setEditingBlock(null)} className="rounded-xl shadow-lg shadow-accent/20">
                                    Save Changes
                                </Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>

            {/* Template Switch Confirmation */}
            <Modal
                isOpen={showConfirmSwitch}
                onOpenChange={setShowConfirmSwitch}
            >
                <Modal.Backdrop className="backdrop-blur-md bg-background/50" />
                <Modal.Container>
                    <Modal.Dialog className="max-w-md bg-background/90 backdrop-blur-2xl border border-separator/50 shadow-2xl rounded-3xl">
                        <Modal.CloseTrigger />
                        <Modal.Header className="flex flex-col items-center pt-8 pb-4">
                            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center text-warning mb-4">
                                <Icon icon="lucide:alert-triangle" className="w-8 h-8" />
                            </div>
                            <Modal.Heading className="text-2xl font-bold text-center">Discard manual changes?</Modal.Heading>
                            <p className="text-sm text-muted-foreground text-center mt-2 px-4">
                                Switching to a different base template will reset all your manual block toggles and reordering in the current workflow.
                            </p>
                        </Modal.Header>

                        <Modal.Footer className="border-t border-separator/20 p-6 rounded-b-3xl gap-3">
                            <Button
                                variant="ghost"
                                onPress={cancelTemplateSwitch}
                                className="flex-1 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onPress={confirmTemplateSwitch}
                                className="flex-1 rounded-xl shadow-lg shadow-danger/20 font-bold"
                            >
                                Switch Template
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal>
        </div>
    );
}
