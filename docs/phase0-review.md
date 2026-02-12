# Phase 0 Peer Review

**Reviewer:** Senior Frontend Developer (independent review)  
**Date:** 2026-02-12  
**Scope:** 5 files touched in Phase 0 implementation

---

## Task 0.1 — Fix `ComingSoonPage` Lazy-Loading Pattern

**Files reviewed:** [router.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/router.tsx), [ComingSoonPages.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ComingSoonPages.tsx)

| Aspect | Status | Detail |
|--------|--------|--------|
| Correctness | ⚠️ Concern | Reconciliation issue is fixed — stable component identity ✅. However, code-splitting is now **lost** for these 6 routes (see below). |
| Regression risk | ⚠️ Concern | `ComingSoonPages.tsx` is eagerly imported at the top of `router.tsx` (line 3–10). This pulls `ComingSoonPage` + all 6 wrappers into the **entry chunk**, eliminating the lazy-loading that existed before. |
| Type safety | ✅ Pass | Types are inherited from `ComingSoonPage` props. |
| Consistency | ❌ Fail | All 6 exports use `export const X = () =>` arrow-function syntax. Project convention mandates `export function X()` declarations (see `dev_instruction_v3.md` key convention #1). |
| Completeness | ⚠️ Concern | Acceptance criteria says "stable component reference" ✅, but the original routes were `React.lazy()` — losing code-splitting was not an intended trade-off. |
| Naming & readability | ✅ Pass | File name `ComingSoonPages.tsx` (plural) is clear. Comment on line 3–4 explains intent. |
| Performance | ⚠️ Concern | 6 placeholder routes (trivial byte size) are now eagerly loaded. Impact is minimal for these tiny components, but sets a bad precedent. |
| Side effects | ✅ Pass | Old `ComingSoonPage.tsx` preserved, no export changes to other files. |

### ⚠️ Finding 1 — Code-splitting regression `IMPROVABLE`

**What's wrong:** `router.tsx` lines 3–10 use a static `import` for the wrapper components. All other routes use `React.lazy()` for code-splitting. The 6 `ComingSoonPage` routes are the exception.

**Why it matters:** While the byte impact of `ComingSoonPage` (255 bytes) is negligible today, this pattern creates inconsistency. Every other route is lazy-loaded — a developer copying this pattern for a real feature page would create a non-lazy route without realising it.

**Suggested fix:** Use `React.lazy` at module level (called once, not per render) to preserve code-splitting + stable identity:

```tsx
// router.tsx — top-level, called once at module init
const AccountComingSoon = React.lazy(() =>
  import("./components/ComingSoonPages").then(m => ({ default: m.AccountComingSoon }))
);
// ... repeat for each
```

Or accept the trade-off (255 bytes is trivial) and add a comment explaining the deliberate choice:

```tsx
// Eagerly imported — these are <1KB combined, not worth lazy-loading.
import { AccountComingSoon, ... } from "./components/ComingSoonPages";
```

### ❌ Finding 2 — Arrow-function exports violate project convention

**What's wrong:** `ComingSoonPages.tsx` lines 5–10 use `export const X = () =>` instead of `export function X()`.

**Why it matters:** Project convention (`dev_instruction_v3.md` rule #1: "Named exports only: `export function ComponentName() {}`"). Arrow-function consts are also flagged by the `react-refresh/only-export-components` ESLint rule (ironic given the comment on line 4 claims compliance).

**Suggested fix:**

```tsx
export function AccountComingSoon() {
  return <ComingSoonPage feature="Account Details" />;
}
// ... repeat for each
```

---

## Task 0.2 — Remove Dual `<main>` Landmark

**Files reviewed:** [main.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/main.tsx), [AppLayout.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/layouts/AppLayout.tsx), [OrderLayout.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/layouts/OrderLayout.tsx)

| Aspect | Status | Detail |
|--------|--------|--------|
| Correctness | ⚠️ Concern | `main.tsx` changed `<main>` → `<div>` ✅. But a **second `<main>` nesting** still exists: `AppLayout.tsx` line 19 renders `<main>`, and `OrderLayout.tsx` line 39 renders another `<main>` **inside it** via `<Outlet>`. |
| Regression risk | ✅ Pass | Changing `<main>` to `<div>` in `main.tsx` has no visual impact. |
| Type safety | ✅ Pass | No type changes. |
| Consistency | ✅ Pass | `<div>` is appropriate for a React root wrapper. |
| Completeness | ⚠️ Concern | Acceptance criteria: "Only one `<main>` element exists in the rendered DOM." This is **not met** on Order pages — `AppLayout.tsx` `<main>` wraps `OrderLayout.tsx` `<main>`. |
| Accessibility | ⚠️ Concern | Nested `<main>` landmarks remain. Screen readers will announce two main content regions. |

### ⚠️ Finding 3 — Nested `<main>` in OrderLayout `FRAGILE`

**What's wrong:** The rendered DOM on any Order page is:

```
<div>  ← main.tsx (fixed ✅)
  <div>  ← AppLayout outer
    <main>  ← AppLayout.tsx line 19
      <div>  ← OrderLayout outer
        <main>  ← OrderLayout.tsx line 39
```

Two `<main>` landmarks exist whenever the Order layout is active.

**Why it matters:** The W3C spec says "only one visible `<main>` element" per document. Assistive tech may skip content or produce confusing navigation.

**Suggested fix:** Change `OrderLayout.tsx` line 39 from `<main>` to `<section>` or `<div>`:

```tsx
// OrderLayout.tsx line 39
<div>  {/* Content area — AppLayout already provides <main> */}
  <Surface variant="secondary" ...>
```

> [!NOTE]
> The Project page (`ProjectPage.tsx`) should be checked for the same issue. It renders inside `AppLayout.tsx`'s `<main>` as well — verify it doesn't also use `<main>`.

---

## Task 0.3 — Replace Hardcoded `projectName` in OrderLayout

**Files reviewed:** [OrderLayout.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/layouts/OrderLayout.tsx), [OrderPageHeader.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderPageHeader.tsx), [mock-order.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/data/mock-order.ts)

| Aspect | Status | Detail |
|--------|--------|--------|
| Correctness | ⚠️ Concern | Hardcoded `"Wolt Germany"` string is removed ✅. But it was replaced with `order.projectId` which is a **slug** (`"wolt_germany"`), not a human-readable name. |
| Regression risk | ✅ Pass | No functional breakage. |
| Type safety | ✅ Pass | `projectId` is `string`, matches `projectName: string` prop type. |
| Completeness | ⚠️ Concern | Acceptance criteria: "derives the project name from data... No literal `'Wolt Germany'` string." Technically met, but the UI now shows `"wolt_germany"` in the breadcrumb and header instead of `"Wolt Germany"`. |
| Naming & readability | ⚠️ Concern | The `OrderPageHeader` prop is called `projectName` but receives an ID slug — semantically misleading. |

### ⚠️ Finding 4 — Slug displayed as project name `IMPROVABLE`

**What's wrong:** `OrderLayout.tsx` line 29: `projectName={order.projectId}` passes the slug `"wolt_germany"` to `OrderPageHeader`, which renders it in the breadcrumb (line 29 of `OrderPageHeader.tsx`): `{projectName}` → user sees **"wolt_germany"** instead of **"Wolt Germany"**.

**Why it matters:** This is user-facing text in the breadcrumb and header. The slug is not human-readable.

**Suggested fix — option A** (minimal, no data model change):

```tsx
// OrderLayout.tsx — simple formatter
const formatProjectName = (id: string) =>
  id.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// line 29:
projectName={formatProjectName(order.projectId)}
```

**Suggested fix — option B** (proper, add to data model):
Add `projectName: string` to `OrderData` interface and mock data. This is the right long-term answer but adds scope.

---

## Task 0.4 — Replace Hardcoded Project Path in SidebarNav

**Files reviewed:** [SidebarNav.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/layouts/SidebarNav.tsx), [ui.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/constants/ui.ts)

| Aspect | Status | Detail |
|--------|--------|--------|
| Correctness | ✅ Pass | Literal string `/project/wolt_germany` replaced with template using `DEFAULT_PROJECT_ID` constant. |
| Regression risk | ✅ Pass | Identical runtime value. |
| Type safety | ✅ Pass | Constant is typed `string`. |
| Consistency | ✅ Pass | Follows existing constants pattern in `ui.ts`. |
| Completeness | ✅ Pass | No literal path string in the component. Build passes. |
| Naming & readability | ✅ Pass | `DEFAULT_PROJECT_ID` is clear and descriptive. |
| Performance | ✅ Pass | No runtime impact. |
| Side effects | ✅ Pass | `ui.ts` is a shared file but only additive (new export, no changes to existing ones). |

**No issues found. Clean implementation.**

---

## Verdict

### 🔁 REQUEST CHANGES

Must fix before push:

| # | Issue | Finding | Effort | File |
|---|-------|---------|--------|------|
| 1 | **Arrow-function exports** → `export function` declarations | Finding 2 | trivial (5 min) | `ComingSoonPages.tsx` |
| 2 | **Nested `<main>` in OrderLayout** → change to `<div>` or `<section>` | Finding 3 | trivial (2 min) | `OrderLayout.tsx` line 39 |
| 3 | **Slug as project name** → add `formatProjectName` helper or title-case transform | Finding 4 | trivial (5 min) | `OrderLayout.tsx` line 29 |

Acceptable to ship as-is (document for Phase 1):

| # | Issue | Finding | Reasoning |
|---|-------|---------|-----------|
| A | Code-splitting lost for ComingSoon routes | Finding 1 | Byte impact is negligible (~255 bytes). Add a comment explaining the trade-off, or wrap with `React.lazy` at module level if consistency matters more. |
