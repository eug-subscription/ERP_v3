/**
 * Constants for the avatar upload feature.
 * Validation rules, accepted MIME types, and crop configuration.
 */

// ─── File Validation ──────────────────────────────────────────────────────────

/** MIME types accepted by the avatar file picker. */
export const AVATAR_ACCEPTED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
] as const;

/** Human-readable format list shown in the drop zone hint. */
export const AVATAR_ACCEPTED_LABEL = "JPG, PNG, WebP, HEIC";

/** Maximum allowed file size in bytes (10 MB). */
export const AVATAR_MAX_SIZE_BYTES = 10 * 1024 * 1024;

/** Minimum pixel dimension (width and height) for uploaded images. */
export const AVATAR_MIN_DIMENSION_PX = 200;

// ─── Crop Configuration ───────────────────────────────────────────────────────

/** Minimum zoom level for react-easy-crop. */
export const AVATAR_CROP_ZOOM_MIN = 1;

/** Maximum zoom level for react-easy-crop. */
export const AVATAR_CROP_ZOOM_MAX = 3;

/** Zoom step increment for the HeroUI Slider. */
export const AVATAR_CROP_ZOOM_STEP = 0.05;

/** JPEG quality (0–1) used when generating the cropped output blob. */
export const AVATAR_CROP_OUTPUT_QUALITY = 0.92;

/** Fixed aspect ratio for the crop area (circle needs 1:1). */
export const AVATAR_CROP_ASPECT = 1;

/** Fixed height for the react-easy-crop canvas container. */
export const AVATAR_CROP_AREA_HEIGHT = "h-[300px]";

/**
 * Delay (ms) before opening the native file picker after resetting crop state.
 * Allows React to flush the state reset before the browser opens the picker.
 */
export const FILE_PICKER_OPEN_DELAY_MS = 50;
