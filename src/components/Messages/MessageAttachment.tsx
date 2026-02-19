import { useState } from "react";
import { Button, Modal } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Attachment } from "../../data/mock-messages";
import { formatFileSize } from "../../utils/formatters";
import {
    MESSAGE_ATTACHMENT_FILE_MAX_WIDTH,
    MESSAGE_ATTACHMENT_IMAGE_MAX_WIDTH,
    MODAL_BACKDROP,
} from "../../constants/ui-tokens";

interface MessageAttachmentProps {
    attachment: Attachment;
}


function ImageAttachment({ attachment }: MessageAttachmentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const src = attachment.thumbnailUrl ?? attachment.downloadUrl;

    return (
        <>
            <Button
                variant="ghost"
                className={`block ${MESSAGE_ATTACHMENT_IMAGE_MAX_WIDTH} rounded-xl overflow-hidden cursor-zoom-in p-0 h-auto`}
                aria-label={`View ${attachment.fileName}`}
                onPress={() => setIsOpen(true)}
            >
                <img
                    src={src}
                    alt={attachment.fileName}
                    className="w-full object-cover rounded-xl"
                />
            </Button>

            <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
                <Modal.Backdrop className={MODAL_BACKDROP}>
                    <Modal.Container className="max-w-3xl">
                        <Modal.Dialog>
                            <Modal.CloseTrigger />
                            <Modal.Header>
                                <Modal.Heading>{attachment.fileName}</Modal.Heading>
                            </Modal.Header>
                            <Modal.Body>
                                <img
                                    src={attachment.downloadUrl}
                                    alt={attachment.fileName}
                                    className="w-full rounded-xl object-contain"
                                    style={{ maxHeight: "70vh" }}
                                />
                            </Modal.Body>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </>
    );
}

function FileCard({ attachment, icon }: MessageAttachmentProps & { icon: string }) {
    return (
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-default-200 bg-default-50 ${MESSAGE_ATTACHMENT_FILE_MAX_WIDTH}`}>
            <div className="size-9 rounded-lg bg-default-100 flex items-center justify-center shrink-0">
                <Icon icon={icon} className="size-5 text-default-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-default-800 truncate">
                    {attachment.fileName}
                </p>
                <p className="text-tiny text-default-400">
                    {formatFileSize(attachment.fileSize)}
                </p>
            </div>
            <Button
                isIconOnly
                variant="ghost"
                size="sm"
                aria-label={`Download ${attachment.fileName}`}
                onPress={() => window.open(attachment.downloadUrl, "_blank")}
            >
                <Icon icon="lucide:download" className="size-4 text-default-400" />
            </Button>
        </div>
    );
}

export function MessageAttachment({ attachment }: MessageAttachmentProps) {
    if (attachment.mimeType.startsWith("image/")) {
        return <ImageAttachment attachment={attachment} />;
    }

    if (attachment.mimeType === "application/pdf") {
        return <FileCard attachment={attachment} icon="lucide:file-text" />;
    }

    if (attachment.mimeType.startsWith("video/")) {
        // Video playback is Phase C — render as a generic file card for now
        return <FileCard attachment={attachment} icon="lucide:video" />;
    }

    return <FileCard attachment={attachment} icon="lucide:file" />;
}
