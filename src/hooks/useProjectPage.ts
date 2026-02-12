import { useMemo } from "react";
import { useProjectData } from "./useProjectData";
import { useProjectRates } from "./useProjectRates";
import { useProjectRetouching } from "./useProjectRetouching";

/**
 * Main orchestrator hook for the Project page.
 * Composes useProjectData, useProjectRates, and useProjectRetouching.
 * Maintains backward compatibility with the original useProjectPage API.
 */
export function useProjectPage() {
    // 1. Data queries & service selection
    const {
        rates,
        stats,
        info,
        isLoading,
        selectedServices,
        serviceConfigs,
        setServiceConfigs,
        createdRateIds,
        setCreatedRateIds,
        toggleServiceSelection,
        getServiceConfig,
    } = useProjectData();

    // 2. Rate management
    const {
        editingRateId,
        updateRate,
        updateRateMode,
        updateNewRateField,
        createRate,
        deleteCreatedRate,
        startEditRate,
        saveEditedRate,
        cancelEdit,
    } = useProjectRates({
        serviceConfigs,
        setServiceConfigs,
        rates,
        createdRateIds,
        setCreatedRateIds,
    });

    // 3. Retouching logic
    const {
        updateRetouchingType,
        updateRetoucherRate,
        updateNewRetoucherRateField,
        updateRetouchingLevel,
        addRetouchingRate,
        removeRetouchingRate,
        updateRetouchingRate,
        createCombinedRetouchingRate,
    } = useProjectRetouching({
        serviceConfigs,
        setServiceConfigs,
        setCreatedRateIds,
    });

    const state = useMemo(() => ({
        selectedServices,
        serviceConfigs,
        rates,
        stats,
        info,
        isLoading,
        editingRateId,
        createdRateIds,
        getServiceConfig,
    }), [
        selectedServices,
        serviceConfigs,
        rates,
        stats,
        info,
        isLoading,
        editingRateId,
        createdRateIds,
        getServiceConfig
    ]);

    const actions = useMemo(() => ({
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
        updateRetouchingRate,
        updateRetouchingLevel,
        startEditRate,
        saveEditedRate,
        cancelEdit,
        deleteCreatedRate,
    }), [
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
        updateRetouchingRate,
        updateRetouchingLevel,
        startEditRate,
        saveEditedRate,
        cancelEdit,
        deleteCreatedRate,
    ]);

    return {
        state,
        actions
    };
}
