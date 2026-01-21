import { Select, ListBox, Header, Label, Description, Skeleton } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useWorkflowTemplates } from '../../../hooks/useWorkflowTemplates';
import { WorkflowTemplate, TemplateCategory } from '../../../types/workflow';

interface TemplateSelectorProps {
    selectedId?: string;
    onSelect: (template: WorkflowTemplate) => void;
    className?: string;
}

/**
 * TemplateSelector Component
 * Categorized dropdown for selecting workflow templates.
 * 
 * ULTRATHINK:
 * - Implements semantic grouping using ListBox.Section.
 * - Provides rich visual feedback with icons and descriptions.
 * - Fully accessible via React Aria integration in HeroUI v3.
 */
export function TemplateSelector({ selectedId, onSelect, className }: TemplateSelectorProps) {
    const { data: templates, isLoading } = useWorkflowTemplates();

    const groupedTemplates = templates?.reduce((acc, template) => {
        if (!acc[template.category]) {
            acc[template.category] = [];
        }
        acc[template.category].push(template);
        return acc;
    }, {} as Record<TemplateCategory, WorkflowTemplate[]>);

    const getCategoryIcon = (category: TemplateCategory) => {
        switch (category) {
            case 'PRODUCTION':
                return 'lucide:camera';
            case 'AI_POWERED':
                return 'lucide:bot';
            case 'HYBRID':
                return 'lucide:layers';
            default:
                return 'lucide:workflow';
        }
    };

    const getCategoryLabel = (category: TemplateCategory) => {
        switch (category) {
            case 'PRODUCTION':
                return 'Production';
            case 'AI_POWERED':
                return 'AI-Powered';
            case 'HYBRID':
                return 'Hybrid';
            default:
                return category;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>
        );
    }

    return (
        <Select
            className={className}
            placeholder="Choose a template..."
            id="template-selector"
            value={selectedId}
            onChange={(id) => {
                const template = templates?.find((t) => t.id === id);
                if (template) onSelect(template);
            }}
        >
            <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Base Template
            </Label>
            <Select.Trigger className="h-12 rounded-xl border-separator/50 bg-background/50 backdrop-blur-sm px-4">
                <Select.Value />
                <Select.Indicator>
                    <Icon icon="lucide:chevron-down" className="w-4 h-4 text-muted-foreground" />
                </Select.Indicator>
            </Select.Trigger>
            <Select.Popover className="w-[var(--trigger-width)]">
                <ListBox className="p-2">
                    {groupedTemplates &&
                        Object.entries(groupedTemplates).map(([category, items]) => (
                            <ListBox.Section key={category} className="mb-2 last:mb-0">
                                <Header className="px-3 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/70 bg-secondary/20 rounded-lg mb-1">
                                    <Icon icon={getCategoryIcon(category as TemplateCategory)} className="w-3.5 h-3.5" />
                                    {getCategoryLabel(category as TemplateCategory)}
                                </Header>
                                {items.map((template) => (
                                    <ListBox.Item
                                        key={template.id}
                                        id={template.id}
                                        textValue={template.name}
                                        className="rounded-lg py-2.5 px-3 data-[hover=true]:bg-accent/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-md bg-accent/5 text-accent">
                                                <Icon
                                                    icon={template.category === 'PRODUCTION' ? 'lucide:image' : 'lucide:sparkles'}
                                                    className="w-4 h-4"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <Label className="font-semibold cursor-pointer">{template.name}</Label>
                                                {template.description && (
                                                    <Description className="text-xs text-muted-foreground line-clamp-1">
                                                        {template.description}
                                                    </Description>
                                                )}
                                            </div>
                                        </div>
                                        <ListBox.ItemIndicator>
                                            {({ isSelected }) => (
                                                isSelected ? <Icon icon="lucide:check" className="w-4 h-4 text-accent" /> : null
                                            )}
                                        </ListBox.ItemIndicator>
                                    </ListBox.Item>
                                ))}
                            </ListBox.Section>
                        ))}
                </ListBox>
            </Select.Popover>
        </Select>
    );
}
