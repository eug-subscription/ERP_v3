import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mockOrderData } from "../data/mock-order";
import type { ContactPayload } from "../types/order";

interface UpdateContactsPayload {
    contact: ContactPayload;
    secondaryContact: ContactPayload | null;
}

async function updateContacts(payload: UpdateContactsPayload): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));
    mockOrderData.contact = payload.contact;
    mockOrderData.secondaryContact = payload.secondaryContact;
}

export function useUpdateContacts() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateContacts,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["order"] });
        },
    });
}
