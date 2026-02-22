import React from 'react';
import { Avatar, Button, TextArea } from '@heroui/react';
import { Icon } from '@iconify/react';


const MAX_COMMENT_LENGTH = 2000;

interface CommentComposerProps {
    onSubmit: (comment: string) => void;
}

export function CommentComposer({ onSubmit }: CommentComposerProps) {
    const [comment, setComment] = React.useState('');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(e.target.value);
    };

    const handleSubmit = () => {
        const trimmed = comment.trim();
        if (!trimmed) return;
        onSubmit(trimmed);
        setComment('');
    };

    return (
        <div className="flex gap-3 items-start p-4 border-b border-default-100">
            {/* Current user avatar */}
            <Avatar size="sm">
                <Avatar.Fallback>ME</Avatar.Fallback>
            </Avatar>

            {/* Composer body */}
            <div className="flex-1 min-w-0 space-y-2">
                <TextArea
                    aria-label="Write a comment"
                    placeholder="Write your update here..."
                    value={comment}
                    onChange={handleChange}
                    rows={3}
                    fullWidth
                    maxLength={MAX_COMMENT_LENGTH}
                    className="resize-none"
                />

                {/* Action bar */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                        <Button
                            size="sm"
                            variant="ghost"
                            isIconOnly
                            aria-label="Attach file"
                        >
                            <Icon icon="lucide:paperclip" className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            isIconOnly
                            aria-label="Insert emoji"
                        >
                            <Icon icon="lucide:smile" className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            isIconOnly
                            aria-label="Mention someone"
                        >
                            <Icon icon="lucide:at-sign" className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="t-compact text-default-400">
                            {comment.length} / {MAX_COMMENT_LENGTH}
                        </span>
                        <Button
                            size="sm"
                            variant="primary"
                            onPress={handleSubmit}
                            isDisabled={!comment.trim()}
                        >
                            Post
                        </Button>
                    </div>
                </div>

                {/* Privacy note */}
                <p className="text-tiny text-default-400 flex items-center gap-1.5">
                    <Icon icon="lucide:lock" className="w-3 h-3" />
                    Only you and other staff can see comments
                </p>
            </div>
        </div>
    );
}
