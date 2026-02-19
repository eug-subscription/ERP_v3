import { useState } from "react";
import { AlertDialog, Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { MODAL_BACKDROP, TOOLTIP_DELAY } from "../../constants/ui-tokens";

interface MessageActionsProps {
    isCurrentUser: boolean;
    onReply: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

/**
 * Renders action icon buttons (reply, edit, delete) with no wrapper container.
 * The parent in MessageBubble owns the pill container so all controls sit in one row.
 */
export function MessageActions({
    isCurrentUser,
    onReply,
    onEdit,
    onDelete,
}: MessageActionsProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);

    return (
        <>
            <Tooltip delay={TOOLTIP_DELAY}>
                <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    aria-label="Reply"
                    onPress={onReply}
                    className="size-6 min-w-0"
                >
                    <Icon icon="lucide:reply" className="size-3 text-default-500" />
                </Button>
                <Tooltip.Content>
                    <p>Reply</p>
                </Tooltip.Content>
            </Tooltip>

            {isCurrentUser && (
                <Tooltip delay={TOOLTIP_DELAY}>
                    <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        aria-label="Edit message"
                        onPress={onEdit}
                        className="size-6 min-w-0"
                    >
                        <Icon icon="lucide:pencil" className="size-3 text-default-500" />
                    </Button>
                    <Tooltip.Content>
                        <p>Edit</p>
                    </Tooltip.Content>
                </Tooltip>
            )}

            {isCurrentUser && (
                <Tooltip delay={TOOLTIP_DELAY}>
                    <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        aria-label="Delete message"
                        onPress={() => setDeleteOpen(true)}
                        className="size-6 min-w-0"
                    >
                        <Icon icon="lucide:trash-2" className="size-3 text-danger" />
                    </Button>
                    <Tooltip.Content>
                        <p>Delete</p>
                    </Tooltip.Content>
                </Tooltip>
            )}

            <AlertDialog.Backdrop className={MODAL_BACKDROP} isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialog.Container>
                    <AlertDialog.Dialog className="sm:max-w-[400px]">
                        <AlertDialog.CloseTrigger />
                        <AlertDialog.Header>
                            <AlertDialog.Icon status="danger" />
                            <AlertDialog.Heading>Delete this message?</AlertDialog.Heading>
                        </AlertDialog.Header>
                        <AlertDialog.Body>
                            <p>This message will be permanently deleted and cannot be recovered.</p>
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
                                    onDelete();
                                }}
                            >
                                Delete
                            </Button>
                        </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                </AlertDialog.Container>
            </AlertDialog.Backdrop>
        </>
    );
}
