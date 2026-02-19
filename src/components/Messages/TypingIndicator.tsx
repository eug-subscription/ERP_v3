import { Avatar } from "@heroui/react";

interface TypingIndicatorProps {
    userName: string;
    avatarSrc: string;
}

export function TypingIndicator({ userName, avatarSrc }: TypingIndicatorProps) {
    return (
        <div className="flex items-center gap-2 px-1 py-2">
            <Avatar size="sm" className="shrink-0">
                <Avatar.Image src={avatarSrc} alt={userName} />
            </Avatar>
            <span className="text-tiny text-default-400">{userName} is typing</span>
            <div className="flex items-center gap-1 pt-1">
                <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-typing-dot"
                    style={{ animationDelay: "0ms" }}
                />
                <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-typing-dot"
                    style={{ animationDelay: "200ms" }}
                />
                <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-typing-dot"
                    style={{ animationDelay: "400ms" }}
                />
            </div>
        </div>
    );
}
