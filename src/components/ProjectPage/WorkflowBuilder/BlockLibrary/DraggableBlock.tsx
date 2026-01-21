import { useDraggable } from "@dnd-kit/core";
import { Icon } from "@iconify/react";
import { BlockLibraryItem } from "../../../../data/block-ui-categories";
import { CSS } from "@dnd-kit/utilities";
import { tv } from "tailwind-variants";

interface DraggableBlockProps {
    block: BlockLibraryItem;
}

const blockIcon = tv({
    base: "flex h-7 w-7 items-center justify-center rounded-md",
    variants: {
        category: {
            SETUP_ONBOARDING: "bg-primary/10 text-primary",
            GATES_PREREQUISITES: "bg-warning/10 text-warning",
            PRODUCTION_PROCESSING: "bg-secondary/10 text-secondary",
            FLOW_CONTROL: "bg-success/10 text-success",
            QUALITY_ASSURANCE: "bg-danger/10 text-danger",
            ASSET_MANAGEMENT: "bg-default-200 text-default-600",
            DELIVERY_NOTIFICATIONS: "bg-success/10 text-success",
        },
    },
});

export function DraggableBlock({ block }: DraggableBlockProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `library-${block.type}`,
        data: {
            type: "BLOCK_TEMPLATE",
            blockType: block.type,
            category: block.category,
            label: block.label,
            icon: block.icon,
        },
    });

    const style = transform
        ? {
            transform: CSS.Translate.toString(transform),
        }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            tabIndex={0}
            role="option"
            aria-roledescription="draggable block"
            className={`
                group flex items-center gap-3 px-3 py-2 rounded-lg
                hover:bg-default-100 cursor-grab active:cursor-grabbing
                focus-visible:ring-2 focus-visible:ring-primary
                transition-colors
                ${isDragging ? "opacity-50" : ""}
            `}
        >
            <Icon
                icon="lucide:grip-vertical"
                className="text-default-300 opacity-40 group-hover:opacity-100 transition-opacity"
                width={14}
            />
            <div className={blockIcon({ category: block.category })}>
                <Icon icon={block.icon} width={16} />
            </div>
            <span className="text-small font-medium text-foreground">
                {block.label}
            </span>
        </div>
    );
}
