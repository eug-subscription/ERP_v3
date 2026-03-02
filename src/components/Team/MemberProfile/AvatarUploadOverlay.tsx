import { Icon } from "@iconify/react";
import { AVATAR_OVERLAY_BG, PROFILE_AVATAR_SIZE } from "../../../constants/ui-tokens";

interface AvatarUploadOverlayProps {
    /** Whether the member currently has an avatar (changes label text). */
    hasAvatar: boolean;
    /** Called when the user presses the overlay to open the upload modal. */
    onPress: () => void;
}

/**
 * AvatarUploadOverlay — semi-transparent hover overlay rendered on top of the
 * Avatar in ProfileHeader.
 *
 * - Appears on `group-hover` of the parent `div.group` wrapper.
 * - Also visible on focus (keyboard accessibility) via `:focus-visible`.
 * - Label adapts: "Change Photo" when an avatar exists, "Add Photo" otherwise.
 */
export function AvatarUploadOverlay({ hasAvatar, onPress }: AvatarUploadOverlayProps) {
    const label = hasAvatar ? "Change Photo" : "Add Photo";

    return (
        <button
            type="button"
            aria-label="Change profile photo"
            onClick={onPress}
            className={[
                "absolute inset-0",
                PROFILE_AVATAR_SIZE,
                AVATAR_OVERLAY_BG,
                "rounded-full",
                "flex flex-col items-center justify-center gap-1",
                "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
                "transition-opacity duration-200",
                "cursor-pointer",
                "outline-none",
                "ring-0 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
            ].join(" ")}
        >
            <Icon icon="lucide:camera" className="w-5 h-5 text-white" aria-hidden />
            <span className="text-[10px] font-semibold text-white leading-none tracking-wide">
                {label}
            </span>
        </button>
    );
}
