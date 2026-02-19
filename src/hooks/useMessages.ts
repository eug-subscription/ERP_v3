import { useQuery } from "@tanstack/react-query";
import { mockMessages, Message } from "../data/mock-messages";
import { DEFAULT_STALE_TIME, MOCK_API_DELAY } from "../constants/query-config";

async function fetchMessages(): Promise<Message[]> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    return mockMessages;
}

export function useMessages() {
    return useQuery({
        queryKey: ["messages"],
        queryFn: fetchMessages,
        staleTime: DEFAULT_STALE_TIME,
    });
}
