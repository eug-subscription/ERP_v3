export type ShotListStatus =
    | "await-uploading"
    | "await-moderation"
    | "approved"
    | "rejected"
    | "processing"
    | "completed";

export type ShotListCreatorRole = "Moderator" | "Client";

export interface ShotListItem {
    id: number;
    externalId: string;
    name: string;
    images: string[];
    status: ShotListStatus;
    creatorName: string;
    creatorRole: ShotListCreatorRole;
    createdAt: string; // ISO 8601
}
