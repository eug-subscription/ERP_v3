import { Card, Button, Chip, Tooltip, ScrollShadow } from "@heroui/react";
import { TOOLTIP_DELAY, MATCHED_ROW_STAGGER_MS } from "../../constants/ui-tokens";
import { Icon } from "@iconify/react";
import { Item } from "../../types/matching";

interface MatchedItemsSectionProps {
    matchedItems: Item[];
    matchedPhotos: { [itemId: string]: string };
    onUnmatch: (itemId: string) => void;
}

/**
 * Displays the list of successfully matched items
 */
export function MatchedItemsSection({
    matchedItems,
    matchedPhotos,
    onUnmatch,
}: MatchedItemsSectionProps) {
    if (matchedItems.length === 0) {
        return null;
    }

    return (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            <Card className="overflow-hidden">
                <Card.Header className="px-4 py-4 border-b border-default-200 bg-default-50 flex-row justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-sm font-black text-default-900">Matched Items</h3>
                            <Chip color="success" variant="soft">
                                {matchedItems.length} items
                            </Chip>
                        </div>
                        <p className="text-xs text-default-400 font-medium">Successfully matched items and photos.</p>
                    </div>
                    <Icon icon="lucide:check-circle-2" className="w-5 h-5 text-success" />
                </Card.Header>
                <Card.Content className="p-0">
                    <ScrollShadow className="max-h-[400px]" hideScrollBar>
                        <div className="divide-y divide-default-100">
                            {matchedItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-4 py-3 px-4 hover:bg-default-50/50 transition-colors animate-in fade-in duration-300"
                                    style={{ animationDelay: `${index * MATCHED_ROW_STAGGER_MS}ms` }}
                                >
                                    <div className="w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden shadow-sm mt-0.5">
                                        <img
                                            src={matchedPhotos[item.id]}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-default-900 truncate text-sm">
                                            {item.name}
                                        </h4>
                                        <p className="text-xs text-default-500 truncate mt-0.5">{item.description}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 text-success" />
                                            <span className="text-xs font-medium text-success">Photo matched</span>
                                        </div>
                                    </div>
                                    <Tooltip delay={TOOLTIP_DELAY}>
                                        <Tooltip.Trigger>
                                            <Button
                                                isIconOnly
                                                variant="ghost"
                                                className="rounded-full hover:bg-danger/10 hover:text-danger hover:border-danger/20"
                                                onPress={() => onUnmatch(item.id)}
                                            >
                                                <Icon icon="lucide:link-2-off" className="w-4 h-4" />
                                            </Button>
                                        </Tooltip.Trigger>
                                        <Tooltip.Content>Unmatch</Tooltip.Content>
                                    </Tooltip>
                                </div>
                            ))}
                        </div>
                    </ScrollShadow>
                </Card.Content>
            </Card>
        </div>
    );
}
