import type { DateValue } from "@internationalized/date";
import type { TimeValue } from "@heroui/react";

export interface ContactPayload {
    name: string;
    email: string;
    phone: string;
}

export interface AddressPayload {
    line1: string;
    line2: string;
    city: string;
    country: string;
    postcode: string;
}

export interface AssignedLead {
    name: string;
    role: string;
}

export interface ExtraMember {
    id: string;
    name: string;
    role: string;
}

export interface CreateOrderPayload {
    orderName: string;
    contact: ContactPayload;
    address: AddressPayload;
    sessionDate: DateValue | null;
    sessionTime: TimeValue | null;
}

export const CREATE_ORDER_DEFAULTS: CreateOrderPayload = {
    orderName: "",
    contact: {
        name: "",
        email: "",
        phone: "",
    },
    address: {
        line1: "",
        line2: "",
        city: "",
        country: "",
        postcode: "",
    },
    sessionDate: null,
    sessionTime: null,
};
