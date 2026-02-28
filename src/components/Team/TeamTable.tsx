import { Avatar, Button, Chip, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Table } from "../pricing/Table";
import { EmptyState } from "../pricing/EmptyState";
import { TOOLTIP_DELAY, ACTION_BUTTON_ICON } from "../../constants/ui-tokens";
import { ROLE_LABEL_MAP } from "../../types/team";
import type { SplTeamMember } from "../../types/team";
import { formatRelativeTime, formatAbsoluteTime } from "../../utils/format-time";

// ─── Role chip color mapping ─────────────────────────────────────────────────

const ROLE_COLOR_MAP: Record<string, "accent" | "success" | "warning" | "danger" | "default"> = {
    ops: "accent",
    admin: "danger",
    accountant: "warning",
    photo_editor: "default",
    video_editor: "default",
    photographer: "success",
    videographer: "success",
    analytics: "default",
};

// ─── Status chip config ──────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: "success" | "warning" | "default"; dotIcon: string; label: string }> = {
    active: { color: "success", dotIcon: "lucide:circle", label: "Active" },
    paused: { color: "warning", dotIcon: "lucide:circle", label: "Paused" },
    inactive: { color: "default", dotIcon: "lucide:circle", label: "Inactive" },
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type SortableColumn = Extract<keyof SplTeamMember, "name" | "email" | "role" | "status" | "dateJoined" | "country" | "city">;

interface TeamTableProps {
    members: SplTeamMember[];
    sortKey: SortableColumn;
    sortDirection: "asc" | "desc";
    onSort: (key: SortableColumn) => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
    onEdit?: (member: SplTeamMember) => void;
}

/** Derive initials from a full name (up to 2 letters). */
function getInitials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase() ?? "")
        .join("");
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TeamTable({ members, sortKey, sortDirection, onSort, onClearFilters, hasActiveFilters, onEdit }: TeamTableProps) {
    const sortButton = (label: string, key: SortableColumn, isBlack = false) => (
        <Table.SortButton
            label={label}
            isActive={sortKey === key}
            direction={sortKey === key ? sortDirection : undefined}
            onPress={() => onSort(key)}
            isBlack={isBlack}
        />
    );

    return (
        <Table>
            <Table.Header>
                <tr>
                    <Table.Column className="w-12">Avatar</Table.Column>
                    <Table.Column isBlack>{sortButton("Name", "name", true)}</Table.Column>
                    <Table.Column>{sortButton("Email", "email")}</Table.Column>
                    <Table.Column>{sortButton("Role", "role")}</Table.Column>
                    <Table.Column>{sortButton("Status", "status")}</Table.Column>
                    <Table.Column>{sortButton("Date Joined", "dateJoined")}</Table.Column>
                    <Table.Column>{sortButton("Country", "country")}</Table.Column>
                    <Table.Column>{sortButton("City", "city")}</Table.Column>
                    <Table.Column align="right">Actions</Table.Column>
                </tr>
            </Table.Header>
            <Table.Body>
                {members.length > 0 ? (
                    members.map((member) => (
                        <Table.Row key={member.id}>
                            {/* Avatar — v3 compound pattern */}
                            <Table.Cell>
                                <Avatar size="sm" className="shrink-0">
                                    {member.avatarUrl && (
                                        <Avatar.Image
                                            src={member.avatarUrl}
                                            alt={member.name}
                                        />
                                    )}
                                    <Avatar.Fallback>{getInitials(member.name)}</Avatar.Fallback>
                                </Avatar>
                            </Table.Cell>

                            {/* Name */}
                            <Table.Cell>
                                <span className="text-sm font-medium text-default-900">{member.name}</span>
                            </Table.Cell>

                            {/* Email */}
                            <Table.Cell>
                                <span className="text-xs text-default-400 font-normal">{member.email}</span>
                            </Table.Cell>

                            {/* Role */}
                            <Table.Cell>
                                <Chip
                                    size="sm"
                                    color={ROLE_COLOR_MAP[member.role] ?? "default"}
                                    variant="soft"
                                    className="font-medium px-2 h-6 border-none"
                                >
                                    <Chip.Label>{ROLE_LABEL_MAP[member.role]}</Chip.Label>
                                </Chip>
                            </Table.Cell>

                            {/* Status — soft chip with dot icon replacing v2 "dot" variant */}
                            <Table.Cell>
                                <Chip
                                    size="sm"
                                    color={STATUS_CONFIG[member.status]?.color ?? "default"}
                                    variant="soft"
                                    className="font-medium px-2 h-6 border-none gap-1"
                                >
                                    <Icon
                                        icon={STATUS_CONFIG[member.status]?.dotIcon ?? "lucide:circle"}
                                        className="w-2 h-2 fill-current"
                                    />
                                    <Chip.Label>
                                        {STATUS_CONFIG[member.status]?.label ?? member.status}
                                    </Chip.Label>
                                </Chip>
                            </Table.Cell>

                            {/* Date Joined */}
                            <Table.Cell>
                                <span
                                    className="text-xs font-medium text-default-500 whitespace-nowrap"
                                    title={formatAbsoluteTime(member.dateJoined)}
                                >
                                    {formatRelativeTime(member.dateJoined)}
                                </span>
                            </Table.Cell>

                            {/* Country */}
                            <Table.Cell>
                                <span className="text-xs font-medium text-default-500">{member.country}</span>
                            </Table.Cell>

                            {/* City */}
                            <Table.Cell>
                                <span className="text-xs font-medium text-default-500">{member.city}</span>
                            </Table.Cell>

                            {/* Actions */}
                            <Table.Cell align="right">
                                <Tooltip delay={TOOLTIP_DELAY}>
                                    <Tooltip.Trigger>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="ghost"
                                            aria-label={`Edit ${member.name}`}
                                            className={ACTION_BUTTON_ICON}
                                            onPress={() => onEdit?.(member)}
                                        >
                                            <Icon icon="lucide:edit-3" width={16} />
                                        </Button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>Edit Member</Tooltip.Content>
                                </Tooltip>
                            </Table.Cell>
                        </Table.Row>
                    ))
                ) : (
                    <tr>
                        <td colSpan={9} className="p-0">
                            <EmptyState
                                icon="lucide:users"
                                title="No Team Members Found"
                                description={
                                    hasActiveFilters
                                        ? "No members match your current filters. Try adjusting your search or filter criteria."
                                        : "Your team directory is empty. Start by inviting your first team member."
                                }
                                actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
                                actionIcon={hasActiveFilters ? "lucide:x" : undefined}
                                onAction={hasActiveFilters ? onClearFilters : undefined}
                            />
                        </td>
                    </tr>
                )}
            </Table.Body>
        </Table>
    );
}
