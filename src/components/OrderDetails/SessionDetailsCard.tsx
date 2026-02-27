import { useState } from 'react';
import { Card, Skeleton, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { AddressPayload } from '../../types/order';
import type { CalendarDateTime } from '@internationalized/date';
import { formatCalendarDate, formatCalendarTime } from '../../utils/format-time';
import { formatAddress } from '../../utils/format-address';
import { TEXT_SECTION_LABEL, ICON_SIZE_CONTAINER, GHOST_EDIT_BUTTON } from '../../constants/ui-tokens';
import { SessionEditModal } from './SessionEditModal';

interface SessionDetailsCardProps {
    isLoading: boolean;
    address: AddressPayload | null | undefined;
    sessionTime: CalendarDateTime | null | undefined;
    orderDate: CalendarDateTime | null | undefined;
    totalSessionHours: number;
}

export function SessionDetailsCard({ isLoading, address, sessionTime, orderDate, totalSessionHours }: SessionDetailsCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const displayDate = sessionTime ?? orderDate;

    if (isLoading) {
        return (
            <Card className="h-full">
                <Card.Content className="p-5 flex flex-col gap-4">
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                    <Skeleton className="h-5 w-48 rounded-lg" />
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
                            <Icon icon="lucide:map-pin" className={ICON_SIZE_CONTAINER} />
                            <h3 className={TEXT_SECTION_LABEL}>Session Details</h3>
                        </div>
                        <Button size="sm" variant="ghost" isIconOnly aria-label="Edit session details" className={GHOST_EDIT_BUTTON} onPress={() => setIsEditOpen(true)}>
                            <Icon icon="lucide:pencil" className="size-3.5" />
                        </Button>
                    </div>

                    {/* Address */}
                    <div>
                        {address ? (
                            <p className="text-sm font-medium text-default-700">
                                {formatAddress(address)}
                            </p>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-default-400">
                                <Icon icon="lucide:map-pin-off" className="size-4 shrink-0" />
                                <span>No address set</span>
                            </div>
                        )}
                    </div>

                    {/* Session date */}
                    <div className="flex items-center gap-2 text-sm font-medium text-default-700">
                        <Icon icon="lucide:calendar" className="size-4 shrink-0" />
                        {displayDate ? (
                            <span>
                                {formatCalendarDate(displayDate)} · {formatCalendarTime(displayDate)}
                            </span>
                        ) : (
                            <span>—</span>
                        )}
                    </div>

                    {/* Session hours */}
                    <div className="flex items-center gap-2 text-sm font-medium text-default-700">
                        <Icon icon="lucide:clock" className="size-4 shrink-0" />
                        <span>
                            {totalSessionHours > 0
                                ? `${totalSessionHours} session hours`
                                : 'No session hours'}
                        </span>
                    </div>
                </Card.Content>
            </Card>
            {/*
              * orderDate is intentionally not passed to SessionEditModal.
              * The card shows `sessionTime ?? orderDate` for display only, but the
              * modal should start with an empty date so the user explicitly picks a
              * session time — preventing accidental overwrite with orderDate.
              */}
            <SessionEditModal
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                sessionTime={sessionTime}
                address={address}
            />
        </>
    );
}
