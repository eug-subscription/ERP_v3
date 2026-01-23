import { Accordion } from "@heroui/react";
import { Icon } from "@iconify/react";
import { CategoryMeta, BlockLibraryItem } from "../../../../data/block-ui-categories";
import { DraggableBlock } from "./DraggableBlock";

export interface CategoryAccordionProps {
    category: CategoryMeta;
    blocks: BlockLibraryItem[];
}

export function CategoryAccordion({ category, blocks }: CategoryAccordionProps) {
    return (
        <Accordion.Item
            key={category.id}
            id={category.id}
            aria-label={category.label}
            className="border-l-4 bg-background px-0"
            style={{ borderLeftColor: category.color }}
        >
            <Accordion.Heading>
                <Accordion.Trigger className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Icon
                            icon={category.icon}
                            width={20}
                            className="text-default-500"
                            style={{ color: category.color }}
                        />
                        <div className="flex flex-col text-left">
                            <span className="text-small font-medium text-foreground">
                                {category.label}
                            </span>
                            <span className="text-tiny leading-tight text-default-400">
                                {category.description}
                            </span>
                        </div>
                    </div>
                    <Accordion.Indicator className="text-default-300" />
                </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
                <Accordion.Body className="px-2 pb-2 pt-0">
                    <div className="flex flex-col gap-1" role="listbox">
                        {blocks.length > 0 ? (
                            blocks.map((block) => (
                                <DraggableBlock
                                    key={block.type}
                                    block={block}
                                />
                            ))
                        ) : (
                            <span className="px-2 text-tiny text-default-400">
                                No blocks available
                            </span>
                        )}
                    </div>
                </Accordion.Body>
            </Accordion.Panel>
        </Accordion.Item>
    );
}
