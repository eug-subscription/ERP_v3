# Codebase Audit — Pre-Production Push

**Date:** 2026-02-12  
**Scope:** 172 staged changes · Full project audit  
**Build status:** ✅ Passes (1 chunk-size warning)

---

## Executive Summary

The codebase is in **good health**: zero `any` types, zero `export default`, consistent named exports, strong aria-label coverage, proper HeroUI v3 compound component usage, and a working code-split architecture with manual vendor chunks. **The single biggest risk** is the `ComingSoonPage` lazy-loading pattern in `router.tsx`, which creates a **new component identity on every render** via inline arrow functions inside `React.lazy()`, causing full unmount/remount cycles and breaking React reconciliation for 6 routes. **Priority #1:** fix the `ComingSoonPage` lazy pattern before pushing — it is the only true blocker.

---

## 1. Project Structure

| # | Issue | Severity | Impact | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|--------|--------|-----------------|-----------------|
| 1.1 | Stale documentation files in root (`audit-implementation-plan.md`, `PRICING_DETAILED_IMPLEMENTATION_PLAN.md`, `pricing-concepts-guide.md`) | Nice-to-have | 2 | trivial | Confuses new devs | Delete or move to `docs/` `TECH DEBT` |
| 1.2 | `src/components/shared/` contains only `StatisticCard.tsx` — negligible as a "shared" layer | Nice-to-have | 1 | trivial | Misleading folder | Move `StatisticCard.tsx` into the component that uses it, or populate `shared/` with actual shared components `TECH DEBT` |
| 1.3 | `src/styles/` has only `modal-variants.ts` — could be co-located with components | Nice-to-have | 1 | trivial | Minor DX confusion | Keep as-is if more shared variants are planned; otherwise co-locate |

**Narrative:** The project structure follows conventions well. PascalCase components, kebab-case data, camelCase hooks are all consistent. The root has accumulated some spec/audit markdown files that should be cleaned up.

---

## 2. Component Architecture

| # | Issue | Severity | Impact | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|--------|--------|-----------------|-----------------|
| 2.1 | `useProjectPage.ts` is **564 lines** — a monolith hook managing rates, services, stats, and project info | Medium | 6 | medium | Increasingly hard to test, debug, and extend | Split into domain-specific hooks: `useProjectRates`, `useProjectServices`, `useProjectStats` `TECH DEBT` |
| 2.2 | `useWorkflowBuilder.ts` is **447 lines** — manages canvas state, DnD, selection, and validation | Medium | 5 | medium | Same problem at scale | Extract `useCanvasDnD`, `useBlockSelection` as sub-hooks `TECH DEBT` |
| 2.3 | `BillingLineRow.tsx` uses `onClick` on `<Table.Row>` (line 72) | Nice-to-have | 2 | trivial | Not a bug — `onClick` on a native `<tr>` element (not a HeroUI pressable) is acceptable, and it has `onKeyDown` + `role="button"` for a11y | No change needed |

**Narrative:** Component composition is solid — HeroUI compound patterns (`Card.Content`, `Modal.Body`, `Tooltip.Trigger`) are used correctly throughout. The two oversized hooks are the main architectural concern.

---

## 3. Page Composition

| # | Issue | Severity | Impact | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|--------|--------|-----------------|-----------------|
| 3.1 | 6 `ComingSoonPage` routes create **inline components** inside `React.lazy()` — e.g. `{ default: () => m.ComingSoonPage({ feature: "X" }) }` | **Critical** | 9 | small | New component identity on every render → unmount/remount cycles, broken React reconciliation, potential state loss | Create wrapper components per route or use a single lazy wrapper (see fix below) `BLOCKER` |
| 3.2 | `OrderLayout.tsx` hardcodes `projectName="Wolt Germany"` (line 29) | Medium | 4 | trivial | Wrong project name in production for any non-Wolt order | Derive from `order.projectId` or a project lookup `QUICK WIN` |
| 3.3 | `SidebarNav.tsx` hardcodes project path `/project/wolt_germany` (line 7) | Medium | 4 | trivial | Same issue — non-dynamic project link | Make dynamic from route context or config `QUICK WIN` |
| 3.4 | `main.tsx` wraps `<App>` in `<main className="text-foreground bg-background">` — redundant with `AppLayout.tsx`'s `bg-surface-base` | Nice-to-have | 2 | trivial | Potential colour flash / specificity conflict between `bg-background` and `bg-surface-base` | Remove the outer `<main>` wrapper or align classes `QUICK WIN` |

**Fix for 3.1** — Replace inline arrow functions with proper components:

```tsx
// Option A: create tiny wrapper files per route
// src/components/ComingSoonPages/AccountComingSoon.tsx
export function AccountComingSoon() {
  return <ComingSoonPage feature="Account Details" />;
}

// Then in router.tsx:
component: React.lazy(() => import("./components/ComingSoonPages/AccountComingSoon").then(m => ({ default: m.AccountComingSoon })))

// Option B: single factory (fewer files)
function createComingSoonRoute(feature: string) {
  return React.lazy(() =>
    import("./components/ComingSoonPage").then(m => {
      function Page() { return m.ComingSoonPage({ feature }); }
      return { default: Page };
    })
  );
}
// The key: `createComingSoonRoute` is called once at module level, not on each render.
```

**Narrative:** Route structure is clean with 3 layout groups. Code-splitting via `React.lazy` is applied consistently to all routes. The `ComingSoonPage` pattern is the only critical issue.

---

## 4. Styling — `index.css` & Shared Styles

| # | Issue | Severity | Impact | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|--------|--------|-----------------|-----------------|
| 4.1 | 4 residual `bg-white` in components (`TaxSettings.tsx` ×2, `ModifierCodeModal.tsx` ×1, `UnmatchedItems.tsx` ×1) | Medium | 4 | trivial | Breaks dark mode | Replace with theme token `bg-surface` or `bg-background` `QUICK WIN` |
| 4.2 | 9 instances of `text-[9px]` across `RateCardTicket.tsx`, `RateCardEntryEditor.tsx`, `RateCardDetail.tsx`, `RateCardsList.tsx`, `ExternalProcessConfig.tsx` | Medium | 3 | small | Inconsistent with `font-size-micro` (9px = 0.5625rem) token in `index.css` | Replace with `t-micro` utility `TECH DEBT` |
| 4.3 | 4 `rounded-[...]` hardcoded values (`rounded-[32px]` ×2, `rounded-[28px]`, `rounded-[13.5px]`) | Medium | 3 | small | Bypasses `radius-premium` / `radius-premium-lg` tokens | Replace with `rounded-premium-lg` (2.5rem ≈ 40px) or the nearest token `TECH DEBT` |
| 4.4 | 2 hardcoded hex colors in canvas: `#9CA3AF` in `CanvasBlockCard.tsx`, `#A1A1AA` in `ConnectionLine.tsx` | Medium | 3 | trivial | Won't adapt to dark mode or theme changes | Use `--color-cat-asset` or equivalent token via CSS variable `TECH DEBT` |
| 4.5 | `--font-sans` is declared in both `@theme` (line 22) and `:root` (line 52) | Nice-to-have | 1 | trivial | Redundant definition | Remove the `:root` duplicate |
| 4.6 | Accent shadow tokens use `rgba(var(--heroui-primary-rgb), ...)` — this assumes HeroUI exposes `--heroui-primary-rgb` | Medium | 5 | small | If the variable is missing in a future HeroUI update, all accent shadows silently break | Verify variable exists; consider using oklch-based shadows `TECH DEBT` |

**Narrative:** The token system is well-designed with `@theme` variables, custom utilities (`t-compact`, `t-mini`, `t-micro`), and premium shadow scales. All defined tokens are actively used. The remaining hardcoded values are residual from pre-audit code.

---

## 5. Type Safety

| # | Issue | Severity | Impact | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|--------|--------|-----------------|-----------------|
| — | No issues found | — | — | — | — | — |

**Narrative:** Zero `any` types. ESLint enforces `@typescript-eslint/no-explicit-any: error`. All component props are typed with interfaces. `as` casts are minimal and justified (e.g. `key as string` in selection handlers).

---

## 6. Dead Code

| # | Issue | Severity | Impact | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|--------|--------|-----------------|-----------------|
| 6.1 | `useHasConfirmedOrders.ts` — the confirmation workflow was deferred/removed per recent conversations | Medium | 3 | trivial | Orphaned file | Verify if referenced; if not, delete `TECH DEBT` |
| 6.2 | `src/components/OrderBilling/AddManualLine/` directory with 2 sub-files exists alongside `AddManualLineModal.tsx` | Nice-to-have | 2 | trivial | Unclear if both are used | Verify imports; consolidate if redundant |

**Narrative:** The codebase is reasonably clean. The confirmation workflow deferral should have removed `useHasConfirmedOrders.ts`.

---

## 7. Import Hygiene

| # | Issue | Severity | Impact | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|--------|--------|-----------------|-----------------|
| — | No barrel files, no circular dependencies, no inconsistent import paths detected | — | — | — | — | — |

**Narrative:** Imports are direct (`@heroui/react`, relative paths). No barrel `index.ts` files that could cause tree-shaking issues.

---

## 8. Naming Conventions

| # | Issue | Severity | Impact | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|--------|--------|-----------------|-----------------|
| 8.1 | Constants files mix kebab-case filename (`pricing-data.ts`) with non-kebab (`query.ts`, `ui.ts`) in `src/constants/` | Nice-to-have | 1 | trivial | Minor inconsistency | Standardise to kebab-case |

**Narrative:** PascalCase components, camelCase hooks, kebab-case data files are all followed correctly. The constants folder has minor inconsistency but nothing impactful.

---

## 9. Dependencies

| # | Issue | Severity | Impact | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|--------|--------|-----------------|-----------------|
| 9.1 | `@dnd-kit/utilities` (`^3.2.2`) — verify it's used; `@dnd-kit/sortable` typically includes needed utilities | Nice-to-have | 2 | trivial | Extra dependency | Check imports; remove if unused `TECH DEBT` |
| 9.2 | `husky` v8 — latest is v9 with ESM support | Nice-to-have | 1 | small | v8 works fine, but is legacy | Upgrade when convenient |
| 9.3 | 5 Babel devDependencies (`@babel/core`, `generator`, `preset-react`, `preset-typescript`, `traverse`, `types`) — unusual for a Vite project | Medium | 3 | small | Increases `node_modules` size and install time | Check if used by `vite-plugin-inject-data-locator`; if so, note it. If not, remove `TECH DEBT` |

**Narrative:** Dependency tree is lean. No duplicates. The Babel packages are likely used by the custom Vite plugin for injecting `data-locator` attributes (useful for testing/QA). Worth confirming.

---

## 10. Performance

| # | Issue | Severity | Impact | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|--------|--------|-----------------|-----------------|
| 10.1 | `vendor-heroui` chunk is **559 kB** (165 kB gzip) — exceeds Vite's 500 kB warning | High | 6 | medium | Large initial payload for users; slower FCP on mobile | Consider importing individual HeroUI packages if available, or accept as known cost `TECH DEBT` |
| 10.2 | `WorkflowBuilder` chunk is **298 kB** (59 kB gzip) — the largest app chunk | Medium | 4 | medium | Acceptable since it's lazy-loaded; optimise if load time becomes an issue | Split `dnd-kit` into its own vendor chunk in `vite.config.ts` |
| 10.3 | `OrderBillingRoute` chunk is **110 kB** (19 kB gzip) | Nice-to-have | 2 | — | Acceptable for a feature-rich billing page | No action needed |
| 10.4 | `Iconify` chunk is **18 kB** (7 kB gzip) — loads icon runtime | Nice-to-have | 1 | — | Acceptable | No action needed |

**Narrative:** Code-splitting works well — all routes are lazy-loaded. Vendor chunks are properly extracted (`vendor-react`, `vendor-tanstack`, `vendor-heroui`). The HeroUI chunk exceeds the warning threshold which is expected for a full UI library import.

---

## 11. Accessibility

| # | Issue | Severity | Impact | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|--------|--------|-----------------|-----------------|
| 11.1 | `<main>` in `main.tsx` wraps the entire app, and another semantic `<main>` exists in `AppLayout.tsx` | Medium | 4 | trivial | Two `<main>` landmarks — assistive tech won't know which is primary | Remove `<main>` from `main.tsx`; keep the one in `AppLayout.tsx` `QUICK WIN` |
| 11.2 | `SidebarNav.tsx` uses `<nav>` without `aria-label` | Nice-to-have | 2 | trivial | With only one nav, it's acceptable, but adding a label improves clarity | Add `aria-label="Main navigation"` `QUICK WIN` |

**Narrative:** Accessibility coverage is strong — 60+ `aria-label` instances, `role="button"` with keyboard handlers on interactive rows, HeroUI handles built-in ARIA for components. The dual `<main>` landmark issue should be fixed.

---

## Prioritised Action Plan

### 1. Fix Before This Push (go/no-go boundary)

| Priority | Issue | Ref | Effort |
|----------|-------|-----|--------|
| 🔴 1 | `ComingSoonPage` inline components in `React.lazy()` — broken reconciliation | 3.1 | small |
| 🟡 2 | Dual `<main>` landmarks — a11y violation | 11.1 | trivial |
| 🟡 3 | Hardcoded `projectName="Wolt Germany"` visible in UI | 3.2 | trivial |
| 🟡 4 | Hardcoded project path in `SidebarNav.tsx` | 3.3 | trivial |

### 2. Fix Next Sprint (safe to defer)

| Priority | Issue | Ref | Effort |
|----------|-------|-----|--------|
| 1 | Replace 4× `bg-white` with theme tokens | 4.1 | trivial |
| 2 | Verify `--heroui-primary-rgb` stability for accent shadows | 4.6 | small |
| 3 | Replace 9× `text-[9px]` with `t-micro` | 4.2 | small |
| 4 | Replace 4× `rounded-[...]` with radius tokens | 4.3 | small |
| 5 | Replace 2× hardcoded hex in canvas components | 4.4 | trivial |
| 6 | Split `useProjectPage.ts` (564 lines) | 2.1 | medium |
| 7 | Split `useWorkflowBuilder.ts` (447 lines) | 2.2 | medium |
| 8 | Remove `useHasConfirmedOrders.ts` if orphaned | 6.1 | trivial |
| 9 | Audit Babel devDependencies relevance | 9.3 | small |
| 10 | Split `dnd-kit` into vendor chunk | 10.2 | small |
| 11 | Clean root-level markdown files | 1.1 | trivial |
| 12 | Add `aria-label` to `SidebarNav` | 11.2 | trivial |
| 13 | Remove duplicate `--font-sans` in `:root` | 4.5 | trivial |
