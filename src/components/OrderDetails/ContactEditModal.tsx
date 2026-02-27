import { useEffect, useState } from 'react';
import { Button, FieldError, Input, Label, Modal, TextField, toast } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { ContactPayload } from '../../types/order';
import { useUpdateContacts } from '../../hooks/useUpdateContacts';
import { MODAL_WIDTH_MD, MODAL_BACKDROP, TEXT_MODAL_SECTION_LABEL, MODAL_ICON_DEFAULT } from '../../constants/ui-tokens';
import { EMAIL_REGEX } from '../../utils/validators';

const EMPTY_CONTACT: ContactPayload = { name: '', email: '', phone: '' };

interface ContactEditModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    contact: ContactPayload | null;
    secondaryContact: ContactPayload | null;
}

interface ContactFieldGroupProps {
    label: string;
    value: ContactPayload;
    onChange: (updated: ContactPayload) => void;
    className?: string;
    isNameInvalid?: boolean;
    isEmailInvalid?: boolean;
}

function ContactFieldGroup({ label, value, onChange, className, isNameInvalid, isEmailInvalid }: ContactFieldGroupProps) {
    return (
        <div className={`flex flex-col gap-3 ${className ?? ''}`}>
            <p className={TEXT_MODAL_SECTION_LABEL}>{label}</p>
            <TextField
                fullWidth
                isRequired
                isInvalid={isNameInvalid}
                name={`${label.toLowerCase()}-name`}
                onChange={(name) => onChange({ ...value, name })}
            >
                <Label>Name</Label>
                <Input value={value.name} placeholder="Full name" />
                <FieldError>Name is required</FieldError>
            </TextField>
            <TextField
                fullWidth
                isInvalid={isEmailInvalid}
                name={`${label.toLowerCase()}-email`}
                type="email"
                onChange={(email) => onChange({ ...value, email })}
            >
                <Label>Email</Label>
                <Input value={value.email} placeholder="email@example.com" />
                <FieldError>Enter a valid email address</FieldError>
            </TextField>
            <TextField
                fullWidth
                name={`${label.toLowerCase()}-phone`}
                type="tel"
                onChange={(phone) => onChange({ ...value, phone })}
            >
                <Label>Phone</Label>
                <Input value={value.phone} placeholder="+1 (555) 000-0000" />
            </TextField>
        </div>
    );
}

export function ContactEditModal({
    isOpen,
    onOpenChange,
    contact,
    secondaryContact,
}: ContactEditModalProps) {
    const { mutate, isPending } = useUpdateContacts();

    const [submitted, setSubmitted] = useState(false);

    const [primaryDraft, setPrimaryDraft] = useState<ContactPayload>(contact ?? EMPTY_CONTACT);
    const [secondaryDraft, setSecondaryDraft] = useState<ContactPayload>(
        secondaryContact ?? EMPTY_CONTACT
    );

    // Re-initialise drafts each time the modal opens
    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPrimaryDraft(contact ?? EMPTY_CONTACT);
            setSecondaryDraft(secondaryContact ?? EMPTY_CONTACT);
            setSubmitted(false);
        }
    }, [isOpen, contact, secondaryContact]);

    function handleSave() {
        setSubmitted(true);

        const isPrimaryNameEmpty = primaryDraft.name.trim() === '';
        const isPrimaryEmailBad = primaryDraft.email !== '' && !EMAIL_REGEX.test(primaryDraft.email);
        const isSecondaryEmailBad = secondaryDraft.email !== '' && !EMAIL_REGEX.test(secondaryDraft.email);

        if (isPrimaryNameEmpty || isPrimaryEmailBad || isSecondaryEmailBad) return;

        mutate(
            {
                contact: primaryDraft,
                secondaryContact:
                    secondaryDraft.name || secondaryDraft.email || secondaryDraft.phone
                        ? secondaryDraft
                        : null,
            },
            {
                onSuccess: () => onOpenChange(false),
                onError: (error: Error) => {
                    toast('Update Failed', {
                        variant: 'danger',
                        description: error.message || 'Could not update contacts.',
                    });
                },
            }
        );
    }

    const isPrimaryNameInvalid = submitted && primaryDraft.name.trim() === '';
    const isPrimaryEmailInvalid = submitted && primaryDraft.email !== '' && !EMAIL_REGEX.test(primaryDraft.email);
    const isSecondaryEmailInvalid = submitted && secondaryDraft.email !== '' && !EMAIL_REGEX.test(secondaryDraft.email);

    return (
        <Modal.Backdrop className={MODAL_BACKDROP} isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className={MODAL_WIDTH_MD}>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Icon className={MODAL_ICON_DEFAULT}>
                            <Icon icon="lucide:users" className="size-5" />
                        </Modal.Icon>
                        <Modal.Heading>Edit Contacts</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="flex flex-col gap-4 px-6 pb-2">
                        <ContactFieldGroup
                            label="Primary"
                            value={primaryDraft}
                            onChange={setPrimaryDraft}
                            isNameInvalid={isPrimaryNameInvalid}
                            isEmailInvalid={isPrimaryEmailInvalid}
                        />
                        <ContactFieldGroup
                            label="Secondary"
                            value={secondaryDraft}
                            onChange={setSecondaryDraft}
                            isEmailInvalid={isSecondaryEmailInvalid}
                            className="border-t border-default pt-4"
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button slot="close" variant="ghost">
                            Cancel
                        </Button>
                        <Button variant="primary" onPress={handleSave} isPending={isPending}>
                            Save changes
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
