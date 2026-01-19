import { useQuery } from "@tanstack/react-query";
import { mockMessages, Message } from "../data/mock-messages";

async function fetchMessages(): Promise<Message[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockMessages;
}

export function useMessages() {
    return useQuery({
        queryKey: ["messages"],
        queryFn: fetchMessages,
    });
}
