import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mockOrderData } from "../data/mock-order";
import type { OrderTag } from "../data/mock-order";

async function updateTags(payload: OrderTag[]): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    mockOrderData.tags = payload;
}

export function useUpdateTags() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateTags,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["order"] });
        },
    });
}
