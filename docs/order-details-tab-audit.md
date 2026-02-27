# Order Details Tab — Full Code Audit

**Audit date:** 2026-02-27
**Scope:** All 13 files in `src/components/OrderDetails/`, 8 associated hooks, and cross-reference with `dev_instruction_v3.1.md`, `ui-tokens.ts`, and `index.css`.

---

## Findings

### ✅ [DONE] [7/10] Duplicated initials-derivation logic — extract to a shared utility

**Files:**

- `TeamLeadCard.tsx` — lines 51–56
- `ExtraMembersCard.tsx` — lines 62–67
- `AssignedLeadEditModal.tsx` — lines 73–78, 119–124
- `ExtraMembersEditModal.tsx` — lines 84–89, 137–142

**Issue:** The exact same 4-line snippet to derive avatar initials from a name string is duplicated **6 times** across 4 files:

```ts
name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
```

This violates the DRY principle and increases the risk of divergence if the logic ever changes (e.g. handling single-word names safely — `n[0]` throws on empty strings for edge cases like `"John "` with a trailing space producing an empty segment).

**Fix:** Create a utility function in `src/utils/format-name.ts`:

```ts
export function getInitials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}
```

Replace all 6 call sites with `getInitials(name)`. The `filter(Boolean)` also guards against the edge case of empty segments.

---

### ✅ [DONE] [7/10] Duplicated member-row UI block across card and modal

**Files:**

- `ExtraMembersCard.tsx` — lines 69–91 (member row with hover-bg, Avatar, Tooltip, role)
- `ExtraMembersEditModal.tsx` — lines 91–116 (nearly identical row — same classes, same Avatar, same layout, but with a Remove button)

**Issue:** The member row markup (Avatar + name/role columns + rounded-xl hover container) is duplicated between the card and the modal. The only difference is the modal appends a remove button. This is approximately 25 lines of identical JSX.

**Fix:** Extract a shared `MemberRow` component (either in a dedicated file or co-located) that accepts an optional `action` slot or `onRemove` prop. Both `ExtraMembersCard` and `ExtraMembersEditModal` should use it.

---

### ✅ [DONE] [6/10] Duplicated ComboBox + "Add/Assign" button pattern across modals

**Files:**

- `TagsEditModal.tsx` — lines 130–166
- `AssignedLeadEditModal.tsx` — lines 103–155
- `ExtraMembersEditModal.tsx` — lines 123–173

**Issue:** Three modals share the same structural pattern: a `<div className="flex gap-2 items-end">` containing a `ComboBox` (with `selectedKey`, `onSelectionChange`, label, input, popover, listbox) and a secondary `Button` with an icon and text (`Add` / `Assign`). While content differs, the scaffolding is identical.

**Fix:** This is a lower-priority extraction. Note it for when these modals are next modified. Consider a `PickerWithAction` compound component if a fourth usage appears.

---

### ✅ [DONE] [6/10] `w-16` magic number repeated 9× in BillingContextCard

**File:** `BillingContextCard.tsx` — lines 137–139, 150, 153, 156, 175, 176, 179

**Issue:** The column width `w-16` (4rem / 64px) is hard-coded 9 times for the Qty / Revenue / Expense columns. If the column width needs to change, all 9 must be updated in sync. The `dev_instruction_v3.1.md` states: _"No Hardcoded Values — Use tokens."_

**Fix:** Add a constant to `ui-tokens.ts`:

```ts
export const BILLING_COLUMN_WIDTH = "w-16";
```

Replace all 9 occurrences in `BillingContextCard.tsx` with the token.

---

### ✅ [DONE] [6/10] Repeated column-header class string in BillingContextCard

**File:** `BillingContextCard.tsx` — lines 135, 137, 138, 139, 171, 187

**Issue:** The class string `t-mini font-black uppercase tracking-widest text-default-400` is repeated verbatim 6 times in this single file (3 column headers + 2 footer labels + 1 "Profit" label). A token `TEXT_TINY_MUTED_BOLD` with this exact value already exists in `ui-tokens.ts` (line 98) but is not imported or used.

**Fix:** Import `TEXT_TINY_MUTED_BOLD` from `ui-tokens.ts` and replace all 6 inline occurrences.

---

### ✅ [DONE] [5/10] Inconsistent header spacing — `mb-1` applied only to ContactDetailsCard

**Files:**

- `ContactDetailsCard.tsx` — line 91: `className="flex items-center justify-between mb-1"`
- `OrderSummaryCard.tsx` — line 63: `className="flex items-center justify-between"` (no `mb-1`)
- `SessionDetailsCard.tsx` — line 38: same — no `mb-1`
- `TeamLeadCard.tsx` — line 37: same — no `mb-1`
- `ExtraMembersCard.tsx` — line 41: same — no `mb-1`
- `BillingContextCard.tsx` — line 74: same — no `mb-1`

**Issue:** Only `ContactDetailsCard` adds `mb-1` to its header row. All other cards omit it. This creates a 4px visual inconsistency in header-to-content spacing.

**Fix:** Remove `mb-1` from `ContactDetailsCard.tsx` line 91 to match every other card, or add it to all — but be consistent. Removing it is the lower-risk fix.

---

### ✅ [DONE] [5/10] Inconsistent Modal.Body padding across modals

**Files:**

- `TagsEditModal.tsx` — line 82: `className="flex flex-col gap-4 px-6 pb-4"`
- `ContactEditModal.tsx` — line 127: `className="flex flex-col gap-5 px-6 pb-2"`
- `SessionEditModal.tsx` — line 105: `className="flex flex-col gap-5 px-6 pb-2"`
- `AssignedLeadEditModal.tsx` — line 67: `className="flex flex-col gap-4 px-6 pb-2"`
- `BillingContextEditModal.tsx` — line 113: `className="flex flex-col gap-4 px-6 pb-2"`
- `ExtraMembersEditModal.tsx` — line 79: `className="flex flex-col gap-4 px-6 pb-2"`

**Issue:** Two inconsistencies:

1. `TagsEditModal` uses `pb-4`, all others use `pb-2`.
2. `ContactEditModal` and `SessionEditModal` use `gap-5`, the other 4 use `gap-4`.

**Fix:** Standardise to `gap-4 px-6 pb-2` across all modals (majority pattern). Alternatively, define a `MODAL_BODY_DEFAULT` token in `ui-tokens.ts` to prevent future drift.

---

### ✅ [DONE] [5/10] Modal placement inconsistency — inside vs. outside `<Card>`

**Files:**

- `OrderSummaryCard.tsx` — lines 133–138: `<TagsEditModal>` is rendered **inside** `<Card>`.
- `ContactDetailsCard.tsx` — lines 114–119: `<ContactEditModal>` is rendered **outside** `<Card>`, via a Fragment.
- Same outside pattern in `SessionDetailsCard.tsx`, `TeamLeadCard.tsx`, `ExtraMembersCard.tsx`, `BillingContextCard.tsx`.

**Issue:** `OrderSummaryCard` is the **only** card that places its edit modal inside the `<Card>` element. All 5 other cards use a `<>…</>` Fragment to render the modal as a sibling. While HeroUI modals portal to the body so this has no visual effect, it is an inconsistency that can cause confusion during code review.

**Fix:** In `OrderSummaryCard.tsx`, wrap the card and modal in a Fragment to match all other cards:

```tsx
return (
    <>
        <Card className="group h-full">
            {/* ... */}
        </Card>
        <TagsEditModal ... />
    </>
);
```

---

### ✅ [DONE] [5/10] Duplicated "Current lead" card block between AssignedLeadEditModal and ExtraMembersEditModal

**Files:**

- `AssignedLeadEditModal.tsx` — lines 70–99 (avatar + name + role + remove button in `bg-default/40` container)
- `ExtraMembersEditModal.tsx` — lines 91–116 (structurally identical per-member card)

**Issue:** The "member card with remove button" UI is replicated in both modals with the same class strings (`flex items-center gap-3 rounded-xl px-3 py-2 bg-default/40`), the same `Avatar` config, and the same remove button styling. This is a sub-case of the member-row duplication noted above and further reinforces the case for extraction.

**Fix:** Same as Finding #2 — extract a `MemberRow` component.

---

### ✅ [DONE] [4/10] `BillingContextEditModal` has a template-literal className with no interpolation

**File:** `BillingContextEditModal.tsx` — line 126

**Issue:** The line uses a template literal where a plain string is sufficient:

```tsx
<p className={`t-mini font-bold uppercase tracking-[0.15em] text-default-400 mb-1`}>Quantities</p>
```

There is no variable interpolated in this template literal.

**Fix:** Replace with a plain string:

```tsx
<p className="t-mini font-bold uppercase tracking-[0.15em] text-default-400 mb-1">Quantities</p>
```

---

### ✅ [DONE] [4/10] Inconsistent sub-heading label classes across modals

**Files:**

- `TagsEditModal.tsx` — line 91, 136: `className="t-mini font-bold uppercase tracking-[0.15em] text-default-400"`
- `ContactEditModal.tsx` — line 30: same
- `SessionEditModal.tsx` — line 108, 183: same
- `AssignedLeadEditModal.tsx` — line 109: same
- `BillingContextEditModal.tsx` — line 126: same (with extra `mb-1`)
- `ExtraMembersEditModal.tsx` — line 129: same

**Issue:** The sub-heading label class `t-mini font-bold uppercase tracking-[0.15em] text-default-400` appears 8 times across 6 modals but is not a token. This is a strong candidate for a token in `ui-tokens.ts`.

**Fix:** Add to `ui-tokens.ts`:

```ts
export const TEXT_MODAL_SECTION_LABEL = "t-mini font-bold uppercase tracking-[0.15em] text-default-400";
```

Replace all 8 occurrences with the token.

---

### ✅ [DONE] [4/10] `BillingContextCard` — margin thresholds (30, 10) are magic numbers

**File:** `BillingContextCard.tsx` — line 50

```ts
const marginColor = margin >= 30 ? 'success' : margin >= 10 ? 'warning' : 'danger';
```

**Issue:** The threshold values `30` and `10` are business-logic magic numbers with no documentation. A reader cannot tell why these specific percentages were chosen.

**Fix:** Define named constants in `src/constants/billing.ts` (or similar):

```ts
export const MARGIN_THRESHOLD_GOOD = 30;
export const MARGIN_THRESHOLD_ACCEPTABLE = 10;
```

Update the ternary to use these constants.

---

### ✅ [DONE] [4/10] `BillingContextCard.fmt` closes over `currency` from first scope line

**File:** `BillingContextCard.tsx` — lines 35–36

```ts
const currency = scopeLines[0]?.currency ?? 'EUR';
const fmt = (amount: number) => formatCurrencyAmount(amount, currency, 0);
```

**Issue:** If `scopeLines` is empty, the currency silently defaults to `'EUR'`. This is a hard-coded fallback business value embedded in a UI component. Additionally, `fmt` is recreated on every render even though `currency` will rarely change.

**Fix:**

1. Move the `'EUR'` fallback to a named constant: `DEFAULT_CURRENCY` in billing constants.
2. Wrap `fmt` in a `useMemo` or `useCallback` keyed on `currency`.

---

### ✅ [DONE] [4/10] `ContactEditModal` — email regex is defined inline

**File:** `ContactEditModal.tsx` — line 9

```ts
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

**Issue:** This regex is co-located with the modal component. If another part of the app needs email validation, this will be duplicated. The pattern itself is minimal (no TLD check, no plus-addressing).

**Fix:** Move to `src/utils/validators.ts` (or similar) so it can be shared:

```ts
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

---

### ✅ [DONE] [3/10] `BillingContextEditModal.handleSave` — manual batch-mutation counter

**File:** `BillingContextEditModal.tsx` — lines 61–94

**Issue:** The `handleSave` function uses a manual counter (`remaining`) and boolean flag (`hadError`) to track completion of multiple concurrent mutations. This is fragile — if an `onSuccess` and `onError` fire out of order or a mutation is retried, the counter could desync. Using `Promise.all` (as `TagsEditModal.handleSave` does) is safer and more idiomatic.

**Fix:** Refactor to use `Promise.all` with `mutateAsync`:

```ts
async function handleSave() {
    if (changedLines.length === 0) { onOpenChange(false); return; }
    try {
        await Promise.all(
            changedLines.map((line) =>
                updateQuantity.mutateAsync({ id: line.id, quantityInput: drafts.get(line.id)! })
            )
        );
        toast('Quantities Updated', { variant: 'success', description: '...' });
        onOpenChange(false);
    } catch (error) {
        toast('Update Failed', { variant: 'danger', description: (error as Error).message || '...' });
    }
}
```

---

### ✅ [DONE] [3/10] `orderDate` prop passed to `SessionDetailsCard` but not to `SessionEditModal`

**File:** `SessionDetailsCard.tsx` — lines 18, 20, 75–80

**Issue:** `SessionDetailsCard` receives `orderDate` and uses it as a fallback display date via `const displayDate = sessionTime ?? orderDate;`. However, the `SessionEditModal` is not given `orderDate` — it only receives `sessionTime`. If a user opens the modal when `sessionTime` is `null`, the date field will be empty even though the card shows `orderDate`. This is a minor UX disconnect rather than a bug.

**Fix:** If `orderDate` should pre-populate the date field when `sessionTime` is null, pass it to `SessionEditModal` and default the draft to `sessionTime ?? orderDate`. If the current behaviour is intentional (user must explicitly pick a session time), add a code comment explaining the design choice.

---

### ✅ [DONE] [3/10] `useOrderDetails` — `useMemo` dependency array omits `order`

**File:** `useOrderDetails.ts` — line 81

```ts
}, [lines]);
```

**Issue:** The `useMemo` only depends on `lines`, but the output also includes `taxTreatment` which is derived from `lines` — this is correct. However, `order` is returned outside the memo, which is fine. The memo dependency array is actually correct here, but deserves a clarifying comment since the `order` dependency question is non-obvious to a reviewer.

**Fix:** Add a comment: `// order is returned directly — not derived in this memo.`

---

### ✅ [DONE] [3/10] `SessionEditModal` imports from `@internationalized/date` twice inconsistently

**File:** `SessionEditModal.tsx` — lines 18–20

```ts
import type { DateValue } from '@internationalized/date';
import { parseDateTime } from '@internationalized/date';
import type { CalendarDateTime } from '@internationalized/date';
```

**Issue:** Three separate import statements from `@internationalized/date` — two `type` imports that could be combined.

**Fix:** Merge into two statements:

```ts
import type { DateValue, CalendarDateTime } from '@internationalized/date';
import { parseDateTime } from '@internationalized/date';
```

---

### ✅ [DONE] [2/10] Inconsistent `aria-label` specificity on edit buttons

**Files:**

- `OrderSummaryCard.tsx` — line 68: `aria-label="Edit tags"`
- `ExtraMembersCard.tsx` — line 50: `aria-label="Edit extra members"`
- `ContactDetailsCard.tsx` — line 96: `aria-label="Edit"`
- `SessionDetailsCard.tsx` — line 43: `aria-label="Edit"`
- `TeamLeadCard.tsx` — line 42: `aria-label="Edit"`
- `BillingContextCard.tsx` — line 84: `aria-label="Edit"`

**Issue:** Two cards use descriptive labels (`"Edit tags"`, `"Edit extra members"`) while four use a generic `"Edit"`. The generic label is less accessible — a screen reader user navigating between cards would hear "Edit" repeated without context.

**Fix:** Update the 4 generic labels to be descriptive:

- `ContactDetailsCard`: `"Edit contacts"`
- `SessionDetailsCard`: `"Edit session details"`
- `TeamLeadCard`: `"Edit assigned lead"`
- `BillingContextCard`: `"Edit billing lines"`

---

### ✅ [DONE] [2/10] `useTeam` hook called in both team-related modals — no caching concern

**Files:**

- `AssignedLeadEditModal.tsx` — line 21
- `ExtraMembersEditModal.tsx` — line 23

**Issue:** Both modals call `useTeam()` independently. This is fine because TanStack Query deduplicates identical queries — the same data is shared. **No action required.** Noted for completeness.

---

## Summary

| Category | Count |
|:--|:--|
| Duplications | 5 |
| Consistency | 5 |
| Dead code & hygiene | 4 |
| Optimisation | 2 |
| Other (accessibility, UX) | 3 |
| **Total** | **19** |

| Severity | Count |
|:--|:--|
| 7 (high) | 2 |
| 6 | 3 |
| 5 | 4 |
| 4 | 4 |
| 3 | 4 |
| 2 | 2 |
