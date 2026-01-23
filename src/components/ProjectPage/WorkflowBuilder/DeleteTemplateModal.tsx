import { AlertDialog, Button } from "@heroui/react";

interface DeleteTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    templateName: string;
}

/**
 * Confirmation modal for deleting a workflow template.
 * Replaces native confirm() for better accessibility and design consistency.
 */
export function DeleteTemplateModal({
    isOpen,
    onClose,
    onConfirm,
    templateName
}: DeleteTemplateModalProps) {
    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <AlertDialog isOpen={isOpen} onOpenChange={onClose}>
            <AlertDialog.Backdrop className="backdrop-blur-md bg-black/40">
                <AlertDialog.Container>
                    <AlertDialog.Dialog className="sm:max-w-[420px]">
                        <AlertDialog.CloseTrigger />
                        <AlertDialog.Header>
                            <AlertDialog.Icon status="danger" />
                            <AlertDialog.Heading>Delete Template?</AlertDialog.Heading>
                        </AlertDialog.Header>

                        <AlertDialog.Body>
                            <div className="text-sm text-default-500 leading-relaxed">
                                <p>
                                    Are you sure you want to delete the template <span className="font-semibold text-default-900">"{templateName}"</span>?
                                </p>
                                <p className="mt-2 text-danger font-medium">
                                    This action cannot be undone and will remove the template from your library.
                                </p>
                            </div>
                        </AlertDialog.Body>

                        <AlertDialog.Footer>
                            <Button
                                slot="close"
                                variant="tertiary"
                                className="text-default-500"
                                onPress={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                slot="close"
                                variant="danger"
                                onPress={handleConfirm}
                            >
                                Delete Template
                            </Button>
                        </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                </AlertDialog.Container>
            </AlertDialog.Backdrop>
        </AlertDialog>
    );
}
