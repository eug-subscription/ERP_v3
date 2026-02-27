import { CalendarDateTime, parseDateTime } from "@internationalized/date";
import type { ContactPayload, AddressPayload, AssignedLead, ExtraMember } from "../types/order";

export interface OrderTag {
  id: string;
  text: string;
  color: "accent" | "danger" | "warning" | "default" | "success";
}

export interface OrderData {
  id: string;
  orderName: string;
  orderDate: CalendarDateTime;
  sessionTime: CalendarDateTime | null;
  tags: OrderTag[];
  client: string | null;
  contact: ContactPayload;
  secondaryContact: ContactPayload | null;
  address: AddressPayload | null;
  status: "Completed" | "Pending" | "In Progress";
  profit: number;
  projectId: string;
  createdAt: string;
  modifiedAt: string | null;
  assignedLead: AssignedLead | null;
  extraMembers: ExtraMember[];
}

export const mockOrderData: OrderData = {
  id: "order-1",
  orderName: "Budget King Berlin — Food Photography",
  orderDate: parseDateTime("2025-01-10T10:00:00"),
  sessionTime: parseDateTime("2025-01-10T10:00:00"),
  tags: [
    { id: "1", text: "Food photography", color: "accent" },
    { id: "2", text: "Web Germany", color: "default" },
    { id: "3", text: "Food Pics", color: "default" },
    { id: "4", text: "Editing", color: "default" },
  ],
  client: "Budget King Berlin",
  contact: {
    name: "Marcus Hoffmann",
    email: "m.hoffmann@budgetkingberlin.de",
    phone: "+49 30 1234 5678",
  },
  secondaryContact: {
    name: "Laura Schneider",
    email: "l.schneider@budgetkingberlin.de",
    phone: "+49 30 8765 4321",
  },
  address: {
    line1: "Johannisstraße 20",
    line2: "Hinterhaus, 2. OG",
    city: "Berlin",
    country: "DE",
    postcode: "10117",
  },
  status: "Completed",
  profit: 45,
  projectId: "wolt_germany",
  createdAt: "2025-01-10T09:15:00Z",
  modifiedAt: "2026-02-23T09:00:00Z",
  assignedLead: {
    name: "Elena Braun",
    role: "Senior Photographer",
  },
  extraMembers: [
    { id: "extra-1", name: "Alex Morgan", role: "Photographer" },
  ],
};

export const availableTags: OrderTag[] = [
  ...mockOrderData.tags,
  { id: "5", text: "Event", color: "default" },
  { id: "6", text: "Portrait", color: "default" },
  { id: "7", text: "Commercial", color: "default" },
];

