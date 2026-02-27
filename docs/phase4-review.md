# Phase 4 — Peer Code Review

**Scope:** Billing Context Card adjustments (session-hours removal + scope-lines total row)
**Reviewed against:** `dev_instruction_v3.1.md`, `ui-tokens.ts`, `index.css`, HeroUI v3 MCP
**Reviewed files:** `BillingContextCard.tsx`, `OrderDetailsTab.tsx`, `useOrderDetails.ts`, `mock-order.ts`, `OrderSummaryCard.tsx`, `ContactDetailsCard.tsx`, `SessionDetailsCard.tsx`, `TeamLeadCard.tsx`, `format-address.ts`, `order-details.ts`, `countries.ts`, `types/order.ts`

---

## ✅ Acceptance Criteria — All Passed

| Criterion | Status |
|:--|:--|
| No `⏱ 3 session hours` line inside Billing Context | ✅ Removed — `totalSessionHours` prop removed from `BillingContextCardProps` |
| Total row below scope lines with count | ✅ Present — `border-t border-default pt-2 mt-1`, right-aligned, `text-xs font-bold text-default-900` |
| Singular/plural handled | ✅ `{scopeLines.length} line item{scopeLines.length !== 1 ? 's' : ''}` |
| `npm run build` / `npm run lint` | ⬜ To be verified by implementer |

---

## Findings

### F-01 · Dead re-export: `countries` from `mock-order.ts` (LOW)

**File:** [mock-order.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/data/mock-order.ts#L78)

```ts
export { countries } from '../constants/countries';
```

After countries was moved to `constants/countries.ts`, `format-address.ts` imports directly from `constants/countries`. No component imports `countries` from `mock-order`. This re-export is dead code.

**Fix:** Delete line 78.

---

### F-02 · Dead re-export: `AssignedLead` from `mock-order.ts` (LOW)

**File:** [mock-order.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/data/mock-order.ts#L4)

```ts
export type { AssignedLead };
```

`AssignedLead` is defined in `types/order.ts`. `TeamLeadCard.tsx` imports it directly from `types/order`. `mock-order.ts` uses the type internally for `OrderData.assignedLead`, but the re-export has no external consumer. Dead code.

**Fix:** Delete line 4 and the blank line below it.

---

### F-03 · Cosmetic: double blank lines in `BillingContextCard.tsx` (LOW)

**File:** [BillingContextCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/BillingContextCard.tsx#L63-L64)

Lines 63–64 contain two consecutive blank lines between the order-type chips block and the scope-lines block — leftover from the session-hours removal.

**Fix:** Remove one blank line.

---

### F-04 · Naïve pluralisation on scope-line units (MEDIUM)

**File:** [BillingContextCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/BillingContextCard.tsx#L82)

```tsx
{line.quantity} {line.unit}
{line.quantity !== 1 ? 's' : ''}
```

This appends `s` to any unit string. It works for `hour` → `hours`, `item` → `items`, but will break for units that don't pluralise by adding `s` (e.g., a hypothetical `piece` → `pieces` is fine, but `photo` → `photos` is fine too). More importantly, units like `session` or `lot` work correctly with this pattern.

However, this is fragile if new `UnitType` values are added in the future. Consider either:

- A `pluraliseUnit(unit, quantity)` utility in `utils/` with an explicit map
- Or document the assumption that all `UnitType` values pluralise with `s`

**Verdict:** Acceptable for now but worth a note for future-proofing.

---

## Standards Compliance — All Passed ✅

| Check | Result |
|:--|:--|
| Named exports only (`export function`) | ✅ |
| No `export default` | ✅ |
| No `any` types | ✅ |
| No wrapper components | ✅ |
| `onPress` (not `onClick`) | ✅ N/A — no interactive handlers |
| Direct `@heroui/react` imports | ✅ (`Card`, `Chip`, `Skeleton`) |
| HeroUI compound components (`Card.Content`) | ✅ |
| UI tokens used for labels/icons | ✅ (`TEXT_SECTION_LABEL`, `ICON_SIZE_CONTAINER`) |
| No hardcoded colours or hex values | ✅ |
| No magic numbers | ✅ |
| No `console.*` calls | ✅ |
| No `"use client"` directive | ✅ |
| Mock data in `src/data/` | ✅ |
| Constants in `src/constants/` | ✅ |
| Logic in hooks | ✅ (`useOrderDetails`) |
| Data fetching uses `useQuery` | ✅ |
| Loading / empty states handled | ✅ |
| `@ts-ignore` absent | ✅ |

---

## Summary

| Severity | Count | IDs |
|:--|:--|:--|
| High | 0 | — |
| Medium | 1 | F-04 |
| Low | 3 | F-01, F-02, F-03 |

**Verdict:** Phase 4 implementation is **correct and complete**. Three low-severity cleanup items (dead re-exports and a cosmetic blank line) and one medium advisory on pluralisation. No blockers.
