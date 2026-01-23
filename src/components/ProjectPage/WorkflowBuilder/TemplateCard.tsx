import { Card, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { UserWorkflowTemplate } from "../../../types/workflow";

interface TemplateCardProps {
    template: UserWorkflowTemplate;
    onApply: (template: UserWorkflowTemplate) => void;
    onDelete?: (template: UserWorkflowTemplate) => void;
    isDeleting?: boolean;
}


/**
 * Reusable card component for displaying a workflow template.
 */
export function TemplateCard({
    template,
    onApply,
    onDelete,
    isDeleting = false
}: TemplateCardProps) {
    const isUserTemplate = template.source === "USER";

    return (
        <Card
            className="group relative p-4 border border-default-200 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all focus-within:ring-2 focus-within:ring-primary-500 outline-none"
        >
            <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-default-900 truncate pr-6">{template.name}</h4>
                    <Chip
                        size="sm"
                        variant="soft"
                        color={
                            template.category === 'PRODUCTION' ? 'accent' :
                                template.category === 'AI_POWERED' ? 'default' : 'warning'
                        }
                        className="text-tiny font-bold uppercase tracking-wider h-5 px-2"
                    >
                        {template.category.replace("_", " ")}
                    </Chip>
                </div>

                <p className="text-xs text-default-500 line-clamp-2 mb-4 flex-1">
                    {template.description}
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3">
                        <span className="text-tiny text-default-400 flex items-center gap-1">
                            <Icon icon="lucide:layers" className="w-3.5 h-3.5" />
                            {template.enabledBlocks.length} blocks
                        </span>
                        {isUserTemplate && (
                            <span className="text-tiny text-default-400 flex items-center gap-1">
                                <Icon icon="lucide:calendar" className="w-3.5 h-3.5" />
                                {new Date(template.createdAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {isUserTemplate && onDelete && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="px-2 text-danger hover:bg-danger-50 dark:hover:bg-danger-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                onPress={() => onDelete(template)}
                                isPending={isDeleting}
                                aria-label="Delete template"
                            >
                                <Icon icon="lucide:trash-2" className="w-4 h-4" />
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            className="bg-primary-100/50 hover:bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            onPress={() => onApply(template)}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
