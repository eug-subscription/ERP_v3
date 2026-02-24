import { Button, Card } from '@heroui/react';
import { Link } from '@tanstack/react-router';
import { Icon } from '@iconify/react';
import { TEXT_SECTION_LABEL } from '../../constants/ui-tokens';

interface QuickActionsBarProps {
    onAddTeamMember: () => void;
    onAddShotListItem: () => void;
}

export function QuickActionsBar({ onAddTeamMember, onAddShotListItem }: QuickActionsBarProps) {
    return (
        <Card className="w-full">
            <Card.Content className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-1.5">
                    <Icon icon="lucide:zap" className="size-4 text-default-500" />
                    <h3 className={TEXT_SECTION_LABEL}>Quick Actions</h3>
                </div>
                <div className="flex flex-row flex-wrap items-center gap-2">
                    <Link to="/uploading">
                        <Button variant="secondary" size="sm">
                            <Icon icon="lucide:upload-cloud" className="size-4" />
                            Upload Photos
                        </Button>
                    </Link>

                    <Link to="/messages">
                        <Button variant="secondary" size="sm">
                            <Icon icon="lucide:message-square" className="size-4" />
                            Send Message
                        </Button>
                    </Link>

                    <Button
                        variant="secondary"
                        size="sm"
                        onPress={onAddTeamMember}
                    >
                        <Icon icon="lucide:user-plus" className="size-4" />
                        Add Team Member
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        onPress={onAddShotListItem}
                    >
                        <Icon icon="lucide:list-plus" className="size-4" />
                        Add Shot List Item
                    </Button>
                </div>
            </Card.Content>
        </Card>
    );
}

