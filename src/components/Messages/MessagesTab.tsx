import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Chip, ScrollShadow, Skeleton } from "@heroui/react";
import type { ScrollShadowVisibility } from "@heroui/react";
import { Icon } from "@iconify/react";
import {
    CARD_HEADER,
    ICON_CONTAINER_LG,
    ICON_SIZE_CONTAINER,
    MESSAGE_SCROLL_HEIGHT,
    SPACE_Y_6,
    TEXT_SECTION_TITLE,
} from "../../constants/ui-tokens";
import { EmptyState } from "../pricing/EmptyState";
import { useMessages } from "../../hooks/useMessages";
import { Message, mockMessages, ReplyPreview } from "../../data/mock-messages";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";
import { MessageDateSeparator } from "./MessageDateSeparator";
import { ScrollToBottomButton } from "./ScrollToBottomButton";
import { TypingIndicator } from "./TypingIndicator";

// Mocked — will be driven by WebSocket/polling in production
const MOCK_TYPING_USER = mockMessages[0].user;
const MOCK_IS_TYPING = true; // TODO: drive via WebSocket/polling in production

function getDateLabel(iso: string): string {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getDayKey(iso: string): string {
    const d = new Date(iso);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

interface RenderedItem {
    type: "separator";
    key: string;
    label: string;
}

interface RenderedMessage {
    type: "message";
    key: string;
    message: Message;
    isFirstInGroup: boolean;
}

type RenderItem = RenderedItem | RenderedMessage;

function buildRenderList(messages: Message[]): RenderItem[] {
    const items: RenderItem[] = [];
    let lastDayKey = "";
    let lastUserId = "";

    for (const message of messages) {
        const dayKey = getDayKey(message.time);

        if (dayKey !== lastDayKey) {
            items.push({
                type: "separator",
                key: `sep-${dayKey}`,
                label: getDateLabel(message.time),
            });
            lastDayKey = dayKey;
            lastUserId = "";
        }

        const isFirstInGroup = message.user.name !== lastUserId;
        items.push({
            type: "message",
            key: message.id,
            message,
            isFirstInGroup,
        });
        lastUserId = message.user.name;
    }

    return items;
}

export function MessagesTab() {
    const { data: messages = [], isLoading, isError, refetch } = useMessages();
    const bottomRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [replyTo, setReplyTo] = useState<ReplyPreview | undefined>(undefined);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function handleScrollToBottom() {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    function handleVisibilityChange(visibility: ScrollShadowVisibility) {
        setShowScrollButton(visibility === "top" || visibility === "both");
    }

    if (isLoading) {
        return (
            <Card className="mb-8 scroll-mt-32">
                <Card.Header className={CARD_HEADER}>
                    <div className="flex items-center gap-4">
                        <Skeleton className="size-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32 rounded-lg" />
                            <Skeleton className="h-3 w-48 rounded-lg" />
                        </div>
                    </div>
                </Card.Header>
                <Card.Content className="p-8">
                    <div className={SPACE_Y_6}>
                        <Skeleton className="h-16 w-3/4 rounded-xl" />
                        <Skeleton className="h-16 w-2/3 rounded-xl ml-auto" />
                    </div>
                </Card.Content>
            </Card>
        );
    }

    if (isError) {
        return (
            <Alert status="danger" className="rounded-2xl">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title className="font-bold">Error Loading Messages</Alert.Title>
                    <Alert.Description>Failed to fetch messages. Please try again.</Alert.Description>
                    <Button size="sm" variant="danger-soft" onPress={() => refetch()} className="font-bold mt-2">
                        Retry
                    </Button>
                </Alert.Content>
            </Alert>
        );
    }

    const renderList = buildRenderList(messages);

    return (
        <Card className="mb-8 scroll-mt-32">
            <Card.Header className={CARD_HEADER}>
                <div className="flex items-center gap-4">
                    <div className={ICON_CONTAINER_LG}>
                        <Icon icon="lucide:message-circle" className={ICON_SIZE_CONTAINER} />
                    </div>
                    <div className="flex-1">
                        <h2 className={TEXT_SECTION_TITLE}>Messages</h2>
                        <p className="text-xs text-default-400 font-medium">
                            Communication thread for this order.
                        </p>
                    </div>
                    <Chip color="accent" variant="soft" size="sm">Public Channel</Chip>
                </div>
            </Card.Header>
            <Card.Content className="p-8">
                {messages.length === 0 ? (
                    <EmptyState
                        icon="lucide:message-circle"
                        title="No messages yet"
                        description="Messages about this order will appear here."
                    />
                ) : (
                    <div className="relative">
                        <ScrollShadow
                            className={`${MESSAGE_SCROLL_HEIGHT} overflow-y-auto px-1`}
                            onVisibilityChange={handleVisibilityChange}
                        >
                            <div className={SPACE_Y_6}>
                                {renderList.map((item) =>
                                    item.type === "separator" ? (
                                        <MessageDateSeparator key={item.key} label={item.label} />
                                    ) : (
                                        <MessageBubble
                                            key={item.key}
                                            message={item.message}
                                            isFirstInGroup={item.isFirstInGroup}
                                            onReply={setReplyTo}
                                        />
                                    )
                                )}
                            </div>
                            {MOCK_IS_TYPING && (
                                <TypingIndicator
                                    userName={MOCK_TYPING_USER.name}
                                    avatarSrc={MOCK_TYPING_USER.avatar}
                                />
                            )}
                            <div ref={bottomRef} />
                        </ScrollShadow>
                        {showScrollButton && (
                            <ScrollToBottomButton onPress={handleScrollToBottom} />
                        )}
                    </div>
                )}
            </Card.Content>
            <Card.Footer className="p-0">
                <MessageComposer
                    replyTo={replyTo}
                    onDismissReply={() => setReplyTo(undefined)}
                />
            </Card.Footer>
        </Card>
    );
}
