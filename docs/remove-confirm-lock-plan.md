# Remove Confirm & Lock Functionality — Implementation Plan

> [!NOTE]
> **STATUS: ✅ COMPLETED** — All 9 files modified, `useHasConfirmedOrders.ts` deleted, `npx tsc --noEmit` clean. Verified in browser: no lock icons, all draft lines editable, voided lines intact.

## Goal

Remove the "confirmed" billing line status concept from the codebase. Currently no UI button triggers confirmation — the only visible artifact is a green 🔒 lock icon on lines that ship with `status: 'confirmed'` in mock data. This plan strips the concept cleanly without breaking the app.

> [!IMPORTANT]
> The **voided** status and its associated fields (`voidedAt`, `voidedBy`, `voidReason`) are **kept** — they serve a different purpose (soft-delete / audit trail for cancelled lines).

---

## Affected Files (11 files)

### Spec Documentation

#### [MODIFY] [erp_pricing_spec_v1_7.md](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/docs/erp_pricing_spec_v1_7.md)

The spec has 16 references to "confirmed" across multiple sections. Changes:

- **§8.2** (line 323): Remove "Immutable after first confirmed order" from currency field — currency is now always editable
- **§10.2** (line 566): Remove "Order confirmed => billing lines locked" from the order creation workflow
- **§12.1** (line 769): Change status enum from `draft | confirmed | voided` → `draft | voided`
- **§12.1** (lines 772–773): Remove `confirmed_at` and `confirmed_by` fields
- **§12.2** (lines 789–791): Remove "Confirmed BLIs" immutability rule and corrections note — replace with a note that immutability will be handled by future order-level state machine
- **§14** appendix (lines 948, 971): Remove confirmed BLI references
- **§15** currency rules (lines 1054–1056): Remove "immutable after first confirmed order" rule
- **§16** changelog (line 1151): Keep as historical record
- **§17** open questions (lines 1257, 1264): Mark the "pricing changes after confirmation" question as resolved/removed

> [!NOTE]
> The last two entries at lines 1233 and 1242 use "confirm" in the sense of "verify/clarify" (not billing confirmation) — these are **not changed**.

---

### Types

#### [MODIFY] [pricing.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/types/pricing.ts)

- Change `BillingLineStatus` from `'draft' | 'confirmed' | 'voided'` → `'draft' | 'voided'`
- Remove `confirmedAt` and `confirmedBy` fields from `BillingLineInstance`

---

### Mock Data

#### [MODIFY] [mock-billing-lines.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/data/mock-billing-lines.ts)

- Change `bli-1-1` status from `'confirmed'` → `'draft'`
- Remove all `confirmedAt` and `confirmedBy` fields from every billing line (6 occurrences)

---

### Hooks

#### [MODIFY] [useBillingLineMutations.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useBillingLineMutations.ts)

- **Delete** `useConfirmBillingLine()` function (lines 127–144)
- **Delete** `useBulkConfirmBillingLines()` function (lines 166–199)
- Update `simulateUpdateLine` guard (line 60–63): change from `status !== 'draft'` to `status === 'voided'`, keeping voided lines immutable but removing the confirmed concept
- Remove `BULK_MOCK_API_DELAY` import if no longer used after deletion

#### [MODIFY] [useOrderBilling.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useOrderBilling.ts)

- Remove `confirmed` key from `breakdown` and `lineCount` in `OrderBillingSummary` interface
- Remove `confirmedLines` filter variable (line 81)
- Remove `confirmed` breakdown calculations (lines 102–106)
- Remove `confirmed` line count (line 116)

> [!NOTE]
> The `breakdown` and `lineCount` with `confirmed` are **not consumed by any component** — safe to remove.

#### [DELETE] [useHasConfirmedOrders.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useHasConfirmedOrders.ts)

- Entire file is deleted — it only exists to check if confirmed orders exist (always returns `false` in mock mode anyway)

#### [MODIFY] [useAddManualLine.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useAddManualLine.ts)

- Remove `confirmedAt: null` and `confirmedBy: null` from the new line template (lines 205–206)

---

### UI Components

#### [MODIFY] [BillingLineRow.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderBilling/BillingLineRow.tsx)

- Remove `const isConfirmed = line.status === "confirmed"` (line 43)
- Remove green lock icon + tooltip next to item name (lines 104–111)
- Simplify Qty column: remove `!isConfirmed` guard — show `QuantityEditor` for all non-voided lines (line 122)
- Simplify Actions column: remove `!isConfirmed` guard and the locked-state branch (lines 238–278) — show edit/void buttons for all non-voided lines

#### [MODIFY] [BillingLineDetail.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderBilling/BillingLineDetail.tsx)

- Remove the "Confirmed: {time} by {user}" display block (lines 158–163)

---

### Project Pricing (downstream effect)

#### [MODIFY] [PricingEngine.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/Pricing/PricingEngine.tsx)

- Remove `useHasConfirmedOrders` import (line 8)
- Remove `const { data: hasConfirmedOrders } = useHasConfirmedOrders(projectId)` (line 51)
- Change `lockedCurrency` prop from `hasConfirmedOrders ? initialCurrency : null` → `null` (line 203)

> [!NOTE]
> The `lockedCurrency` prop on `RateCardComboBox` is **kept** — it may be useful later for other locking mechanisms. We just always pass `null` for now.

---

## What is NOT Changed

| Item | Reason |
|---|---|
| `'voided'` status + `voidedAt`/`voidedBy`/`voidReason` | Different purpose — soft-delete audit trail |
| `RateCardComboBox` `lockedCurrency` prop | Kept for future use; just receives `null` |
| `erp_pricing_spec_v1_7.md` and other docs | Spec docs remain as-is; they document the intended architecture |
| `BULK_MOCK_API_DELAY` constant | Check if other hooks use it; remove import only from this file if unused |

---

## Verification Plan

### Automated (TypeScript build)

```bash
cd "/Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My Drive/Antigravity/ERP"
npx tsc --noEmit
```

A clean build confirms no type errors from removing `confirmed` fields, status values, or deleted hooks.

### Manual Verification

1. Open the app (`npm run dev` already running)
2. Navigate to **Order page → Billing tab**
3. Verify:
   - **No green lock icon** appears on any billing line (previously appeared on "Photo Shoot" line)
   - **All draft lines** show the quantity editor and edit/void action buttons
   - **Voided lines** still display correctly (greyed out, "Voided" label)
   - Editing quantity and modifiers still works
   - Voiding a line still works
4. Navigate to **Project page → Pricing tab**
5. Verify:
   - Rate Card selector shows **all rate cards** as selectable (no currency-mismatch disabling)
