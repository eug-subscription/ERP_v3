import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TOOLTIP_DELAY } from "../../constants/ui-tokens";

interface ComposerToolbarProps {
    onAttachPress: () => void;
}

export function ComposerToolbar({ onAttachPress }: ComposerToolbarProps) {
    return (
        <div className="flex items-center gap-1 px-4 pb-3">
            <Tooltip delay={TOOLTIP_DELAY}>
                <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    aria-label="Attach file"
                    onPress={onAttachPress}
                >
                    <Icon icon="lucide:paperclip" className="size-4 text-default-400" />
                </Button>
                <Tooltip.Content>
                    <p>Attach file</p>
                </Tooltip.Content>
            </Tooltip>

            <Tooltip delay={TOOLTIP_DELAY}>
                <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    isDisabled
                    aria-label="Record video (coming soon)"
                >
                    <Icon icon="lucide:video" className="size-4 text-default-400" />
                </Button>
                <Tooltip.Content>
                    <p>Video message (coming soon)</p>
                </Tooltip.Content>
            </Tooltip>

            <Tooltip delay={TOOLTIP_DELAY}>
                <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    isDisabled
                    aria-label="Emoji picker (coming soon)"
                >
                    <Icon icon="lucide:smile" className="size-4 text-default-400" />
                </Button>
                <Tooltip.Content>
                    <p>Emoji picker (coming soon)</p>
                </Tooltip.Content>
            </Tooltip>
        </div>
    );
}
