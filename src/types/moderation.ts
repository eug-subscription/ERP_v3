export interface ModerationEntry {
    id: number;
    stage: string;
    inputFileCount: number;
    batchLabel?: string;
    approved: number;
    rejected: number;
    date: string; // ISO 8601
    userName: string;
    userRole: "Moderator" | "Client";
}
