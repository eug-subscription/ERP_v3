import { Card, Chip, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface TagsCardProps {
    /** List of project tags */
    tags: string[];
}

/**
 * TagsCard component for displaying project tags in the sidebar.
 * Aligned with HeroUI v3 standards and legacy design requirements.
 */
export function TagsCard({ tags }: TagsCardProps) {
    return (
        <Card className="p-0 border border-default-200 shadow-none">
            <Card.Content className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag, index) => (
                        <Chip
                            key={index}
                            variant="secondary"
                            className="bg-default-100 text-default-600 font-medium hover:bg-default-200 transition-colors"
                        >
                            {tag}
                        </Chip>
                    ))}
                </div>
                <Button
                    variant="tertiary"
                    size="sm"
                    className="font-medium text-default-600"
                >
                    <Icon icon="lucide:plus" className="text-lg" />
                    Add more
                </Button>
            </Card.Content>
        </Card>
    );
}
