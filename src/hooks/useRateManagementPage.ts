import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "@heroui/react";
import { PricingTab } from "../router";
import { RateItem, RateCard, ModifierReasonCode } from "../types/pricing";
import {
    useCreateRateItem,
    useUpdateRateItem,
    useCreateRateCard,
    useCreateModifierCode,
    useUpdateModifierCode
} from "./useAdminPricingMutations";

/**
 * Custom hook for Rate Management Page state and handlers.
 * Extracts all modal state management and mutation logic from RateManagementPage component.
 */
export function useRateManagementPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { tab: activeTab = "rate-items" } = useSearch({ from: '/_rates/rates' });

    // Mutations
    const createRateItem = useCreateRateItem();
    const updateRateItem = useUpdateRateItem();
    const createRateCard = useCreateRateCard();
    const createModifierCode = useCreateModifierCode();
    const updateModifierCode = useUpdateModifierCode();

    // --- Tab Navigation ---
    const handleTabChange = (key: string) => {
        navigate({
            to: "/rates",
            search: { tab: key as PricingTab }
        });
    };

    // --- Rate Item State & Handlers ---
    const [isRateItemModalOpen, setIsRateItemModalOpen] = useState(false);
    const [selectedRateItem, setSelectedRateItem] = useState<RateItem | undefined>();

    const handleAddRateItem = () => {
        setSelectedRateItem(undefined);
        setIsRateItemModalOpen(true);
    };

    const handleEditRateItem = (item: RateItem) => {
        setSelectedRateItem(item);
        setIsRateItemModalOpen(true);
    };

    const handleRateItemSuccess = (item: Partial<RateItem>) => {
        if (selectedRateItem) {
            updateRateItem.mutate(item, {
                onSuccess: () => {
                    toast("Rate Item Updated", {
                        variant: "success",
                        description: `Successfully saved changes to ${item.name || 'item'}.`
                    });
                    setIsRateItemModalOpen(false);
                },
                onError: (error: Error) => {
                    toast("Update Failed", {
                        variant: "danger",
                        description: error.message || "Could not update rate item."
                    });
                }
            });
        } else {
            createRateItem.mutate(item, {
                onSuccess: () => {
                    toast("Rate Item Created", {
                        variant: "success",
                        description: `Successfully added ${item.name} to the catalog.`
                    });
                    setIsRateItemModalOpen(false);
                },
                onError: (error: Error) => {
                    toast("Creation Failed", {
                        variant: "danger",
                        description: error.message || "Could not create rate item."
                    });
                }
            });
        }
    };

    const handleArchiveRateItem = (item: RateItem) => {
        updateRateItem.mutate({ ...item, status: 'archived' });
    };

    // --- Rate Card State & Handlers ---
    const [isRateCardCreateModalOpen, setIsRateCardCreateModalOpen] = useState(false);

    const handleAddRateCard = () => {
        setIsRateCardCreateModalOpen(true);
    };

    const handleRateCardCreateSuccess = (cardData: Partial<RateCard>) => {
        createRateCard.mutate(cardData, {
            onSuccess: () => {
                toast("Rate Card Created", {
                    variant: "success",
                    description: `Successfully created ${cardData.name}.`
                });
                setIsRateCardCreateModalOpen(false);
            },
            onError: (error: Error) => {
                toast("Creation Failed", {
                    variant: "danger",
                    description: error.message || "Could not create rate card."
                });
            }
        });
    };

    // --- Modifier Code State & Handlers ---
    const [isModifierCodeModalOpen, setIsModifierCodeModalOpen] = useState(false);
    const [selectedModifierCode, setSelectedModifierCode] = useState<ModifierReasonCode | undefined>();

    const handleAddModifierCode = () => {
        setSelectedModifierCode(undefined);
        setIsModifierCodeModalOpen(true);
    };

    const handleEditModifierCode = (code: ModifierReasonCode) => {
        setSelectedModifierCode(code);
        setIsModifierCodeModalOpen(true);
    };

    const handleModifierCodeSuccess = (codeData: Partial<ModifierReasonCode>) => {
        const updatedCode = { ...selectedModifierCode, ...codeData } as ModifierReasonCode;
        queryClient.setQueryData(['modifierReasonCodes', { activeOnly: false }], (old: ModifierReasonCode[] | undefined) => {
            if (!old) return old;
            return old.map(c => c.id === updatedCode.id ? updatedCode : c);
        });

        if (selectedModifierCode) {
            updateModifierCode.mutate(codeData, {
                onSuccess: () => {
                    toast("Modifier Code Updated", {
                        variant: "success",
                        description: `Successfully saved changes to ${codeData.displayName || 'modifier'}.`
                    });
                    setIsModifierCodeModalOpen(false);
                },
                onError: (error: Error) => {
                    queryClient.invalidateQueries({ queryKey: ['modifierReasonCodes'] });
                    toast("Update Failed", {
                        variant: "danger",
                        description: error.message || "Could not update modifier code."
                    });
                }
            });
        } else {
            createModifierCode.mutate(codeData, {
                onSuccess: () => {
                    toast("Modifier Code Created", {
                        variant: "success",
                        description: `Successfully added ${codeData.displayName}.`
                    });
                    setIsModifierCodeModalOpen(false);
                },
                onError: (error: Error) => {
                    toast("Creation Failed", {
                        variant: "danger",
                        description: error.message || "Could not create modifier code."
                    });
                }
            });
        }
    };

    const handleToggleModifierActive = (code: ModifierReasonCode, active: boolean) => {
        const updateCachedList = (old: ModifierReasonCode[] | undefined) => {
            if (!old) return old;
            return old.map(c => c.id === code.id ? { ...c, active } : c);
        };

        queryClient.setQueryData(['modifierReasonCodes', { activeOnly: false }], updateCachedList);
        queryClient.setQueryData(['modifierReasonCodes', { activeOnly: true }], updateCachedList);

        updateModifierCode.mutate({ ...code, active }, {
            onError: (error: Error) => {
                queryClient.invalidateQueries({ queryKey: ['modifierReasonCodes'] });
                toast("Update Failed", {
                    variant: "danger",
                    description: error.message || "Could not update modifier status."
                });
            }
        });
    };

    const handleArchiveModifierCode = (code: ModifierReasonCode) => {
        updateModifierCode.mutate({ ...code, status: 'archived' });
    };

    return {
        // Tab state
        activeTab,
        handleTabChange,

        // Rate Item state & actions
        rateItemModal: {
            isOpen: isRateItemModalOpen,
            setIsOpen: setIsRateItemModalOpen,
            selectedItem: selectedRateItem,
            isPending: createRateItem.isPending || updateRateItem.isPending
        },
        rateItemActions: {
            onAdd: handleAddRateItem,
            onEdit: handleEditRateItem,
            onSuccess: handleRateItemSuccess,
            onArchive: handleArchiveRateItem
        },

        // Rate Card state & actions
        rateCardModal: {
            isOpen: isRateCardCreateModalOpen,
            setIsOpen: setIsRateCardCreateModalOpen,
            isPending: createRateCard.isPending
        },
        rateCardActions: {
            onAdd: handleAddRateCard,
            onSuccess: handleRateCardCreateSuccess
        },

        // Modifier Code state & actions
        modifierCodeModal: {
            isOpen: isModifierCodeModalOpen,
            setIsOpen: setIsModifierCodeModalOpen,
            selectedCode: selectedModifierCode,
            isPending: createModifierCode.isPending || updateModifierCode.isPending
        },
        modifierCodeActions: {
            onAdd: handleAddModifierCode,
            onEdit: handleEditModifierCode,
            onSuccess: handleModifierCodeSuccess,
            onToggleActive: handleToggleModifierActive,
            onArchive: handleArchiveModifierCode
        }
    };
}
