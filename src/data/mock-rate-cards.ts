import { RateCard } from '../types/pricing';

/**
 * Mock data for Rate Cards
 * Based on erp_pricing_spec_v1_7.md Section 7.2
 */
export const mockRateCards: RateCard[] = [
    {
        id: 'rc-1',
        name: 'Standard - EUR',
        currency: 'EUR',
        status: 'active',
        version: 1,
        entries: [
            {
                id: 'rce-1-1',
                rateCardId: 'rc-1',
                rateItemId: 'ri-1', // Photographer Hour
                costRate: 50,
                clientRate: 100,
                rulesJson: JSON.stringify({
                    schemaVersion: 1,
                    ruleType: 'minimum',
                    minimum: 2,
                    unit: 'hours',
                }),
            },
            {
                id: 'rce-1-2',
                rateCardId: 'rc-1',
                rateItemId: 'ri-2', // Retoucher Image
                costRate: 5,
                clientRate: 12,
                rulesJson: '{}',
            },
            {
                id: 'rce-1-3',
                rateCardId: 'rc-1',
                rateItemId: 'ri-3', // AI Photo Processing
                costRate: 0.5,
                clientRate: 2,
                rulesJson: '{}',
            },
            {
                id: 'rce-1-4',
                rateCardId: 'rc-1',
                rateItemId: 'ri-6', // Travel Fee
                costRate: 0,
                clientRate: 50,
                rulesJson: '{}',
            },
        ],
    },
    {
        id: 'rc-2',
        name: 'Standard - GBP',
        currency: 'GBP',
        status: 'active',
        version: 1,
        entries: [
            {
                id: 'rce-2-1',
                rateCardId: 'rc-2',
                rateItemId: 'ri-1', // Photographer Hour
                costRate: 45,
                clientRate: 85,
                rulesJson: JSON.stringify({
                    schemaVersion: 1,
                    ruleType: 'minimum',
                    minimum: 2,
                    unit: 'hours',
                }),
            },
            {
                id: 'rce-2-2',
                rateCardId: 'rc-2',
                rateItemId: 'ri-2', // Retoucher Image
                costRate: 4,
                clientRate: 10,
                rulesJson: '{}',
            },
        ],
    },
    {
        id: 'rc-3',
        name: 'Premium - EUR',
        currency: 'EUR',
        status: 'active',
        version: 2,
        entries: [
            {
                id: 'rce-3-1',
                rateCardId: 'rc-3',
                rateItemId: 'ri-1', // Photographer Hour
                costRate: 75,
                clientRate: 150,
                rulesJson: JSON.stringify({
                    schemaVersion: 1,
                    ruleType: 'minimum',
                    minimum: 4,
                    unit: 'hours',
                }),
            },
        ],
    },
    {
        id: 'rc-4',
        name: 'AI-only - USD',
        currency: 'USD',
        status: 'active',
        version: 1,
        entries: [
            {
                id: 'rce-4-1',
                rateCardId: 'rc-4',
                rateItemId: 'ri-3', // AI Photo Processing
                costRate: 0.4,
                clientRate: 1.5,
                rulesJson: '{}',
            },
        ],
    },
];
