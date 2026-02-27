# Peer Review — Audit Findings 1–5

**Date:** 2026-02-27  
**Reviewer:** Senior Front-End Developer  
**Build:** `tsc --noEmit` ✅ clean

---

## Finding 1 — Duplicated initials-derivation logic → shared utility

### Verdict: ✅ PASS

**What was done:**

- Created `src/utils/format-name.ts` with `getInitials()` — includes `filter(Boolean)` guard for trailing spaces, JSDoc with examples.
- All **6** original call sites replaced with `getInitials()`:
  - `TeamLeadCard.tsx` — line 51
  - `ExtraMembersCard.tsx` — line 68
  - `AssignedLeadEditModal.tsx` — lines 73, 119
  - `ExtraMembersEditModal.tsx` — lines 90, 136
- Grep for the old inline pattern `.split(' ').slice(0, 2).map` returns **zero hits** — no leftover logic.

**Quality:** Named export, proper typing, edge-case safe. Clean.

---

## Finding 2 — Duplicated member-row UI block → shared component

### Verdict: ⚠️ NOT ADDRESSED

**Expected:** Extract a shared `MemberRow` component used by both `ExtraMembersCard` and the two edit modals (`ExtraMembersEditModal`, `AssignedLeadEditModal`).

**Current state:** The member-row UI block is still **duplicated in 3 locations**:

| File | Lines | Layout |
|:--|:--|:--|
| `ExtraMembersCard.tsx` | 63–85 | Avatar + name/role with Tooltip + hover container |
| `ExtraMembersEditModal.tsx` | 84–111 | Avatar + name/role + remove button in `bg-default/40` |
| `AssignedLeadEditModal.tsx` | 70–93 | Same as above |

The class strings `flex items-center gap-3 rounded-xl px-3 py-2 bg-default/40` (modal variant) and `rounded-xl -mx-2 px-2 py-1 transition-colors hover:bg-default/40 cursor-default flex items-center gap-3` (card variant) are still inline and duplicated.

**Action required:** Extract a `MemberRow` component (or co-locate as a private helper). The card variant adds hover + Tooltip; the modal variant adds a remove button. Suggestion:

```tsx
// In shared/ or co-located
interface MemberRowProps {
    name: string;
    role: string;
    variant: 'card' | 'modal';
    onRemove?: () => void;
    removeLabel?: string;
}
```

---

## Finding 3 — Duplicated ComboBox + "Add/Assign" button pattern

### Verdict: ✅ PASS

The audit recommendation was to **note it for future** and only extract if a 4th usage appears. No extraction was expected. The pattern remains consistent across all 3 modals (`TagsEditModal`, `AssignedLeadEditModal`, `ExtraMembersEditModal`) with the same `flex gap-2 items-end` container, `ComboBox` + secondary `Button` structure.

---

## Finding 4 — `w-16` magic number → `BILLING_COLUMN_WIDTH` token

### Verdict: ✅ PASS

**What was done:**

- Added `BILLING_COLUMN_WIDTH = "w-16"` to `ui-tokens.ts` (line 85) with descriptive comment.
- `BillingContextCard.tsx` now imports `BILLING_COLUMN_WIDTH` (line 7) and uses it in all **9** occurrences:
  - Column headers: lines 137, 138, 139
  - Row cells: lines 150, 153, 156
  - Footer: lines 175, 176, 179

- Grep for standalone `"w-16"` in `BillingContextCard.tsx` returns **zero hits** — all replaced.

**Quality:** Properly classified under "Table cell constraints" section in `ui-tokens.ts`, right next to `FILE_NAME_MAX_WIDTH`. Good placement.

---

## Finding 5 — Repeated column-header class string → use `TEXT_TINY_MUTED_BOLD`

### Verdict: ✅ PASS

**What was done:**

- `BillingContextCard.tsx` now imports `TEXT_TINY_MUTED_BOLD` (line 7) and uses it in all **6** occurrences:
  - "Rate Items" header: line 135
  - Column headers (via combined class): lines 137, 138, 139
  - Footer "line items" label: line 171
  - "Profit" label: line 187

- Grep for the old inline pattern `t-mini font-black uppercase tracking-widest text-default-400` in `BillingContextCard.tsx` returns **zero hits** (only token references remain).

**Quality:** Consistent with how `TEXT_TINY_MUTED_BOLD` is used elsewhere in the codebase (Timeline/Pipeline section).

---

## Bonus observation

`TagsEditModal.tsx` line 82 — `Modal.Body` padding was changed from `pb-4` to `pb-2`, aligning with the majority pattern across all other modals. This resolves part of audit Finding #7 (inconsistent Modal.Body padding) as a bonus.

---

## Summary

| Finding | Status | Notes |
|:--|:--|:--|
| 1 — Initials utility | ✅ PASS | Clean extraction, all 6 sites migrated |
| 2 — Member-row component | ⚠️ NOT DONE | Still duplicated in 3 files |
| 3 — ComboBox pattern | ✅ PASS | Noted for future, no action needed |
| 4 — `BILLING_COLUMN_WIDTH` | ✅ PASS | Token added, all 9 uses replaced |
| 5 — `TEXT_TINY_MUTED_BOLD` | ✅ PASS | Token used, all 6 inlines replaced |

**Overall: 4/5 findings resolved. Finding 2 remains open.**
