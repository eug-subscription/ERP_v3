/**
 * Pricing-related constants
 */

/** Minimum acceptable margin percentage before displaying danger indicator (0 = warn on negative margin) */
export const MARGIN_DANGER_THRESHOLD = 0;

/** Default number of skeleton rows to show during loading states */
export const DEFAULT_SKELETON_COUNT = 5;

/** Number of skeleton cards to show in grid layouts (2 rows of 3) */
export const SKELETON_CARD_COUNT = 6;

/** Simulated API delay for mock data hooks (ms) */
export const MOCK_API_DELAY_MS = 500;

/** Default staleTime for pricing hook queries (ms) */
export const QUERY_STALE_TIME_MS = 1000 * 60 * 5; // 5 minutes

/** Extended staleTime for rarely-changing reference data (ms) */
export const QUERY_STALE_TIME_EXTENDED_MS = 1000 * 60 * 60; // 1 hour

/** Base token for absolute smallest technical typography (10px) */
export const TYPO_TINY = "t-mini";

/** Shared label styling for pricing components */
export const PRICING_LABEL_CLASSES = `${TYPO_TINY} font-semibold uppercase tracking-wide text-default-500`;

/** Typography token for industrial table headers */
export const TABLE_HEADER_TRACKING = "tracking-widest";

/** Typography token for high-density item names */
export const PRICING_ITEM_TRACKING = "tracking-tight";

/** Typography token for minimalist metadata text */
export const METADATA_CLASSES = `${TYPO_TINY} font-medium uppercase tracking-wider text-default-400`;

/** Style token for metadata badges (pills/chips) */
export const METADATA_BADGE_CLASSES = `inline-flex items-center px-2 h-5 rounded-md bg-default-100/50 text-default-600 font-medium ${TYPO_TINY} uppercase tracking-wider transition-colors`;

/** Typography token for specialized margin percentage displays */
export const MARGIN_DISPLAY_CLASSES = `${TYPO_TINY} font-bold tracking-tight`;

/** Modifer bounds as defined in erp_pricing_spec_v1_7.md */
export const CLIENT_MODIFIER_MIN = 0.5;
export const CLIENT_MODIFIER_MAX = 2.0;
export const COST_MODIFIER_MIN = 0.8;
export const COST_MODIFIER_MAX = 1.5;

/** Step value for currency input fields (rate overrides, pricing adjustments) */
export const CURRENCY_INPUT_STEP = "0.10";

/** Maximum length for override reason field */
export const OVERRIDE_REASON_MAX_LENGTH = 500;
