import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mockOrderData } from "../data/mock-order";
import type { AssignedLead } from "../types/order";

async function updateAssignedLead(payload: AssignedLead | null): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));
    mockOrderData.assignedLead = payload;
}

export function useUpdateAssignedLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAssignedLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["order"] });
        },
    });
}
