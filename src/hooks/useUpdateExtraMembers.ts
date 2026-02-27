import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mockOrderData } from "../data/mock-order";
import type { ExtraMember } from "../types/order";

async function updateExtraMembers(payload: ExtraMember[]): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    mockOrderData.extraMembers = payload;
}

export function useUpdateExtraMembers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateExtraMembers,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["order"] });
        },
    });
}
