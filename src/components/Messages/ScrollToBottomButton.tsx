import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface ScrollToBottomButtonProps {
    onPress: () => void;
}

export function ScrollToBottomButton({ onPress }: ScrollToBottomButtonProps) {
    return (
        <Button
            isIconOnly
            size="sm"
            variant="secondary"
            onPress={onPress}
            className="absolute bottom-4 right-4 z-10 shadow-md rounded-full"
            aria-label="Scroll to latest message"
        >
            <Icon icon="lucide:chevrons-down" className="size-4" />
        </Button>
    );
}
