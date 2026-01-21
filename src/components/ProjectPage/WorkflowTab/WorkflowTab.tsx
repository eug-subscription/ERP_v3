import { Card, Button, Modal, Alert } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useWorkflowTemplates } from '../../../hooks/useWorkflowTemplates';
import { WorkflowConfiguration } from './WorkflowConfiguration';
import { WorkflowPreview } from './WorkflowPreview';
import { useOrderWorkflow } from '../../../hooks/useOrderWorkflow';
import { useWorkflowTabState } from '../../../hooks/useWorkflowTabState';

export function WorkflowTab() {
    const { isLoading } = useWorkflowTemplates();
    const {
        config,
        setConfig,
        selectedTemplate,
        setSelectedTemplate,
        isLiveMode,
        setIsLiveMode,
        validation,
        setValidation,
        showValidationModal,
        setShowValidationModal,
        isSaving,
        autoFixConfig,
        resetConfig,
        saveConfig,
        confirmSave
    } = useWorkflowTabState();

    const { data: orderInstance } = useOrderWorkflow('ord-12345');

    return (
        <div className="grid grid-cols-12 gap-8 min-h-[calc(100vh-250px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Configuration Column (Left) */}
            <div className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-6">
                <Card className="h-full shadow-premium border-none">
                    <Card.Header>
                        <div className="flex items-center justify-between w-full">
                            <div className="space-y-1">
                                <Card.Title className="text-2xl font-bold tracking-tight">
                                    Workflow Configuration
                                </Card.Title>
                                <Card.Description>
                                    Define the steps and rules for project orders.
                                </Card.Description>
                            </div>
                            <div className="p-2 bg-accent/10 rounded-xl text-accent">
                                <Icon icon="lucide:settings-2" className="w-6 h-6" />
                            </div>
                        </div>
                    </Card.Header>

                    <Card.Content className="space-y-6">
                        <WorkflowConfiguration
                            config={config}
                            selectedTemplate={selectedTemplate}
                            onTemplateSelect={setSelectedTemplate}
                            onConfigChange={setConfig}
                            onValidationChange={setValidation}
                        />
                    </Card.Content>

                    <Card.Footer className="border-t border-separator/30 flex justify-between gap-4 p-6 mt-auto">
                        <Button
                            variant="secondary"
                            className="flex-1 rounded-xl"
                            onPress={resetConfig}
                            isDisabled={isSaving}
                        >
                            <Icon icon="lucide:rotate-ccw" className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1 rounded-xl shadow-accent-md"
                            onPress={saveConfig}
                            isDisabled={!config || isSaving}
                            isPending={isSaving}
                        >
                            {({ isPending }) => (
                                <>
                                    {isPending ? null : <Icon icon="lucide:save" className="w-4 h-4 mr-2" />}
                                    {isPending ? 'Saving...' : 'Save Layout'}
                                </>
                            )}
                        </Button>
                    </Card.Footer>
                </Card>
            </div>

            {/* Visual Preview Column (Right) */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col">
                <Card className="flex-1 shadow-premium border-none bg-background/50 backdrop-blur-sm overflow-hidden">
                    <Card.Header className="pb-0">
                        <div className="flex items-center justify-between">
                            <Card.Title className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                Live Preview
                            </Card.Title>
                            <div className="flex gap-2 items-center">
                                <div className="flex bg-secondary/10 p-1 rounded-xl mr-2">
                                    <Button
                                        variant={!isLiveMode ? 'primary' : 'ghost'}
                                        size="sm"
                                        className="rounded-lg text-[10px] font-bold h-7 px-3"
                                        onPress={() => setIsLiveMode(false)}
                                    >
                                        Blueprint
                                    </Button>
                                    <Button
                                        variant={isLiveMode ? 'primary' : 'ghost'}
                                        size="sm"
                                        className="rounded-lg text-[10px] font-bold h-7 px-3"
                                        onPress={() => setIsLiveMode(true)}
                                    >
                                        Live Status
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card.Header>

                    <Card.Content className="relative flex-1 p-8 overflow-auto">
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm z-10 rounded-2xl">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                                    <span className="text-muted-foreground font-medium">Synthesizing Workflow...</span>
                                </div>
                            </div>
                        ) : null}
                        <WorkflowPreview
                            config={config}
                            instance={isLiveMode ? orderInstance : null}
                            validation={validation}
                        />
                    </Card.Content>
                </Card>
            </div>

            {/* Validation Modal */}
            <Modal
                isOpen={showValidationModal}
                onOpenChange={setShowValidationModal}
            >
                <Modal.Backdrop className="backdrop-blur-md bg-background/50" />
                <Modal.Container>
                    <Modal.Dialog className="max-w-lg bg-background/90 backdrop-blur-2xl border border-separator/50 shadow-2xl rounded-3xl">
                        <Modal.CloseTrigger />
                        <Modal.Header className="flex flex-col items-center pt-8 pb-4 px-8">
                            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-4">
                                <Icon icon="lucide:alert-circle" className="w-8 h-8" />
                            </div>
                            <Modal.Heading className="text-2xl font-bold text-center">Workflow Issues Found</Modal.Heading>
                            <p className="text-sm text-muted-foreground text-center mt-2">
                                Please review the following issues before saving your workflow configuration.
                            </p>
                        </Modal.Header>

                        <Modal.Body className="px-8 py-4 space-y-4 max-h-[40vh] overflow-auto">
                            {validation.errors.map((error, idx) => (
                                <Alert
                                    key={`${error.type}-${idx}`}
                                    status={error.level === 'ERROR' ? 'danger' : 'warning'}
                                    className="rounded-2xl"
                                >
                                    <Alert.Indicator />
                                    <Alert.Content>
                                        <Alert.Title className="text-sm font-semibold">
                                            {error.message}
                                        </Alert.Title>
                                        {error.suggestion && (
                                            <Alert.Description className="text-xs opacity-80 italic">
                                                Suggestion: {error.suggestion}
                                            </Alert.Description>
                                        )}
                                    </Alert.Content>
                                </Alert>
                            ))}
                        </Modal.Body>

                        <Modal.Footer className="border-t border-separator/20 p-6 rounded-b-3xl gap-3 flex flex-col sm:flex-row">
                            <Button
                                variant="secondary"
                                onPress={autoFixConfig}
                                className="flex-1 rounded-xl font-semibold"
                            >
                                <Icon icon="lucide:sparkles" className="w-4 h-4 mr-2" />
                                Fix Automatically
                            </Button>
                            <div className="flex gap-2 flex-1">
                                <Button
                                    variant="ghost"
                                    onPress={() => setShowValidationModal(false)}
                                    className="flex-1 rounded-xl"
                                >
                                    Review
                                </Button>
                                <Button
                                    variant="primary"
                                    onPress={confirmSave}
                                    className="flex-1 rounded-xl shadow-lg shadow-accent/20 font-bold"
                                    isDisabled={!validation.isValid}
                                >
                                    Save Anyway
                                </Button>
                            </div>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal>
        </div>
    );
}
