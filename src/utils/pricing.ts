import { AppliedRuleSnapshot } from "../types/pricing";

/**
 * Parses a JSON string containing pricing rules into a typed object.
 * Returns null if parsing fails or the object is empty.
 */
export function parsePricingRules(rulesJson?: string | null): AppliedRuleSnapshot | null {
    if (!rulesJson) return null;

    try {
        const parsed = JSON.parse(rulesJson);
        return Object.keys(parsed).length > 0 ? (parsed as AppliedRuleSnapshot) : null;
    } catch {
        return null;
    }
}
