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
export const MODAL_WIDTH_FORM = "max-w-lg";
export const MODAL_WIDTH_LG = "max-w-4xl";
export const PREVIEW_IMAGE_MIN_HEIGHT = "min-h-[300px]";
export const PREVIEW_IMAGE_MAX_HEIGHT = "max-h-[80vh]";

// Shot list controls
export const SEARCH_FIELD_WIDTH = "w-[240px]";
export const FILTER_SELECT_WIDTH = "w-[180px]";

// Container patterns
export const CONTAINER_BASE_RATES = "p-3 rounded-xl border border-default-100 bg-default-50/50";
export const CONTAINER_INFO_ACCENT = "p-4 rounded-xl border border-accent/20 bg-accent/5";
export const CONTAINER_INFO_ITEM = "p-3 rounded-xl border border-default-200 bg-default-50/50";
export const CONTAINER_DETAIL_BLOCK = "rounded-xl bg-default/40 border border-default px-4 py-3";

// Icon containers
export const ICON_CONTAINER_LG = "size-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0";
export const ICON_CONTAINER_SM = "size-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0";
export const ICON_SIZE_CONTAINER = "size-5 text-accent";

// Typography patterns
export const TEXT_SECTION_LABEL = "text-xs font-bold uppercase tracking-wider";
export const TEXT_SECTION_TITLE = "text-sm font-black uppercase tracking-widest text-foreground";
export const TEXT_TINY_LABEL = "text-tiny text-default-400 capitalize";
export const TEXT_FIELD_LABEL = "text-xs text-default-400 font-medium";

// Modal icon background — consistent accent-soft style across all edit modals
export const MODAL_ICON_DEFAULT = "bg-accent-soft text-accent-soft-foreground";

// Ghost edit button — hover-reveal on card headers
export const GHOST_EDIT_BUTTON = "opacity-0 group-hover:opacity-100 transition-opacity";



// Layout patterns
export const FLEX_COL_GAP_1 = "flex flex-col gap-1";
export const FLEX_COL_GAP_2 = "flex flex-col gap-2";
export const FLEX_COL_GAP_4 = "flex flex-col gap-4";
export const SPACE_Y_4 = "space-y-4";
export const SPACE_Y_6 = "space-y-6";

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
// Billing table column width — Qty / Revenue / Expense columns in BillingContextCard
export const BILLING_COLUMN_WIDTH = "w-16";

// Matching tab animation timing
export const DROP_EXIT_ANIMATION_MS = 500;
export const MATCHED_ROW_STAGGER_MS = 50;
export const PANEL_SCROLL_HEIGHT = "h-[560px]";

// Messages tab
export const MESSAGE_BUBBLE_MAX_WIDTH = "max-w-[80%]";
export const MESSAGE_SCROLL_HEIGHT = "max-h-[480px]";
export const MESSAGE_ATTACHMENT_IMAGE_MAX_WIDTH = "max-w-[320px]";
export const MESSAGE_ATTACHMENT_FILE_MAX_WIDTH = "max-w-[280px]";

// Timeline / Pipeline
export const ACTIVITY_LOG_SCROLL_HEIGHT = "max-h-[600px]";
export const TEXT_TINY_MUTED_BOLD = "t-mini font-black uppercase tracking-widest text-default-400";
// Modal section sub-heading label — used across all edit modals
export const TEXT_MODAL_SECTION_LABEL = "t-mini font-bold uppercase tracking-[0.15em] text-default-400";
export const COMMENT_BUBBLE = "bg-default-50 text-default-900 shadow-surface rounded-2xl rounded-tl-sm px-3 py-2.5";
// Pipeline track geometry — derived from uniform Card p-4 padding
export const PIPELINE_DOT_OFFSET = "mt-[18px]";   // dot aligns with card title baseline
export const PIPELINE_TRACK_HEIGHT = "h-[34px]";  // upper track height = dotOffset(18) + half-dot(16)
export const PIPELINE_TRACK_MARGIN = "mt-[34px]"; // lower track top margin on first step
export const PIPELINE_LINE_WIDTH = "w-[2px]";      // vertical connector line width
export const PIPELINE_LINE_HEIGHT = "h-[2px]";     // horizontal connector line height

// Pipeline fork junction geometry
export const JUNCTION_BRANCH_TOP = "29px";   // where the horizontal branch starts (from top of the fork area)
export const JUNCTION_SPINE_SPLIT = "31px";  // where the upper spine ends and lower spine begins
export const JUNCTION_BRANCH_WIDTH = "24px"; // horizontal branch length (spine centre → child dot edge)

// Table action buttons — ghost icon buttons used in table rows
export const ACTION_BUTTON_ICON = "rounded-full bg-default/50 border border-transparent hover:border-accent/20 hover:bg-accent/10 text-default-500";

// Card header — consistent section header pattern across all tabs
export const CARD_HEADER = "p-8 border-b border-default-200 bg-default-50/50";

// Tab page heading — shared h2 style across all tab components
export const TEXT_TAB_HEADING = "text-2xl font-black text-default-900 tracking-tight";


