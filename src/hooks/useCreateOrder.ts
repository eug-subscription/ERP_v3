import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "@heroui/react";
import { createOrder } from "../data/mock-create-order";
import type { CreateOrderPayload } from "../types/order";

export function useCreateOrder() {
    const navigate = useNavigate();

    const { mutate, isPending } = useMutation({
        mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
        onSuccess: () => {
            toast.success("Order created");
            void navigate({ to: "/overview" });
        },
        onError: () => {
            toast.danger("Could not create order. Please try again.");
        },
    });

    return { mutate, isPending };
}
