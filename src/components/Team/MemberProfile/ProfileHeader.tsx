import { useState } from "react";
import { Avatar, Breadcrumbs, Button, Chip, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "@tanstack/react-router";
import {
    PROFILE_BANNER_HEIGHT,
    PROFILE_AVATAR_SIZE,
    PROFILE_AVATAR_RING,
    COPY_FEEDBACK_DURATION_MS,
    FLEX_COL_GAP_1_5,
    ICON_SIZE_SM,
} from "../../../constants/ui-tokens";
import { ROLE_LABEL_MAP } from "../../../types/team";
import type { TeamMemberStatus } from "../../../types/team";
import type { SplTeamMemberProfile } from "../../../types/team-profile";
import { AvatarUploadOverlay } from "./AvatarUploadOverlay";
import { AvatarUploadModal } from "./AvatarUploadModal";

interface ProfileHeaderProps {
    profile: SplTeamMemberProfile;
}

const STATUS_CHIP_COLOR: Record<
    TeamMemberStatus,
    "success" | "warning" | "danger"
> = {
    active: "success",
    paused: "warning",
    inactive: "danger",
};

const STATUS_LABEL: Record<TeamMemberStatus, string> = {
    active: "Active",
    paused: "Paused",
    inactive: "Inactive",
};

/**
 * ProfileHeader — Full-bleed gradient banner with:
 * - Breadcrumb nav strip overlaid at the top of the banner (Option A inline nav)
 * - Avatar + name/email/chips row at the bottom-left of the banner
 * - Avatar upload overlay (hover) + modal (click)
 * - Copy link button at the top-right
 */
export function ProfileHeader({ profile }: ProfileHeaderProps) {
    const { personalInfo } = profile;
    const initials = `${personalInfo.firstName[0] ?? ""}${personalInfo.lastName[0] ?? ""}`.toUpperCase();
    const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`;
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const statusColor = STATUS_CHIP_COLOR[profile.status];
    const roleLabel = ROLE_LABEL_MAP[profile.role];
    const statusLabel = STATUS_LABEL[profile.status];

    // The avatar source is driven by the TanStack Query cache (optimistically
    // updated by useAvatarUpload after a successful save/remove).
    const avatarSrc = personalInfo.avatarUrl ?? null;

    return (
        <div className="mb-8 relative">
            {/* Gradient banner */}
            <div className={`${PROFILE_BANNER_HEIGHT} rounded-xl profile-banner`} />

            {/* Nav strip — frosted pill; .profile-nav CSS in index.css forces white breadcrumb colors on both themes */}
            <div className="profile-nav absolute top-4 left-4 flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-lg px-1 py-0.5">
                <Tooltip delay={300}>
                    <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        onPress={() => void navigate({ to: "/people" })}
                        aria-label="Back to Team Directory"
                    >
                        <Icon icon="lucide:arrow-left" className={ICON_SIZE_SM} />
                    </Button>
                    <Tooltip.Content>
                        <p>Back to Team Directory</p>
                    </Tooltip.Content>
                </Tooltip>
                <Breadcrumbs className="text-xs pr-1">
                    <Breadcrumbs.Item>Administration</Breadcrumbs.Item>
                    <Breadcrumbs.Item href="/people">Team Directory</Breadcrumbs.Item>
                    <Breadcrumbs.Item>{fullName}</Breadcrumbs.Item>
                </Breadcrumbs>
            </div>

            {/* Avatar + name/email/chips row — bottom-left of banner */}
            <div className="absolute bottom-5 left-8 right-[13rem] flex items-center gap-4">
                {/* Avatar wrapper — group enables hover overlay */}
                <div className={`relative group shrink-0 ${PROFILE_AVATAR_SIZE}`}>
                    <Avatar
                        className={`${PROFILE_AVATAR_SIZE} ${PROFILE_AVATAR_RING} shadow-lg`}
                        color="accent"
                    >
                        {avatarSrc ? (
                            <Avatar.Image src={avatarSrc} alt={fullName} />
                        ) : null}
                        <Avatar.Fallback className="text-xl font-black">
                            {initials}
                        </Avatar.Fallback>
                    </Avatar>

                    <AvatarUploadOverlay
                        hasAvatar={Boolean(avatarSrc)}
                        onPress={() => setIsModalOpen(true)}
                    />
                </div>

                <div className={FLEX_COL_GAP_1_5}>
                    <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
                        {fullName}
                    </h1>
                    <p className="text-sm text-white/75">{personalInfo.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Chip size="sm" variant="soft">
                            <Chip.Label>{roleLabel}</Chip.Label>
                        </Chip>
                        <Chip size="sm" variant="soft" color={statusColor}>
                            <Icon icon="lucide:circle" className="w-1.5 h-1.5" />
                            <Chip.Label>{statusLabel}</Chip.Label>
                        </Chip>
                    </div>
                </div>
            </div>

            {/* Copy link button — top-right of banner */}
            <div className="absolute top-4 right-4">
                <Tooltip delay={300}>
                    <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        className="bg-white/15 backdrop-blur-sm text-white hover:bg-white/25"
                        aria-label={copied ? "Link copied" : "Copy profile link"}
                        onPress={async () => {
                            try {
                                await navigator.clipboard.writeText(window.location.href);
                                setCopied(true);
                                setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
                            } catch {
                                // Clipboard write failed (e.g. permissions denied) — fail silently
                            }
                        }}
                    >
                        <Icon
                            icon={copied ? "lucide:check" : "lucide:link"}
                            className={ICON_SIZE_SM}
                        />
                    </Button>
                    <Tooltip.Content>
                        <p>{copied ? "Copied!" : "Copy profile link"}</p>
                    </Tooltip.Content>
                </Tooltip>
            </div>

            {/* Avatar upload modal — rendered outside the avatar wrapper to avoid z-index issues */}
            <AvatarUploadModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                memberId={profile.id}
                hasAvatar={Boolean(avatarSrc)}
            />
        </div>
    );
}
