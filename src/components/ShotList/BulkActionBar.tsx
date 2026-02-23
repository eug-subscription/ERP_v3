import { useState } from "react";
import { createPortal } from "react-dom";
import { AlertDialog, Button, Separator, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TOOLTIP_DELAY, MODAL_BACKDROP, MODAL_WIDTH_SM } from "../../constants/ui-tokens";

interface BulkActionBarProps {
    selectedCount: number;
    onClear: () => void;
}

export function BulkActionBar({ selectedCount, onClear }: BulkActionBarProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);

    if (selectedCount === 0) return null;

    return createPortal(
        <>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-default-200 bg-surface/80 backdrop-blur-xl shadow-xl ring-1 ring-foreground/5">
                    {/* Selection count chip */}
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent bg-accent/10 px-3 py-1 rounded-lg mr-1">
                        <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5" />
                        {selectedCount} selected
                    </span>

                    <Separator orientation="vertical" className="h-5 mx-1" />

                    {/* Actions */}
                    <Tooltip delay={TOOLTIP_DELAY}>
                        <Tooltip.Trigger>
                            <Button variant="ghost" size="sm" className="rounded-xl gap-1.5" onPress={() => { /* TODO: connect bulk edit handler */ }}>
                                <Icon icon="lucide:pencil" className="w-4 h-4" />
                                Edit
                            </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>Edit selected items</Tooltip.Content>
                    </Tooltip>

                    <Tooltip delay={TOOLTIP_DELAY}>
                        <Tooltip.Trigger>
                            <Button variant="ghost" size="sm" className="rounded-xl gap-1.5" onPress={() => { /* TODO: connect bulk send-to-order handler */ }}>
                                <Icon icon="lucide:arrow-right-left" className="w-4 h-4" />
                                Send to order
                            </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>Move items to another order</Tooltip.Content>
                    </Tooltip>

                    <Tooltip delay={TOOLTIP_DELAY}>
                        <Tooltip.Trigger>
                            <Button variant="ghost" size="sm" className="rounded-xl gap-1.5" onPress={() => { /* TODO: connect bulk download handler */ }}>
                                <Icon icon="lucide:download" className="w-4 h-4" />
                                Download
                            </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>Download selected items</Tooltip.Content>
                    </Tooltip>

                    <Separator orientation="vertical" className="h-5 mx-1" />

                    <Tooltip delay={TOOLTIP_DELAY}>
                        <Tooltip.Trigger>
                            <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 text-danger hover:bg-danger/10" onPress={() => setDeleteOpen(true)}>
                                <Icon icon="lucide:trash-2" className="w-4 h-4" />
                                Delete
                            </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>Delete selected items</Tooltip.Content>
                    </Tooltip>

                    <Separator orientation="vertical" className="h-5 mx-1" />

                    {/* Close */}
                    <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-default-400"
                        onPress={onClear}
                        aria-label="Clear selection"
                    >
                        <Icon icon="lucide:x" className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Delete confirmation dialog */}
            <AlertDialog.Backdrop className={MODAL_BACKDROP} isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialog.Container>
                    <AlertDialog.Dialog className={MODAL_WIDTH_SM}>
                        <AlertDialog.CloseTrigger />
                        <AlertDialog.Header>
                            <AlertDialog.Icon status="danger" />
                            <AlertDialog.Heading>Delete {selectedCount} {selectedCount === 1 ? "item" : "items"}?</AlertDialog.Heading>
                        </AlertDialog.Header>
                        <AlertDialog.Body>
                            <p>This will permanently delete the selected shot list {selectedCount === 1 ? "item" : "items"}. This action cannot be undone.</p>
                        </AlertDialog.Body>
                        <AlertDialog.Footer>
                            <Button slot="close" variant="tertiary">
                                Cancel
                            </Button>
                            <Button
                                slot="close"
                                variant="danger"
                                onPress={() => {
                                    setDeleteOpen(false);
                                    /* TODO: connect bulk delete handler */
                                }}
                            >
                                Delete
                            </Button>
                        </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                </AlertDialog.Container>
            </AlertDialog.Backdrop>
        </>,
        document.body
    );
}
