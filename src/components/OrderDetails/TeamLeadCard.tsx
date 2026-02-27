import { useState } from 'react';
import { Card, Skeleton, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { AssignedLead } from '../../types/order';
import { TEXT_SECTION_LABEL, ICON_SIZE_CONTAINER, GHOST_EDIT_BUTTON } from '../../constants/ui-tokens';
import { AssignedLeadEditModal } from './AssignedLeadEditModal';
import { MemberRow } from './MemberRow';

interface TeamLeadCardProps {
    isLoading: boolean;
    assignedLead: AssignedLead | null | undefined;
}

export function TeamLeadCard({ isLoading, assignedLead }: TeamLeadCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    if (isLoading) {
        return (
            <Card className="h-full">
                <Card.Content className="p-5 flex flex-col gap-4">
                    <Skeleton className="h-5 w-32 rounded-lg" />
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-full shrink-0" />
                        <div className="flex flex-col gap-1.5 flex-1">
                            <Skeleton className="h-4 w-32 rounded-lg" />
                            <Skeleton className="h-3 w-24 rounded-lg" />
                        </div>
                    </div>
                </Card.Content>
            </Card>
        );
    }

    return (
        <>
            <Card className="group h-full">
                <Card.Content className="p-5 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Icon icon="lucide:user-check" className={ICON_SIZE_CONTAINER} />
                            <h3 className={TEXT_SECTION_LABEL}>Assigned Lead</h3>
                        </div>
                        <Button size="sm" variant="ghost" isIconOnly aria-label="Edit assigned lead" className={GHOST_EDIT_BUTTON} onPress={() => setIsEditOpen(true)}>
                            <Icon icon="lucide:pencil" className="size-3.5" />
                        </Button>
                    </div>

                    {assignedLead ? (
                        <MemberRow
                            name={assignedLead.name}
                            role={assignedLead.role}
                            variant="card"
                        />
                    ) : (
                        <div className="flex items-center gap-3 py-1 text-default-400">
                            <div className="size-10 rounded-full bg-default/40 border border-default flex items-center justify-center shrink-0">
                                <Icon icon="lucide:user" className="size-4" />
                            </div>
                            <p className="text-sm font-medium">Unassigned</p>
                        </div>
                    )}
                </Card.Content>
            </Card>

            <AssignedLeadEditModal
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                assignedLead={assignedLead}
            />
        </>
    );
}
