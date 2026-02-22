import { useQuery } from '@tanstack/react-query';
import { ActivityLogEvent } from '../types/activity-log';
import { mockActivityLogEvents } from '../data/mock-activity-log';
import { DEFAULT_STALE_TIME, MOCK_API_DELAY } from '../constants/query-config';

async function fetchActivityLog(orderId: string): Promise<ActivityLogEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    return mockActivityLogEvents.filter((event) => event.orderId === orderId);
}

export function useActivityLog(orderId: string) {
    return useQuery({
        queryKey: ['activity-log', orderId],
        queryFn: () => fetchActivityLog(orderId),
        staleTime: DEFAULT_STALE_TIME,
        enabled: !!orderId,
    });
}
