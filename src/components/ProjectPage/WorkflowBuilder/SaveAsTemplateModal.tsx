import { Modal, Button, TextField, TextArea, Select, ListBox, Input, Label } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { TemplateCategory } from "../../../types/workflow";

interface SaveAsTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string; description: string; category: TemplateCategory }) => Promise<void>;
    isSaving: boolean;
}

/**
 * Modal for saving the current workflow as a reusable template.
 */
export function SaveAsTemplateModal({
    isOpen,
    onClose,
    onSave,
    isSaving
}: SaveAsTemplateModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<TemplateCategory>("PRODUCTION");

    const handleSave = async () => {
        if (!name.trim()) return;

        await onSave({ name, description, category });
        handleClose();
    };

    const handleClose = () => {
        onClose();
        // Reset form on close
        setName("");
        setDescription("");
        setCategory("PRODUCTION");
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={handleClose}>
            <Modal.Backdrop className="backdrop-blur-md bg-black/40">
                <Modal.Container>
                    <Modal.Dialog className="sm:max-w-[450px]">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>Save as Template</Modal.Heading>
                        </Modal.Header>

                        <Modal.Body className="space-y-6 !overflow-visible">
                            <div className="space-y-4 p-1">
                                <TextField
                                    isRequired
                                    autoFocus
                                    className="w-full"
                                    value={name}
                                    onChange={setName}
                                >
                                    <Label>Template Name</Label>
                                    <Input placeholder="e.g. My Custom Workflow" />
                                </TextField>

                                <TextField
                                    className="w-full"
                                    value={description}
                                    onChange={setDescription}
                                >
                                    <Label>Description</Label>
                                    <TextArea placeholder="Describe when to use this template..." />
                                </TextField>

                                <Select
                                    selectedKey={category}
                                    onSelectionChange={(key) => setCategory(key as TemplateCategory)}
                                    className="w-full"
                                >
                                    <Label>Category</Label>
                                    <Select.Trigger>
                                        <Select.Value />
                                    </Select.Trigger>
                                    <Select.Popover>
                                        <ListBox>
                                            <ListBox.Item key="PRODUCTION" id="PRODUCTION">Production</ListBox.Item>
                                            <ListBox.Item key="AI_POWERED" id="AI_POWERED">AI Powered</ListBox.Item>
                                            <ListBox.Item key="HYBRID" id="HYBRID">Hybrid</ListBox.Item>
                                        </ListBox>
                                    </Select.Popover>
                                </Select>
                            </div>

                            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 rounded-xl flex items-start gap-3">
                                <Icon icon="lucide:info" className="w-5 h-5 text-primary-500 mt-0.5" />
                                <p className="text-sm text-primary-700 dark:text-primary-300 leading-relaxed">
                                    This template will be available for all future projects.
                                </p>
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button
                                variant="ghost"
                                className="text-default-500"
                                onPress={handleClose}
                                isDisabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onPress={handleSave}
                                isPending={isSaving}
                                isDisabled={!name.trim()}
                                className="min-w-[140px]"
                            >
                                Save as Template
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
