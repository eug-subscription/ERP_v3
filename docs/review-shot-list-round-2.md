# Deep Peer Review — Shot Items Tab (Round 2)

**Date:** 2026-02-23  
**Standard:** `dev_instruction_v3.1.md`  
**HeroUI validation:** MCP tools (`get_component_docs`) — Checkbox, SearchField, RadioGroup, TextField, AlertDialog, Dropdown, Chip, Separator  
**Theme validation:** `index.css` `@theme` block, `ui-tokens.ts`

---

## Findings

### F-01 🔴 Must Fix — `onClick` on native `<button>` for image thumbnails

**File:** [ShotListTable.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/ShotListTable.tsx#L94-L106)  
**Rule:** dev_instruction §Core Principles #1 — "Use `onPress` for all interaction handlers"; §Pre-Commit Checklist — "onPress used for interactions (not onClick)"

This is a native `<button>` element, not a HeroUI `<Button>`, so technically `onPress` is not available here. The real issue is that a native `<button>` is used when a HeroUI `<Button>` would provide proper accessibility (touch, keyboard, screen reader) via `onPress`.

**Current:**

```tsx
<button
    key={url}
    type="button"
    className="relative w-10 h-10 rounded-lg bg-default border-2 border-surface overflow-hidden hover:z-10 transition-transform hover:scale-110 shadow-sm shrink-0 focus:outline-none focus:ring-2 focus:ring-accent"
    onClick={() => setPreviewImage({ url, name: item.name })}
    aria-label={`Preview ${item.name} photo ${idx + 1}`}
>
```

**Recommended:**

```tsx
<Button
    key={url}
    isIconOnly
    variant="ghost"
    className="relative w-10 h-10 rounded-lg bg-default border-2 border-surface overflow-hidden hover:z-10 transition-transform hover:scale-110 shadow-sm shrink-0 p-0"
    onPress={() => setPreviewImage({ url, name: item.name })}
    aria-label={`Preview ${item.name} photo ${idx + 1}`}
>
```

---

### F-02 🔴 Must Fix — `onClick` on drop-zone `<div>` in AddShotListItemsModal

**File:** [AddShotListItemsModal.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/AddShotListItemsModal.tsx#L138)  
**Rule:** dev_instruction §Core Principles #1, §Pre-Commit Checklist — `onPress` not `onClick`  

The drop-zone `<div>` uses a native `onClick` handler. Since this is a drag-and-drop zone with `role="button"`, it's a custom interactive element. The `onClick` is acceptable for native DOM elements **not** using HeroUI — but the `onKeyDown` handler that follows it is manually re-implementing what `onPress` provides for free. Consider wrapping with HeroUI's `Button` (variant `ghost`) or using React Aria's `usePress` hook to unify touch/keyboard/mouse handling.

**Current (L138-139):**

```tsx
onClick={() => fileInputRef.current?.click()}
onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
```

**Recommended:** Accept as-is (since it's an intentionally custom drop-zone) **OR** use `usePress` from React Aria:

```tsx
import { usePress } from "@react-aria/interactions";

const { pressProps } = usePress({
    onPress: () => fileInputRef.current?.click(),
});
// Spread pressProps on the div instead of onClick + onKeyDown
```

> [!NOTE]
> This is borderline since it's a native element with a legitimate drag-and-drop role. The manual keyboard handling is functional. **Severity downgraded from 🔴 to 🟡 if you consider the drop-zone pattern acceptable.**

---

### F-03 🟡 Should Fix — `onChange` on `RadioGroup` should be verified

**File:** [AddShotListItemsModal.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/AddShotListItemsModal.tsx#L179-L182)  
**Rule:** dev_instruction §Core Principles #2 — "Use `onSelectionChange` (not `onChange`) for HeroUI Select"; HeroUI MCP docs for RadioGroup

Per HeroUI v3 MCP docs, `RadioGroup` **does** use `onChange` (it inherits React Aria's RadioGroup API). This is correct — `onSelectionChange` only applies to `Select`.

**Verdict:** ✅ **No issue** — `onChange` is the correct handler for `RadioGroup`.

---

### F-04 🟡 Should Fix — Hardcoded inline class strings should use `ACTION_BUTTON_ICON` token

**File:** [ShotListTable.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/ShotListTable.tsx#L169)  
**Rule:** dev_instruction §UI Tokens — "Always import from `ui-tokens.ts` instead of writing ad-hoc classes"

The action button duplicates similar styling to the existing `ACTION_BUTTON_ICON` token in `ui-tokens.ts`.

**Current:**

```tsx
className="rounded-full hover:border hover:border-accent/20 hover:bg-accent/10 text-default-500"
```

**Token value** (`ACTION_BUTTON_ICON`):

```ts
"rounded-full bg-default/50 border border-transparent hover:border-accent/20 hover:bg-accent/10 text-default-500"
```

**Recommended:**

```tsx
import { ACTION_BUTTON_ICON } from "../../constants/ui-tokens";
// ...
className={ACTION_BUTTON_ICON}
```

---

### F-05 🟡 Should Fix — TODO comments left in production code

**Files:**

- [ShotListTable.tsx:176](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/ShotListTable.tsx#L176) — `// TODO: connect to action handlers`
- [AddShotListItemsModal.tsx:13](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/AddShotListItemsModal.tsx#L13) — `// TODO: Replace ParseResult data...`
- [AddShotListItemsModal.tsx:65](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/AddShotListItemsModal.tsx#L65) — `// TODO: replace with real parse API call`
- [AddShotListItemsModal.tsx:71](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/AddShotListItemsModal.tsx#L71) — `// TODO: dispatch actual import action`
- [BulkActionBar.tsx:32](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/BulkActionBar.tsx#L32) — `// TODO: connect bulk edit handler`
- [BulkActionBar.tsx:42](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/BulkActionBar.tsx#L42) — `// TODO: connect bulk send-to-order handler`
- [BulkActionBar.tsx:52](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/BulkActionBar.tsx#L52) — `// TODO: connect bulk download handler`
- [BulkActionBar.tsx:109](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/BulkActionBar.tsx#L109) — `// TODO: connect bulk delete handler`

**Rule:** dev_instruction §Code Review Standards — Code Hygiene  

**Recommended:** These are all mock/placeholder TODOs for future backend integration. Acceptable for now if this is intentionally a front-end-only milestone. If merging to a shared branch, consider converting to `// FUTURE:` or tracking in a ticket instead.

---

### F-06 🟡 Should Fix — Orphaned import `useState` is used but not needed in `BulkActionBar` if delete state is removed

**File:** [BulkActionBar.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/BulkActionBar.tsx#L1)  
**Rule:** Code Hygiene — orphaned imports

**Verdict:** ✅ **No issue** — `useState` is correctly used for `deleteOpen` state. Import is valid.

---

### F-07 🟡 Should Fix — Hardcoded magic number `100` in statistics percentage calculation

**File:** [ShotListTab.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/ShotListTab.tsx#L34-L35)  
**Rule:** Hardcoded Values & Magic Numbers

**Current:**

```tsx
const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
const rejectedPct = total > 0 ? Math.round((rejected / total) * 100) : 0;
```

**Verdict:** ✅ **No issue** — `* 100` for percentage conversion is universally understood and not a magic number. No action needed.

---

### F-08 🟡 Should Fix — `text-mini` class used directly in `ShotListTable.tsx`

**File:** [ShotListTable.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/ShotListTable.tsx#L114)  
**Rule:** Hardcoded Values

**Current:**

```tsx
<div className="... text-mini font-bold text-default-600 z-0">
```

The class `text-mini` refers to a custom font-size utility mapped to `--font-size-mini` in the `@theme` block. This is using a proper CSS variable-backed token, which is correct. But `text-default-600` for text color on a `bg-surface-secondary` element should be verified for dark mode contrast.

**Verdict:** 🔵 **Nitpick** — verify dark mode contrast for this overflow badge.

---

### F-09 🔵 Nitpick — Hardcoded `ring-1 ring-black/5` in BulkActionBar

**File:** [BulkActionBar.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/BulkActionBar.tsx#L20)  
**Rule:** Styling &  Theming — CSS Variables for all colors

**Current:**

```tsx
<div className="... ring-1 ring-black/5">
```

`ring-black/5` is a hardcoded color that won't adapt to dark mode. In dark mode, a black ring against a dark surface becomes invisible (harmless) but also useless. Consider `ring-foreground/5` or `ring-default-200` for theme-awareness.

**Recommended:**

```tsx
ring-1 ring-foreground/5
```

---

### F-10 🔵 Nitpick — `border-default-300` used in `ShotListTab.tsx` tooltip trigger

**File:** [ShotListTab.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/ShotListTab.tsx#L82)  
**Rule:** Styling & Theming §HeroUI v3 Color Utilities Gotcha

**Current:**

```tsx
<div className="text-xs text-default-500 mb-0.5 cursor-default border-b border-dashed border-default-300 inline-block">
```

`border-default-300` is fine — per `dev_instruction_v3.1.md`, the transparency issue only affects `bg-default-{shade}`, not `border-default-{shade}`. ✅ **No issue.**

---

### F-11 🔵 Nitpick — `border-default-200` usage across files

**Files:** `BulkActionBar.tsx:20`, `ShotListTable.tsx:109`, `AddShotListItemsModal.tsx:134`

**Verdict:** ✅ **No issue** — `border-default-200` is used for borders, not backgrounds. These work correctly in Tailwind v4 + HeroUI v3.

---

### F-12 🔵 Nitpick — `text-default-300` very faint separator dot in stats

**File:** [ShotListTab.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ShotList/ShotListTab.tsx#L95-L105)

**Current:**

```tsx
<span className="text-xs text-default-300">·&nbsp;{completedPct}%</span>
```

`text-default-300` is a very faint text shade. In dark mode it may become nearly invisible. Consider `text-default-400` or `text-muted` for better readability.

**Recommended:**

```tsx
<span className="text-xs text-default-400">·&nbsp;{completedPct}%</span>
```

---

## Non-Findings (Verified Correct)

| Item | Status | Notes |
|:---|:---:|:---|
| Named exports only | ✅ | All 5 component files use `export function` |
| HeroUI compound components | ✅ | Card.Content, Modal.Backdrop > Container > Dialog, Tabs.List, Checkbox.Control > Indicator, etc. |
| Direct imports from `@heroui/react` | ✅ | No wrapper components |
| `onPress` on HeroUI components | ✅ | All `Button` components use `onPress` |
| Checkbox `onChange` | ✅ | Confirmed via MCP: `onChange` is correct for Checkbox (not `onPress`) |
| RadioGroup `onChange` | ✅ | Confirmed via MCP: `onChange` is correct (not `onSelectionChange`) |
| `onSelectionChange` on Tabs | ✅ | `ShotListTab.tsx:159` correctly uses `onSelectionChange` |
| No `export default` | ✅ | Zero instances |
| No `any` types | ✅ | All props have interfaces |
| No `console.*` calls | ✅ | Zero instances |
| No `bg-default-{shade}` | ✅ | Zero instances of `bg-default-200`, etc. |
| Data in `data/` | ✅ | `mock-shot-list.ts` in `src/data/` |
| Constants in `constants/` | ✅ | `shot-list.ts` in `src/constants/` |
| Hook in `hooks/` | ✅ | `useShotList.ts` follows standard TanStack Query pattern |
| `ui-tokens.ts` used | ✅ | TOOLTIP_DELAY, SEARCH_FIELD_WIDTH, FILTER_SELECT_WIDTH, MODAL_BACKDROP, MODAL_WIDTH_LG, etc. |
| `format-time.ts` used | ✅ | `formatRelativeTime` + `formatAbsoluteTime` in ShotListTable |
| Skeleton matches table columns | ✅ | 8 columns (checkbox, image, ID, name, status, creator, created at, actions) |
| AlertDialog anatomy | ✅ | Backdrop > Container > Dialog pattern per MCP docs |
| Modal anatomy | ✅ | Backdrop > Container > Dialog with CloseTrigger |
| Error/loading/empty states | ✅ | All three states handled in ShotListTab |
| TanStack Query data hook | ✅ | `useShotList` uses `useQuery` with `queryKey`, `queryFn`, `staleTime` |
| Strict typing | ✅ | `ShotListItem`, `ShotListStatus`, props interfaces all defined |

---

## Summary

| Severity | Count |
|:---|:---:|
| 🔴 Must Fix | 1 |
| 🟡 Should Fix | 2 |
| 🔵 Nitpick | 3 |
| **Total** | **6** |

> [!NOTE]
> Findings F-03, F-06, F-07, F-10, F-11 were investigated and confirmed as non-issues — they are documented above for completeness.

### Verdict: 🟡 **Conditional Pass**

One must-fix (F-01: native `<button>` with `onClick` for image thumbnails — should use HeroUI `<Button>` with `onPress`), two should-fixes (F-04: use `ACTION_BUTTON_ICON` token; F-05: TODO comments), and three cosmetic nitpicks. After resolving F-01, this tab is ready for merge.
