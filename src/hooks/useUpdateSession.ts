import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mockOrderData } from "../data/mock-order";
import type { AddressPayload } from "../types/order";
import type { CalendarDateTime } from "@internationalized/date";

interface UpdateSessionPayload {
    sessionTime: CalendarDateTime | null;
    address: AddressPayload | null;
}

async function updateSession(payload: UpdateSessionPayload): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));
    mockOrderData.sessionTime = payload.sessionTime;
    mockOrderData.address = payload.address;
}

export function useUpdateSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["order"] });
        },
    });
}
