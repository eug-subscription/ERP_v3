import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockRates, defaultServiceConfigs, mockProjectStats, mockProjectInfo, ServiceConfig } from "../data/mock-project";

/**
 * Manages data queries and service selection state for the Project page.
 * Handles TanStack Query hooks and service configuration state.
 */
export function useProjectData() {
    const [selectedServices, setSelectedServices] = useState<string[]>(["professional-photography"]);
    const [serviceConfigs, setServiceConfigs] = useState<ServiceConfig[]>(defaultServiceConfigs);
    const [createdRateIds, setCreatedRateIds] = useState<string[]>([]);

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

    const toggleServiceSelection = useCallback((serviceId: string) => {
        setSelectedServices((prev) =>
            prev.includes(serviceId)
                ? prev.filter((id) => id !== serviceId)
                : [...prev, serviceId]
        );
    }, []);

    const getServiceConfig = useCallback((serviceId: string): ServiceConfig =>
        serviceConfigs.find(c => c.type === serviceId) || {
            id: `s-${serviceId}`,
            type: serviceId,
            isEnabled: true,
            clientRateMode: "existing",
            providerRateMode: "existing",
        }, [serviceConfigs]);

    return {
        rates: rates || [],
        stats,
        info,
        isLoading: isLoadingRates,
        selectedServices,
        serviceConfigs,
        setServiceConfigs,
        createdRateIds,
        setCreatedRateIds,
        toggleServiceSelection,
        getServiceConfig,
    };
}
