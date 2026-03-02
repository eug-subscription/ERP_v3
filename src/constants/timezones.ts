/**
 * Static timezone lookup list.
 *
 * Rule: static config/UI constants live in `src/constants/` per dev_instruction_v3.1.md.
 * In production, replace with a comprehensive IANA database or API response.
 */
export type TimezoneLookup = { id: string; label: string };

export const TIMEZONES: TimezoneLookup[] = [
    { id: "Australia/Sydney", label: "Australia/Sydney (UTC+10/+11)" },
    { id: "America/Los_Angeles", label: "America/Los_Angeles (UTC-8/-7)" },
    { id: "America/New_York", label: "America/New_York (UTC-5/-4)" },
    { id: "Asia/Dubai", label: "Asia/Dubai (UTC+4)" },
    { id: "Asia/Singapore", label: "Asia/Singapore (UTC+8)" },
    { id: "Europe/Berlin", label: "Europe/Berlin (UTC+1/+2)" },
    { id: "Europe/London", label: "Europe/London (UTC+0/+1)" },
    { id: "Europe/Paris", label: "Europe/Paris (UTC+1/+2)" },
];
