import { useState } from "react";
import { Reaction, CURRENT_USER_ID } from "../data/mock-messages";

interface UseMessageBubbleOptions {
    text: string;
    reactions: Reaction[];
    isDeleted?: boolean;
}

function toggleReaction(reactions: Reaction[], emoji: string): Reaction[] {
    const existing = reactions.find((r) => r.emoji === emoji);
    if (existing) {
        if (existing.hasReacted) {
            const newCount = existing.count - 1;
            if (newCount === 0) return reactions.filter((r) => r.emoji !== emoji);
            return reactions.map((r) =>
                r.emoji === emoji ? { ...r, count: newCount, hasReacted: false } : r
            );
        } else {
            return reactions.map((r) =>
                r.emoji === emoji ? { ...r, count: r.count + 1, hasReacted: true } : r
            );
        }
    }
    return [...reactions, { emoji, count: 1, userIds: [CURRENT_USER_ID], hasReacted: true }];
}

export function useMessageBubble({ text, reactions: initialReactions, isDeleted: initialDeleted }: UseMessageBubbleOptions) {
    const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);
    const [displayText, setDisplayText] = useState(text);
    const [isDeleted, setIsDeleted] = useState(initialDeleted ?? false);

    function handleReact(emoji: string) {
        setReactions((prev) => toggleReaction(prev, emoji));
    }

    function handleEditSave() {
        if (editText.trim()) setDisplayText(editText.trim());
        setIsEditing(false);
    }

    function handleEditCancel() {
        setEditText(displayText);
        setIsEditing(false);
    }

    function handleDelete() {
        setIsDeleted(true);
    }

    return {
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
    };
}
