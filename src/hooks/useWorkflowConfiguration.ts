import { useState, useEffect, useCallback, useMemo } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import {
    ProjectWorkflowConfig,
    WorkflowBlock,
    WorkflowTemplate,
    ValidationResult
} from '../types/workflow';
import { generateWorkflowFromPreset } from '../utils/workflow-generator';
import { validateWorkflow } from '../data/block-dependencies';

interface UseWorkflowConfigurationProps {
    initialConfig: ProjectWorkflowConfig | null;
    onConfigChange: (config: ProjectWorkflowConfig) => void;
    onTemplateSelect: (template: WorkflowTemplate) => void;
    onValidationChange?: (result: ValidationResult) => void;
}

export function useWorkflowConfiguration({
    initialConfig,
    onConfigChange,
    onTemplateSelect,
    onValidationChange
}: UseWorkflowConfigurationProps) {
    const [editingBlock, setEditingBlock] = useState<{ branchId: string; block: WorkflowBlock } | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [showConfirmSwitch, setShowConfirmSwitch] = useState(false);
    const [pendingTemplate, setPendingTemplate] = useState<WorkflowTemplate | null>(null);

    // Validate configuration whenever it changes
    const validation = useMemo(() => {
        if (!initialConfig) return { isValid: true, errors: [] };
        return validateWorkflow(initialConfig);
    }, [initialConfig]);

    // Notify parent about validation changes
    useEffect(() => {
        onValidationChange?.(validation);
    }, [validation, onValidationChange]);

    const handleTemplateSelect = useCallback((template: WorkflowTemplate) => {
        if (isDirty) {
            setPendingTemplate(template);
            setShowConfirmSwitch(true);
        } else {
            // Convert template (which is now a preset) into a full workflow config
            const newWorkflowConfig = generateWorkflowFromPreset(template, 'current-project');
            onConfigChange(newWorkflowConfig);
            onTemplateSelect(template);
            setIsDirty(false);
        }
    }, [isDirty, onConfigChange, onTemplateSelect]);

    const confirmTemplateSwitch = useCallback(() => {
        if (pendingTemplate) {
            const newWorkflowConfig = generateWorkflowFromPreset(pendingTemplate, 'current-project');
            onConfigChange(newWorkflowConfig);
            onTemplateSelect(pendingTemplate);
            setIsDirty(false);
        }
        setShowConfirmSwitch(false);
        setPendingTemplate(null);
    }, [pendingTemplate, onConfigChange, onTemplateSelect]);

    const cancelTemplateSwitch = useCallback(() => {
        setShowConfirmSwitch(false);
        setPendingTemplate(null);
    }, []);

    const toggleBlock = useCallback((branchId: string, blockId: string) => {
        if (!initialConfig) return;

        const newConfig = {
            ...initialConfig,
            branches: initialConfig.branches.map((branch) => {
                if (branch.id !== branchId) return branch;
                return {
                    ...branch,
                    blocks: branch.blocks.map((block) => {
                        if (block.id !== blockId) return block;
                        return { ...block, isEnabled: !block.isEnabled };
                    }),
                };
            }),
        };
        onConfigChange(newConfig);
        setIsDirty(true);
    }, [initialConfig, onConfigChange]);

    const reorderBlocks = useCallback((branchId: string, oldIndex: number, newIndex: number) => {
        if (!initialConfig) return;

        const newConfig = {
            ...initialConfig,
            branches: initialConfig.branches.map((branch) => {
                if (branch.id !== branchId) return branch;
                return {
                    ...branch,
                    blocks: arrayMove(branch.blocks, oldIndex, newIndex),
                };
            }),
        };
        onConfigChange(newConfig);
        setIsDirty(true);
    }, [initialConfig, onConfigChange]);

    const updateBlockConfig = useCallback((branchId: string, blockId: string, newConfigBlock: WorkflowBlock['config']) => {
        if (!initialConfig) return;

        const updatedConfig = {
            ...initialConfig,
            branches: initialConfig.branches.map((branch) => {
                if (branch.id !== branchId) return branch;
                return {
                    ...branch,
                    blocks: branch.blocks.map((block) => {
                        if (block.id !== blockId) return block;
                        return { ...block, config: newConfigBlock };
                    }),
                };
            }),
        };

        onConfigChange(updatedConfig);
        setIsDirty(true);

        // Update local editing state to keep UI in sync
        setEditingBlock((prev) => {
            if (prev?.block.id === blockId) {
                return {
                    ...prev,
                    block: { ...prev.block, config: newConfigBlock }
                };
            }
            return prev;
        });
    }, [initialConfig, onConfigChange]);

    return {
        editingBlock,
        setEditingBlock,
        validation,
        isDirty,
        showConfirmSwitch,
        setShowConfirmSwitch,
        handleTemplateSelect,
        confirmTemplateSwitch,
        cancelTemplateSwitch,
        toggleBlock,
        reorderBlocks,
        updateBlockConfig
    };
}
