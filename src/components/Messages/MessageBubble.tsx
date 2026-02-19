import { Avatar, Button, TextArea, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { tv } from "tailwind-variants";
import { MESSAGE_BUBBLE_MAX_WIDTH, TOOLTIP_DELAY } from "../../constants/ui-tokens";
import { Message, ReplyPreview } from "../../data/mock-messages";
import { useMessageBubble } from "../../hooks/useMessageBubble";
import { MessageAttachment } from "./MessageAttachment";
import { MessageActions } from "./MessageActions";

interface MessageBubbleProps {
    message: Message;
    isFirstInGroup: boolean;
    onReply: (preview: ReplyPreview) => void;
}

const EMOJI_TRAY = ["👍", "❤️", "😂", "👀", "🎉"] as const;

const bubbleVariants = tv({
    base: `p-3 ${MESSAGE_BUBBLE_MAX_WIDTH}`,
    variants: {
        isCurrentUser: {
            true: "bg-gradient-to-br from-accent-100 to-accent-50 text-accent-900 shadow-surface rounded-2xl rounded-tr-sm",
            false: "bg-default-50 text-default-900 shadow-surface rounded-2xl rounded-tl-sm",
        },
    },
});

const rowVariants = tv({
    base: "flex gap-3 items-start group",
    variants: {
        isCurrentUser: {
            true: "flex-row-reverse",
            false: "",
        },
    },
});

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message, isFirstInGroup, onReply }: MessageBubbleProps) {
    const timeLabel = formatTime(message.time);
    const {
        reactions,
        isEditing,
        editText,
        displayText,
        isDeleted,
        setIsEditing,
        setEditText,
        handleReact,
        handleEditSave,
        handleEditCancel,
        handleDelete,
    } = useMessageBubble({
        text: message.text,
        reactions: message.reactions,
        isDeleted: message.isDeleted,
    });

    if (isDeleted) {
        return (
            <div className={rowVariants({ isCurrentUser: message.isCurrentUser })}>
                <div className="size-8 shrink-0" aria-hidden="true" />
                <p className="text-xs text-default-400 italic px-3 py-1">
                    This message was deleted.
                </p>
            </div>
        );
    }

    return (
        <div className={rowVariants({ isCurrentUser: message.isCurrentUser })}>
            {/* Avatar */}
            {isFirstInGroup ? (
                <div className="relative shrink-0 mt-0.5">
                    <Avatar size="sm">
                        <Avatar.Image src={message.user.avatar} alt={message.user.name} />
                    </Avatar>
                    {message.user.status === "online" && (
                        <span className="absolute bottom-0 right-0 z-10 size-2 rounded-full bg-success ring-1 ring-background" />
                    )}
                </div>
            ) : (
                <div className="size-8 shrink-0" aria-hidden="true" />
            )}

            {/* Bubble + reactions column */}
            <div className="flex flex-col gap-1 min-w-0">
                {/* Bubble row: bubble + hover controls side by side */}
                <div className={`flex items-center gap-1.5 ${message.isCurrentUser ? "flex-row-reverse" : ""}`}>
                    {/* Bubble */}
                    <div className={bubbleVariants({ isCurrentUser: message.isCurrentUser })}>
                        {isFirstInGroup && (
                            <div className="flex justify-between items-center mb-1 gap-4">
                                <span className="font-semibold text-xs">{message.user.name}</span>
                                <span className="text-tiny opacity-0 group-hover:opacity-60 transition-opacity duration-200 uppercase tracking-wider">
                                    {timeLabel}
                                </span>
                            </div>
                        )}

                        {/* Quoted reply preview */}
                        {message.replyTo && (
                            <div className="mb-2 px-2 py-1.5 rounded-lg bg-default-100 border-l-2 border-accent flex flex-col gap-0.5 min-w-0">
                                <span className="text-tiny font-semibold text-accent truncate">
                                    {message.replyTo.userName}
                                </span>
                                <span className="text-xs text-default-500 truncate leading-snug">
                                    {message.replyTo.text}
                                </span>
                            </div>
                        )}

                        {isEditing ? (
                            <div className="flex flex-col gap-2 min-w-72">
                                <TextArea
                                    aria-label="Edit message"
                                    fullWidth
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    rows={3}
                                    className="resize-none text-sm"
                                    autoFocus
                                />
                                <div className="flex gap-1.5 justify-end">
                                    <Button size="sm" variant="ghost" onPress={handleEditCancel}>
                                        Cancel
                                    </Button>
                                    <Button size="sm" variant="primary" onPress={handleEditSave}>
                                        Save
                                    </Button>
                                </div>
                            </div>
                        ) : isFirstInGroup ? (
                            <p className="text-sm leading-relaxed">{displayText}</p>
                        ) : (
                            <Tooltip delay={TOOLTIP_DELAY}>
                                <p className="text-sm leading-relaxed cursor-default">{displayText}</p>
                                <Tooltip.Content>
                                    <p>{timeLabel}</p>
                                </Tooltip.Content>
                            </Tooltip>
                        )}

                        {message.attachments.length > 0 && (
                            <div className="flex flex-col gap-2 mt-2">
                                {message.attachments.map((att) => (
                                    <MessageAttachment key={att.id} attachment={att} />
                                ))}
                            </div>
                        )}

                        {message.isCurrentUser && (
                            <div className="flex justify-end mt-1">
                                <Icon
                                    icon={message.status === "sent" ? "lucide:check" : "lucide:check-check"}
                                    className={`size-3.5 ${message.status === "read" ? "text-accent" : "text-default-400"}`}
                                />
                            </div>
                        )}
                    </div>

                    {/* Hover controls: compact single pill beside the bubble */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-0.5 bg-background border border-default-200 rounded-full px-1 py-0.5 shadow-surface shrink-0">
                        <MessageActions
                            isCurrentUser={message.isCurrentUser}
                            onReply={() =>
                                onReply({
                                    messageId: message.id,
                                    text: displayText,
                                    userName: message.user.name,
                                })
                            }
                            onEdit={() => setIsEditing(true)}
                            onDelete={handleDelete}
                        />
                        <div className="w-px h-3 bg-default-200 mx-0.5 shrink-0" />
                        {EMOJI_TRAY.map((emoji) => (
                            <Button
                                key={emoji}
                                isIconOnly
                                variant="ghost"
                                size="sm"
                                aria-label={`React with ${emoji}`}
                                onPress={() => handleReact(emoji)}
                                className="size-5 min-w-0 p-0 text-sm hover:scale-125 transition-transform duration-100"
                            >
                                {emoji}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Reaction pills */}
                {reactions.length > 0 && (
                    <div className={`flex flex-wrap gap-1 ${message.isCurrentUser ? "justify-end" : ""}`}>
                        {reactions.map((reaction) => (
                            <Button
                                key={reaction.emoji}
                                size="sm"
                                variant="secondary"
                                aria-label={`${reaction.emoji} ${reaction.count} reaction${reaction.count !== 1 ? "s" : ""}`}
                                onPress={() => handleReact(reaction.emoji)}
                                className="h-6 px-2 text-xs rounded-full gap-1 min-w-0"
                            >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
