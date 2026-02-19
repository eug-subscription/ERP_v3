import { useRef, useState, KeyboardEvent } from "react";
import { Avatar, Button, Kbd, TextArea, Tooltip, toast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { CURRENT_USER_AVATAR, ReplyPreview } from "../../data/mock-messages";
import { TOOLTIP_DELAY } from "../../constants/ui-tokens";
import { formatFileSize } from "../../utils/formatters";
import { ComposerToolbar } from "./ComposerToolbar";

interface StagedFile {
    id: string;
    name: string;
    size: number;
    mimeType: string;
}

interface MessageComposerProps {
    replyTo?: ReplyPreview;
    onDismissReply?: () => void;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export function MessageComposer({ replyTo, onDismissReply }: MessageComposerProps) {
    const [text, setText] = useState("");
    const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasContent = text.trim().length > 0 || stagedFiles.length > 0;

    function handleSend() {
        if (!hasContent) return;
        // TODO: wire to actual send logic
        setText("");
        setStagedFiles([]);
        onDismissReply?.();
    }

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        const oversized = files.filter((f) => f.size > MAX_FILE_SIZE_BYTES);

        if (stagedFiles.length + files.length > MAX_FILES) {
            toast.danger(`Too many files`, {
                description: `You can attach a maximum of ${MAX_FILES} files per message.`,
            });
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        if (oversized.length > 0) {
            toast.danger("File too large", {
                description: `Each file must be under 25 MB. Remove the oversized file and try again.`,
            });
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const newFiles: StagedFile[] = files.map((f) => ({
            id: `${f.name}-${f.lastModified}`,
            name: f.name,
            size: f.size,
            mimeType: f.type,
        }));

        setStagedFiles((prev) => [...prev, ...newFiles]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleRemoveFile(id: string) {
        setStagedFiles((prev) => prev.filter((f) => f.id !== id));
    }

    return (
        <div className="border-t border-default-100 bg-default-50/50 flex flex-col">
            {/* Reply preview bar */}
            {replyTo && (
                <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                    <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/5 border-l-2 border-accent min-w-0">
                        <Icon icon="lucide:reply" className="size-3.5 text-accent shrink-0" />
                        <span className="text-xs font-semibold text-accent shrink-0">
                            {replyTo.userName}
                        </span>
                        <span className="text-xs text-default-500 truncate">{replyTo.text}</span>
                    </div>
                    <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        aria-label="Dismiss reply"
                        onPress={onDismissReply}
                    >
                        <Icon icon="lucide:x" className="size-3.5 text-default-400" />
                    </Button>
                </div>
            )}

            {/* Staged attachment chips */}
            {stagedFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-4 pt-2">
                    {stagedFiles.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-default-100 border border-default-200 text-xs text-default-700"
                        >
                            <Icon icon="lucide:paperclip" className="size-3 text-default-400 shrink-0" />
                            <span className="max-w-[120px] truncate">{file.name}</span>
                            <span className="text-default-400">({formatFileSize(file.size)})</span>
                            <Button
                                isIconOnly
                                variant="ghost"
                                size="sm"
                                aria-label={`Remove ${file.name}`}
                                onPress={() => handleRemoveFile(file.id)}
                                className="size-4 min-w-0 p-0 ml-0.5"
                            >
                                <Icon icon="lucide:x" className="size-2.5" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input row */}
            <div className="flex items-end gap-3 px-4 pt-3 pb-1">
                <Avatar size="sm" className="flex-shrink-0 shadow-surface mb-1">
                    <Avatar.Image src={CURRENT_USER_AVATAR} alt="Your Avatar" />
                </Avatar>

                <div className="flex-1">
                    <TextArea
                        aria-label="Message content"
                        fullWidth
                        placeholder="Type a message..."
                        rows={1}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="resize-none"
                        style={{ maxHeight: "9rem", overflowY: "auto" }}
                    />
                </div>

                <Tooltip delay={TOOLTIP_DELAY}>
                    <Button
                        isIconOnly
                        variant={hasContent ? "primary" : "ghost"}
                        aria-label="Send message"
                        isDisabled={!hasContent}
                        onPress={handleSend}
                        className="mb-1"
                    >
                        <Icon icon="lucide:send" className="size-4" />
                    </Button>
                    <Tooltip.Content>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs">Send</span>
                            <Kbd>
                                <Kbd.Abbr keyValue="command" />
                                <Kbd.Content>↵</Kbd.Content>
                            </Kbd>
                        </div>
                    </Tooltip.Content>
                </Tooltip>
            </div>

            {/* Toolbar row */}
            <ComposerToolbar onAttachPress={() => fileInputRef.current?.click()} />

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                aria-hidden="true"
            />
        </div>
    );
}
