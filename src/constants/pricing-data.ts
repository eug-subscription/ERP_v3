import { Currency, Status, UnitType } from "../types/pricing";
import { WorkflowBlockType } from "../types/workflow";

/**
 * Standard Currencies supported by the ERP
 */
export const SUPPORTED_CURRENCIES: { id: Currency; label: string }[] = [
    { id: 'EUR', label: 'Euro' },
    { id: 'GBP', label: 'British Pound' },
    { id: 'USD', label: 'US Dollar' }
];

/**
 * Standard Unit Types for Rate Items
 */
export const RATE_UNIT_TYPES: { id: UnitType; label: string }[] = [
    { id: 'hour', label: 'Hour' },
    { id: 'image', label: 'Image' },
    { id: 'video', label: 'Video' },
    { id: 'day', label: 'Day' },
    { id: 'package', label: 'Package' },
    { id: 'minute', label: 'Minute' },
];

/**
 * Standard Lifecycle Statuses for Pricing entities
 */
export const PRICING_STATUSES: { id: Status; label: string }[] = [
    { id: 'active', label: 'Active' },
    { id: 'deprecated', label: 'Deprecated' },
    { id: 'archived', label: 'Archived' },
];

/**
 * Billable Workflow Block Types
 * Block types that can be linked to Rate Items for automatic billing.
 * Excludes operational/flow-control blocks (ORDER_CREATED, ITEMS_TO_SHOOT, SST, 
 * PRO_ASSIGNING, RETOUCHER_ASSIGNING, WAIT_PAYMENT, IF_ELSE, MERGE, 
 * SEND_NOTIFICATION, FILE_RENAMING).
 */
export const BILLABLE_BLOCK_TYPES: { id: WorkflowBlockType; label: string }[] = [
    { id: 'PHOTO_SHOOT', label: 'Photo Shoot' },
    { id: 'VIDEO_SHOOT', label: 'Video Shoot' },
    { id: 'PHOTO_RETOUCHING', label: 'Photo Retouching' },
    { id: 'VIDEO_RETOUCHING', label: 'Video Retouching' },
    { id: 'FILE_STORAGE', label: 'File Storage' },
    { id: 'MATCHING', label: 'Matching' },
    { id: 'MODERATION', label: 'Moderation' },
    { id: 'EXTERNAL_PROCESS', label: 'External Process' },
];

/**
 * Tax-related constants
 */
export const DEFAULT_TAX_RATE = 0.2; // 20% - typical EU VAT rate
export const TAX_RATE_PERCENTAGE_FACTOR = 100;

/**
 * Tax rate conversion utilities
 */
export const percentToDecimal = (percent: number): number => percent / TAX_RATE_PERCENTAGE_FACTOR;
export const decimalToPercent = (decimal: number): number => decimal * TAX_RATE_PERCENTAGE_FACTOR;
