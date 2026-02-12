import { useCallback, Dispatch, SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { ServiceConfig, Rate, NewRateData, DEFAULT_NEW_RATE } from "../data/mock-project";

interface UseProjectRetouchingParams {
    serviceConfigs: ServiceConfig[];
    setServiceConfigs: Dispatch<SetStateAction<ServiceConfig[]>>;
    setCreatedRateIds: Dispatch<SetStateAction<string[]>>;
}

/**
 * Manages retouching-specific service configuration.
 * Handles retouching type, level, retoucher rates, and combined rate creation.
 */
export function useProjectRetouching({
    serviceConfigs,
    setServiceConfigs,
    setCreatedRateIds,
}: UseProjectRetouchingParams) {
    const queryClient = useQueryClient();

    const updateRetouchingType = useCallback((type: "ai" | "human") => {
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
    }, [setServiceConfigs]);

    const updateRetoucherRate = useCallback((rateId: string) => {
        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== "retouching") return c;
                return { ...c, retoucherRateId: rateId };
            })
        );
    }, [setServiceConfigs]);

    const updateNewRetoucherRateField = useCallback((field: keyof NewRateData, value: string | number) => {
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
    }, [setServiceConfigs]);

    const updateRetouchingLevel = useCallback((level: "standard" | "advanced" | "premium") => {
        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== "retouching") return c;
                return { ...c, retouchingLevel: level };
            })
        );
    }, [setServiceConfigs]);

    const addRetouchingRate = useCallback(() => {
        setServiceConfigs((prev) =>
            prev.map((c) => {
                if (c.type !== "retouching") return c;
                return {
                    ...c,
                    clientRateIds: [...(c.clientRateIds || []), ""],
                };
            })
        );
    }, [setServiceConfigs]);

    const removeRetouchingRate = useCallback((index: number) => {
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
    }, [setServiceConfigs]);

    const updateRetouchingRateIndexed = useCallback((index: number, rateId: string) => {
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
    }, [setServiceConfigs]);

    const createCombinedRetouchingRate = useCallback(() => {
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

        toast.success("Rates created!", {
            description: `Retouching rate "${newClientRate.name}" has been added.`,
        });
    }, [serviceConfigs, queryClient, setCreatedRateIds, setServiceConfigs]);

    return {
        updateRetouchingType,
        updateRetoucherRate,
        updateNewRetoucherRateField,
        updateRetouchingLevel,
        addRetouchingRate,
        removeRetouchingRate,
        updateRetouchingRate: updateRetouchingRateIndexed,
        createCombinedRetouchingRate,
    };
}
