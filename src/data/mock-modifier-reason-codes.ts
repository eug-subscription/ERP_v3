import { ModifierReasonCode } from '../types/pricing';

/**
 * Mock data for Modifier Reason Codes
 * Based on erp_pricing_spec_v1_7.md Section 9.5
 */
export const mockModifierReasonCodes: ModifierReasonCode[] = [
    {
        id: 'mrc-1',
        code: 'RUSH',
        displayName: 'Rush/urgent delivery',
        active: true,
        status: 'active',
        usageCount: 213,
    },
    {
        id: 'mrc-2',
        code: 'WEEKEND',
        displayName: 'Weekend/holiday work',
        active: true,
        status: 'active',
        usageCount: 147,
    },
    {
        id: 'mrc-3',
        code: 'COMPLEXITY_HIGH',
        displayName: 'Above normal complexity',
        active: true,
        status: 'active',
        usageCount: 89,
    },
    {
        id: 'mrc-4',
        code: 'COMPLEXITY_LOW',
        displayName: 'Below normal complexity',
        active: true,
        status: 'active',
        usageCount: 47,
    },
    {
        id: 'mrc-5',
        code: 'REWORK',
        displayName: 'Client-requested revision',
        active: true,
        status: 'active',
        usageCount: 35,
    },
    {
        id: 'mrc-6',
        code: 'LOYALTY',
        displayName: 'Loyalty discount',
        active: true,
        status: 'active',
        usageCount: 28,
    },
    {
        id: 'mrc-7',
        code: 'SPECIALIST',
        displayName: 'Specialist contractor required',
        active: true,
        status: 'active',
        usageCount: 12,
    },
    {
        id: 'mrc-8',
        code: 'VOLUME_DISCOUNT',
        displayName: 'Volume-based discount',
        active: true,
        status: 'active',
        usageCount: 8,
    },
    {
        id: 'mrc-9',
        code: 'NEW_CLIENT',
        displayName: 'New client introductory rate',
        active: true,
        status: 'active',
        usageCount: 3,
    },
    {
        id: 'mrc-10',
        code: 'SEASONAL',
        displayName: 'Seasonal promotion',
        active: false,
        status: 'archived',
        usageCount: 0,
    },
];
