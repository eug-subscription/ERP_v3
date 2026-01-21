import { useState, useCallback } from 'react';
import { autoFixWorkflow } from '../data/block-dependencies';
import {
    ProjectWorkflowConfig,
    WorkflowTemplate,
    ValidationResult
} from '../types/workflow';

export function useWorkflowTabState() {
    const [config, setConfig] = useState<ProjectWorkflowConfig | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const resetConfig = () => {
        // Implementation for reset if needed
        setConfig(null);
        setSelectedTemplate(null);
    };

    const saveConfig = async () => {
        if (!config) return;

        // Final validation check
        if (validation.errors.length > 0) {
            setShowValidationModal(true);
            return;
        }

        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        // Success logic here
    };

    const autoFixConfig = useCallback(() => {
        if (!config) return;
        const fixed = autoFixWorkflow(config);
        setConfig(fixed);
    }, [config]);

    const confirmSave = async () => {
        setShowValidationModal(false);
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
    };

    return {
        config,
        setConfig,
        selectedTemplate,
        setSelectedTemplate,
        isLiveMode,
        setIsLiveMode,
        validation,
        setValidation,
        showValidationModal,
        setShowValidationModal,
        isSaving,
        autoFixConfig,
        resetConfig,
        saveConfig,
        confirmSave
    };
}
