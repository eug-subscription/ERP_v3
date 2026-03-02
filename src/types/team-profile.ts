import type { TeamRole, SplTeamMember } from "./team";

// ─── Personal Details ─────────────────────────────────────────────────────────

export interface PersonalInfo {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
    phone: string;
    country: string;
    timezone: string;
}

export interface ProfileInfo {
    isAvailable: boolean;
    portfolioUrl: string;
    description: string;
}

/** Max character count for profile description. */
export const DESCRIPTION_MAX_LENGTH = 500;

/** Default timezone used for new/fallback profiles. */
export const DEFAULT_TIMEZONE = "Europe/London";

/** Default currency used for new/fallback payment details. */
export const DEFAULT_CURRENCY = "GBP";

// ─── Roles & Permissions ──────────────────────────────────────────────────────

export type CrudOperation = "list" | "read" | "create" | "update" | "delete";

export type PermissionModule =
    | "orders"
    | "team_members"
    | "billing"
    | "projects"
    | "rate_cards"
    | "workflows"
    | "reports"
    | "moderation"
    | "settings";

export interface PermissionEntry {
    module: PermissionModule;
    operations: Record<CrudOperation, boolean>;
}

export const PERMISSION_MODULES: { id: PermissionModule; label: string }[] = [
    { id: "orders", label: "Orders" },
    { id: "team_members", label: "Team Members" },
    { id: "billing", label: "Billing" },
    { id: "projects", label: "Projects" },
    { id: "rate_cards", label: "Rate Cards" },
    { id: "workflows", label: "Workflows" },
    { id: "reports", label: "Reports" },
    { id: "moderation", label: "Moderation" },
    { id: "settings", label: "Settings" },
];

export const CRUD_OPERATIONS: { id: CrudOperation; label: string }[] = [
    { id: "list", label: "List" },
    { id: "read", label: "Read" },
    { id: "create", label: "Create" },
    { id: "update", label: "Update" },
    { id: "delete", label: "Delete" },
];

export interface RolesAndPermissions {
    assignedRoles: TeamRole[];
    customRoles: string[];
    permissions: PermissionEntry[];
}

// ─── Password / Sessions ──────────────────────────────────────────────────────

export interface ActiveSession {
    id: string;
    device: string;
    location: string;
    lastActive: string; // ISO 8601
    isCurrent: boolean;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface LocalBankDetails {
    country: string;
    accountHolderName: string;
    sortCode: string;
    accountNumber: string;
}

export interface InternationalBankDetails {
    country: string;
    accountHolderName: string;
    bankName: string;
    iban: string;
    swiftBic: string;
    currency: string;
}

export interface BillingAddress {
    addressLine1: string;
    addressLine2: string;
    city: string;
    stateRegion: string;
    postcode: string;
    country: string;
}

export interface PaymentDetails {
    localBank: LocalBankDetails;
    internationalBank: InternationalBankDetails;
    billingEmails: string[];
    paypalAccounts: string[];
    billingAddress: BillingAddress;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationChannel = "push" | "email" | "sms";

export type NotificationCategoryId =
    | "new_available_photos"
    | "rejected_photos"
    | "invoices_generated"
    | "order_deadlines"
    | "new_editing_guidelines"
    | "photo_status_updates"
    | "system_messages"
    | "new_project_assigned"
    | "payment_updates"
    | "tips_and_tutorials";

export interface NotificationCategory {
    id: NotificationCategoryId;
    label: string;
    description: string;
}

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
    {
        id: "new_available_photos",
        label: "New Available Photos",
        description: "Notifications for newly uploaded photos for retouching.",
    },
    {
        id: "rejected_photos",
        label: "Rejected Photos",
        description:
            "Alerts for rejected photos requiring revisions or rework.",
    },
    {
        id: "invoices_generated",
        label: "Invoices Generated",
        description:
            "Notifications when invoices are generated and ready for viewing and downloading.",
    },
    {
        id: "order_deadlines",
        label: "Order Deadlines Approaching",
        description:
            "Reminders for deadlines tied to orders or specific projects.",
    },
    {
        id: "new_editing_guidelines",
        label: "New Editing Guidelines",
        description:
            "Updates about new or revised retouching guidelines.",
    },
    {
        id: "photo_status_updates",
        label: "Photo Status Updates",
        description: "Notifications when a retouched photo is approved.",
    },
    {
        id: "system_messages",
        label: "System Messages",
        description:
            "Alerts for platform updates, outages, or system-related issues that might affect workflow.",
    },
    {
        id: "new_project_assigned",
        label: "New Project Assigned",
        description: "Notifications for newly assigned projects.",
    },
    {
        id: "payment_updates",
        label: "Payment Updates",
        description:
            "Alerts for payment confirmations, delays, or changes in payment status.",
    },
    {
        id: "tips_and_tutorials",
        label: "Tips and Tutorials",
        description: "Tips on getting better at retouching.",
    },
];

export interface NotificationPreference {
    categoryId: NotificationCategoryId;
    channels: Record<NotificationChannel, boolean>;
}

// ─── Full Profile ─────────────────────────────────────────────────────────────

/**
 * Full profile for the member detail page.
 * Note: `personalInfo` fields (email, avatarUrl, country) intentionally overlap
 * with inherited `SplTeamMember` fields. The flat fields serve list views;
 * `personalInfo` serves the editable profile form.
 */
export interface SplTeamMemberProfile extends SplTeamMember {
    personalInfo: PersonalInfo;
    profileInfo: ProfileInfo;
    rolesAndPermissions: RolesAndPermissions;
    activeSessions: ActiveSession[];
    paymentDetails: PaymentDetails;
    notificationPreferences: NotificationPreference[];
}
