# Order Details Tab — Second-Round Code Audit

**Audit date:** 2026-02-27  
**Scope:** All 14 files in `src/components/OrderDetails/`, 8 associated hooks/utils/constants, cross-referenced with `dev_instruction_v3.1.md`, `ui-tokens.ts`, and `index.css`.  
**Prior audit:** `docs/order-details-tab-audit.md` — all 19 findings resolved. This report contains only **new** issues.

---

## Findings

### [6/10] `BillingContextCard` uses `line.name` as React `key` — not guaranteed unique

**File:** `BillingContextCard.tsx` — line 150

```tsx
{scopeLines.map((line, index) => (
    <div key={line.name}>
```

**Issue:** `line.name` is a display name derived from `rateItem.displayName ?? rateItem.name` in `useOrderDetails`. If two rate items share a display name (e.g. "Photo Shoot" at different rates), React will receive duplicate keys, causing rendering bugs — incorrect diff reconciliation, skipped updates, or console warnings. The `index` parameter is already destructured but unused as key.

**Fix:** Use a stable, unique identifier as the key. `scopeLines` are aggregated by `rateItem.id` in `useOrderDetails`, so the map key is always unique. Expose it by adding an `id` field to the `ScopeLine` interface:

```diff
// useOrderDetails.ts — ScopeLine interface
 export interface ScopeLine {
+    id: string;
     name: string;
     // ...

// useOrderDetails.ts — scopeMap.set
-scopeMap.set(rateItem.id, {
+scopeMap.set(rateItem.id, { id: rateItem.id,

// BillingContextCard.tsx — line 150
-<div key={line.name}>
+<div key={line.id}>
```

---

### [5/10] Repeated inline label class `text-xs text-default-400 font-medium` in `OrderSummaryCard` — not tokenised

**File:** `OrderSummaryCard.tsx` — lines 76, 98, 120, 124

```tsx
<p className="text-xs text-default-400 font-medium mb-1">Name</p>
<p className="text-xs text-default-400 font-medium mb-2">Tags</p>
<p className="text-xs text-default-400 font-medium mb-1.5">Created</p>
<p className="text-xs text-default-400 font-medium mb-1.5">Modified</p>
```

**Issue:** The base class `text-xs text-default-400 font-medium` is repeated 4 times with varying bottom margins (`mb-1`, `mb-2`, `mb-1.5`). Per `dev_instruction_v3.1.md` §UI Tokens: _"Always import from ui-tokens.ts instead of writing ad-hoc classes."_ A near-identical token `TEXT_TINY_LABEL` already exists (`text-tiny text-default-400 capitalize`) but uses `text-tiny` and `capitalize`, making it unsuitable. A dedicated token is needed.

**Fix:** Add to `ui-tokens.ts`:

```ts
export const TEXT_FIELD_LABEL = "text-xs text-default-400 font-medium";
```

Replace all 4 occurrences, keeping the per-instance margin as a separate class:

```tsx
<p className={`${TEXT_FIELD_LABEL} mb-1`}>Name</p>
<p className={`${TEXT_FIELD_LABEL} mb-2`}>Tags</p>
<p className={`${TEXT_FIELD_LABEL} mb-1.5`}>Created</p>
<p className={`${TEXT_FIELD_LABEL} mb-1.5`}>Modified</p>
```

---

### [5/10] Repeated `Modal.Icon` class string across all 6 modals — not tokenised

**Files:**

- `TagsEditModal.tsx` — line 76
- `ContactEditModal.tsx` — line 122
- `SessionEditModal.tsx` — line 99
- `AssignedLeadEditModal.tsx` — line 64
- `BillingContextEditModal.tsx` — line 97
- `ExtraMembersEditModal.tsx` — line 76

```tsx
<Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
```

**Issue:** The class string `"bg-accent-soft text-accent-soft-foreground"` is duplicated verbatim across all 6 edit modals. Per `dev_instruction_v3.1.md` §UI Tokens, repeated class strings should be tokenised to prevent drift.

**Fix:** Add to `ui-tokens.ts`:

```ts
export const MODAL_ICON_DEFAULT = "bg-accent-soft text-accent-soft-foreground";
```

Replace all 6 occurrences:

```tsx
<Modal.Icon className={MODAL_ICON_DEFAULT}>
```

---

### [5/10] Repeated edit-button class string across all 6 cards — not tokenised

**Files:**

- `OrderSummaryCard.tsx` — line 69
- `ContactDetailsCard.tsx` — line 96
- `SessionDetailsCard.tsx` — line 43
- `TeamLeadCard.tsx` — line 43
- `ExtraMembersCard.tsx` — line 52
- `BillingContextCard.tsx` — line 89

```tsx
className="opacity-0 group-hover:opacity-100 transition-opacity"
```

**Issue:** This ghost edit-button reveal class string is duplicated 6 times across all card components. A change to the hover behaviour (e.g. adding `focus-visible:opacity-100` for keyboard accessibility) would require editing 6 files.

**Fix:** Add to `ui-tokens.ts`:

```ts
export const GHOST_EDIT_BUTTON = "opacity-0 group-hover:opacity-100 transition-opacity";
```

Replace all 6 occurrences with the token.

---

### [4/10] Inconsistent bottom margin on field labels inside `OrderSummaryCard`

**File:** `OrderSummaryCard.tsx` — lines 76, 98, 120, 124

| Label | Bottom margin |
|:--|:--|
| Name | `mb-1` (4px) |
| Tags | `mb-2` (8px) |
| Created | `mb-1.5` (6px) |
| Modified | `mb-1.5` (6px) |

**Issue:** Each label uses a different bottom margin. The same visual pattern (muted label above a value) should have a consistent gap across all fields within the same card.

**Fix:** Standardise to `mb-1.5` (the majority pattern used by the timestamp labels) for all four labels. The Tags section has a slightly larger TagGroup below it, but `mb-1.5` still provides sufficient visual separation.

---

### [4/10] `ContactEditModal` — missing error handling on save failure

**File:** `ContactEditModal.tsx` — lines 100–109

```tsx
mutate(
    { contact: primaryDraft, secondaryContact: ... },
    { onSuccess: () => onOpenChange(false) }
);
```

**Issue:** The `mutate` call provides an `onSuccess` handler but no `onError` handler. If the mutation fails, the modal stays open with no user feedback — the user sees no toast, no error state, and no indication of what happened. By contrast, `BillingContextEditModal` and `TagsEditModal` both handle errors with toast notifications.

**Fix:** Add an `onError` handler consistent with the other modals:

```tsx
mutate(
    { contact: primaryDraft, secondaryContact: ... },
    {
        onSuccess: () => onOpenChange(false),
        onError: (error: Error) => {
            toast('Update Failed', {
                variant: 'danger',
                description: error.message || 'Could not update contacts.',
            });
        },
    }
);
```

Requires adding `toast` to the import from `@heroui/react`.

---

### [4/10] `SessionEditModal` — missing error handling on save failure

**File:** `SessionEditModal.tsx` — lines 78–81

```tsx
mutate(
    { sessionTime: newSessionTime, address: addressDraft },
    { onSuccess: () => onOpenChange(false) }
);
```

**Issue:** Same as `ContactEditModal` — no `onError` handler. A failed session update silently leaves the modal open.

**Fix:** Add an `onError` handler matching the rest of the codebase:

```tsx
mutate(
    { sessionTime: newSessionTime, address: addressDraft },
    {
        onSuccess: () => onOpenChange(false),
        onError: (error: Error) => {
            toast('Update Failed', {
                variant: 'danger',
                description: error.message || 'Could not update session details.',
            });
        },
    }
);
```

Requires adding `toast` to the import from `@heroui/react`.

---

### [4/10] `AssignedLeadEditModal` — missing error handling on save failure

**File:** `AssignedLeadEditModal.tsx` — line 51

```tsx
mutate(currentLeadDraft, { onSuccess: () => onOpenChange(false) });
```

**Issue:** Same pattern — no `onError` handler. Silent failure.

**Fix:** Same approach:

```tsx
mutate(currentLeadDraft, {
    onSuccess: () => onOpenChange(false),
    onError: (error: Error) => {
        toast('Update Failed', {
            variant: 'danger',
            description: error.message || 'Could not update assigned lead.',
        });
    },
});
```

Requires adding `toast` to the import from `@heroui/react`.

---

### [4/10] `ExtraMembersEditModal` — missing error handling on save failure

**File:** `ExtraMembersEditModal.tsx` — line 63

```tsx
mutate(members, { onSuccess: () => onOpenChange(false) });
```

**Issue:** Same pattern — no `onError` handler. Silent failure.

**Fix:**

```tsx
mutate(members, {
    onSuccess: () => onOpenChange(false),
    onError: (error: Error) => {
        toast('Update Failed', {
            variant: 'danger',
            description: error.message || 'Could not update team members.',
        });
    },
});
```

Requires adding `toast` to the import from `@heroui/react`.

---

### [3/10] `OrderDetailsTab` — page header class string `text-2xl font-black text-default-900 tracking-tight` is repeated across 8 tabs but not tokenised

**File:** `OrderDetailsTab.tsx` — line 27

```tsx
<h2 className="text-2xl font-black text-default-900 tracking-tight">
```

**Issue:** This exact class string is used in at least 8 tab components (`OrderDetailsTab`, `OrderBillingTab`, `OverviewTab`, `TeamMembers`, `Timeline`, `ShotListTab`, `OriginalPhotos`, `ModerationTab`). While this finding spans beyond the Order Details tab, it originates here and creates a drift risk since all tabs share it.

**Fix:** Add to `ui-tokens.ts`:

```ts
export const TEXT_TAB_HEADING = "text-2xl font-black text-default-900 tracking-tight";
```

Replace all occurrences across the codebase.

---

### [3/10] `ExtraMembersEditModal` — `Date.now()` used to generate IDs for new members

**File:** `ExtraMembersEditModal.tsx` — line 53

```tsx
{ id: `extra-${Date.now()}`, name: member.user.name, role: member.role },
```

**Issue:** If a user clicks "Add" twice within the same millisecond (e.g. rapid double-click, or slow-motion automation), two members will receive the same ID. While unlikely in practice, it violates the principle of deterministic unique identifiers and could cause React key collisions.

**Fix:** Use a monotonically incrementing counter or `crypto.randomUUID()`:

```tsx
{ id: crypto.randomUUID(), name: member.user.name, role: member.role },
```

`crypto.randomUUID()` is available in all modern browsers and provides guaranteed uniqueness.

---

### [3/10] Inconsistent `eslint-disable` comment patterns across modals

**Files:**

- `ContactEditModal.tsx` — line 84: `// eslint-disable-next-line react-hooks/set-state-in-effect`
- `SessionEditModal.tsx` — line 56: `// eslint-disable-next-line react-hooks/set-state-in-effect`
- `BillingContextEditModal.tsx` — line 43: `// eslint-disable-next-line react-hooks/exhaustive-deps`

**Issue:** Three modals suppress ESLint warnings for the "reset state on open" `useEffect` pattern, but only two of them (`ContactEditModal`, `SessionEditModal`) suppress `react-hooks/set-state-in-effect`, while `BillingContextEditModal` suppresses `react-hooks/exhaustive-deps`. The remaining three modals (`TagsEditModal`, `AssignedLeadEditModal`, `ExtraMembersEditModal`) use the same pattern with no suppression comment at all. This inconsistency suggests either the linter rule is misconfigured or the suppressions are stale.

**Fix:** Audit which ESLint rules are actually triggered for each `useEffect`. Apply the appropriate suppression comment with an explanation consistently across all 6 modals, or if no rule fires, remove the unnecessary suppressions from `ContactEditModal` and `SessionEditModal`.

---

### [2/10] `BillingContextCard` — `Separator` applies inconsistent margins within the scope-lines section

**File:** `BillingContextCard.tsx` — lines 166, 173, 189

| Separator | margin class | Context |
|:--|:--|:--|
| Between rows (line 166) | `my-0` | Unusually tight — effectively no visual separator |
| Before footer totals (line 173) | `my-2` | Standard |
| Before profit (line 189) | `my-1.5` | Different from totals separator |

**Issue:** Three `Separator` instances within the same visual block use three different vertical margins. The `my-0` on inter-row separators effectively makes them invisible hairlines, while `my-2` and `my-1.5` create inconsistent breathing room in the footer.

**Fix:** Standardise -- use `my-1` for inter-row separators (slight breathing room) and `my-2` for both the totals and profit separators.

---

## Summary

| Category | Count |
|:--|:--|
| Missing error handling | 4 |
| Untokenised repeated class strings | 4 |
| Consistency | 3 |
| Key/ID correctness | 2 |
| **Total** | **13** |

| Severity | Count |
|:--|:--|
| 6 | 1 |
| 5 | 3 |
| 4 | 5 |
| 3 | 3 |
| 2 | 1 |
