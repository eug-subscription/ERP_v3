import { useState } from "react";
import {
    TagGroup,
    Tag,
    Card,
    Button,
    Checkbox,
    Select,
    ListBox,
    Label,
    Input,
    TextField,
} from "@heroui/react";
import type { Key } from "@heroui/react";
import type { SplTeamMemberProfile, PermissionEntry, CrudOperation } from "../../../types/team-profile";
import {
    PERMISSION_MODULES,
    CRUD_OPERATIONS,
} from "../../../types/team-profile";
import { TEAM_ROLES, ROLE_LABEL_MAP } from "../../../types/team";
import type { TeamRole } from "../../../types/team";
import { FormSection } from "./FormSection";
import {
    FLEX_COL_GAP_4,
    TEXT_FIELD_LABEL,
} from "../../../constants/ui-tokens";

// ─── Props ────────────────────────────────────────────────────────────────────

interface RolesPermissionsTabProps {
    profile: SplTeamMemberProfile;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * RolesPermissionsTab — "Roles & Permissions" tab on the Member Profile page.
 *
 * Two sections:
 *  1. Role Assignment — active role chips + Select to add + custom role input
 *  2. Permission Matrix — module × operation checkbox grid with dirty state
 */
export function RolesPermissionsTab({ profile }: RolesPermissionsTabProps) {
    const { rolesAndPermissions } = profile;

    // ── Section 1: Roles ────────────────────────────────────────────────────
    const [assignedRoles, setAssignedRoles] = useState<TeamRole[]>(
        rolesAndPermissions.assignedRoles,
    );
    const [customRoles, setCustomRoles] = useState<string[]>(
        rolesAndPermissions.customRoles,
    );
    const [newCustomRole, setNewCustomRole] = useState("");

    const isRolesDirty =
        JSON.stringify(assignedRoles) !==
        JSON.stringify(rolesAndPermissions.assignedRoles) ||
        JSON.stringify(customRoles) !==
        JSON.stringify(rolesAndPermissions.customRoles);

    // Available roles not already assigned
    const availableRoles = TEAM_ROLES.filter(
        (r) => !assignedRoles.includes(r.id),
    );

    // ── Section 2: Permissions ──────────────────────────────────────────────
    const [permissions, setPermissions] = useState<PermissionEntry[]>(
        rolesAndPermissions.permissions,
    );

    const isPermDirty =
        JSON.stringify(permissions) !==
        JSON.stringify(rolesAndPermissions.permissions);

    // ── Combined tab-level state ────────────────────────────────────────────
    const isDirty = isRolesDirty || isPermDirty;
    const [isSaving, setIsSaving] = useState(false);

    function handleCancel() {
        setAssignedRoles(rolesAndPermissions.assignedRoles);
        setCustomRoles(rolesAndPermissions.customRoles);
        setPermissions(rolesAndPermissions.permissions);
    }

    function handleSave() {
        setIsSaving(true);
        // TODO: trigger toast notification on successful save (deferred until real API integration)
        setTimeout(() => setIsSaving(false), 800);
    }

    function addCustomRole() {
        const trimmed = newCustomRole.trim();
        if (trimmed && !customRoles.includes(trimmed)) {
            setCustomRoles((r) => [...r, trimmed]);
        }
        setNewCustomRole("");
    }

    function togglePermission(
        module: string,
        operation: CrudOperation,
        value: boolean,
    ) {
        setPermissions((prev: PermissionEntry[]) =>
            prev.map((entry: PermissionEntry) =>
                entry.module === module
                    ? {
                        ...entry,
                        operations: {
                            ...entry.operations,
                            [operation]: value,
                        },
                    }
                    : entry,
            ),
        );
    }

    function getPermission(module: string, operation: CrudOperation): boolean {
        const entry = permissions.find((e: PermissionEntry) => e.module === module);
        return entry?.operations[operation] ?? false;
    }

    return (
        <div className={FLEX_COL_GAP_4}>
            {/* ── Section 1: Role Assignment ───────────────────────────── */}
            <FormSection
                title="Role assignment"
                description="Assign predefined roles or add custom roles to this team member."
                isDirty={isRolesDirty}
                onCancel={handleCancel}
                onSave={handleSave}
                isSaving={isSaving}
                showActions={false}
                isFirst
            >
                {/* Assigned roles — TagGroup with built-in remove support */}
                {assignedRoles.length > 0 && (
                    <TagGroup
                        size="sm"
                        aria-label="Assigned roles"
                        onRemove={(keys: Set<Key>) => {
                            setAssignedRoles((prev) =>
                                prev.filter((r) => !keys.has(r)),
                            );
                        }}
                    >
                        <TagGroup.List>
                            {assignedRoles.map((role) => (
                                <Tag key={role} id={role} textValue={ROLE_LABEL_MAP[role]}>
                                    {ROLE_LABEL_MAP[role]}
                                </Tag>
                            ))}
                        </TagGroup.List>
                    </TagGroup>
                )}

                {/* Custom roles — separate TagGroup so remove handler targets the right state */}
                {customRoles.length > 0 && (
                    <TagGroup
                        size="sm"
                        aria-label="Custom roles"
                        onRemove={(keys: Set<Key>) => {
                            setCustomRoles((prev) =>
                                prev.filter((r) => !keys.has(r)),
                            );
                        }}
                    >
                        <TagGroup.List>
                            {customRoles.map((role) => (
                                <Tag key={role} id={role} textValue={role}>
                                    {role}
                                </Tag>
                            ))}
                        </TagGroup.List>
                    </TagGroup>
                )}

                {/* Add role + Custom role — one row */}
                <div className="flex gap-4 items-end">
                    {availableRoles.length > 0 && (
                        <Select
                            selectedKey={null}
                            placeholder="Add a role…"
                            className="flex-1"
                            onSelectionChange={(key: Key | null) => {
                                if (!key) return;
                                const role = key as TeamRole;
                                if (!assignedRoles.includes(role)) {
                                    setAssignedRoles((r: TeamRole[]) => [...r, role]);
                                }
                            }}
                        >
                            <Label className={TEXT_FIELD_LABEL}>Add role</Label>
                            <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                                <ListBox>
                                    {availableRoles.map((r) => (
                                        <ListBox.Item
                                            key={r.id}
                                            id={r.id}
                                            textValue={r.label}
                                        >
                                            {r.label}
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    ))}
                                </ListBox>
                            </Select.Popover>
                        </Select>
                    )}

                    <div className="flex flex-1 gap-2 items-end">
                        <TextField
                            fullWidth
                            name="customRole"
                            value={newCustomRole}
                            onChange={setNewCustomRole}
                        >
                            <Label className={TEXT_FIELD_LABEL}>Custom role</Label>
                            <Input
                                placeholder="e.g. Senior Retoucher"
                                onKeyDown={(e: React.KeyboardEvent) => {
                                    if (e.key === "Enter") addCustomRole();
                                }}
                            />
                        </TextField>
                        <Button
                            variant="secondary"
                            size="sm"
                            onPress={addCustomRole}
                            isDisabled={!newCustomRole.trim()}
                            className="shrink-0 self-end mb-0.5"
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </FormSection>

            {/* ── Section 2: Permission Matrix ─────────────────────────── */}
            <FormSection
                title="Permissions"
                description="Fine-tune CRUD permissions per module. These override role defaults."
                isDirty={isPermDirty}
                onCancel={handleCancel}
                onSave={handleSave}
                isSaving={isSaving}
                showActions={false}
            >
                <Card className="p-0 overflow-hidden">
                    <Card.Content className="p-0 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-default-200 bg-default/40">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-default-500 w-40">
                                        Module
                                    </th>
                                    {CRUD_OPERATIONS.map((op) => (
                                        <th
                                            key={op.id}
                                            className="text-left px-3 py-3 text-xs font-semibold text-default-500"
                                        >
                                            {op.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PERMISSION_MODULES.map((mod, idx) => (
                                    <tr
                                        key={mod.id}
                                        className={idx % 2 === 0 ? "" : "bg-default/20"}
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                                            {mod.label}
                                        </td>
                                        {CRUD_OPERATIONS.map((op) => (
                                            <td
                                                key={op.id}
                                                className="text-left px-3 py-2"
                                            >
                                                <Checkbox
                                                    variant="secondary"
                                                    isSelected={getPermission(mod.id, op.id)}
                                                    onChange={(v: boolean) =>
                                                        togglePermission(mod.id, op.id, v)
                                                    }
                                                    aria-label={`${mod.label} ${op.label}`}
                                                >
                                                    <Checkbox.Control>
                                                        <Checkbox.Indicator />
                                                    </Checkbox.Control>
                                                </Checkbox>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card.Content>
                </Card>
            </FormSection>

            {/* Shared action row for the whole tab */}
            <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onPress={handleCancel}
                    isDisabled={!isDirty || isSaving}
                >
                    Cancel
                </Button>
                <Button
                    size="sm"
                    onPress={handleSave}
                    isDisabled={!isDirty || isSaving}
                >
                    {isSaving ? "Saving…" : "Save changes"}
                </Button>
            </div>
        </div>
    );
}
