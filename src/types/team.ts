/**
 * Team member types and role definitions.
 *
 * Roles carry a permissions array; permission management UI is out of scope —
 * the data model is ready for it.
 */

// ─── Roles ───────────────────────────────────────────────────────────────────

export type TeamRole =
    | "ops"
    | "admin"
    | "accountant"
    | "photo_editor"
    | "video_editor"
    | "photographer"
    | "videographer"
    | "analytics";

export interface RolePermission {
    key: string;
    label: string;
}

export interface TeamRoleDefinition {
    id: TeamRole;
    label: string;
    permissions: RolePermission[];
}

/**
 * Canonical role definitions with placeholder permissions.
 * Permission management UI is out of scope for v1.
 */
export const TEAM_ROLES: TeamRoleDefinition[] = [
    {
        id: "ops",
        label: "Ops",
        permissions: [
            { key: "orders.manage", label: "Manage orders" },
            { key: "team.view", label: "View team" },
        ],
    },
    {
        id: "admin",
        label: "Admin",
        permissions: [
            { key: "admin.full", label: "Full admin access" },
        ],
    },
    {
        id: "accountant",
        label: "Accountant",
        permissions: [
            { key: "billing.manage", label: "Manage billing" },
            { key: "reports.view", label: "View reports" },
        ],
    },
    {
        id: "photo_editor",
        label: "Photo Editor",
        permissions: [
            { key: "photos.edit", label: "Edit photos" },
            { key: "orders.view", label: "View orders" },
        ],
    },
    {
        id: "video_editor",
        label: "Video Editor",
        permissions: [
            { key: "videos.edit", label: "Edit videos" },
            { key: "orders.view", label: "View orders" },
        ],
    },
    {
        id: "photographer",
        label: "Photographer",
        permissions: [
            { key: "photos.upload", label: "Upload photos" },
            { key: "orders.view", label: "View assigned orders" },
        ],
    },
    {
        id: "videographer",
        label: "Videographer",
        permissions: [
            { key: "videos.upload", label: "Upload videos" },
            { key: "orders.view", label: "View assigned orders" },
        ],
    },
    {
        id: "analytics",
        label: "Analytics",
        permissions: [
            { key: "reports.view", label: "View reports" },
            { key: "dashboard.view", label: "View dashboards" },
        ],
    },
];

/** Quick label lookup by role id. */
export const ROLE_LABEL_MAP: Record<TeamRole, string> = Object.fromEntries(
    TEAM_ROLES.map((r) => [r.id, r.label]),
) as Record<TeamRole, string>;

// ─── Member ──────────────────────────────────────────────────────────────────

export type TeamMemberStatus = "active" | "paused" | "inactive";

export interface SplTeamMember {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: TeamRole;
    status: TeamMemberStatus;
    /** ISO 8601 date string */
    dateJoined: string;
    country: string;
    city: string;
}

// ─── Paginated response ──────────────────────────────────────────────────────

export interface TeamMembersPage {
    items: SplTeamMember[];
    total: number;
    page: number;
    pageSize: number;
}
