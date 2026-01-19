import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import { ProjectInfo } from "../../data/mock-project";

interface ProjectInfoCardProps {
    /** Project meta information */
    info: ProjectInfo;
}

/**
 * ProjectInfoCard component for displaying project metadata in the sidebar.
 * Aligned with HeroUI v3 standards and legacy design requirements.
 */
export function ProjectInfoCard({ info }: ProjectInfoCardProps) {
    return (
        <Card className="p-0 border border-default-200 shadow-none">
            <Card.Content className="p-6">
                <h3 className="text-lg font-semibold mb-4">Project info</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Icon icon="lucide:calendar" className="text-default-400" />
                        <span className="text-sm text-default-500">
                            Created on {info.createdOn}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Icon icon="lucide:user" className="text-default-400" />
                        <span className="text-sm text-default-500">
                            Created by {info.createdBy}
                        </span>
                    </div>
                </div>
            </Card.Content>
        </Card>
    );
}
