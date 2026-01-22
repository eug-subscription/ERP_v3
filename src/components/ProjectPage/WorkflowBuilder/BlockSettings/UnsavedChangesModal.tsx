import { Button, Modal } from "@heroui/react";
import { Icon } from "@iconify/react";

interface UnsavedChangesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDiscard: () => void;
    onSave: () => void;
}

/**
 * Modal shown when user tries to leave block settings with pending changes.
 */
export function UnsavedChangesModal({
    isOpen,
    onClose,
    onDiscard,
    onSave
}: UnsavedChangesModalProps) {
    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <Modal.Backdrop className="backdrop-blur-md bg-black/40">
                <Modal.Container>
                    <Modal.Dialog className="sm:max-w-[400px]">
                        <Modal.Header>
                            <Modal.Icon className="bg-warning-100 text-warning">
                                <Icon icon="lucide:alert-triangle" className="h-6 w-6" />
                            </Modal.Icon>
                            <Modal.Heading>Unsaved Changes</Modal.Heading>
                        </Modal.Header>

                        <Modal.Body>
                            <p className="text-sm text-default-500 leading-relaxed">
                                You have modified the configuration of this block. Those changes will be lost if you leave without saving.
                            </p>
                        </Modal.Body>

                        <Modal.Footer className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                variant="primary"
                                className="w-full sm:w-auto"
                                onPress={onSave}
                            >
                                Save Changes
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full sm:w-auto"
                                onPress={onDiscard}
                            >
                                Discard Changes
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full sm:w-auto text-default-400"
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
