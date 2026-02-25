import { useState } from "react";
import type { DateValue } from "@internationalized/date";
import type { TimeValue } from "@heroui/react";
import { getLocalTimeZone, today } from "@internationalized/date";
import {
    Button,
    Calendar,
    DateField,
    DatePicker,
    FieldError,
    Input,
    Label,
    Modal,
    Separator,
    TextField,
    TimeField,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { FLEX_COL_GAP_4, MODAL_WIDTH_MD, TEXT_SECTION_LABEL } from "../constants/ui-tokens";
import { CREATE_ORDER_DEFAULTS } from "../types/order";
import type { ContactPayload, AddressPayload } from "../types/order";
import { useCreateOrder } from "../hooks/useCreateOrder";

interface CreateOrderModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function CreateOrderModal({ isOpen, onOpenChange }: CreateOrderModalProps) {
    const [orderName, setOrderName] = useState(CREATE_ORDER_DEFAULTS.orderName);
    const [contact, setContact] = useState<ContactPayload>(CREATE_ORDER_DEFAULTS.contact);
    const [address, setAddress] = useState<AddressPayload>(CREATE_ORDER_DEFAULTS.address);
    const [sessionDate, setSessionDate] = useState<DateValue | null>(
        CREATE_ORDER_DEFAULTS.sessionDate,
    );
    const [sessionTime, setSessionTime] = useState<TimeValue | null>(
        CREATE_ORDER_DEFAULTS.sessionTime,
    );

    const { mutate, isPending } = useCreateOrder();

    const currentDate = today(getLocalTimeZone());
    const isPastDate = sessionDate != null && sessionDate.compare(currentDate) < 0;

    function resetFields() {
        setOrderName(CREATE_ORDER_DEFAULTS.orderName);
        setContact(CREATE_ORDER_DEFAULTS.contact);
        setAddress(CREATE_ORDER_DEFAULTS.address);
        setSessionDate(CREATE_ORDER_DEFAULTS.sessionDate);
        setSessionTime(CREATE_ORDER_DEFAULTS.sessionTime);
    }

    function handleOpenChange(open: boolean) {
        if (!open) {
            resetFields();
        }
        onOpenChange(open);
    }

    function handleSubmit() {
        mutate(
            { orderName, contact, address, sessionDate, sessionTime },
            { onSuccess: () => handleOpenChange(false) },
        );
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Modal.Backdrop variant="blur">
                <Modal.Container>
                    <Modal.Dialog className={MODAL_WIDTH_MD}>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
                                <Icon icon="lucide:clipboard-plus" className="size-5" />
                            </Modal.Icon>
                            <Modal.Heading>New Order</Modal.Heading>
                            <p className="text-sm text-muted">
                                Fill in the details below to create a new order.
                            </p>
                        </Modal.Header>

                        <Modal.Body className="p-6">
                            <div className={FLEX_COL_GAP_4}>
                                {/* Order Name */}
                                <TextField
                                    className="w-full"
                                    value={orderName}
                                    onChange={setOrderName}
                                    isRequired
                                    autoFocus
                                >
                                    <Label>Order Name</Label>
                                    <Input placeholder="e.g. Smith Wedding – June 2026" />
                                </TextField>

                                {/* Contact */}
                                <div className="flex flex-col gap-3">
                                    <Separator />
                                    <span className={TEXT_SECTION_LABEL}>Client Contact</span>
                                    <TextField
                                        className="w-full"
                                        value={contact.name}
                                        onChange={(val) =>
                                            setContact((prev) => ({ ...prev, name: val }))
                                        }
                                    >
                                        <Label>Name</Label>
                                        <Input placeholder="Full name" />
                                    </TextField>
                                    <div className="grid grid-cols-2 gap-3">
                                        <TextField
                                            className="w-full"
                                            type="email"
                                            value={contact.email}
                                            onChange={(val) =>
                                                setContact((prev) => ({ ...prev, email: val }))
                                            }
                                        >
                                            <Label>Email</Label>
                                            <Input placeholder="name@example.com" />
                                        </TextField>
                                        <TextField
                                            className="w-full"
                                            type="tel"
                                            value={contact.phone}
                                            onChange={(val) =>
                                                setContact((prev) => ({ ...prev, phone: val }))
                                            }
                                        >
                                            <Label>Phone</Label>
                                            <Input placeholder="+1 555 000 0000" />
                                        </TextField>
                                    </div>
                                </div>

                                {/* Session Details */}
                                <div className="flex flex-col gap-3">
                                    <Separator />
                                    <span className={TEXT_SECTION_LABEL}>Session Details</span>

                                    {/* Address */}
                                    <TextField
                                        className="w-full"
                                        value={address.line1}
                                        onChange={(val) =>
                                            setAddress((prev) => ({ ...prev, line1: val }))
                                        }
                                    >
                                        <Label>Address Line 1</Label>
                                        <Input placeholder="Street and number" />
                                    </TextField>
                                    <TextField
                                        className="w-full"
                                        value={address.line2}
                                        onChange={(val) =>
                                            setAddress((prev) => ({ ...prev, line2: val }))
                                        }
                                    >
                                        <Label>Address Line 2 (optional)</Label>
                                        <Input placeholder="Apartment, suite, etc." />
                                    </TextField>
                                    <div className="grid grid-cols-2 gap-3">
                                        <TextField
                                            className="w-full"
                                            value={address.city}
                                            onChange={(val) =>
                                                setAddress((prev) => ({ ...prev, city: val }))
                                            }
                                        >
                                            <Label>City</Label>
                                            <Input placeholder="City" />
                                        </TextField>
                                        <TextField
                                            className="w-full"
                                            value={address.country}
                                            onChange={(val) =>
                                                setAddress((prev) => ({ ...prev, country: val }))
                                            }
                                        >
                                            <Label>Country</Label>
                                            <Input placeholder="Country" />
                                        </TextField>
                                    </div>
                                    <TextField
                                        className="w-full"
                                        value={address.postcode}
                                        onChange={(val) =>
                                            setAddress((prev) => ({ ...prev, postcode: val }))
                                        }
                                    >
                                        <Label>Postcode / ZIP</Label>
                                        <Input placeholder="Postcode or ZIP code" />
                                    </TextField>

                                    {/* Date + Time */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <DatePicker
                                            className="w-full"
                                            name="sessionDate"
                                            value={sessionDate}
                                            onChange={setSessionDate}
                                            isInvalid={isPastDate}
                                        >
                                            <Label>Session Date</Label>
                                            <DateField.Group fullWidth>
                                                <DateField.Input>
                                                    {(segment) => (
                                                        <DateField.Segment segment={segment} />
                                                    )}
                                                </DateField.Input>
                                                <DateField.Suffix>
                                                    <DatePicker.Trigger>
                                                        <DatePicker.TriggerIndicator />
                                                    </DatePicker.Trigger>
                                                </DateField.Suffix>
                                            </DateField.Group>
                                            {isPastDate && (
                                                <FieldError>
                                                    This date is in the past.
                                                </FieldError>
                                            )}
                                            <DatePicker.Popover>
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
                                                                <Calendar.HeaderCell>
                                                                    {day}
                                                                </Calendar.HeaderCell>
                                                            )}
                                                        </Calendar.GridHeader>
                                                        <Calendar.GridBody>
                                                            {(date) => (
                                                                <Calendar.Cell date={date} />
                                                            )}
                                                        </Calendar.GridBody>
                                                    </Calendar.Grid>
                                                    <Calendar.YearPickerGrid>
                                                        <Calendar.YearPickerGridBody>
                                                            {({ year }) => (
                                                                <Calendar.YearPickerCell
                                                                    year={year}
                                                                />
                                                            )}
                                                        </Calendar.YearPickerGridBody>
                                                    </Calendar.YearPickerGrid>
                                                </Calendar>
                                            </DatePicker.Popover>
                                        </DatePicker>

                                        <TimeField
                                            className="w-full"
                                            name="sessionTime"
                                            value={sessionTime}
                                            onChange={setSessionTime}
                                            granularity="minute"
                                            hourCycle={24}
                                        >
                                            <Label>Session Time</Label>
                                            <TimeField.Group fullWidth>
                                                <TimeField.Input>
                                                    {(segment) => (
                                                        <TimeField.Segment segment={segment} />
                                                    )}
                                                </TimeField.Input>
                                            </TimeField.Group>
                                        </TimeField>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="secondary" slot="close">
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onPress={handleSubmit}
                                isPending={isPending}
                            >
                                Create Order
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
