import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { tv } from "tailwind-variants";

/**
 * ServiceButton styles using tailwind-variants.
 * Precision-styled to match the blue/white design from the reference screenshot.
 */
const serviceButton = tv({
    base: "h-14 w-full justify-start px-0 transition-all duration-200 rounded-xl border",
    variants: {
        isSelected: {
            true: "bg-primary border-primary text-white shadow-sm",
            false: "bg-surface border-primary/40 text-primary hover:border-primary hover:bg-primary/5",
        },
    },
});

export interface ServiceButtonProps {
    /** Iconify icon name */
    icon: string;
    /** Display text for the service */
    text: string;
    /** Whether the service is currently selected */
    isSelected?: boolean;
    /** Callback when the button is pressed */
    onPress?: () => void;
}

/**
 * ServiceButton component for selecting services.
 * precision-styled with Tailwind v4 and HeroUI v3 standards.
 * Optimized for density to prevent text truncation in 4-column layouts.
 */
export function ServiceButton({
    icon,
    text,
    isSelected = false,
    onPress,
}: ServiceButtonProps) {
    return (
        <Button
            className={serviceButton({ isSelected })}
            onPress={onPress}
            variant="ghost"
        >
            <div className="flex items-center gap-2 pl-3.5 pr-2 w-full overflow-visible">
                <Icon
                    icon={icon}
                    className="text-lg flex-shrink-0"
                />
                <span className="text-xs font-semibold truncate text-left" title={text}>
                    {text}
                </span>
            </div>
        </Button>
    );
}
