import { Skeleton } from "@heroui/react";
import {
    PROFILE_BANNER_HEIGHT,
    PROFILE_AVATAR_SIZE,
    PROFILE_AVATAR_RING,
    SKELETON_TEXT_HEIGHT,
    SKELETON_TAB_HEIGHT,
    SKELETON_TAB_WIDTH,
    DENSITY_CONTROL_HEIGHT,
    SKELETON_LABEL_HEIGHT,
    SKELETON_FIELD_HEIGHT,
    FLEX_COL_GAP_1_5,
} from "../../../constants/ui-tokens";

/**
 * MemberProfileSkeleton — Loading state placeholder for the profile page.
 * Mirrors Option A "inline nav" layout: breadcrumb skeletons live inside the
 * banner overlay at the top-left, same as ProfileHeader.
 * Uses PROFILE_* tokens so geometry stays in sync with ProfileHeader.
 */
export function MemberProfileSkeleton() {
    return (
        <div className="animate-fadeIn">
            {/* Banner */}
            <div className="relative mb-8">
                <Skeleton className={`${PROFILE_BANNER_HEIGHT} w-full rounded-xl`} />

                {/* Nav strip skeleton — back button + breadcrumb trail inside banner top */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="h-4 w-52 rounded-lg" />
                </div>

                {/* Avatar + name/email/chips row skeleton inside banner bottom */}
                <div className="absolute bottom-5 left-8 flex items-center gap-4">
                    <Skeleton className={`${PROFILE_AVATAR_SIZE} rounded-full ${PROFILE_AVATAR_RING} shrink-0`} />
                    <div className={FLEX_COL_GAP_1_5}>
                        <Skeleton className={`${DENSITY_CONTROL_HEIGHT} w-48 rounded-lg`} />
                        <Skeleton className={`${SKELETON_TEXT_HEIGHT} w-40 rounded-lg`} />
                        <div className="flex gap-2 mt-0.5">
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-5 w-14 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Copy button skeleton top-right */}
                <div className="absolute top-4 right-4">
                    <Skeleton className="size-8 rounded-lg" />
                </div>
            </div>

            {/* Tab bar */}
            <div className="pl-8 flex gap-2 mb-8 border-b border-default-200 pb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className={`${SKELETON_TAB_HEIGHT} ${SKELETON_TAB_WIDTH} rounded-lg`} />
                ))}
            </div>

            {/* Content block */}
            <div className="space-y-4">
                <Skeleton className={`${SKELETON_LABEL_HEIGHT} w-40 rounded-lg`} />
                <Skeleton className={`${SKELETON_FIELD_HEIGHT} w-full rounded-xl`} />
                <Skeleton className={`${SKELETON_FIELD_HEIGHT} w-full rounded-xl`} />
                <Skeleton className={`${SKELETON_FIELD_HEIGHT} w-3/4 rounded-xl`} />
            </div>
        </div>
    );
}
