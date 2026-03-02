import { useState } from "react";
import {
    Input,
    Label,
    TextField,
    FieldError,
    Chip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import type { SplTeamMemberProfile } from "../../../types/team-profile";
import { FormSection } from "./FormSection";
import {
    FLEX_COL_GAP_3,
    FLEX_COL_GAP_4,
    TEXT_FIELD_LABEL,
    CONTAINER_INFO_ITEM,
} from "../../../constants/ui-tokens";
import { formatRelativeTime } from "../../../utils/format-time";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PasswordTabProps {
    profile: SplTeamMemberProfile;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MIN_PASSWORD_LENGTH = 8;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PasswordTab — "Password" tab on the Member Profile page.
 *
 * Two sections:
 *  1. Change Password — current / new / confirm fields with validation
 *  2. Active Sessions — read-only list with device, location, last active
 */
export function PasswordTab({ profile }: PasswordTabProps) {
    // ── Section 1: Change Password state ───────────────────────────────────
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const isDirty =
        currentPwd.length > 0 ||
        newPwd.length > 0 ||
        confirmPwd.length > 0;

    const isNewPwdTooShort = newPwd.length > 0 && newPwd.length < MIN_PASSWORD_LENGTH;
    const isMismatch = confirmPwd.length > 0 && confirmPwd !== newPwd;
    const isFormValid =
        currentPwd.length > 0 &&
        newPwd.length >= MIN_PASSWORD_LENGTH &&
        !isMismatch;

    function handleCancel() {
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
    }

    function handleSave() {
        if (!isFormValid) return;
        setIsSaving(true);
        // TODO: trigger toast notification on successful save (deferred until real API integration)
        setTimeout(() => {
            setIsSaving(false);
            handleCancel();
        }, 800);
    }

    return (
        <div className={FLEX_COL_GAP_4}>
            {/* ── Section 1: Change Password ───────────────────────────── */}
            <FormSection
                title="Change password"
                description="Use a strong password with at least 8 characters."
                isDirty={isDirty}
                onCancel={handleCancel}
                onSave={handleSave}
                isSaving={isSaving}
                saveLabel="Update password"
                isFirst
            >
                {/* Current password */}
                <TextField
                    fullWidth
                    isRequired
                    name="currentPassword"
                    type="password"
                    value={currentPwd}
                    onChange={setCurrentPwd}
                >
                    <Label className={TEXT_FIELD_LABEL}>Current password</Label>
                    <Input placeholder="••••••••" />
                </TextField>

                {/* New password */}
                <TextField
                    fullWidth
                    isRequired
                    isInvalid={isNewPwdTooShort}
                    name="newPassword"
                    type="password"
                    value={newPwd}
                    onChange={setNewPwd}
                >
                    <Label className={TEXT_FIELD_LABEL}>New password</Label>
                    <Input placeholder="••••••••" />
                    {isNewPwdTooShort && (
                        <FieldError>
                            Password must be at least {MIN_PASSWORD_LENGTH} characters.
                        </FieldError>
                    )}
                </TextField>

                {/* Confirm new password */}
                <TextField
                    fullWidth
                    isRequired
                    isInvalid={isMismatch}
                    name="confirmPassword"
                    type="password"
                    value={confirmPwd}
                    onChange={setConfirmPwd}
                >
                    <Label className={TEXT_FIELD_LABEL}>Confirm new password</Label>
                    <Input placeholder="••••••••" />
                    {isMismatch && (
                        <FieldError>Passwords do not match.</FieldError>
                    )}
                </TextField>
            </FormSection>

            {/* ── Section 2: Active Sessions ────────────────────────────── */}
            <FormSection
                title="Active sessions"
                description="These are the devices currently signed in to your account."
                isDirty={false}
                onCancel={() => { }}
                onSave={() => { }}
                showActions={false}
            >
                <div className={FLEX_COL_GAP_3}>
                    {profile.activeSessions.map((session) => (
                        <div
                            key={session.id}
                            className={`${CONTAINER_INFO_ITEM} flex items-center gap-4`}
                        >
                            {/* Device icon */}
                            <div className="shrink-0 size-9 rounded-full bg-default flex items-center justify-center">
                                <Icon
                                    icon={
                                        session.device
                                            .toLowerCase()
                                            .includes("mobile") ||
                                            session.device
                                                .toLowerCase()
                                                .includes("iphone") ||
                                            session.device
                                                .toLowerCase()
                                                .includes("android")
                                            ? "lucide:smartphone"
                                            : "lucide:monitor"
                                    }
                                    className="size-4 text-default-500"
                                />
                            </div>

                            {/* Device + location */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {session.device}
                                    </p>
                                    {session.isCurrent && (
                                        <Chip
                                            size="sm"
                                            variant="soft"
                                            color="success"
                                        >
                                            Active now
                                        </Chip>
                                    )}
                                </div>
                                <p className="text-xs text-default-500 mt-0.5">
                                    {session.location}
                                </p>
                            </div>

                            {/* Last active */}
                            <p className="text-xs text-default-400 shrink-0">
                                {session.isCurrent
                                    ? "Now"
                                    : formatRelativeTime(session.lastActive)}
                            </p>
                        </div>
                    ))}
                </div>
            </FormSection>
        </div>
    );
}
