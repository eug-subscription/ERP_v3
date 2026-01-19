import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { mockRates, defaultServiceConfigs, mockProjectStats, mockProjectInfo, ServiceConfig, Rate, NewRateData, DEFAULT_NEW_RATE } from "../data/mock-project";

export interface ToastMessage {
    id: string;
    title: string;
    description?: string;
    status: "success" | "danger" | "warning" | "accent";
}

export function useProjectPage() {
    const [selectedServices, setSelectedServices] = useState<string[]>(["professional-photography"]);
    const [serviceConfigs, setServiceConfigs] = useState<ServiceConfig[]>(defaultServiceConfigs);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [editingRateId, setEditingRateId] = useState<string | null>(null);
    const [createdRateIds, setCreatedRateIds] = useState<string[]>([]);
    const queryClient = useQueryClient();

    const { data: rates, isLoading: isLoadingRates } = useQuery({
        queryKey: ["rates"],
        queryFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return mockRates;
        },
    });

    const { data: stats } = useQuery({
        queryKey: ["project-stats"],
        queryFn: async () => Promise.resolve(mockProjectStats),
    });

    const { data: info } = useQuery({
        queryKey: ["project-info"],
        queryFn: async () => Promise.resolve(mockProjectInfo),
    });

    const toggleServiceSelection = (serviceId: string) => {
        setSelectedServices((prev) =>
            prev.includes(serviceId)
                ? prev.filter((id) => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const updateRate = (
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
    };
    const updateRateMode = (
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
    };

    const updateNewRateField = (
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
    };

    const createRate = (
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

        addToast({
            title: "Rate created!",
            description: `Rate "${newRate.name}" has been added to ${serviceId.split("-").join(" ")}.`,
            status: "success",
        });
    };

    /**
     * Delete a created rate - only works for rates created in this session
     */
    const deleteCreatedRate = (rateId: string) => {
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

        addToast({
            title: "Rate deleted",
            description: "The rate has been removed.",
            status: "warning",
        });
    };

    /**
     * Start editing an existing rate - populates form with rate data
     */
    const startEditRate = (
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
    };

    /**
     * Save the edited rate - updates existing rate in cache
     */
    const saveEditedRate = (
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

        addToast({
            title: "Rate updated!",
            description: `Rate "${rateData.name}" has been updated successfully.`,
            status: "success",
        });

        // Clear editing state
        setEditingRateId(null);
    };

    /**
     * Cancel editing and clear form
     */
    const cancelEdit = (serviceId: string, rateType: "client" | "provider") => {
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
    };

    const updateRetouchingType = (type: "ai" | "human") => {
        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== "retouching") return c;
                return {
                    ...c,
                    retouchingType: type,
                    retoucherRateMode: type === "human" ? (c.retoucherRateMode || "existing") : c.retoucherRateMode
                };
            })
        );
    };

    const updateRetoucherRate = (rateId: string) => {
        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== "retouching") return c;
                return { ...c, retoucherRateId: rateId };
            })
        );
    };


    const updateNewRetoucherRateField = (field: keyof NewRateData, value: string | number) => {
        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== "retouching") return c;
                return {
                    ...c,
                    newRetoucherRate: {
                        ...(c.newRetoucherRate || DEFAULT_NEW_RATE),
                        [field]: value,
                    },
                };
            })
        );
    };

    const updateRetouchingLevel = (level: "standard" | "advanced" | "premium") => {
        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== "retouching") return c;
                return { ...c, retouchingLevel: level };
            })
        );
    };


    const addRetouchingRate = () => {
        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== "retouching") return c;
                return {
                    ...c,
                    clientRateIds: [...(c.clientRateIds || []), ""],
                };
            })
        );
    };

    const removeRetouchingRate = (index: number) => {
        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== "retouching") return c;
                const newRateIds = [...(c.clientRateIds || [])];
                newRateIds.splice(index, 1);
                return {
                    ...c,
                    clientRateIds: newRateIds,
                };
            })
        );
    };

    const updateRetouchingRateIndexed = (index: number, rateId: string) => {
        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== "retouching") return c;
                const newRateIds = [...(c.clientRateIds || [])];
                newRateIds[index] = rateId;
                return {
                    ...c,
                    clientRateIds: newRateIds,
                };
            })
        );
    };

    const createCombinedRetouchingRate = () => {
        const config = serviceConfigs.find((c) => c.type === "retouching");
        if (!config || !config.newClientRate?.name) return;

        const newRates: Rate[] = [];
        const newRateIds: string[] = [];

        // Create Client Rate
        const newClientRate: Rate = {
            id: `r-client-${Date.now()}`,
            name: config.newClientRate.name,
            currency: config.newClientRate.currency || "USD",
            amount: config.newClientRate.amount ?? 1,
            unit: config.newClientRate.unit || "per hour",
            createdDate: new Date().toISOString(),
        };
        newRates.push(newClientRate);
        newRateIds.push(newClientRate.id);

        // Create Retoucher Rate (if human)
        let newProviderRateId: string | undefined;
        if (config.retouchingType === "human" && config.newRetoucherRate?.name) {
            const newRetoucherRate: Rate = {
                id: `r-retoucher-${Date.now()}`,
                name: config.newRetoucherRate.name,
                currency: config.newRetoucherRate.currency || "USD",
                amount: config.newRetoucherRate.amount ?? 1,
                unit: config.newRetoucherRate.unit || "per hour",
                createdDate: new Date().toISOString(),
            };
            newRates.push(newRetoucherRate);
            newRateIds.push(newRetoucherRate.id);
            newProviderRateId = newRetoucherRate.id;
        }

        // Update rates list in cache
        queryClient.setQueryData<Rate[]>(["rates"], (old) => (old ? [...old, ...newRates] : newRates));

        // Track created rate IDs
        setCreatedRateIds((prev) => [...prev, ...newRateIds]);

        // Update config
        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== "retouching") return c;
                return {
                    ...c,
                    clientRateMode: "existing",
                    clientRateIds: [newClientRate.id],
                    providerRateMode: newProviderRateId ? "existing" : c.providerRateMode,
                    providerRateId: newProviderRateId || c.providerRateId,
                    newClientRate: undefined,
                    newRetoucherRate: undefined,
                };
            })
        );

        addToast({
            title: "Rates created!",
            description: `Retouching rate "${newClientRate.name}" has been added.`,
            status: "success",
        });
    };

    const addToast = (toast: Omit<ToastMessage, "id">) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { ...toast, id }]);
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getServiceConfig = (serviceId: string): ServiceConfig =>
        serviceConfigs.find(c => c.type === serviceId) || {
            id: `s-${serviceId}`,
            type: serviceId,
            isEnabled: true,
            clientRateMode: "existing",
            providerRateMode: "existing",
        };

    return {
        state: {
            selectedServices,
            serviceConfigs,
            rates: rates || [],
            stats,
            info,
            isLoading: isLoadingRates,
            toasts,
            editingRateId,
            createdRateIds,
            getServiceConfig,
        },
        actions: {
            toggleServiceSelection,
            updateRate,
            updateRateMode,
            updateNewRateField,
            createRate,
            updateRetouchingType,
            updateRetoucherRate,
            updateNewRetoucherRateField,
            createCombinedRetouchingRate,
            addRetouchingRate,
            removeRetouchingRate,
            updateRetouchingRate: updateRetouchingRateIndexed,
            removeToast,
            updateRetouchingLevel,
            startEditRate,
            saveEditedRate,
            cancelEdit,
            deleteCreatedRate,
        },
    };
}
