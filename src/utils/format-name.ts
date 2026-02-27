/**
 * Derives avatar initials from a display name.
 * Uses filter(Boolean) to guard against empty segments (e.g. trailing spaces).
 *
 * @example getInitials("John Doe") → "JD"
 * @example getInitials("Alice")    → "A"
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}
