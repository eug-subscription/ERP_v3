import { CalendarDateTime, parseDateTime } from "@internationalized/date";

export interface StructuredAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
}

export interface OrderTag {
  id: string;
  text: string;
  color: "accent" | "danger" | "warning" | "default" | "success";
}

export interface OrderData {
  orderDate: CalendarDateTime;
  tags: OrderTag[];
  client: string | null;
  address: StructuredAddress | null;
  status: "Completed" | "Pending" | "In Progress";
  profit: number;
}

export const mockOrderData: OrderData = {
  orderDate: parseDateTime("2025-01-10T10:00:00"),
  tags: [
    { id: "1", text: "Food photography", color: "accent" },
    { id: "2", text: "Web Germany", color: "default" },
    { id: "3", text: "Food Pics", color: "default" },
    { id: "4", text: "Editing", color: "default" },
  ],
  client: "Budget King Berlin",
  address: {
    line1: "Johannisstraße 20",
    line2: "",
    city: "Berlin",
    state: "Berlin",
    country: "DE",
    postcode: "10117",
  },
  status: "Completed",
  profit: 45,
};

export const availableTags: OrderTag[] = [
  ...mockOrderData.tags,
  { id: "5", text: "Event", color: "default" },
  { id: "6", text: "Portrait", color: "default" },
  { id: "7", text: "Commercial", color: "default" },
];

export const countries = [
  { code: "DE", name: "Germany" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
];
