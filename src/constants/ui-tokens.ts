/**
 * Shared UI constants for consistent polish across the application.
 */

// Tooltip configuration
export const TOOLTIP_DELAY = 300;
export const COPY_FEEDBACK_DURATION_MS = 2000;

// Skeleton loading states
export const SKELETON_ROW_HEIGHT = "h-12";
export const SKELETON_FIELD_HEIGHT = "h-10";
export const SKELETON_AREA_HEIGHT = "h-20";

// High-density UI sizing (Magic number elimination)
export const DENSITY_CHIP_HEIGHT = "h-5";
export const DENSITY_CONTROL_HEIGHT = "h-7";

// Navigation paths
export const RATES_MANAGEMENT_URL = "/rates?tab=rate-cards";
export const DEFAULT_PROJECT_ID = "wolt_germany";

// Animation/scroll timing
export const SCROLL_DELAY_MS = 100;
export const TRANSITION_DURATION_STANDARD = "duration-300";
export const TRANSITION_DURATION_SLOW = "duration-500";

// Opacity tokens for interactive states
export const HOVER_OPACITY_SUBTLE = "hover:bg-accent/5";
export const INACTIVE_ICON_HOVER_OPACITY = "group-hover/btn:opacity-50";

// Pricing-specific UI patterns
// Modal and dialog configurations
export const MODAL_BACKDROP = "backdrop-blur-sm bg-black/20";
export const MODAL_WIDTH_SM = "sm:max-w-[400px]";
export const MODAL_WIDTH_MD = "sm:max-w-[480px]";

// Container patterns
export const CONTAINER_BASE_RATES = "p-3 rounded-xl border border-default-100 bg-default-50/50";
export const CONTAINER_INFO_ACCENT = "p-4 rounded-xl border border-accent/20 bg-accent/5";
export const CONTAINER_INFO_ITEM = "p-3 rounded-xl border border-default-200 bg-default-50/50";

// Icon containers
export const ICON_CONTAINER_LG = "size-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0";
export const ICON_SIZE_CONTAINER = "size-5 text-accent";

// Typography patterns
export const TEXT_SECTION_LABEL = "text-xs font-bold uppercase tracking-wider";
export const TEXT_SECTION_TITLE = "text-sm font-black uppercase tracking-widest text-foreground";
export const TEXT_TINY_LABEL = "text-tiny text-default-400 capitalize";
export const TEXT_SUBSECTION_LABEL = "text-xs font-bold text-default-500 uppercase tracking-wider";

// Layout patterns
export const FLEX_COL_GAP_1 = "flex flex-col gap-1";
export const FLEX_COL_GAP_2 = "flex flex-col gap-2";
export const FLEX_COL_GAP_4 = "flex flex-col gap-4";
export const SPACE_Y_4 = "space-y-4";

// Border radius
export const ROUNDED_STANDARD = "rounded-xl";

// Revenue-Expense column layout (used in Rate Cards and Project Overrides)
export const REVENUE_COLUMN_WIDTH = "w-[88px]";
export const EXPENSE_COLUMN_WIDTH = "w-[80px]";
export const RATE_SEPARATOR_WIDTH = "w-10";

// Number formatting precision
export const PERCENTAGE_DECIMALS = 0; // For change percentages (e.g., "+50%")
export const MARGIN_PERCENTAGE_DECIMALS = 1; // For margin percentages (e.g., "45.8%")
export const CURRENCY_DECIMALS = 2; // For currency amounts (e.g., "€45.80")

// Table cell constraints
export const FILE_NAME_MAX_WIDTH = "max-w-[180px]";
