/**
 * Relative timestamp formatting utility.
 *
 * Provides human-friendly relative timestamps that respect calendar day
 * boundaries (e.g., "Yesterday" is based on calendar date, not 24h ago).
 *
 * Two formats:
 *   - 'short' — compact display for sidebars and compact UI
 *   - 'long'  — verbose display for activity logs and detail views
 *
 * @example
 * formatRelativeTime('2026-02-19T09:00:00Z')           // "Today · 09:00"
 * formatRelativeTime('2026-02-18T14:45:00Z')           // "Yesterday · 14:45"
 * formatRelativeTime('2026-02-17T09:00:00Z', 'long')   // "Monday at 09:00"
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format time portion as HH:MM in user's locale. */
function formatTime(d: Date): string {
    return d.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/** Get the start of day (midnight) for a given date. */
function startOfDay(d: Date): Date {
    const result = new Date(d);
    result.setHours(0, 0, 0, 0);
    return result;
}

/** Get the number of calendar days between two dates. */
function calendarDaysBetween(a: Date, b: Date): number {
    const startA = startOfDay(a);
    const startB = startOfDay(b);
    return Math.round((startA.getTime() - startB.getTime()) / (1000 * 60 * 60 * 24));
}

/** Get short or long day name. */
function dayName(d: Date, style: 'short' | 'long'): string {
    return d.toLocaleString('en-GB', { weekday: style === 'short' ? 'short' : 'long' });
}

// ─── Main ────────────────────────────────────────────────────────────────────

/**
 * Format an ISO timestamp as a human-friendly relative string.
 *
 * @param iso    — ISO 8601 timestamp string
 * @param format — 'short' for compact UI, 'long' for detail views (default: 'short')
 * @param now    — optional reference "now" for testing
 */
export function formatRelativeTime(
    iso: string,
    format: 'short' | 'long' = 'short',
    now?: Date,
): string {
    const date = new Date(iso);
    const ref = now ?? new Date();
    const diffMs = ref.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const calDays = calendarDaysBetween(ref, date);
    const time = formatTime(date);
    const sep = format === 'short' ? ' · ' : ' at ';
    const sameYear = date.getFullYear() === ref.getFullYear();

    // Future dates
    if (diffMs < 0) {
        const futureDays = calendarDaysBetween(date, ref);
        if (futureDays === 0) return `Today${sep}${time}`;
        if (futureDays === 1) return `Tomorrow${sep}${time}`;
        if (futureDays <= 6) return `${dayName(date, format)}${sep}${time}`;
        if (sameYear) {
            const dateStr = date.toLocaleString('en-GB', { day: 'numeric', month: format === 'short' ? 'short' : 'long' });
            return `${dateStr}${sep}${time}`;
        }
        const dateStr = date.toLocaleString('en-GB', { day: 'numeric', month: format === 'short' ? 'short' : 'long', year: 'numeric' });
        return format === 'short' ? dateStr : `${dateStr}${sep}${time}`;
    }

    // Just now (< 1 minute)
    if (diffSec < 60) return 'Just now';

    // Minutes ago (1–59 min)
    if (diffMin < 60) {
        return format === 'short' ? `${diffMin} min ago` : `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    }

    // Hours ago (1–23h, but only if same calendar day)
    if (calDays === 0) {
        return format === 'short' ? `${diffHours}h ago` : `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }

    // Yesterday
    if (calDays === 1) return `Yesterday${sep}${time}`;

    // 2–6 days ago (use day name)
    if (calDays <= 6) return `${dayName(date, format)}${sep}${time}`;

    // 7+ days, same year
    if (sameYear) {
        const dateStr = date.toLocaleString('en-GB', { day: 'numeric', month: format === 'short' ? 'short' : 'long' });
        return `${dateStr}${sep}${time}`;
    }

    // Previous year(s)
    const dateStr = date.toLocaleString('en-GB', { day: 'numeric', month: format === 'short' ? 'short' : 'long', year: 'numeric' });
    return format === 'short' ? dateStr : `${dateStr}${sep}${time}`;
}

/**
 * Get the full absolute timestamp string for use in `title` attributes.
 * Always returns a consistent format regardless of how recent the time is.
 *
 * @example formatAbsoluteTime('2026-02-19T09:00:00Z') // "19 February 2026 at 09:00"
 */
export function formatAbsoluteTime(iso: string): string {
    const d = new Date(iso);
    const dateStr = d.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const time = formatTime(d);
    return `${dateStr} at ${time}`;
}

/**
 * Format a date header label for grouping (e.g., activity log date separators).
 * Returns "Today" for today's date, otherwise a human-readable date string.
 */
export function formatDateGroupLabel(dateKey: string, now?: Date): string {
    const ref = now ?? new Date();
    const todayIso = ref.toISOString().slice(0, 10);
    if (dateKey === todayIso) return 'Today';

    const yesterdayRef = new Date(ref);
    yesterdayRef.setDate(yesterdayRef.getDate() - 1);
    const yesterdayIso = yesterdayRef.toISOString().slice(0, 10);
    if (dateKey === yesterdayIso) return 'Yesterday';

    const d = new Date(`${dateKey}T00:00:00`);
    const sameYear = d.getFullYear() === ref.getFullYear();
    return d.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'long',
        ...(sameYear ? {} : { year: 'numeric' }),
    });
}
/**
 * Format a CalendarDateTime (from @internationalized/date) as a plain date
 * string with no time component. Use for order-level date labels in the UI.
 *
 * @example formatCalendarDate(parseDateTime('2025-01-10T10:00:00')) // "10 January 2025"
 */
export function formatCalendarDate(dt: { year: number; month: number; day: number }): string {
    const d = new Date(dt.year, dt.month - 1, dt.day);
    return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}
