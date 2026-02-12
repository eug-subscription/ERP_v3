# Pre-Push Codebase Audit — 190 Staged Changes

> **Date:** 2026-02-12 · **Build:** ✅ passes in 4.68 s · **Lint:** ✅ zero warnings

---

## Executive Summary

Overall codebase health is **strong**: zero `any` types, zero `export default`, strict ESLint with `no-explicit-any: error`, comprehensive `aria-label` coverage, and a clean build with well-structured vendor chunks. The **single biggest risk** is the **256 KB `WorkflowBuilder` chunk** (44.9 KB gzip) — the largest application chunk by far — which will degrade initial load time for the workflow tab as the feature grows. **Priority #1** recommendation: split `WorkflowBuilder` internals (canvas, block library, timeline config) into lazy-loaded sub-chunks to keep each below 100 KB.

---

## 1. Project Structure

| # | Issue | Severity | Impact (1–10) | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|---------------|--------|-----------------|-----------------|
| 1.1 | `ComingSoonPage.tsx` + `ComingSoonPages.tsx` co-exist at same directory level — confusing plural/singular naming | Medium | 3 | trivial | DX confusion, new devs won't know which to import | `TECH DEBT` Merge into single `ComingSoonPage.tsx` exporting both the base component and the wrappers, or rename wrappers to `ComingSoonRoutes.tsx` |
| 1.2 | `src/data/` mixes mock data files with domain constants (`block-dependencies.ts`, `block-descriptions.ts`, `block-ui-categories.ts`, `workflow-constants.ts`, `workflow-options.ts`) | Medium | 4 | small | Module boundary confusion — non-mock files buried among mocks | Move domain constants to `src/constants/workflow/` and keep `src/data/` purely for `mock-*.ts` files |
| 1.3 | `src/styles/` contains a single file (`modal-variants.ts`) — directory is overkill | Nice-to-have | 2 | trivial | Minor clutter | Move `modal-variants.ts` to `src/constants/` or collapse `styles/` into `constants/` |

The project follows clear conventions. File naming is consistently PascalCase for components and kebab-case for data/constants. The `src/shared/` directory contains only `StatisticCard.tsx` — this is fine and scales well as a shared component landing zone.

---

## 2. Component Architecture

| # | Issue | Severity | Impact (1–10) | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|---------------|--------|-----------------|-----------------|
| 2.1 | `OrderInfo.tsx` is 15.5 KB / ~400 lines with 5+ inline sub-sections (Client, Location, Schedule, Tags, Rating) | Medium | 5 | medium | Difficult to test, review, or modify individual sections | Extract each section into `OrderInfo/ClientSection.tsx`, `OrderInfo/LocationSection.tsx`, etc. |
| 2.2 | `LineModifierEditor.tsx` is 18.4 KB — largest component in `OrderBilling/` | Medium | 4 | medium | Hard to reason about; combines form logic, layout, and modifier math | Split editor body into `ModifierAdjustments.tsx` and `ModifierPreview.tsx` sub-components |

No prop-drilling or redundant wrapper anti-patterns detected. Compound component pattern (`Card.Header`, `Modal.Body`, `Tooltip.Trigger`) is consistently applied. `onPress` is used everywhere except one justified `onClick` on a native `<tr>` element in `BillingLineRow.tsx`.

---

## 3. Page Composition

| # | Issue | Severity | Impact (1–10) | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|---------------|--------|-----------------|-----------------|
| 3.1 | 6 `ComingSoon` routes are eagerly imported in `router.tsx` (comment says "<1 KB combined") | Nice-to-have | 2 | trivial | Negligible bundle impact — correctly justified in code comments | No action required — comment is accurate |

Route structure is clean: 3 layout groups (Order, Project, Rates) with proper `React.lazy()` on all substantive routes. Index routes correctly redirect. The `PricingSearch` type export from `router.tsx` provides type-safe search params. No unreachable routes detected.

---

## 4. Styling — `index.css` & Shared Styles

| # | Issue | Severity | Impact (1–10) | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|---------------|--------|-----------------|-----------------|
| 4.1 | `bg-default-100`, `bg-default-50`, `bg-default-200` used in ~50 locations across components and `modal-variants.ts` | Medium | 5 | large | These are HeroUI v2 palette tokens; they still work in v3 beta but may be removed in stable | `TECH DEBT` Audit and migrate to v3 semantic tokens (`bg-field`, `bg-surface`, etc.) in batches — not a blocker for this push since v3 beta 6 still supports them |
| 4.2 | Duplicate `-webkit-font-smoothing: antialiased` declared on both `:root` and `body` in `index.css` | Nice-to-have | 1 | trivial | No functional impact; only one declaration is needed | `QUICK WIN` Remove from `:root` (line 56), keep on `body` |
| 4.3 | `--color-glass` uses `rgba()` while rest of theme uses `oklch()` — inconsistent color space | Nice-to-have | 2 | trivial | No functional impact; cosmetic inconsistency | Convert to `oklch(1 0 0 / 0.7)` for light mode, `oklch(0.08 0 0 / 0.8)` for dark |

Design token system is well-structured in `index.css` with clear sections for identity, surfaces, shadows, typography, and category colors. Custom `@utility` directives (`gpu-clipping-fix`, `t-compact`, `t-mini`, `t-micro`) are properly defined. The `@frozen` annotation on `modal-variants.ts` correctly signals approved design.

---

## 5. Type Safety

| # | Issue | Severity | Impact (1–10) | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|---------------|--------|-----------------|-----------------|

**No issues found.** Zero `any` types, zero `as any` casts, ESLint enforces `@typescript-eslint/no-explicit-any: error`. `strict: true` enabled in `tsconfig.json`. The `as HTMLElement` cast in `BillingLineRow.tsx` line 43 is the only type assertion and is correctly used for DOM event delegation.

---

## 6. Dead Code

| # | Issue | Severity | Impact (1–10) | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|---------------|--------|-----------------|-----------------|
| 6.1 | `src/components/OrderBillingRoute.tsx` is a 162-byte pass-through file — only re-exports `OrderBillingTab` | Nice-to-have | 2 | trivial | Extra indirection for no benefit | `QUICK WIN` Inline the lazy import in `router.tsx` to point directly at `OrderBillingTab` and delete `OrderBillingRoute.tsx` |

No orphaned components or unreachable routes found. All 36 hooks are imported somewhere. All data files are consumed.

---

## 7. Import Hygiene

| # | Issue | Severity | Impact (1–10) | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|---------------|--------|-----------------|-----------------|
| 7.1 | `main.tsx` imports `"./App.tsx"` with explicit `.tsx` extension (line 4) — inconsistent with every other import in the codebase | Nice-to-have | 1 | trivial | No build impact; just inconsistent | `QUICK WIN` Change to `"./App"` |

No barrel files, no circular dependencies, no index re-exports. Imports are direct and module-path consistent. HeroUI imports come from `@heroui/react` exclusively (no sub-package imports).

---

## 8. Naming Conventions

| # | Issue | Severity | Impact (1–10) | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|---------------|--------|-----------------|-----------------|
| 8.1 | Duplicate stale-time constants: `DEFAULT_STALE_TIME` in `query-config.ts` (5 min) vs `QUERY_STALE_TIME_MS` in `pricing.ts` (also 5 min) and `MOCK_API_DELAY` (800ms) vs `MOCK_API_DELAY_MS` (500ms) | Medium | 4 | small | Drift risk — two sources of truth for the same concept with slightly different values | `TECH DEBT` Consolidate into `query-config.ts` as the single source; update all consumers; delete duplicates from `pricing.ts` |
| 8.2 | Category color variables use `--color-cat-*` prefix; no other constants use abbreviations — inconsistent with the verbose naming elsewhere | Nice-to-have | 1 | trivial | Readability only | No action — abbreviation is well-understood and used consistently |

Component naming (PascalCase), hook naming (`use*` camelCase), and constant naming (SCREAMING_SNAKE) are all applied consistently.

---

## 9. Dependencies

| # | Issue | Severity | Impact (1–10) | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|---------------|--------|-----------------|-----------------|
| 9.1 | `@dnd-kit/utilities` (^3.2.2) paired with `@dnd-kit/sortable` (^10.0.0) — major version mismatch within the same ecosystem | Medium | 5 | small | `@dnd-kit/utilities` v3 may have API incompatibilities with sortable v10; works now but fragile | Upgrade `@dnd-kit/utilities` to match the v10 ecosystem, or verify peer deps are satisfied |
| 9.2 | `@babel/core`, `@babel/generator`, `@babel/traverse`, `@babel/types`, `@babel/preset-react`, `@babel/preset-typescript` — 6 Babel devDependencies | Nice-to-have | 3 | small | Added bundle dev footprint; purpose unclear since Vite uses esbuild/SWC | Confirm these are needed (likely by `vite-plugin-inject-data-locator`); if not, remove |

No unused runtime dependencies detected. `tailwind-variants` (tv) is actively used in `modal-variants.ts`. All `@heroui/*` packages are pinned to beta.6 consistently.

---

## 10. Performance

| # | Issue | Severity | Impact (1–10) | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|---------------|--------|-----------------|-----------------|
| 10.1 | `WorkflowBuilder` chunk: **256 KB** (44.9 KB gzip) — largest application chunk | High | 7 | medium | Will become a bottleneck as workflow feature grows; exceeds recommended 200 KB threshold | Split canvas, block library, and timeline config modal into lazy-loaded sub-routes or dynamic imports |
| 10.2 | `index-C_-yrv03.js`: **267 KB** (84.4 KB gzip) — this is the HeroUI component library shared chunk | Medium | 4 | large | Expected for UI framework; not directly actionable without tree-shaking improvements from HeroUI upstream | Monitor; no action needed now |
| 10.3 | `OrderBillingRoute` chunk: **112 KB** (20 KB gzip) — second-largest application chunk | Medium | 4 | medium | Grows as billing features expand | Consider splitting `LineModifierEditor` (18 KB source) into dynamic import since it's modal-triggered |
| 10.4 | 3 `console.*` calls in production code (`useAddManualLine.ts:86`, `useCanvasOperations.ts:116`, `useProjectWorkflow.ts:45`) | Medium | 3 | trivial | Console noise in production; potential info leak | `QUICK WIN` Replace with no-ops or remove; use error boundary patterns instead |

Vendor chunking is well-configured with 4 manual chunks (heroui-styles, tanstack, react, dnd). Code-splitting via `React.lazy()` is applied to all major routes.

---

## 11. Accessibility

| # | Issue | Severity | Impact (1–10) | Effort | Risk if Ignored | Recommended Fix |
|---|-------|----------|---------------|--------|-----------------|-----------------|
| 11.1 | `BillingLineRow.tsx` uses `<Table.Row onClick>` with `role="button"` — keyboard `Enter`/`Space` handling exists, but native `onClick` bypasses HeroUI's press event system | Medium | 4 | small | Works functionally; minor a11y concern around press feedback consistency | Acceptable pattern for native `<tr>` elements — HeroUI `onPress` doesn't apply to table rows. Add comment explaining the choice |
| 11.2 | `OrderInfo.tsx` uses `<Select onChange>` (line 312) — should verify this is the native HTML `onChange` prop, not a missed `onSelectionChange` | Medium | 3 | trivial | May not fire correctly depending on HeroUI Select implementation | `QUICK WIN` Verify and change to `onSelectionChange` if using HeroUI `<Select>` |

Good overall a11y coverage: `aria-label` present on all search fields, buttons, interactive elements, navigation, and tab lists. `role="button"` with keyboard handler on expandable rows.

---

## Prioritised Action Plan

### 1. Fix Before This Push

| Priority | Item | Reference |
|----------|------|-----------|
| 1 | Remove 3 `console.*` calls from production hooks | §10.4 |
| 2 | Verify `OrderInfo.tsx` `<Select onChange>` vs `onSelectionChange` | §11.2 |

> **Go/No-Go verdict: ✅ GO** — no critical blockers found. The two items above are quick wins (< 5 min combined) that prevent console noise and a potential a11y bug.

### 2. Fix Next Sprint

| Priority | Item | Reference |
|----------|------|-----------|
| 1 | Split `WorkflowBuilder` chunk into lazy sub-chunks (256 KB → <100 KB each) | §10.1 |
| 2 | Consolidate duplicate stale-time / mock-delay constants | §8.1 |
| 3 | Verify `@dnd-kit/utilities` v3 compatibility with `@dnd-kit/sortable` v10 | §9.1 |
| 4 | Split `OrderInfo.tsx` into section sub-components | §2.1 |
| 5 | Lazy-load `LineModifierEditor` to reduce billing chunk | §10.3 |
| 6 | Move domain constants out of `src/data/` to `src/constants/workflow/` | §1.2 |
| 7 | Migrate `bg-default-*` tokens to v3 semantics when HeroUI v3 stable ships | §4.1 |
| 8 | Remove duplicate `antialiased` declaration | §4.2 |
| 9 | Clean up `OrderBillingRoute.tsx` pass-through | §6.1 |
| 10 | Remove `.tsx` extension from import in `main.tsx` | §7.1 |
| 11 | Confirm Babel devDependencies are required | §9.2 |
