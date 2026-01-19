export interface Message {
    id: string;
    user: {
        name: string;
        avatar: string;
    };
    text: string;
    time: string;
    isCurrentUser: boolean;
}

export const mockMessages: Message[] = [
    {
        id: "1",
        user: {
            name: "Phoenix Baker",
            avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=phoenix",
        },
        text: "Hey there, can you please choose the best design?",
        time: "Today 7:15pm",
        isCurrentUser: false,
    },
    {
        id: "2",
        user: {
            name: "Phoenix Baker",
            avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=phoenix",
        },
        text: "Hurry up, I need a quick turnaround.",
        time: "Today 7:39pm",
        isCurrentUser: false,
    },
];
