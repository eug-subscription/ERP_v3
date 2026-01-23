import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    UserWorkflowTemplate,
    SaveAsTemplateRequest,
    TemplateOperationResult,
    WorkflowCanvasState,
    WorkflowBlockType,
    BlockConfig
} from '../types/workflow';
import { mockWorkflowTemplates } from '../data/mock-workflow-templates';

/**
 * Enhanced mock data including source, timestamps, and other fields from UserWorkflowTemplate.
 */
const systemTemplates: UserWorkflowTemplate[] = mockWorkflowTemplates.map(t => ({
    ...t,
    source: 'SYSTEM',
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date('2026-01-01').toISOString(),
}));

/**
 * Local storage for user templates (simulated).
 */
let userTemplates: UserWorkflowTemplate[] = [];

/**
 * Fetch all available templates (system + user).
 */
async function fetchTemplates(): Promise<UserWorkflowTemplate[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...systemTemplates, ...userTemplates];
}

/**
 * Save current canvas as a new template.
 */
async function saveAsTemplate(
    canvasState: WorkflowCanvasState,
    request: SaveAsTemplateRequest
): Promise<TemplateOperationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple validation
    if (!request.name.trim()) {
        return { success: false, error: 'Template name is required.' };
    }

    const newTemplate: UserWorkflowTemplate = {
        id: `tpl-${Date.now()}`,
        name: request.name,
        description: request.description,
        category: request.category,
        source: 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Capture blocks and configurations from canvas state
        enabledBlocks: canvasState.blocks.map(b => b.type),
        blockConfigs: canvasState.blocks.reduce((acc, block) => {
            if (block.config) {
                acc[block.type] = block.config;
            }
            return acc;
        }, {} as Partial<Record<WorkflowBlockType, BlockConfig>>),
        // Also keep branches for backward compatibility
        branches: [], // In a real implementation, we would reconstruct branches from blocks
    };

    userTemplates = [newTemplate, ...userTemplates];

    return { success: true, templateId: newTemplate.id };
}

/**
 * Delete a user-created template.
 */
async function deleteTemplate(templateId: string): Promise<TemplateOperationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    userTemplates = userTemplates.filter(t => t.id !== templateId);

    return { success: true };
}

/**
 * Hook for fetching, saving, and managing workflow templates.
 */
export function useWorkflowTemplates() {
    const queryClient = useQueryClient();

    const templatesQuery = useQuery({
        queryKey: ['workflow-templates'],
        queryFn: fetchTemplates,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    const saveTemplateMutation = useMutation({
        mutationFn: ({ canvasState, request }: {
            canvasState: WorkflowCanvasState;
            request: SaveAsTemplateRequest
        }) => saveAsTemplate(canvasState, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
        },
    });

    const deleteTemplateMutation = useMutation({
        mutationFn: deleteTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
        },
    });

    return {
        state: {
            templates: templatesQuery.data ?? [],
            isLoading: templatesQuery.isLoading,
            systemTemplates: templatesQuery.data?.filter(t => t.source === 'SYSTEM') ?? [],
            userTemplates: templatesQuery.data?.filter(t => t.source === 'USER') ?? [],
        },
        actions: {
            saveAsTemplate: saveTemplateMutation.mutateAsync,
            deleteTemplate: deleteTemplateMutation.mutateAsync,
            refetch: templatesQuery.refetch,
        },
        mutations: {
            isSaving: saveTemplateMutation.isPending,
            isDeleting: deleteTemplateMutation.isPending,
        },
    };
}
