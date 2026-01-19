import { useQuery } from "@tanstack/react-query";
import { mockTimelineEvents, TimelineEvent } from "../data/mock-timeline";

async function fetchTimelineEvents(): Promise<TimelineEvent[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 450));
    return mockTimelineEvents;
}

export function useTimeline() {
    return useQuery({
        queryKey: ["timeline"],
        queryFn: fetchTimelineEvents,
    });
}
