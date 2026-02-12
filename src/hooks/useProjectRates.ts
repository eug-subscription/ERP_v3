import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { ServiceConfig, Rate, NewRateData, DEFAULT_NEW_RATE } from "../data/mock-project";

interface UseProjectRatesParams {
    serviceConfigs: ServiceConfig[];
    setServiceConfigs: Dispatch<SetStateAction<ServiceConfig[]>>;
    rates: Rate[];
    createdRateIds: string[];
    setCreatedRateIds: Dispatch<SetStateAction<string[]>>;
}

/**
 * Manages core rate CRUD operations for the Project page.
 * Handles rate creation, editing, updating, and deletion.
 */
export function useProjectRates({
    serviceConfigs,
    setServiceConfigs,
    rates,
    createdRateIds,
    setCreatedRateIds,
}: UseProjectRatesParams) {
    const [editingRateId, setEditingRateId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const updateRate = useCallback((
        serviceId: string,
        rateType: "client" | "provider",
        rateId: string
    ) => {
        setServiceConfigs((prev) => {
            const existing = prev.find((c) => c.type === serviceId);
            if (existing) {
                return prev.map((c) => {
                    if (c.type !== serviceId) return c;
                    return rateType === "client"
                        ? { ...c, clientRateIds: [rateId] }
                        : { ...c, providerRateId: rateId };
                });
            }
            return [...prev, {
                id: `s-${serviceId}`,
                type: serviceId,
                isEnabled: true,
                clientRateIds: rateType === "client" ? [rateId] : undefined,
                providerRateId: rateType === "provider" ? rateId : undefined,
                clientRateMode: "existing",
                providerRateMode: "existing",
            }];
        });
    }, [setServiceConfigs]);

    const updateRateMode = useCallback((
        serviceId: string,
        rateType: "client" | "provider",
        mode: "existing" | "new"
    ) => {
        setServiceConfigs((prev) => {
            const existing = prev.find((c) => c.type === serviceId);
            const defaultNewRate = DEFAULT_NEW_RATE;

            if (existing) {
                return prev.map((c) => {
                    if (c.type !== serviceId) return c;
                    if (rateType === "client") {
                        return {
                            ...c,
                            clientRateMode: mode,
                            newClientRate: mode === "new" && !c.newClientRate ? defaultNewRate : c.newClientRate
                        };
                    } else {
                        return {
                            ...c,
                            providerRateMode: mode,
                            newProviderRate: mode === "new" && !c.newProviderRate ? defaultNewRate : c.newProviderRate
                        };
                    }
                });
            }
            return [...prev, {
                id: `s-${serviceId}`,
                type: serviceId,
                isEnabled: true,
                clientRateMode: rateType === "client" ? mode : "existing",
                providerRateMode: rateType === "provider" ? mode : "existing",
                newClientRate: rateType === "client" && mode === "new" ? defaultNewRate : undefined,
                newProviderRate: rateType === "provider" && mode === "new" ? defaultNewRate : undefined,
            }];
        });
    }, [setServiceConfigs]);

    const updateNewRateField = useCallback((
        serviceId: string,
        rateType: "client" | "provider",
        field: keyof NewRateData,
        value: string | number
    ) => {
        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== serviceId) return c;

                const dataField = rateType === "client" ? "newClientRate" : "newProviderRate";
                return {
                    ...c,
                    [dataField]: {
                        ...(c[dataField] || DEFAULT_NEW_RATE),
                        [field]: value,
                    },
                };
            })
        );
    }, [setServiceConfigs]);

    const createRate = useCallback((
        serviceId: string,
        rateType: "client" | "provider"
    ) => {
        const config = serviceConfigs.find((c) => c.type === serviceId);
        if (!config) return;

        const rateData = rateType === "client" ? config.newClientRate : config.newProviderRate;

        if (!rateData?.name) return;

        const newRate: Rate = {
            id: `r-${Date.now()}`,
            name: rateData.name,
            currency: rateData.currency || "USD",
            amount: rateData.amount ?? 1,
            unit: rateData.unit || "per hour",
            createdDate: new Date().toISOString(),
        };

        // Update rates list in cache
        queryClient.setQueryData<Rate[]>(["rates"], (old) => (old ? [...old, newRate] : [newRate]));

        // Track this rate as created in this session
        setCreatedRateIds((prev) => [...prev, newRate.id]);

        // Update config to switch back to existing mode and select the new rate
        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== serviceId) return c;
                if (rateType === "client") {
                    return {
                        ...c,
                        clientRateMode: "existing",
                        clientRateIds: [newRate.id],
                        newClientRate: undefined,
                    };
                } else {
                    return {
                        ...c,
                        providerRateMode: "existing",
                        providerRateId: newRate.id,
                        newProviderRate: undefined,
                    };
                }
            })
        );

        toast.success("Rate created!", {
            description: `Rate "${newRate.name}" has been added to ${serviceId.split("-").join(" ")}.`,
        });
    }, [serviceConfigs, queryClient, setCreatedRateIds, setServiceConfigs]);

    /**
     * Delete a created rate - only works for rates created in this session
     */
    const deleteCreatedRate = useCallback((rateId: string) => {
        // Only allow deletion of rates created in this session
        if (!createdRateIds.includes(rateId)) return;

        // Remove from cache
        queryClient.setQueryData<Rate[]>(["rates"], (old) =>
            old?.filter((r) => r.id !== rateId) || []
        );

        // Remove from created IDs
        setCreatedRateIds((prev) => prev.filter((id) => id !== rateId));

        // Remove from any service configs that reference it
        setServiceConfigs((prev) =>
            prev.map((c) => ({
                ...c,
                clientRateIds: c.clientRateIds?.filter((id) => id !== rateId),
                providerRateId: c.providerRateId === rateId ? undefined : c.providerRateId,
                retoucherRateId: c.retoucherRateId === rateId ? undefined : c.retoucherRateId,
            }))
        );

        toast.warning("Rate deleted", {
            description: "The rate has been removed.",
        });
    }, [createdRateIds, queryClient, setCreatedRateIds, setServiceConfigs]);

    /**
     * Start editing an existing rate - populates form with rate data
     */
    const startEditRate = useCallback((
        serviceId: string,
        rateType: "client" | "provider",
        rateId: string
    ) => {
        const rateToEdit = rates?.find((r) => r.id === rateId);
        if (!rateToEdit) return;

        // Set the editing rate ID
        setEditingRateId(rateId);

        // Populate the form with existing rate data
        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== serviceId) return c;

                const rateData: NewRateData = {
                    name: rateToEdit.name,
                    currency: rateToEdit.currency,
                    amount: rateToEdit.amount,
                    unit: rateToEdit.unit,
                };

                if (rateType === "client") {
                    return {
                        ...c,
                        clientRateMode: "new",
                        newClientRate: rateData,
                    };
                } else {
                    return {
                        ...c,
                        providerRateMode: "new",
                        newProviderRate: rateData,
                    };
                }
            })
        );
    }, [rates, setServiceConfigs]);

    /**
     * Save the edited rate - updates existing rate in cache
     */
    const saveEditedRate = useCallback((
        serviceId: string,
        rateType: "client" | "provider"
    ) => {
        if (!editingRateId) return;

        const config = serviceConfigs.find((c) => c.type === serviceId);
        if (!config) return;

        const rateData = rateType === "client" ? config.newClientRate : config.newProviderRate;
        if (!rateData?.name) return;

        // Update the rate in cache
        queryClient.setQueryData<Rate[]>(["rates"], (old) =>
            old?.map((r) =>
                r.id === editingRateId
                    ? {
                        ...r,
                        name: rateData.name,
                        currency: rateData.currency || "USD",
                        amount: rateData.amount ?? 1,
                        unit: rateData.unit || "per hour",
                    }
                    : r
            ) || []
        );

        // Switch back to existing mode
        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== serviceId) return c;
                if (rateType === "client") {
                    return {
                        ...c,
                        clientRateMode: "existing",
                        clientRateIds: [editingRateId],
                        newClientRate: undefined,
                    };
                } else {
                    return {
                        ...c,
                        providerRateMode: "existing",
                        providerRateId: editingRateId,
                        newProviderRate: undefined,
                    };
                }
            })
        );

        toast.success("Rate updated!", {
            description: `Rate "${rateData.name}" has been updated successfully.`,
        });

        // Clear editing state
        setEditingRateId(null);
    }, [editingRateId, serviceConfigs, queryClient, setServiceConfigs]);

    /**
     * Cancel editing and clear form
     */
    const cancelEdit = useCallback((serviceId: string, rateType: "client" | "provider") => {
        setEditingRateId(null);

        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== serviceId) return c;
                if (rateType === "client") {
                    return {
                        ...c,
                        clientRateMode: "existing",
                        newClientRate: undefined,
                    };
                } else {
                    return {
                        ...c,
                        providerRateMode: "existing",
                        newProviderRate: undefined,
                    };
                }
            })
        );
    }, [setServiceConfigs]);

    return {
        editingRateId,
        updateRate,
        updateRateMode,
        updateNewRateField,
        createRate,
        deleteCreatedRate,
        startEditRate,
        saveEditedRate,
        cancelEdit,
    };
}
