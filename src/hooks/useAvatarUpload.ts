import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { convertHeicToJpeg } from "../utils/convert-heic";
import {
    AVATAR_ACCEPTED_TYPES,
    AVATAR_MAX_SIZE_BYTES,
    AVATAR_MIN_DIMENSION_PX,
} from "../constants/avatar-upload";
import { MOCK_API_DELAY } from "../constants/query-config";
import type { SplTeamMemberProfile } from "../types/team-profile";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseAvatarUploadOptions {
    memberId: string;
}

interface UseAvatarUploadReturn {
    /**
     * Validate a selected file, convert HEIC if needed, and return an object URL
     * suitable for use in the crop step.
     *
     * Returns `null` and sets `validationError` if the file is invalid.
     * Sets `isConverting` to true while HEIC conversion runs.
     *
     * NOTE: The caller is responsible for revoking the returned object URL
     * when it is no longer needed (e.g. on modal close or new file selection).
     */
    prepareFile: (file: File) => Promise<string | null>;
    /** Persist the cropped blob (or null to remove the avatar). */
    mutate: (blob: Blob | null) => Promise<void>;
    /** True while HEIC conversion is in progress. */
    isConverting: boolean;
    /** True while the mock save mutation is running. */
    isPending: boolean;
    /** Validation error message to display inline, or null when valid. */
    validationError: string | null;
    /** Clear any existing validation error. */
    clearValidationError: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages avatar file validation, HEIC conversion, and mock persistence
 * for the avatar upload flow.
 *
 * - Validates MIME type, file size, and minimum pixel dimensions.
 * - Converts HEIC/HEIF files to JPEG via `heic2any` before cropping.
 * - Persists by creating an object URL and optimistically updating the
 *   TanStack Query cache for `["teamMember", memberId]`.
 * - Fires `toast.success()` on save and on removal.
 */
export function useAvatarUpload({ memberId }: UseAvatarUploadOptions): UseAvatarUploadReturn {
    const queryClient = useQueryClient();

    const [isConverting, setIsConverting] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // ─── File preparation (validate + HEIC convert) ────────────────────────────

    const prepareFile = useCallback(async (file: File): Promise<string | null> => {
        setValidationError(null);

        // 1. MIME type check
        const isAccepted = (AVATAR_ACCEPTED_TYPES as readonly string[]).includes(file.type);
        if (!isAccepted) {
            setValidationError("Please upload a JPG, PNG, WebP, or HEIC image.");
            return null;
        }

        // 2. File size check
        if (file.size > AVATAR_MAX_SIZE_BYTES) {
            setValidationError("Image must be under 10 MB.");
            return null;
        }

        // 3. HEIC → JPEG conversion (browser cannot decode HEIC natively)
        let blob: Blob = file;
        if (file.type === "image/heic" || file.type === "image/heif") {
            setIsConverting(true);
            try {
                blob = await convertHeicToJpeg(file);
            } catch {
                setIsConverting(false);
                setValidationError("Failed to convert HEIC image. Please try another format.");
                return null;
            }
            setIsConverting(false);
        }

        // 4. Minimum dimension check (requires loading the image)
        const objectUrl = URL.createObjectURL(blob);
        const meetsMinDimension = await checkMinDimensions(objectUrl);
        if (!meetsMinDimension) {
            URL.revokeObjectURL(objectUrl);
            setValidationError(
                `Image must be at least ${AVATAR_MIN_DIMENSION_PX} × ${AVATAR_MIN_DIMENSION_PX} pixels.`,
            );
            return null;
        }

        return objectUrl;
    }, []);

    // ─── Mutation (save or remove avatar) ────────────────────────────────────

    const mutate = useCallback(
        async (blob: Blob | null): Promise<void> => {
            setIsPending(true);

            try {
                // Simulate network latency
                await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));

                // Revoke the previous blob URL to avoid memory leaks
                const prevUrl = queryClient.getQueryData<SplTeamMemberProfile>(
                    ["teamMember", memberId],
                )?.personalInfo.avatarUrl;
                if (prevUrl?.startsWith("blob:")) {
                    URL.revokeObjectURL(prevUrl);
                }

                const newUrl = blob ? URL.createObjectURL(blob) : null;

                // Optimistic cache update
                queryClient.setQueryData<SplTeamMemberProfile>(
                    ["teamMember", memberId],
                    (prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            personalInfo: {
                                ...prev.personalInfo,
                                avatarUrl: newUrl,
                            },
                        };
                    },
                );

                if (blob) {
                    toast.success("Profile photo updated", {
                        description: "Your new photo is now visible.",
                    });
                } else {
                    toast.success("Profile photo removed", {
                        description: "Your initials will be shown instead.",
                    });
                }
            } finally {
                setIsPending(false);
            }
        },
        [memberId, queryClient],
    );

    const clearValidationError = useCallback(() => setValidationError(null), []);

    return {
        prepareFile,
        mutate,
        isConverting,
        isPending,
        validationError,
        clearValidationError,
    };
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Loads an image from an object URL and checks whether both dimensions
 * meet the minimum requirement. Revocation of the URL is the caller's
 * responsibility only if this returns false; callers keep the URL alive
 * when it returns true.
 */
function checkMinDimensions(src: string): Promise<boolean> {
    return new Promise((resolve) => {
        const img = new Image();
        img.addEventListener("load", () => {
            resolve(
                img.naturalWidth >= AVATAR_MIN_DIMENSION_PX &&
                img.naturalHeight >= AVATAR_MIN_DIMENSION_PX,
            );
        });
        img.addEventListener("error", () => resolve(false));
        img.src = src;
    });
}
