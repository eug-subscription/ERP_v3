import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mockOrderData } from "../data/mock-order";

async function updateOrderName(name: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    mockOrderData.orderName = name;
}

export function useUpdateOrderName() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateOrderName,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["order"] });
        },
    });
}
