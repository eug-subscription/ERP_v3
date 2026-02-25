# Phase 2 + 3 — Review Round 1

**Scope:** `src/App.tsx`, `src/components/CreateOrderModal.tsx`  
**Baseline:** Implementation plan Phase 2 (Task 2.1) and Phase 3 (Task 3.1)

---

## Mandatory Checks

| Check | Result |
|:------|:-------|
| Named exports only | ✅ `export function CreateOrderModal` / `export function App` |
| No `export default` | ✅ Zero occurrences |
| No `any` types | ✅ Zero occurrences |
| No `onClick` | ✅ Zero occurrences — uses `onPress` on submit button |
| No `use client` | ✅ Zero occurrences |
| HeroUI compound pattern | ✅ `Modal > Modal.Backdrop > Modal.Container > Modal.Dialog` |
| HeroUI imports direct | ✅ All from `@heroui/react` — no wrappers |
| Tokens from `ui-tokens.ts` | ✅ `MODAL_WIDTH_MD`, `TEXT_SECTION_LABEL` imported |
| `isPending` prop correctness | ✅ Confirmed — HeroUI v3 Button docs show `isPending: boolean` as the loading prop. 50+ usages across codebase. |
| DatePicker composition | ✅ Full composition: `DateField.Group > DateField.Input > DateField.Segment`, `DateField.Suffix > DatePicker.Trigger > DatePicker.TriggerIndicator`, `DatePicker.Popover > Calendar` |
| Calendar composition | ✅ Full: Header, YearPickerTrigger, NavButtons, Grid, YearPickerGrid |
| Toast.Provider placement | ✅ Single provider at root level in `App.tsx`, sibling of `RouterProvider` |

---

## Implementation Note — Acknowledged

> **useEffect → handleOpenChange interceptor**: Plan specified `useEffect` for reset-on-close. ESLint `react-hooks/set-state-in-effect` disallows `setState` in effect bodies. The `handleOpenChange` interceptor pattern is **correct and preferred** — same behaviour, lint-compliant.

---

## Findings

| # | Severity | File & Line | Category | Finding | Suggested Fix |
|:--|:---------|:------------|:---------|:--------|:--------------|
| F-01 | **Should Fix** | `CreateOrderModal.tsx:56-58` | Logic | `handleSubmit()` calls `mutate(payload)` then **immediately** calls `handleOpenChange(false)`, closing the modal before the mutation resolves. This means: (a) the `isPending` spinner on the button is never visible — modal closes too fast, (b) if the mutation fails, the error toast fires but the modal is already gone — user has no chance to retry without reopening. **Fix:** Close the modal in `onSuccess` callback of the mutation, not synchronously in `handleSubmit`. Pass `onOpenChange` to `useCreateOrder` or use `mutate(payload, { onSuccess })`. | Replace `handleSubmit` with: `mutate(payload, { onSuccess: () => handleOpenChange(false) })` — remove the synchronous `handleOpenChange(false)` call. |
| F-02 | **Nitpick** | `CreateOrderModal.tsx:72` | Hard-coded | `mt-1.5` and `leading-5` on the subtitle `<p>` are raw Tailwind values not backed by a token. The rest of the modal correctly uses tokens (`MODAL_WIDTH_MD`, `TEXT_SECTION_LABEL`). These values are minor but inconsistent with the token discipline. | Acceptable as-is — subtitle spacing is local to this component and not reused. No action required unless the team wants strict token parity. |
| F-03 | **Nitpick** | `CreateOrderModal.tsx:78` | Hard-coded | `gap-5` on the form container — not a token from `ui-tokens.ts`. The codebase has `FLEX_COL_GAP_4` (`gap-4`) but no `gap-5` token. | Minor — `gap-5` is a reasonable spacing choice. Could align to `gap-4` for consistency, but this is a design judgment call. |

---

## Code Hygiene Sweep

| Category | Result |
|:---------|:-------|
| Dead code | ✅ None — every import, variable, and function is used |
| Magic numbers | ✅ `rows={2}` on TextArea is self-documenting (line count). No unexplained numbers. |
| Unnecessary comments | ✅ Only three section comments (`{/* Order Name */}`, `{/* Contacts group */}`, `{/* Session details group */}`) — these are structural landmarks, not noise. Acceptable. |
| Orphaned imports | ✅ None — all 11 HeroUI imports, `Icon`, `useState`, `DateValue`, `getLocalTimeZone`, `today` are used |
| Consistency | ✅ Structure matches `TeamMemberModal.tsx` pattern (controlled `isOpen`/`onOpenChange`, `Modal.Footer` with Cancel + primary action) |

---

## Verdict

### 🔁 REQUEST CHANGES

**F-01 must be fixed before merge.** The synchronous close creates a race condition where:

1. The loading spinner is never shown
2. Error toasts appear without context (modal already closed)
3. Users cannot retry from the same form state on failure

The fix is a one-line change: move the modal close into the mutation's `onSuccess` callback.

F-02 and F-03 are cosmetic — approve as-is or address later.
