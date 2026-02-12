import { ProjectPricingSettings, ProjectPricingOverride } from '../types/pricing';

/**
 * Mock storage for project pricing settings.
 */
export const mockProjectPricing: Record<string, ProjectPricingSettings> = {
    'wolt_germany': {
        projectId: 'wolt_germany',
        currency: 'EUR',
        taxTreatment: 'exclusive',
        taxRate: 0.20,
        rateCardId: 'rc-1',
        taxRegistrationNumber: 'DE 123 456 789'
    }
};

/**
 * Mock storage for project overrides.
 */
export const mockProjectOverrides: Record<string, ProjectPricingOverride[]> = {
    'wolt_germany': [
        {
            id: 'ov-1',
            projectId: 'wolt_germany',
            rateItemId: 'ri-1', // Photographer Hour
            costRate: 45, // Overridden from 50 (standard EUR rc-1 cost)
            clientRate: 120, // Overridden from 100
            reason: 'Special contractor rate for Wolt Germany',
            createdBy: 'user-admin',
            createdAt: new Date().toISOString()
        }
    ]
};

/**
 * Simulated API function to fetch project pricing.
 */
export async function fetchProjectPricing(projectId: string): Promise<ProjectPricingSettings> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const settings = mockProjectPricing[projectId];

    if (!settings) {
        // Return default settings if none found
        return {
            projectId,
            currency: 'EUR',
            taxTreatment: 'exclusive',
            taxRate: 0,
            rateCardId: ''
        };
    }

    return settings;
}

/**
 * Simulated API function to update project pricing.
 */
export async function updateProjectPricing(settings: ProjectPricingSettings): Promise<ProjectPricingSettings> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    mockProjectPricing[settings.projectId] = settings;
    return settings;
}

/**
 * Simulated API function to fetch project overrides.
 */
export async function fetchProjectOverrides(projectId: string): Promise<ProjectPricingOverride[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return mockProjectOverrides[projectId] || [];
}

/**
 * Simulated API function to remove a project override.
 */
export async function deleteProjectOverride(overrideId: string, projectId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    mockProjectOverrides[projectId] = (mockProjectOverrides[projectId] || []).filter(ov => ov.id !== overrideId);
}

/**
 * Simulated API function to add a project override.
 */
export async function addProjectOverride(override: Omit<ProjectPricingOverride, 'id' | 'createdAt' | 'createdBy'>): Promise<ProjectPricingOverride> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newOverride: ProjectPricingOverride = {
        ...override,
        id: `ov-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        createdBy: 'current-user'
    };

    if (!mockProjectOverrides[override.projectId]) {
        mockProjectOverrides[override.projectId] = [];
    }

    mockProjectOverrides[override.projectId].push(newOverride);
    return newOverride;
}

/**
 * Simulated API function to update a project override.
 */
export async function updateProjectOverride(override: ProjectPricingOverride): Promise<ProjectPricingOverride> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (mockProjectOverrides[override.projectId]) {
        const index = mockProjectOverrides[override.projectId].findIndex(ov => ov.id === override.id);
        if (index !== -1) {
            mockProjectOverrides[override.projectId][index] = override;
        }
    }

    return override;
}
