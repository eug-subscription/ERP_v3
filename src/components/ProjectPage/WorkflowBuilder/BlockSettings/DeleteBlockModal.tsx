import { AlertDialog, Button, Checkbox, Label } from "@heroui/react";
import { useState } from "react";

interface DeleteBlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (force?: boolean) => void;
    blockLabel: string;
    dependentBlocks?: string[]; // Labels of blocks that depend on this one
}

/**
 * Confirmation modal for deleting a block.
 * Handles dependency warnings and force deletion.
 */
export function DeleteBlockModal({
    isOpen,
    onClose,
    onConfirm,
    blockLabel,
    dependentBlocks = []
}: DeleteBlockModalProps) {
    const [isForceDeleteChecked, setIsForceDeleteChecked] = useState(false);
    const hasDependencies = dependentBlocks.length > 0;

    const handleConfirm = () => {
        onConfirm(isForceDeleteChecked);
        onClose();
        setIsForceDeleteChecked(false);
    };

    return (
        <AlertDialog isOpen={isOpen} onOpenChange={onClose}>
            <AlertDialog.Backdrop className="backdrop-blur-md bg-black/40">
                <AlertDialog.Container>
                    <AlertDialog.Dialog className="sm:max-w-[420px]">
                        <AlertDialog.Header>
                            <AlertDialog.Icon status="danger" />
                            <AlertDialog.Heading>Delete "{blockLabel}"?</AlertDialog.Heading>
                        </AlertDialog.Header>

                        <AlertDialog.Body className="space-y-4">
                            <div className="text-sm text-default-500 leading-relaxed">
                                {hasDependencies ? (
                                    <div className="space-y-3">
                                        <p className="font-medium text-danger">
                                            Warning: This block is currently referenced by other blocks!
                                        </p>
                                        <p>
                                            The following blocks depend on this one:
                                        </p>
                                        <ul className="list-disc list-inside bg-default-50 p-3 rounded-lg border border-default-100 font-medium text-default-700">
                                            {dependentBlocks.map((label, idx) => (
                                                <li key={idx}>{label}</li>
                                            ))}
                                        </ul>
                                        <p>
                                            Deleting it may break the workflow logic in these blocks.
                                        </p>
                                    </div>
                                ) : (
                                    <p>
                                        Are you sure you want to remove this block from the workflow? This action cannot be undone.
                                    </p>
                                )}
                            </div>

                            {hasDependencies && (
                                <div className="pt-2 border-t border-default-100">
                                    <Checkbox
                                        id="force-delete-checkbox"
                                        isSelected={isForceDeleteChecked}
                                        onChange={setIsForceDeleteChecked}
                                    >
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        <Checkbox.Content>
                                            <Label htmlFor="force-delete-checkbox" className="text-xs font-semibold uppercase tracking-wider text-danger cursor-pointer">
                                                I understand the risks, force delete
                                            </Label>
                                        </Checkbox.Content>
                                    </Checkbox>
                                </div>
                            )}
                        </AlertDialog.Body>

                        <AlertDialog.Footer>
                            <Button
                                slot="close"
                                variant="ghost"
                                className="text-default-500"
                                onPress={() => {
                                    onClose();
                                    setIsForceDeleteChecked(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onPress={handleConfirm}
                                isDisabled={hasDependencies && !isForceDeleteChecked}
                            >
                                {hasDependencies ? 'Force Delete' : 'Delete Block'}
                            </Button>
                        </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                </AlertDialog.Container>
            </AlertDialog.Backdrop>
        </AlertDialog>
    );
}
