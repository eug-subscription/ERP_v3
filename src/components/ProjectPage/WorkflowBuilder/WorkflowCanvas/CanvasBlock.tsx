import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@heroui/react";
import type { CanvasBlock as CanvasBlockType } from "../../../../types/workflow";
import { CanvasBlockCard } from "./CanvasBlockCard";
import { ANIMATION_DURATION_MS, PLACEHOLDER_PREFIX } from "../constants";

interface CanvasBlockProps {
    block: CanvasBlockType;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
}

export function CanvasBlock({ block, isSelected, onSelect }: CanvasBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const isPlaceholder = block.id.startsWith(PLACEHOLDER_PREFIX);

    const style = {
        transform: CSS.Translate.toString(transform),
        transition: transition || `transform ${ANIMATION_DURATION_MS}ms ease`,
        opacity: isDragging ? 0.3 : (isPlaceholder ? 0.5 : 1),
        filter: isPlaceholder ? 'grayscale(100%)' : undefined,
        zIndex: isDragging ? 999 : 1,
    };

    return (
        <Button
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="w-auto h-auto p-0 border-none bg-transparent hover:bg-transparent data-[hover=true]:bg-transparent touch-none overflow-visible"
            onPress={() => onSelect?.(block.id)}
        >
            {/* HeroUI Button provides keyboard accessibility for dnd-kit interactions */}
            <CanvasBlockCard block={block} isSelected={isSelected} />
        </Button>
    );
}
