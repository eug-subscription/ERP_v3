import { useState } from "react";
import { ProjectPricingOverride } from "../types/pricing";

type OverrideModalMode = 'add' | 'edit';

interface UseOverrideModalReturn {
    isOpen: boolean;
    mode: OverrideModalMode;
    override: ProjectPricingOverride | null;
    actions: {
        openAdd: () => void;
        openEdit: (override: ProjectPricingOverride) => void;
        close: () => void;
    };
}

/**
 * Custom hook for Override Modal state management.
 * Encapsulates modal state and provides unified interface for add/edit modes.
 * 
 * @example
 * const { isOpen, mode, override, actions } = useOverrideModal();
 * 
 * // Open in add mode
 * <Button onPress={actions.openAdd}>Add Override</Button>
 * 
 * // Open in edit mode
 * <Button onPress={() => actions.openEdit(override)}>Edit</Button>
 * 
 * // Render modal
 * <OverrideModal
 *   isOpen={isOpen}
 *   onOpenChange={actions.close}
 *   override={mode === 'edit' ? override : undefined}
 * />
 */
export function useOverrideModal(): UseOverrideModalReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<OverrideModalMode>('add');
    const [override, setOverride] = useState<ProjectPricingOverride | null>(null);

    const openAdd = () => {
        setMode('add');
        setOverride(null);
        setIsOpen(true);
    };

    const openEdit = (overrideToEdit: ProjectPricingOverride) => {
        setMode('edit');
        setOverride(overrideToEdit);
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        // Don't reset mode/override immediately to avoid flash during close animation
        // They'll be reset when opening next time
    };

    return {
        isOpen,
        mode,
        override,
        actions: {
            openAdd,
            openEdit,
            close
        }
    };
}
