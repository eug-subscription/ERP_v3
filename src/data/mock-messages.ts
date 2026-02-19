export const CURRENT_USER_ID = "current-user";
export const CURRENT_USER_AVATAR = "https://img.heroui.chat/image/avatar?w=32&h=32&u=3";

export interface User {
    id: string;
    name: string;
    avatar: string;
    status: "online" | "away" | "offline";
}

export interface Attachment {
    id: string;
    fileName: string;
    fileSize: number; // bytes
    mimeType: string;
    thumbnailUrl?: string;
    downloadUrl: string;
}

export interface Reaction {
    emoji: string;
    count: number;
    userIds: string[];
    hasReacted: boolean;
}

export interface Mention {
    userId: string;
    displayName: string;
}

export interface Message {
    id: string;
    user: User;
    text: string;
    time: string; // ISO 8601 string
    isCurrentUser: boolean;
    status: "sending" | "sent" | "delivered" | "read";
    attachments: Attachment[];
    reactions: Reaction[];
    mentions: Mention[];
    replyTo?: {
        messageId: string;
        text: string;
        userName: string;
    };
    isEdited: boolean;
    isDeleted: boolean;
}

export interface ReplyPreview {
    messageId: string;
    text: string;
    userName: string;
}

const PHOENIX_USER: User = {
    id: "phoenix",
    name: "Phoenix Baker",
    avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=phoenix",
    status: "online",
};

const CURRENT_USER: User = {
    id: CURRENT_USER_ID,
    name: "You",
    avatar: CURRENT_USER_AVATAR,
    status: "online",
};

export const mockMessages: Message[] = [
    // Yesterday
    {
        id: "1",
        user: PHOENIX_USER,
        text: "Hey, just wanted to check in on the order status.",
        time: "2026-02-17T09:10:00Z",
        isCurrentUser: false,
        status: "read",
        attachments: [],
        reactions: [],
        mentions: [],
        isEdited: false,
        isDeleted: false,
    },
    {
        id: "2",
        user: CURRENT_USER,
        text: "All good! We're on track for delivery by end of week.",
        time: "2026-02-17T09:15:00Z",
        isCurrentUser: true,
        status: "read",
        attachments: [],
        reactions: [
            { emoji: "👍", count: 1, userIds: ["phoenix"], hasReacted: false },
        ],
        mentions: [],
        isEdited: false,
        isDeleted: false,
    },
    // Today — Phoenix group
    {
        id: "3",
        user: PHOENIX_USER,
        text: "Hey there, can you please choose the best design?",
        time: "2026-02-18T07:15:00Z",
        isCurrentUser: false,
        status: "read",
        attachments: [
            {
                id: "att-1",
                fileName: "design-brief.pdf",
                fileSize: 204800, // 200 KB
                mimeType: "application/pdf",
                downloadUrl: "#",
            },
        ],
        reactions: [],
        mentions: [{ userId: CURRENT_USER_ID, displayName: "You" }],
        isEdited: false,
        isDeleted: false,
    },
    {
        id: "4",
        user: PHOENIX_USER,
        text: "Hurry up, I need a quick turnaround.",
        time: "2026-02-18T07:39:00Z",
        isCurrentUser: false,
        status: "read",
        attachments: [],
        reactions: [],
        mentions: [],
        isEdited: false,
        isDeleted: false,
    },
    // Today — current user group
    {
        id: "5",
        user: CURRENT_USER,
        text: "Sure, give me 10 minutes.",
        time: "2026-02-18T07:42:00Z",
        isCurrentUser: true,
        status: "delivered",
        attachments: [],
        reactions: [
            { emoji: "👍", count: 2, userIds: ["phoenix", CURRENT_USER_ID], hasReacted: true },
            { emoji: "❤️", count: 1, userIds: ["phoenix"], hasReacted: false },
        ],
        mentions: [],
        isEdited: false,
        isDeleted: false,
    },
    {
        id: "6",
        user: CURRENT_USER,
        text: "I'll go with design #3 — it has the best balance of clarity and style.",
        time: "2026-02-18T07:52:00Z",
        isCurrentUser: true,
        status: "sent",
        attachments: [],
        reactions: [],
        mentions: [],
        replyTo: {
            messageId: "3",
            text: "Hey there, can you please choose the best design?",
            userName: "Phoenix Baker",
        },
        isEdited: false,
        isDeleted: false,
    },
];
