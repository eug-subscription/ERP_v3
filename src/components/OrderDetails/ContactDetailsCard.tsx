import { useState } from 'react';
import { Card, Skeleton, Button, Separator } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { ContactPayload } from '../../types/order';
import {
    TEXT_SECTION_LABEL,
    ICON_SIZE_CONTAINER,
    GHOST_EDIT_BUTTON,
} from '../../constants/ui-tokens';
import { ContactEditModal } from './ContactEditModal';

interface ContactRowProps {
    icon: string;
    value: string | null | undefined;
}

function ContactRow({ icon, value }: ContactRowProps) {
    return (
        <div className="flex items-center gap-2.5 text-sm">
            <Icon icon={icon} className="size-3.5 text-default-400 shrink-0" />
            <span className={value ? 'text-default-700 font-medium leading-5' : 'text-default-400 leading-5'}>
                {value || '—'}
            </span>
        </div>
    );
}

interface ContactBlockProps {
    label: string;
    contact: ContactPayload | null;
    emptyMessage: string;
}

function ContactBlock({ label, contact, emptyMessage }: ContactBlockProps) {
    return (
        <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-default-500">{label}</p>
            {contact ? (
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-bold text-default-900">{contact.name || '—'}</p>
                    <ContactRow icon="lucide:mail" value={contact.email} />
                    <ContactRow icon="lucide:phone" value={contact.phone} />
                </div>
            ) : (
                <div className="flex items-center gap-2 text-sm text-default-400">
                    <Icon icon="lucide:user-plus" className="size-4 shrink-0" />
                    <span>{emptyMessage}</span>
                </div>
            )}
        </div>
    );
}

interface ContactDetailsCardProps {
    isLoading: boolean;
    contact: ContactPayload | null | undefined;
    secondaryContact: ContactPayload | null | undefined;
}

export function ContactDetailsCard({ isLoading, contact, secondaryContact }: ContactDetailsCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    if (isLoading) {
        return (
            <Card className="h-full">
                <Card.Content className="p-5 flex flex-col gap-4">
                    <Skeleton className="h-5 w-32 rounded-lg" />
                    {/* Primary block skeleton */}
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-16 rounded" />
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-3 w-48 rounded" />
                        <Skeleton className="h-3 w-40 rounded" />
                    </div>
                    {/* Secondary block skeleton */}
                    <Separator className="my-1" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-16 rounded" />
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-3 w-48 rounded" />
                        <Skeleton className="h-3 w-40 rounded" />
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
                            <h3 className={TEXT_SECTION_LABEL}>Contacts</h3>
                        </div>
                        <Button size="sm" variant="ghost" isIconOnly aria-label="Edit contacts" className={GHOST_EDIT_BUTTON} onPress={() => setIsEditOpen(true)}>
                            <Icon icon="lucide:pencil" className="size-3.5" />
                        </Button>
                    </div>

                    <ContactBlock
                        label="Primary"
                        contact={contact ?? null}
                        emptyMessage="No primary contact"
                    />
                    <Separator className="my-1" />
                    <ContactBlock
                        label="Secondary"
                        contact={secondaryContact ?? null}
                        emptyMessage="No secondary contact"
                    />
                </Card.Content>
            </Card>
            <ContactEditModal
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                contact={contact ?? null}
                secondaryContact={secondaryContact ?? null}
            />
        </>
    );
}
