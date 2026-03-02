import { ALL_TEAM_MEMBERS } from "./mock-team-members";
import type { SplTeamMember } from "../types/team";
import type {
    SplTeamMemberProfile,
    PermissionEntry,
    NotificationPreference,
    ActiveSession,
    NotificationCategoryId,
    NotificationChannel,
} from "../types/team-profile";
import {
    NOTIFICATION_CATEGORIES,
    PERMISSION_MODULES,
    DEFAULT_TIMEZONE,
    DEFAULT_CURRENCY,
} from "../types/team-profile";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Split a full name into first / last. Falls back gracefully for single-word names. */
function splitName(name: string): { firstName: string; lastName: string } {
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] ?? name;
    const lastName = parts.slice(1).join(" ") || "";
    return { firstName, lastName };
}

/** Generate a default permission matrix (all false). */
function makeDefaultPermissions(): PermissionEntry[] {
    return PERMISSION_MODULES.map((mod) => ({
        module: mod.id,
        operations: {
            list: false,
            read: false,
            create: false,
            update: false,
            delete: false,
        },
    }));
}

/** Generate a default notification preferences array (all false). */
function makeDefaultNotifications(): NotificationPreference[] {
    return NOTIFICATION_CATEGORIES.map((cat) => ({
        categoryId: cat.id,
        channels: { push: false, email: false, sms: false },
    }));
}

/** Generate a fallback profile for any member not explicitly pre-populated. */
function generateFallbackProfile(member: SplTeamMember): SplTeamMemberProfile {
    const { firstName, lastName } = splitName(member.name);
    return {
        ...member,
        personalInfo: {
            firstName,
            lastName,
            email: member.email,
            avatarUrl: member.avatarUrl,
            phone: "",
            country: member.country,
            timezone: DEFAULT_TIMEZONE,
        },
        profileInfo: {
            isAvailable: member.status === "active",
            portfolioUrl: "",
            description: "",
        },
        rolesAndPermissions: {
            assignedRoles: [member.role],
            customRoles: [],
            permissions: makeDefaultPermissions(),
        },
        activeSessions: [],
        paymentDetails: {
            localBank: {
                country: member.country,
                accountHolderName: member.name,
                sortCode: "",
                accountNumber: "",
            },
            internationalBank: {
                country: member.country,
                accountHolderName: member.name,
                bankName: "",
                iban: "",
                swiftBic: "",
                currency: DEFAULT_CURRENCY,
            },
            billingEmails: [member.email],
            paypalAccounts: [],
            billingAddress: {
                addressLine1: "",
                addressLine2: "",
                city: member.city,
                stateRegion: "",
                postcode: "",
                country: member.country,
            },
        },
        notificationPreferences: makeDefaultNotifications(),
    };
}

// ─── Pre-populated sessions ───────────────────────────────────────────────────

const OLIVIA_SESSIONS: ActiveSession[] = [
    {
        id: "sess-001-a",
        device: "MacBook Pro — Chrome 122",
        location: "London, United Kingdom",
        lastActive: "2026-02-28T17:30:00Z",
        isCurrent: true,
    },
    {
        id: "sess-001-b",
        device: "iPhone 15 Pro — Safari",
        location: "London, United Kingdom",
        lastActive: "2026-02-27T09:15:00Z",
        isCurrent: false,
    },
];

const PRIYA_SESSIONS: ActiveSession[] = [
    {
        id: "sess-008-a",
        device: "Windows PC — Firefox 123",
        location: "Mumbai, India",
        lastActive: "2026-02-28T16:00:00Z",
        isCurrent: true,
    },
];

const AMELIA_SESSIONS: ActiveSession[] = [
    {
        id: "sess-015-a",
        device: "MacBook Air — Safari",
        location: "London, United Kingdom",
        lastActive: "2026-02-28T17:50:00Z",
        isCurrent: true,
    },
    {
        id: "sess-015-b",
        device: "iPad Pro — Chrome",
        location: "Birmingham, United Kingdom",
        lastActive: "2026-02-25T14:20:00Z",
        isCurrent: false,
    },
    {
        id: "sess-015-c",
        device: "Android Phone — Chrome",
        location: "Manchester, United Kingdom",
        lastActive: "2026-02-20T11:30:00Z",
        isCurrent: false,
    },
];

const THOMAS_SESSIONS: ActiveSession[] = [
    {
        id: "sess-022-a",
        device: "Dell XPS — Chrome 122",
        location: "Bristol, United Kingdom",
        lastActive: "2026-02-28T15:45:00Z",
        isCurrent: true,
    },
];

const JAMES_SESSIONS: ActiveSession[] = [
    {
        id: "sess-004-a",
        device: "MacBook Pro — Arc Browser",
        location: "London, United Kingdom",
        lastActive: "2026-02-28T17:55:00Z",
        isCurrent: true,
    },
    {
        id: "sess-004-b",
        device: "MacBook Pro — Safari",
        location: "Edinburgh, United Kingdom",
        lastActive: "2026-02-26T18:00:00Z",
        isCurrent: false,
    },
];

// ─── Notification & permission builders ───────────────────────────────────────

/**
 * Builds a NotificationPreference array with typed override keys.
 * Uses domain types `NotificationCategoryId` and `NotificationChannel`
 * to catch typos at compile time.
 */
function makeNotifications(
    overrides: Partial<Record<NotificationCategoryId, Partial<Record<NotificationChannel, boolean>>>>,
): NotificationPreference[] {
    return NOTIFICATION_CATEGORIES.map((cat) => {
        const catOverride = overrides[cat.id] ?? {};
        return {
            categoryId: cat.id,
            channels: {
                push: catOverride["push"] ?? false,
                email: catOverride["email"] ?? false,
                sms: catOverride["sms"] ?? false,
            },
        };
    });
}

function makeAdminPermissions(): PermissionEntry[] {
    return PERMISSION_MODULES.map((mod) => ({
        module: mod.id,
        operations: {
            list: true,
            read: true,
            create: true,
            update: true,
            delete: true,
        },
    }));
}

function makeEditorPermissions(): PermissionEntry[] {
    return PERMISSION_MODULES.map((mod) => ({
        module: mod.id,
        operations: {
            list: true,
            read: true,
            create: mod.id === "orders" || mod.id === "projects",
            update: mod.id === "orders" || mod.id === "projects",
            delete: false,
        },
    }));
}

function makePhotographerPermissions(): PermissionEntry[] {
    return PERMISSION_MODULES.map((mod) => ({
        module: mod.id,
        operations: {
            list: mod.id === "orders" || mod.id === "projects",
            read: mod.id === "orders" || mod.id === "projects",
            create: false,
            update: false,
            delete: false,
        },
    }));
}

// ─── Builder ──────────────────────────────────────────────────────────────────

/**
 * Looks up a member by ID from ALL_TEAM_MEMBERS and merges profile overrides.
 * Throws a descriptive error if the ID is not found, avoiding silent undefined.
 */
function buildProfile(
    id: string,
    overrides: Omit<SplTeamMemberProfile, keyof SplTeamMember>,
): SplTeamMemberProfile {
    const member = ALL_TEAM_MEMBERS.find((m) => m.id === id);
    if (!member) {
        throw new Error(`Mock member "${id}" not found in ALL_TEAM_MEMBERS`);
    }
    return { ...member, ...overrides };
}

// ─── Static profile map ───────────────────────────────────────────────────────

const PROFILE_MAP = new Map<string, SplTeamMemberProfile>([
    // tm-001 — Olivia Harper (Ops)
    [
        "tm-001",
        buildProfile("tm-001", {
            personalInfo: {
                firstName: "Olivia",
                lastName: "Harper",
                email: "olivia.harper@splento.com",
                avatarUrl: "/mock-assets/olivia-harper.png",
                phone: "+44 7700 900123",
                country: "United Kingdom",
                timezone: DEFAULT_TIMEZONE,
            },
            profileInfo: {
                isAvailable: true,
                portfolioUrl: "https://oliviaharper.com",
                description:
                    "Operations manager with 4 years at Splento. Loves process optimisation and building high-performing teams.",
            },
            rolesAndPermissions: {
                assignedRoles: ["ops"],
                customRoles: [],
                permissions: makeEditorPermissions(),
            },
            activeSessions: OLIVIA_SESSIONS,
            paymentDetails: {
                localBank: {
                    country: "United Kingdom",
                    accountHolderName: "Olivia Harper",
                    sortCode: "20-00-00",
                    accountNumber: "55779911",
                },
                internationalBank: {
                    country: "United Kingdom",
                    accountHolderName: "Olivia Harper",
                    bankName: "Barclays",
                    iban: "GB29BARC20000055779911",
                    swiftBic: "BARCGB22",
                    currency: DEFAULT_CURRENCY,
                },
                billingEmails: ["olivia.harper@splento.com", "olivia@oliviaharper.com"],
                paypalAccounts: ["olivia.harper@paypal.com"],
                billingAddress: {
                    addressLine1: "14 Clerkenwell Road",
                    addressLine2: "",
                    city: "London",
                    stateRegion: "",
                    postcode: "EC1M 5PH",
                    country: "United Kingdom",
                },
            },
            notificationPreferences: makeNotifications({
                new_available_photos: { push: true, email: true },
                order_deadlines: { push: true, email: true, sms: true },
                system_messages: { email: true },
                payment_updates: { email: true },
            }),
        }),
    ],

    // tm-008 — Priya Sharma (Photo Editor)
    [
        "tm-008",
        buildProfile("tm-008", {
            personalInfo: {
                firstName: "Priya",
                lastName: "Sharma",
                email: "priya.sharma@splento.com",
                avatarUrl: "/mock-assets/priya-sharma.png",
                phone: "+91 98201 00123",
                country: "India",
                timezone: "Asia/Kolkata",
            },
            profileInfo: {
                isAvailable: true,
                portfolioUrl: "https://priyasharma.photography",
                description:
                    "Senior photo editor specialising in luxury real estate and lifestyle. Adobe Certified Expert with 6 years of retouching experience.",
            },
            rolesAndPermissions: {
                assignedRoles: ["photo_editor"],
                customRoles: ["senior_editor"],
                permissions: makeEditorPermissions(),
            },
            activeSessions: PRIYA_SESSIONS,
            paymentDetails: {
                localBank: {
                    country: "India",
                    accountHolderName: "Priya Sharma",
                    sortCode: "",
                    accountNumber: "9876543210",
                },
                internationalBank: {
                    country: "India",
                    accountHolderName: "Priya Sharma",
                    bankName: "HDFC Bank",
                    iban: "",
                    swiftBic: "HDFCINBB",
                    currency: "INR",
                },
                billingEmails: ["priya.sharma@splento.com"],
                paypalAccounts: [],
                billingAddress: {
                    addressLine1: "42, Andheri West",
                    addressLine2: "",
                    city: "Mumbai",
                    stateRegion: "Maharashtra",
                    postcode: "400058",
                    country: "India",
                },
            },
            notificationPreferences: makeNotifications({
                new_available_photos: { push: true, email: true, sms: true },
                rejected_photos: { push: true, email: true },
                order_deadlines: { push: true },
                new_editing_guidelines: { push: true, email: true },
                photo_status_updates: { push: true },
            }),
        }),
    ],

    // tm-015 — Amelia Richardson (Photographer)
    [
        "tm-015",
        buildProfile("tm-015", {
            personalInfo: {
                firstName: "Amelia",
                lastName: "Richardson",
                email: "amelia.richardson@splento.com",
                avatarUrl: "/mock-assets/amelia-richardson.png",
                phone: "+44 7700 900456",
                country: "United Kingdom",
                timezone: DEFAULT_TIMEZONE,
            },
            profileInfo: {
                isAvailable: true,
                portfolioUrl: "https://ameliaphotography.co.uk",
                description:
                    "Award-winning photographer with a decade of experience shooting for top-tier hospitality and fashion brands across Europe.",
            },
            rolesAndPermissions: {
                assignedRoles: ["photographer"],
                customRoles: [],
                permissions: makePhotographerPermissions(),
            },
            activeSessions: AMELIA_SESSIONS,
            paymentDetails: {
                localBank: {
                    country: "United Kingdom",
                    accountHolderName: "Amelia Richardson",
                    sortCode: "40-30-11",
                    accountNumber: "12345678",
                },
                internationalBank: {
                    country: "United Kingdom",
                    accountHolderName: "Amelia Richardson",
                    bankName: "HSBC",
                    iban: "GB29HSBC40301112345678",
                    swiftBic: "HSBCGB2L",
                    currency: DEFAULT_CURRENCY,
                },
                billingEmails: ["amelia.richardson@splento.com"],
                paypalAccounts: ["amelia.richardson@paypal.com"],
                billingAddress: {
                    addressLine1: "7 Kensington Palace Gardens",
                    addressLine2: "",
                    city: "London",
                    stateRegion: "",
                    postcode: "W8 4QP",
                    country: "United Kingdom",
                },
            },
            notificationPreferences: makeNotifications({
                new_project_assigned: { push: true, email: true, sms: true },
                order_deadlines: { push: true, sms: true },
                payment_updates: { push: true, email: true },
                system_messages: { email: true },
            }),
        }),
    ],

    // tm-022 — Thomas Anderson (Videographer)
    [
        "tm-022",
        buildProfile("tm-022", {
            personalInfo: {
                firstName: "Thomas",
                lastName: "Anderson",
                email: "thomas.anderson@splento.com",
                avatarUrl: "/mock-assets/thomas-anderson.png",
                phone: "+44 7700 900789",
                country: "United Kingdom",
                timezone: DEFAULT_TIMEZONE,
            },
            profileInfo: {
                isAvailable: true,
                portfolioUrl: "https://vimeo.com/thomasandersonfilm",
                description:
                    "Videographer and post-production specialist. Creates compelling brand films and event coverage. Based in Bristol.",
            },
            rolesAndPermissions: {
                assignedRoles: ["videographer"],
                customRoles: [],
                permissions: makePhotographerPermissions(),
            },
            activeSessions: THOMAS_SESSIONS,
            paymentDetails: {
                localBank: {
                    country: "United Kingdom",
                    accountHolderName: "Thomas Anderson",
                    sortCode: "60-16-13",
                    accountNumber: "31926819",
                },
                internationalBank: {
                    country: "United Kingdom",
                    accountHolderName: "Thomas Anderson",
                    bankName: "Lloyds Bank",
                    iban: "GB82LOYD60161331926819",
                    swiftBic: "LOYDGB21",
                    currency: DEFAULT_CURRENCY,
                },
                billingEmails: ["thomas.anderson@splento.com"],
                paypalAccounts: ["thomas.film@paypal.com"],
                billingAddress: {
                    addressLine1: "22 Clifton Down",
                    addressLine2: "",
                    city: "Bristol",
                    stateRegion: "",
                    postcode: "BS8 3LH",
                    country: "United Kingdom",
                },
            },
            notificationPreferences: makeNotifications({
                new_project_assigned: { push: true, email: true },
                order_deadlines: { push: true },
                invoices_generated: { email: true },
                payment_updates: { email: true },
            }),
        }),
    ],

    // tm-004 — James Whitfield (Admin)
    [
        "tm-004",
        buildProfile("tm-004", {
            personalInfo: {
                firstName: "James",
                lastName: "Whitfield",
                email: "james.whitfield@splento.com",
                avatarUrl: "/mock-assets/james-whitfield.png",
                phone: "+44 7700 900321",
                country: "United Kingdom",
                timezone: DEFAULT_TIMEZONE,
            },
            profileInfo: {
                isAvailable: true,
                portfolioUrl: "",
                description:
                    "Platform administrator and engineering lead. Manages access control, data integrity, and platform infrastructure across all Splento services.",
            },
            rolesAndPermissions: {
                assignedRoles: ["admin"],
                customRoles: ["platform_lead"],
                permissions: makeAdminPermissions(),
            },
            activeSessions: JAMES_SESSIONS,
            paymentDetails: {
                localBank: {
                    country: "United Kingdom",
                    accountHolderName: "James Whitfield",
                    sortCode: "30-00-02",
                    accountNumber: "00123456",
                },
                internationalBank: {
                    country: "United Kingdom",
                    accountHolderName: "James Whitfield",
                    bankName: "NatWest",
                    iban: "GB29NWBK30000200123456",
                    swiftBic: "NWBKGB2L",
                    currency: DEFAULT_CURRENCY,
                },
                billingEmails: ["james.whitfield@splento.com", "james@whitfield.dev"],
                paypalAccounts: [],
                billingAddress: {
                    addressLine1: "10 Threadneedle Street",
                    addressLine2: "",
                    city: "London",
                    stateRegion: "",
                    postcode: "EC2R 8AD",
                    country: "United Kingdom",
                },
            },
            notificationPreferences: makeNotifications({
                system_messages: { push: true, email: true, sms: true },
                invoices_generated: { email: true },
                payment_updates: { email: true },
                order_deadlines: { email: true },
                new_project_assigned: { push: true, email: true },
            }),
        }),
    ],
]);

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the full profile for a given team member id.
 * Pre-populated profiles are returned as-is; all others get a generated default.
 */
export function getTeamMemberProfile(id: string): SplTeamMemberProfile {
    if (PROFILE_MAP.has(id)) {
        return PROFILE_MAP.get(id)!;
    }

    const member = ALL_TEAM_MEMBERS.find((m) => m.id === id);
    if (!member) {
        throw new Error(`Team member with id "${id}" not found.`);
    }

    const fallback = generateFallbackProfile(member);
    // Cache it so repeated lookups return the same object reference
    PROFILE_MAP.set(id, fallback);
    return fallback;
}
