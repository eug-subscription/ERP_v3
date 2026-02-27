import { useState } from 'react';
import { Card, Skeleton, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { AssignedLead, ExtraMember } from '../../types/order';
import { TEXT_SECTION_LABEL, ICON_SIZE_CONTAINER, GHOST_EDIT_BUTTON } from '../../constants/ui-tokens';
import { ExtraMembersEditModal } from './ExtraMembersEditModal';
import { MemberRow } from './MemberRow';

interface ExtraMembersCardProps {
    isLoading: boolean;
    extraMembers: ExtraMember[];
    assignedLead: AssignedLead | null | undefined;
}

export function ExtraMembersCard({ isLoading, extraMembers, assignedLead }: ExtraMembersCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);

    if (isLoading) {
        return (
            <Card className="h-full">
                <Card.Content className="p-5 flex flex-col gap-4">
                    <Skeleton className="h-5 w-36 rounded-lg" />
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-8 rounded-full shrink-0" />
                            <div className="flex flex-col gap-1.5 flex-1">
                                <Skeleton className="h-4 w-32 rounded-lg" />
                                <Skeleton className="h-3 w-20 rounded-lg" />
                            </div>
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
                            <Icon icon="lucide:users" className={ICON_SIZE_CONTAINER} />
                            <h3 className={TEXT_SECTION_LABEL}>Extra Members</h3>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            isIconOnly
                            aria-label="Edit extra members"
                            className={GHOST_EDIT_BUTTON}
                            onPress={() => setIsEditOpen(true)}
                        >
                            <Icon icon="lucide:pencil" className="size-3.5" />
                        </Button>
                    </div>

                    {/* Members list or empty state */}
                    {extraMembers.length > 0 ? (
                        <div className="flex flex-col gap-1">
                            {extraMembers.map((member) => (
                                <MemberRow
                                    key={member.id}
                                    name={member.name}
                                    role={member.role}
                                    variant="card"
                                />
                            ))}
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 py-1 text-default-400 hover:text-accent hover:bg-transparent w-fit px-0 h-auto"
                            onPress={() => setIsEditOpen(true)}
                        >
                            <div className="size-10 rounded-full bg-default/40 border border-default border-dashed flex items-center justify-center shrink-0">
                                <Icon icon="lucide:user-plus" className="size-4" />
                            </div>
                            <p className="text-sm font-medium">Add team member</p>
                        </Button>
                    )}
                </Card.Content>
            </Card>

            <ExtraMembersEditModal
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                extraMembers={extraMembers}
                assignedLead={assignedLead}
            />
        </>
    );
}
