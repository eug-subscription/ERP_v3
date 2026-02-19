import { Separator } from "@heroui/react";

interface MessageDateSeparatorProps {
    label: string;
}

export function MessageDateSeparator({ label }: MessageDateSeparatorProps) {
    return (
        <div className="flex items-center gap-3 my-2">
            <Separator className="flex-1" variant="tertiary" />
            <span className="text-tiny text-default-400 font-medium shrink-0 select-none">
                {label}
            </span>
            <Separator className="flex-1" variant="tertiary" />
        </div>
    );
}
