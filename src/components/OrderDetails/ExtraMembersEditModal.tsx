import { useEffect, useState } from 'react';
import type { Key } from '@heroui/react';
import { Avatar, Button, ComboBox, Description, Input, Label, ListBox, Modal, toast } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { AssignedLead, ExtraMember } from '../../types/order';
import { useTeam } from '../../hooks/useTeam';
import { ROLE_LABEL_MAP } from '../../types/team';
import { useUpdateExtraMembers } from '../../hooks/useUpdateExtraMembers';
import { MODAL_WIDTH_MD, MODAL_BACKDROP, TEXT_MODAL_SECTION_LABEL, MODAL_ICON_DEFAULT } from '../../constants/ui-tokens';
import { getInitials } from '../../utils/format-name';
import { MemberRow } from './MemberRow';

interface ExtraMembersEditModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    extraMembers: ExtraMember[];
    assignedLead: AssignedLead | null | undefined;
}

export function ExtraMembersEditModal({
    isOpen,
    onOpenChange,
    extraMembers,
    assignedLead,
}: ExtraMembersEditModalProps) {
    const { teamMembers } = useTeam();
    const { mutate, isPending } = useUpdateExtraMembers();

    const [members, setMembers] = useState<ExtraMember[]>([]);
    const [selectedKey, setSelectedKey] = useState<Key | null>(null);

    // Re-initialise each time the modal opens
    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMembers(extraMembers);
            setSelectedKey(null);
        }
    }, [isOpen, extraMembers]);

    // Members already added (by name) + the assigned lead — excluded from ComboBox
    const excludedNames = new Set([
        ...members.map((m) => m.name),
        ...(assignedLead ? [assignedLead.name] : []),
    ]);

    const availableMembers = teamMembers.filter((m) => !excludedNames.has(m.name));

    function handleAdd() {
        if (!selectedKey) return;
        const member = teamMembers.find((m) => m.id === String(selectedKey));
        if (!member) return;
        setMembers((prev) => [
            ...prev,
            { id: crypto.randomUUID(), name: member.name, role: ROLE_LABEL_MAP[member.role] },
        ]);
        setSelectedKey(null);
    }

    function handleRemove(id: string) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
    }

    function handleSave() {
        mutate(members, {
            onSuccess: () => onOpenChange(false),
            onError: (error: Error) => {
                toast('Update Failed', {
                    variant: 'danger',
                    description: error.message || 'Could not update team members.',
                });
            },
        });
    }

    const isUnchanged =
        members.length === extraMembers.length &&
        members.every((m, i) => m.id === extraMembers[i]?.id);

    return (
        <Modal.Backdrop className={MODAL_BACKDROP} isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className={MODAL_WIDTH_MD}>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Icon className={MODAL_ICON_DEFAULT}>
                            <Icon icon="lucide:users" className="size-5" />
                        </Modal.Icon>
                        <Modal.Heading>Extra Team Members</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="flex flex-col gap-4 px-6 pb-2">
                        {/* Current members list */}
                        {members.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {members.map((member) => (
                                    <MemberRow
                                        key={member.id}
                                        name={member.name}
                                        role={member.role}
                                        variant="modal"
                                        onRemove={() => handleRemove(member.id)}
                                        removeLabel={`Remove ${member.name}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Add member — ComboBox + Add button */}
                        <div className="flex gap-2 items-end">
                            <ComboBox
                                selectedKey={selectedKey}
                                onSelectionChange={setSelectedKey}
                                className="flex-1"
                            >
                                <Label className={TEXT_MODAL_SECTION_LABEL}>Add team member</Label>
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
                                                textValue={`${member.name} ${ROLE_LABEL_MAP[member.role]}`}
                                            >
                                                <Avatar size="sm" color="accent" className="shrink-0">
                                                    <Avatar.Fallback>{getInitials(member.name)}</Avatar.Fallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <Label>{member.name}</Label>
                                                    <Description>{ROLE_LABEL_MAP[member.role]}</Description>
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
                                onPress={handleAdd}
                                className="shrink-0"
                            >
                                <Icon icon="lucide:plus" className="size-4" />
                                Add
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
