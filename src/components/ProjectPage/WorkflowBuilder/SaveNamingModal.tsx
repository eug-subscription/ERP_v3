import { Button, Modal, TextField, InputGroup } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";

interface SaveNamingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
    currentName: string;
}

/**
 * Modal for naming/renaming a workflow before saving.
 */
export function SaveNamingModal({
    isOpen,
    onClose,
    onConfirm,
    currentName
}: SaveNamingModalProps) {
    const [name, setName] = useState(currentName);


    const handleConfirm = () => {
        onConfirm(name.trim() || currentName);
    };

    // Reset local name when modal opens to ensure it reflects current project state
    const handleOpenChange = (open: boolean) => {
        if (open) {
            setName(currentName);
        } else {
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
        >
            <Modal.Backdrop className="backdrop-blur-md bg-black/40">
                <Modal.Container>
                    <Modal.Dialog className="max-w-md bg-background border border-separator shadow-2xl rounded-3xl overflow-hidden">
                        <Modal.CloseTrigger />

                        <Modal.Header className="flex flex-col items-center pt-8 pb-4 px-8 text-center">
                            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                                <Icon icon="lucide:pen-tool" className="w-7 h-7" />
                            </div>
                            <Modal.Heading className="text-xl font-bold">Name Your Workflow</Modal.Heading>
                            <p className="text-sm text-muted-foreground mt-2">
                                Give your workflow a meaningful name to identify it later.
                            </p>
                        </Modal.Header>

                        <Modal.Body className="px-8 py-4">
                            <TextField
                                value={name}
                                onChange={setName}
                                aria-label="Workflow Name"
                                autoFocus
                            >
                                <InputGroup className="bg-default-100 rounded-2xl px-3 h-12 border-2 border-transparent focus-within:border-primary/30 transition-all">
                                    <InputGroup.Prefix>
                                        <Icon icon="lucide:tag" className="text-default-400 mr-2" />
                                    </InputGroup.Prefix>
                                    <InputGroup.Input
                                        placeholder="e.g. Standard Photoshoot Flow"
                                        className="text-sm font-medium"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleConfirm();
                                        }}
                                    />
                                </InputGroup>
                            </TextField>
                        </Modal.Body>

                        <Modal.Footer className="border-t border-separator/20 p-6 rounded-b-3xl gap-3 bg-default-50/50">
                            <Button
                                variant="ghost"
                                onPress={onClose}
                                className="flex-1 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onPress={handleConfirm}
                                className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/20"
                            >
                                Save
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
