export interface TimelineEvent {
    id: string;
    date: string;
    title: string;
    description: string;
    type: "success" | "info" | "warning" | "danger";
    icon: string;
}

export const mockTimelineEvents: TimelineEvent[] = [
    {
        id: "1",
        date: "20 Jan, 2023",
        title: "Photos are ready and were sent to Micky Mouse",
        description: "Photos were processed by artistic assistant Natiq Neytonovich",
        type: "success",
        icon: "lucide:image",
    },
    {
        id: "2",
        date: "18 Jan, 2023",
        title: "7 photos from Heinz have been successfully uploaded",
        description: "Photos were processed by executive Heinz Steinbauer",
        type: "info",
        icon: "lucide:check-circle",
    },
    {
        id: "3",
        date: "15 Jan, 2023",
        title: "Original photos have been uploaded",
        description: "Photos were uploaded via the Food Web App",
        type: "info",
        icon: "lucide:upload-cloud",
    },
    {
        id: "4",
        date: "12 Jan, 2023",
        title: "Order was created",
        description: "The order was created via the Web Germany manager",
        type: "info",
        icon: "lucide:clipboard-check",
    },
];
