import { AlertDialog, Button } from "@heroui/react";

interface TemplateApplyConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    templateName: string;
}

/**
 * Confirmation modal for applying a template when an existing workflow is present.
 * Replaces native confirm() for better accessibility and design consistency.
 */
export function TemplateApplyConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    templateName
}: TemplateApplyConfirmModalProps) {
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
                            <AlertDialog.Icon status="warning" />
                            <AlertDialog.Heading>Replace Current Workflow?</AlertDialog.Heading>
                        </AlertDialog.Header>

                        <AlertDialog.Body>
                            <div className="text-sm text-default-500 leading-relaxed">
                                <p>
                                    Applying the template <span className="font-semibold text-default-900">"{templateName}"</span> will replace all blocks in your current workflow.
                                </p>
                                <p className="mt-2 text-warning-700 font-medium">
                                    Any unsaved changes to your current design will be lost. Do you want to continue?
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
                                variant="primary"
                                className="bg-warning text-warning-foreground hover:bg-warning-600"
                                onPress={handleConfirm}
                            >
                                Replace Workflow
                            </Button>
                        </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                </AlertDialog.Container>
            </AlertDialog.Backdrop>
        </AlertDialog>
    );
}
