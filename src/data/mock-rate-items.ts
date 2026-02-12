import { RateItem } from '../types/pricing';

/**
 * Mock data for Rate Items
 * Based on erp_pricing_spec_v1_7.md Section 7.1
 */
export const mockRateItems: RateItem[] = [
    {
        id: 'ri-1',
        name: 'Photographer Hour',
        displayName: 'Photo Shoot',
        description: 'Billable time for on-location or studio photography sessions',
        unitType: 'hour',
        blockTypes: ['PHOTO_SHOOT'],
        status: 'active',
    },
    {
        id: 'ri-2',
        name: 'Retoucher Image',
        displayName: 'Photo Retouching',
        description: 'Manual post-production editing and color correction per image',
        unitType: 'image',
        blockTypes: ['PHOTO_RETOUCHING'],
        status: 'active',
    },
    {
        id: 'ri-3',
        name: 'AI Photo Processing',
        displayName: 'AI Enhancement',
        description: 'Automated enhancement using AI tools for fast turnaround',
        unitType: 'image',
        blockTypes: ['PHOTO_RETOUCHING'],
        status: 'active',
    },
    {
        id: 'ri-4',
        name: 'Videographer Hour',
        displayName: 'Video Capture',
        description: 'Professional video recording services including equipment and operator',
        unitType: 'hour',
        blockTypes: ['VIDEO_SHOOT'],
        status: 'active',
    },
    {
        id: 'ri-5',
        name: 'Video Editing',
        displayName: 'Video Editing',
        description: 'Post-production video editing, effects, and final delivery',
        unitType: 'video',
        blockTypes: ['VIDEO_RETOUCHING'],
        status: 'active',
    },
    {
        id: 'ri-6',
        name: 'Travel Fee',
        displayName: 'Travel',
        description: 'Transportation costs and mileage for off-site assignments',
        unitType: 'package',
        status: 'active',
    },
    {
        id: 'ri-7',
        name: 'Licensing Fee',
        displayName: 'License',
        description: 'Image usage rights and licensing permissions for commercial use',
        unitType: 'package',
        status: 'active',
    },
    {
        id: 'ri-8',
        name: 'Legacy AI (V1)',
        unitType: 'image',
        status: 'deprecated',
    },
    {
        id: 'ri-9',
        name: 'Day Rate Photographer',
        displayName: 'Photography Day Rate',
        description: 'Full-day photographer engagement covering 8-10 hours of work',
        unitType: 'day',
        blockTypes: ['PHOTO_SHOOT'],
        status: 'active',
    },
    {
        id: 'ri-10',
        name: 'Adjustment/Credit',
        displayName: 'Discount',
        description: 'Manual pricing adjustments, discounts, or client credits',
        unitType: 'package',
        status: 'active',
    },
];
