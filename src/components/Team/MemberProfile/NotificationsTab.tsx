import { useState } from "react";
import { Switch, Separator, Button } from "@heroui/react";
import type { SplTeamMemberProfile, NotificationPreference } from "../../../types/team-profile";
import {
    NOTIFICATION_CATEGORIES,
} from "../../../types/team-profile";
import type { NotificationChannel, NotificationCategoryId } from "../../../types/team-profile";
import {
    FLEX_COL_GAP_4,
    TEXT_SUBSECTION_LABEL,
    TEXT_TAB_HEADING,
} from "../../../constants/ui-tokens";

// ─── Notification channels shown as columns ───────────────────────────────────

const CHANNELS: { id: NotificationChannel; label: string }[] = [
    { id: "push", label: "Push" },
    { id: "email", label: "Email" },
    { id: "sms", label: "SMS" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationsTabProps {
    profile: SplTeamMemberProfile;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * NotificationsTab — "Notifications" tab on the Member Profile page.
 *
 * Displays 10 notification categories, each with Push / Email / SMS toggles.
 * Single Cancel / Save at the bottom.
 */
export function NotificationsTab({ profile }: NotificationsTabProps) {
    const [preferences, setPreferences] = useState<NotificationPreference[]>(
        profile.notificationPreferences,
    );
    const [isSaving, setIsSaving] = useState(false);

    const isDirty =
        JSON.stringify(preferences) !==
        JSON.stringify(profile.notificationPreferences);

    function handleCancel() {
        setPreferences(profile.notificationPreferences);
    }

    function handleSave() {
        setIsSaving(true);
        // TODO: trigger toast notification on successful save (deferred until real API integration)
        setTimeout(() => setIsSaving(false), 800);
    }

    function toggleChannel(
        categoryId: NotificationCategoryId,
        channel: NotificationChannel,
        value: boolean,
    ) {
        setPreferences((prev) =>
            prev.map((pref) =>
                pref.categoryId === categoryId
                    ? {
                        ...pref,
                        channels: { ...pref.channels, [channel]: value },
                    }
                    : pref,
            ),
        );
    }

    function getChannel(
        categoryId: NotificationCategoryId,
        channel: NotificationChannel,
    ): boolean {
        return (
            preferences.find((p) => p.categoryId === categoryId)?.channels[
            channel
            ] ?? false
        );
    }

    return (
        <div className={FLEX_COL_GAP_4}>
            {/* Header */}
            <div>
                <h2 className={TEXT_TAB_HEADING}>
                    Notification settings
                </h2>
                <p className="mt-1 text-sm text-default-500">
                    Choose how you want to be notified across different activity
                    categories.
                </p>
            </div>

            {/* Channel headers */}
            <div className="flex items-center gap-4 pb-2 border-b border-default-200">
                <div className="flex-1" />
                {CHANNELS.map((ch) => (
                    <span
                        key={ch.id}
                        className="w-16 text-center text-xs font-semibold text-default-500 uppercase tracking-wide"
                    >
                        {ch.label}
                    </span>
                ))}
            </div>

            {/* Category rows */}
            <div className="flex flex-col">
                {NOTIFICATION_CATEGORIES.map((category, idx) => (
                    <div key={category.id}>
                        {idx > 0 && <Separator />}
                        <div className="flex items-center gap-4 py-4">
                            {/* Left: category info */}
                            <div className="flex-1 min-w-0">
                                <p className={TEXT_SUBSECTION_LABEL}>
                                    {category.label}
                                </p>
                                <p className="mt-0.5 text-xs text-default-500 leading-snug">
                                    {category.description}
                                </p>
                            </div>

                            {/* Right: switches per channel */}
                            {CHANNELS.map((ch) => (
                                <div
                                    key={ch.id}
                                    className="w-16 flex justify-center"
                                >
                                    <Switch
                                        isSelected={getChannel(
                                            category.id,
                                            ch.id,
                                        )}
                                        onChange={(v) =>
                                            toggleChannel(
                                                category.id,
                                                ch.id,
                                                v,
                                            )
                                        }
                                        size="sm"
                                        aria-label={`${category.label} ${ch.label}`}
                                    >
                                        <Switch.Control>
                                            <Switch.Thumb />
                                        </Switch.Control>
                                    </Switch>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Single Cancel / Save at bottom */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-default-200">
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
