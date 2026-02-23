/**
 * Image URL utilities for thumbnail and preview resolution manipulation.
 */

/**
 * Converts a thumbnail URL to a high-resolution version by updating the `w`
 * query param and removing the `h` constraint, allowing the image to scale
 * proportionally. Uses the URL API to handle any query string format reliably.
 *
 * @param thumbnailUrl - The thumbnail URL (any query string format)
 * @param width        - Desired width in pixels (default: 1200)
 * @returns            High-resolution URL, or the original if parsing fails
 */
export function getHighResUrl(thumbnailUrl: string, width = 1200): string {
    try {
        const url = new URL(thumbnailUrl);
        url.searchParams.set("w", String(width));
        url.searchParams.delete("h");
        return url.toString();
    } catch {
        return thumbnailUrl;
    }
}
