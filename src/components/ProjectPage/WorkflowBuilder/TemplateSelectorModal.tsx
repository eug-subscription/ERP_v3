import { Modal, Button, TextField, Label, Tabs, InputGroup } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState, useMemo } from "react";
import { UserWorkflowTemplate } from "../../../types/workflow";
import { useWorkflowTemplates } from "../../../hooks/useWorkflowTemplates";
import { TemplateCard } from "./TemplateCard";
import { DeleteTemplateModal } from "./DeleteTemplateModal";

interface TemplateSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: UserWorkflowTemplate) => void;
}

/**
 * Modal for browsing and selecting workflow templates.
 */
export function TemplateSelectorModal({
    isOpen,
    onClose,
    onSelect
}: TemplateSelectorModalProps) {
    const { state, actions, mutations } = useWorkflowTemplates();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<string | number>("system");
    const [deleteTarget, setDeleteTarget] = useState<UserWorkflowTemplate | null>(null);

    const filteredTemplates = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const pool = activeTab === "system" ? state.systemTemplates : state.userTemplates;

        if (!query) return pool;

        return pool.filter(t =>
            t.name.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query)
        );
    }, [searchQuery, activeTab, state.systemTemplates, state.userTemplates]);

    const handleDelete = (template: UserWorkflowTemplate) => {
        setDeleteTarget(template);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        await actions.deleteTemplate(deleteTarget.id);
        setDeleteTarget(null);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <Modal.Backdrop className="backdrop-blur-md bg-black/40">
                <Modal.Container>
                    <Modal.Dialog className="sm:max-w-[700px] h-[600px] flex flex-col">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>Choose a Template</Modal.Heading>
                        </Modal.Header>

                        <Modal.Body className="flex-1 flex flex-col gap-6 !overflow-visible">
                            <div className="p-1">
                                <TextField
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    className="w-full"
                                >
                                    <Label className="sr-only">Search templates</Label>
                                    <InputGroup>
                                        <InputGroup.Prefix>
                                            <Icon icon="lucide:search" className="w-4 h-4 text-default-400" />
                                        </InputGroup.Prefix>
                                        <InputGroup.Input
                                            placeholder="Search by name or description..."
                                        />
                                    </InputGroup>
                                </TextField>
                            </div>

                            <Tabs
                                selectedKey={activeTab}
                                onSelectionChange={setActiveTab}
                                className="w-full flex-1 flex flex-col overflow-hidden"
                            >
                                <Tabs.ListContainer>
                                    <Tabs.List aria-label="Template types">
                                        <Tabs.Tab id="system">System Templates<Tabs.Indicator /></Tabs.Tab>
                                        <Tabs.Tab id="user">My Templates<Tabs.Indicator /></Tabs.Tab>
                                    </Tabs.List>
                                </Tabs.ListContainer>

                                <Tabs.Panel id="system" className="mt-4 flex-1 overflow-y-auto min-h-0">
                                    <TemplateGrid
                                        templates={state.systemTemplates}
                                        filtered={filteredTemplates}
                                        onSelect={onSelect}
                                        isLoading={state.isLoading}
                                        emptyMessage="No system templates found."
                                    />
                                </Tabs.Panel>
                                <Tabs.Panel id="user" className="mt-4 flex-1 overflow-y-auto min-h-0">
                                    <TemplateGrid
                                        templates={state.userTemplates}
                                        filtered={filteredTemplates}
                                        onSelect={onSelect}
                                        onDelete={handleDelete}
                                        isDeleting={mutations.isDeleting}
                                        isLoading={state.isLoading}
                                        emptyMessage="You haven't saved any templates yet."
                                    />
                                </Tabs.Panel>
                            </Tabs>

                            <DeleteTemplateModal
                                isOpen={!!deleteTarget}
                                onClose={() => setDeleteTarget(null)}
                                onConfirm={handleConfirmDelete}
                                templateName={deleteTarget?.name || ""}
                            />
                        </Modal.Body>

                        <Modal.Footer>
                            <Button
                                variant="ghost"
                                className="text-default-500"
                                onPress={onClose}
                            >
                                Cancel
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}

/**
 * Internal helper to render the grid of templates.
 */
function TemplateGrid({
    templates,
    filtered,
    onSelect,
    onDelete,
    isDeleting,
    isLoading,
    emptyMessage
}: {
    templates: UserWorkflowTemplate[];
    filtered: UserWorkflowTemplate[];
    onSelect: (t: UserWorkflowTemplate) => void;
    onDelete?: (template: UserWorkflowTemplate) => void;
    isDeleting?: boolean;
    isLoading: boolean;
    emptyMessage: string;
}) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-[140px] rounded-xl bg-default-100 animate-pulse" />
                ))}
            </div>
        );
    }

    if (templates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Icon icon="lucide:layout-template" className="w-12 h-12 text-default-200 mb-4" />
                <p className="text-default-500">{emptyMessage}</p>
            </div>
        );
    }

    if (filtered.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Icon icon="lucide:search-x" className="w-12 h-12 text-default-200 mb-4" />
                <p className="text-default-500">No templates match your search.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1">
            {filtered.map(template => (
                <TemplateCard
                    key={template.id}
                    template={template}
                    onApply={onSelect}
                    onDelete={onDelete}
                    isDeleting={isDeleting}
                />
            ))}
        </div>
    );
}
