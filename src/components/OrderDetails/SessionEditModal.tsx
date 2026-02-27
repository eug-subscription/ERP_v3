import { useEffect, useState } from 'react';
import {
    Button,
    Calendar,
    ComboBox,
    DateField,
    DatePicker,
    FieldError,
    Input,
    Label,
    ListBox,
    Modal,
    TextField,
    TimeField,
    toast,
} from '@heroui/react';
import type { TimeValue } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { DateValue, CalendarDateTime } from '@internationalized/date';
import { parseDateTime } from '@internationalized/date';
import type { AddressPayload } from '../../types/order';
import { useUpdateSession } from '../../hooks/useUpdateSession';
import { MODAL_WIDTH_MD, MODAL_BACKDROP, TEXT_MODAL_SECTION_LABEL, MODAL_ICON_DEFAULT } from '../../constants/ui-tokens';
import { countries } from '../../constants/countries';

const EMPTY_ADDRESS: AddressPayload = {
    line1: '',
    line2: '',
    city: '',
    country: '',
    postcode: '',
};

interface SessionEditModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    sessionTime: CalendarDateTime | null | undefined;
    address: AddressPayload | null | undefined;
}

export function SessionEditModal({
    isOpen,
    onOpenChange,
    sessionTime,
    address,
}: SessionEditModalProps) {
    const { mutate, isPending } = useUpdateSession();

    const [submitted, setSubmitted] = useState(false);

    const [dateDraft, setDateDraft] = useState<DateValue | null>(sessionTime ?? null);
    const [addressDraft, setAddressDraft] = useState<AddressPayload>(address ?? EMPTY_ADDRESS);

    // Re-initialise drafts each time the modal opens
    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDateDraft(sessionTime ?? null);
            setAddressDraft(address ?? EMPTY_ADDRESS);
            setSubmitted(false);
        }
    }, [isOpen, sessionTime, address]);

    function handleSave() {
        setSubmitted(true);

        const isLine1Empty = addressDraft.line1.trim() === '';
        const isCityEmpty = addressDraft.city.trim() === '';
        const isPostcodeEmpty = addressDraft.postcode.trim() === '';
        const isCountryEmpty = !addressDraft.country;

        if (isLine1Empty || isCityEmpty || isPostcodeEmpty || isCountryEmpty) return;

        // Convert DateValue back to CalendarDateTime for storage
        const newSessionTime: CalendarDateTime | null = dateDraft
            ? (parseDateTime(dateDraft.toString()) as CalendarDateTime)
            : null;

        mutate(
            { sessionTime: newSessionTime, address: addressDraft },
            {
                onSuccess: () => onOpenChange(false),
                onError: (error: Error) => {
                    toast('Update Failed', {
                        variant: 'danger',
                        description: error.message || 'Could not update session details.',
                    });
                },
            }
        );
    }

    function setAddressField<K extends keyof AddressPayload>(key: K, value: AddressPayload[K]) {
        setAddressDraft((prev: AddressPayload) => ({ ...prev, [key]: value }));
    }

    const isLine1Invalid = submitted && addressDraft.line1.trim() === '';
    const isCityInvalid = submitted && addressDraft.city.trim() === '';
    const isPostcodeInvalid = submitted && addressDraft.postcode.trim() === '';
    const isCountryInvalid = submitted && !addressDraft.country;

    return (
        <Modal.Backdrop className={MODAL_BACKDROP} isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className={MODAL_WIDTH_MD}>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Icon className={MODAL_ICON_DEFAULT}>
                            <Icon icon="lucide:map-pin" className="size-5" />
                        </Modal.Icon>
                        <Modal.Heading>Edit Session Details</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="flex flex-col gap-4 px-6 pb-2">
                        {/* Date & Time */}
                        <div className="flex flex-col gap-3">
                            <p className={TEXT_MODAL_SECTION_LABEL}>Date &amp; Time</p>
                            <DatePicker
                                name="session-date"
                                granularity="minute"
                                value={dateDraft}
                                onChange={setDateDraft}
                            >
                                {({ state }) => (
                                    <>
                                        <Label>Session date &amp; time</Label>
                                        <DateField.Group fullWidth>
                                            <DateField.Input>
                                                {(segment) => <DateField.Segment segment={segment} />}
                                            </DateField.Input>
                                            <DateField.Suffix>
                                                <DatePicker.Trigger>
                                                    <DatePicker.TriggerIndicator />
                                                </DatePicker.Trigger>
                                            </DateField.Suffix>
                                        </DateField.Group>
                                        <DatePicker.Popover className="flex flex-col gap-3">
                                            <Calendar aria-label="Session date">
                                                <Calendar.Header>
                                                    <Calendar.YearPickerTrigger>
                                                        <Calendar.YearPickerTriggerHeading />
                                                        <Calendar.YearPickerTriggerIndicator />
                                                    </Calendar.YearPickerTrigger>
                                                    <Calendar.NavButton slot="previous" />
                                                    <Calendar.NavButton slot="next" />
                                                </Calendar.Header>
                                                <Calendar.Grid>
                                                    <Calendar.GridHeader>
                                                        {(day) => (
                                                            <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                                                        )}
                                                    </Calendar.GridHeader>
                                                    <Calendar.GridBody>
                                                        {(date) => <Calendar.Cell date={date} />}
                                                    </Calendar.GridBody>
                                                </Calendar.Grid>
                                                <Calendar.YearPickerGrid>
                                                    <Calendar.YearPickerGridBody>
                                                        {({ year }) => (
                                                            <Calendar.YearPickerCell year={year} />
                                                        )}
                                                    </Calendar.YearPickerGridBody>
                                                </Calendar.YearPickerGrid>
                                            </Calendar>
                                            <div className="flex items-center justify-between border-t border-default pt-3">
                                                <Label className="text-sm">Time</Label>
                                                <TimeField
                                                    aria-label="Session time"
                                                    granularity="minute"
                                                    hourCycle={24}
                                                    name="session-time"
                                                    value={state.timeValue}
                                                    onChange={(v) => state.setTimeValue(v as TimeValue)}
                                                >
                                                    <TimeField.Group variant="secondary">
                                                        <TimeField.Input>
                                                            {(segment) => (
                                                                <TimeField.Segment segment={segment} />
                                                            )}
                                                        </TimeField.Input>
                                                    </TimeField.Group>
                                                </TimeField>
                                            </div>
                                        </DatePicker.Popover>
                                    </>
                                )}
                            </DatePicker>
                        </div>

                        {/* Location */}
                        <div className="flex flex-col gap-3 border-t border-default pt-4">
                            <p className={TEXT_MODAL_SECTION_LABEL}>Location</p>
                            <TextField
                                fullWidth
                                isRequired
                                isInvalid={isLine1Invalid}
                                name="address-line1"
                                onChange={(v) => setAddressField('line1', v)}
                            >
                                <Label>Address line 1</Label>
                                <Input value={addressDraft.line1} placeholder="Street address" />
                                <FieldError>Address line 1 is required</FieldError>
                            </TextField>
                            <TextField
                                fullWidth
                                name="address-line2"
                                onChange={(v) => setAddressField('line2', v)}
                            >
                                <Label>Address line 2</Label>
                                <Input value={addressDraft.line2} placeholder="Apartment, suite, etc." />
                            </TextField>
                            <div className="grid grid-cols-2 gap-3">
                                <TextField
                                    fullWidth
                                    isRequired
                                    isInvalid={isCityInvalid}
                                    name="address-city"
                                    onChange={(v) => setAddressField('city', v)}
                                >
                                    <Label>City</Label>
                                    <Input value={addressDraft.city} placeholder="City" />
                                    <FieldError>Required</FieldError>
                                </TextField>
                                <TextField
                                    fullWidth
                                    isRequired
                                    isInvalid={isPostcodeInvalid}
                                    name="address-postcode"
                                    onChange={(v) => setAddressField('postcode', v)}
                                >
                                    <Label>Postcode</Label>
                                    <Input value={addressDraft.postcode} placeholder="Postcode" />
                                    <FieldError>Required</FieldError>
                                </TextField>
                            </div>
                            <ComboBox
                                isRequired
                                isInvalid={isCountryInvalid}
                                selectedKey={addressDraft.country}
                                onSelectionChange={(key) => setAddressField('country', key as string)}
                                name="address-country"
                            >
                                <Label>Country</Label>
                                <ComboBox.InputGroup>
                                    <Input placeholder="Search countries…" />
                                    <ComboBox.Trigger />
                                </ComboBox.InputGroup>
                                <ComboBox.Popover>
                                    <ListBox>
                                        {countries.map((c) => (
                                            <ListBox.Item key={c.code} id={c.code} textValue={c.name}>
                                                {c.name}
                                                <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                        ))}
                                    </ListBox>
                                </ComboBox.Popover>
                                <FieldError>Country is required</FieldError>
                            </ComboBox>
                        </div>
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
