import type { ShotListStatus } from "../types/shot-list";

export const SHOT_LIST_STATUS_CONFIG: Record<
    ShotListStatus,
    { label: string; color: "default" | "accent" | "success" | "warning" | "danger" }
> = {
    "await-uploading": { label: "Await uploading", color: "warning" },
    "await-moderation": { label: "Await moderation", color: "accent" },
    "approved": { label: "Approved", color: "success" },
    "rejected": { label: "Rejected", color: "danger" },
    "processing": { label: "Processing", color: "accent" },
    "completed": { label: "Completed", color: "success" },
};

/** Filter tab labels — extends status labels with the "all" sentinel. */
export const SHOT_LIST_STATUS_FILTER_LABELS: Record<"all" | ShotListStatus, string> = {
    all: "All",
    ...(Object.fromEntries(
        Object.entries(SHOT_LIST_STATUS_CONFIG).map(([k, v]) => [k, v.label])
    ) as Record<ShotListStatus, string>),
};
