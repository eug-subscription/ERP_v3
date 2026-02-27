import { useEffect, useState } from 'react';
import type { Key } from '@heroui/react';
import { Avatar, Button, ComboBox, Description, Input, Label, ListBox, Modal, toast } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { AssignedLead } from '../../types/order';
import { useTeam } from '../../hooks/useTeam';
import { useUpdateAssignedLead } from '../../hooks/useUpdateAssignedLead';
import { MODAL_WIDTH_MD, MODAL_BACKDROP, TEXT_MODAL_SECTION_LABEL, MODAL_ICON_DEFAULT } from '../../constants/ui-tokens';
import { getInitials } from '../../utils/format-name';
import { MemberRow } from './MemberRow';

interface AssignedLeadEditModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    assignedLead: AssignedLead | null | undefined;
}

export function AssignedLeadEditModal({
    isOpen,
    onOpenChange,
    assignedLead,
}: AssignedLeadEditModalProps) {
    const { teamMembers } = useTeam();
    const { mutate, isPending } = useUpdateAssignedLead();

    const [currentLeadDraft, setCurrentLeadDraft] = useState<AssignedLead | null>(assignedLead ?? null);
    const [selectedKey, setSelectedKey] = useState<Key | null>(null);

    // Re-initialise each time the modal opens
    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentLeadDraft(assignedLead ?? null);
            setSelectedKey(null);
        }
    }, [isOpen, assignedLead]);

    // Exclude the currently drafted lead from the picker so they can't be double-assigned
    const availableMembers = teamMembers.filter(
        (m) => m.user.name !== currentLeadDraft?.name
    );

    function handleAssign() {
        if (!selectedKey) return;
        const member = teamMembers.find((m) => m.id === String(selectedKey));
        if (!member) return;
        setCurrentLeadDraft({ name: member.user.name, role: member.role });
        setSelectedKey(null);
    }

    function handleSave() {
        mutate(currentLeadDraft, {
            onSuccess: () => onOpenChange(false),
            onError: (error: Error) => {
                toast('Update Failed', {
                    variant: 'danger',
                    description: error.message || 'Could not update assigned lead.',
                });
            },
        });
    }

    const isUnchanged =
        (currentLeadDraft == null && assignedLead == null) ||
        currentLeadDraft?.name === assignedLead?.name;

    return (
        <Modal.Backdrop className={MODAL_BACKDROP} isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className={MODAL_WIDTH_MD}>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Icon className={MODAL_ICON_DEFAULT}>
                            <Icon icon="lucide:user-check" className="size-5" />
                        </Modal.Icon>
                        <Modal.Heading>Edit Assigned Lead</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="flex flex-col gap-4 px-6 pb-2">
                        {/* Current assigned lead card */}
                        {currentLeadDraft && (
                            <MemberRow
                                name={currentLeadDraft.name}
                                role={currentLeadDraft.role}
                                variant="modal"
                                onRemove={() => setCurrentLeadDraft(null)}
                                removeLabel="Remove assigned lead"
                            />
                        )}

                        {/* Assign / replace lead — ComboBox + Assign button */}
                        <div className="flex gap-2 items-end">
                            <ComboBox
                                selectedKey={selectedKey}
                                onSelectionChange={setSelectedKey}
                                className="flex-1"
                            >
                                <Label className={TEXT_MODAL_SECTION_LABEL}>
                                    {currentLeadDraft ? 'Replace lead' : 'Assign lead'}
                                </Label>
                                <ComboBox.InputGroup>
                                    <Input placeholder="Search by name or role…" />
                                    <ComboBox.Trigger />
                                </ComboBox.InputGroup>
                                <ComboBox.Popover>
                                    <ListBox>
                                        {availableMembers.map((member) => (
                                            <ListBox.Item
                                                key={member.id}
                                                id={member.id}
                                                textValue={`${member.user.name} ${member.role}`}
                                            >
                                                <Avatar size="sm" color="accent" className="shrink-0">
                                                    <Avatar.Fallback>{getInitials(member.user.name)}</Avatar.Fallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <Label>{member.user.name}</Label>
                                                    <Description>{member.role}</Description>
                                                </div>
                                                <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                        ))}
                                    </ListBox>
                                </ComboBox.Popover>
                            </ComboBox>
                            <Button
                                variant="secondary"
                                size="md"
                                isDisabled={!selectedKey}
                                onPress={handleAssign}
                                className="shrink-0"
                            >
                                <Icon icon="lucide:user-check" className="size-4" />
                                Assign
                            </Button>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button slot="close" variant="ghost">
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onPress={handleSave}
                            isPending={isPending}
                            isDisabled={isUnchanged}
                        >
                            Save changes
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
