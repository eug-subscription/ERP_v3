# Audit Implementation Plan

**Date:** 2026-02-12  
**Source:** [codebase-audit.md](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/codebase-audit.md)  
**Total findings:** 20 · **Blockers:** 1 · **Phases:** 4

---

## Phase 0 — Pre-Push (Blockers Only)

> **Goal:** Ship the 172 staged changes without introducing reconciliation bugs or a11y violations.  
> **Estimated effort:** 1–2 hours  
> **PR strategy:** Single PR, single reviewer, merge last before deploy.

| # | Task | Source | Severity | Effort | Acceptance Criteria | Dependencies |
|---|------|--------|----------|--------|---------------------|--------------|
| ✅ 0.1 | Fix `ComingSoonPage` lazy-loading pattern | 3.1 | Critical | small | All 6 `ComingSoonPage` routes in `router.tsx` use a stable component reference — no inline arrow functions inside `React.lazy()`. Verified by: component identity stays the same across re-renders (React DevTools shows no unmount/remount). Build passes. | None |
| ✅ 0.2 | Remove dual `<main>` landmark | 11.1 | Medium | trivial | Only one `<main>` element exists in the rendered DOM. The `<main>` wrapper in `main.tsx` is removed; `AppLayout.tsx`'s `<main>` remains. Build passes. | None |
| ✅ 0.3 | Replace hardcoded `projectName` in `OrderLayout.tsx` | 3.2 | Medium | trivial | `OrderLayout.tsx` line 29 derives the project name from data (even if temporarily from `order.projectId` or a constant map). No literal `"Wolt Germany"` string in the component. | None |
| ✅ 0.4 | Replace hardcoded project path in `SidebarNav.tsx` | 3.3 | Medium | trivial | `SidebarNav.tsx` line 7 no longer contains a literal `/project/wolt_germany` string. Path is derived from config, route params, or a constant. | None |

### Batch strategy

All 4 tasks touch different files with zero overlap:

- `router.tsx` (0.1)
- `main.tsx` (0.2)
- `OrderLayout.tsx` (0.3)
- `SidebarNav.tsx` (0.4)

**→ 1 PR, all 4 changes together. No conflict risk.**

### Verification

| Step | Command / Action |
|------|-----------------|
| Build | `npm run build` — must complete with zero errors |
| Lint | `npm run lint` — must complete with zero warnings |
| Manual | Open app in browser (`npm run dev`), navigate to each ComingSoon route (`/project/wolt_germany/account`, `/project/wolt_germany/notifications`, etc.) and verify pages render without white-flash or remount. Open React DevTools → Components → verify `ComingSoonPage` does not unmount/remount on parent re-render. |

---

## Phase 1 — Immediate (First Sprint Post-Deploy)

> **Goal:** Fix dark-mode breakage and verify infrastructure assumptions.  
> **Estimated effort:** 3–4 hours (~4 story points)  
> **Timeline:** First 2 days of sprint

| # | Task | Source | Severity | Effort | Acceptance Criteria | Dependencies | Flags |
|---|------|--------|----------|--------|---------------------|--------------|-------|
| ✅ 1.1 | Replace 4× `bg-white` with theme tokens | 4.1 | Medium | trivial | Zero instances of `bg-white` in `src/components/` except `ModifierCodeModal.tsx` Switch.Thumb (HeroUI component styling, documented). Replacements: `TaxSettings.tsx` → `bg-default-100`; `UnmatchedItems.tsx` Separator → `bg-default-200/20`. Dark mode renders correctly for all 3 locations. Build + lint pass. | None | |
| ✅ 1.2 | Verify `--heroui-primary-rgb` CSS variable exists | 4.6 | Medium | small | Confirmed that `--heroui-primary-rgb` is NOT defined by `@heroui/styles` (checked theme variables via MCP + node_modules). Replaced `rgba(var(--heroui-primary-rgb), ...)` in 3 accent shadow tokens with `oklch(0.6 0.18 255 / opacity)` matching `--color-accent` definition. Added explanatory comment. Build + lint pass. | None | `HIGH CONFLICT RISK` — touches `index.css` |
| ✅ 1.3 | Replace 2× hardcoded hex in canvas components | 4.4 | Medium | trivial | `CanvasBlockCard.tsx` line 45 (#9CA3AF) and `ConnectionLine.tsx` line 21 (#A1A1AA) both replaced with `var(--color-cat-asset)` for theme consistency. Canvas elements render in dark mode without colour mismatch. Build + lint pass. | None | |
| ✅ 1.4 | Add `aria-label` to `SidebarNav` | 11.2 | Nice-to-have | trivial | `<nav>` in `SidebarNav.tsx` has `aria-label="Main navigation"` for improved screen reader accessibility. | 0.4 (same file) | |

### Batch strategy

- **PR A** (1.1 + 1.3): Dark-mode fixes — 4 component files, no shared files.
- **PR B** (1.2): `index.css` change — isolated, high-conflict-risk file. Small PR, fast review.
- **PR C** (1.4): Single-line a11y fix — can piggyback on any PR touching `SidebarNav.tsx`.

### Verification

| Step | Command / Action |
|------|-----------------|
| Build | `npm run build` — zero errors |
| Lint | `npm run lint` — zero warnings |
| Dark mode | Toggle `data-theme="dark"` on `<html>`. Verify: TaxSettings cards, Switch.Thumb, UnmatchedItems separator, and canvas blocks/connections all render with appropriate dark-mode colours. No raw white or invisible elements. |
| Shadows | With DevTools, inspect elements using `shadow-accent-sm`, `shadow-accent-md`, `shadow-accent-glow`. Confirm shadow renders (not transparent/invisible). |

---

## Phase 2 — Stabilisation (Tech Debt Reduction)

> **Goal:** Align remaining hardcoded values with the design token system and reduce hook complexity.  
> **Estimated effort:** 8–12 hours (~8 story points)  
> **Timeline:** Days 2–5 of sprint

| # | Task | Source | Severity | Effort | Acceptance Criteria | Dependencies | Flags |
|---|------|--------|----------|--------|---------------------|--------------|-------|
| ✅ 2.1 | Replace 9× `text-[9px]` with `t-micro` utility | 4.2 | Medium | small | Zero `text-[9px]` instances in src/. All 9 replacements use `t-micro` utility (maps to --font-size-micro: 0.5625rem = 9px). Files updated: RateCardTicket.tsx (3), ExternalProcessConfig.tsx (1), RateCardDetail.tsx (1), RateCardEntryEditor.tsx (1), RateCardsList.tsx (3). Visual appearance unchanged. Build + lint pass. | None | |
| ✅ 2.2 | Replace 4× `rounded-[...]` with radius tokens | 4.3 | Medium | small | Only the justified `rounded-[13.5px]` in CanvasBlockCard.tsx line 170 remains (documented with comment explaining pixel-precise border alignment). Replaced: ServiceSelection.tsx → `rounded-premium-lg`, RateCardsList.tsx (2×) → `rounded-premium-lg` and `rounded-premium`. Build + lint pass. | None | |
| ✅ 2.3 | Remove duplicate `--font-sans` in `:root` | 4.5 | Nice-to-have | trivial | `--font-sans` appears only once in `index.css` (inside `@theme` block, lines 23-26). Removed duplicate from `:root` block. `:root` retains `--sticky-offset` and other non-duplicate properties. Font still renders as Libre Franklin. Build + lint pass. | 1.2 (same file) | `HIGH CONFLICT RISK` — touches `index.css` |
| ✅ 2.4 | Split `useProjectPage.ts` (564 lines) | 2.1 | Medium | medium | `useProjectPage.ts` refactored into 4 focused hooks: useProjectData (62 lines - data queries & selection), useProjectRates (324 lines - CRUD operations), useProjectRetouching (188 lines - retouching logic), useProjectPage orchestrator (119 lines - composition). All hooks ≤324 lines. `createdRateIds` state lifted to useProjectData for sharing. External API unchanged (backward compatible). Build + lint pass. | None | |
| ✅ 2.5 | Split `useWorkflowBuilder.ts` (447 lines) | 2.2 | Medium | medium | `useWorkflowBuilder.ts` refactored from 447 to 262 lines. Extracted canvas operations (insertBlock, reorderBlocks, removeBlock, selectBlock, updateBlockConfig) into `useCanvasOperations.ts` (226 lines). DnD logic using `@dnd-kit/sortable` now in dedicated hook. Main hook below 300 lines. External API unchanged (backward compatible). Build + lint pass. | None | |
| ✅ 2.6 | Remove `useHasConfirmedOrders.ts` if orphaned | 6.1 | Medium | trivial | Hook is NOT orphaned - actively used in `PricingEngine.tsx` (2 references: import + usage). No deletion required. Verified via grep search across src/. | None | |
| ✅ 2.7 | Audit Babel devDependencies | 9.3 | Medium | small | All 6 Babel packages (`@babel/core`, `@babel/generator`, `@babel/preset-react`, `@babel/preset-typescript`, `@babel/traverse`, `@babel/types`) are confirmed used by `plugins/vite-plugin-inject-data-locator.ts` and `plugins/babel-plugin-inject-data-locator.ts` for JSX/TSX transformation and data-locator attribute injection. Created `plugins/BABEL_DEPENDENCIES.md` documentation file explaining usage. npm install succeeds. Build passes. | None | |

### Batch strategy

- **PR D** (2.1 + 2.2): Token alignment — touches multiple component files but all changes are class-name-only. Low regression risk.
- **PR E** (2.3): `index.css` cleanup — tiny PR, merge after PR B (Phase 1).
- **PR F** (2.4): `useProjectPage` split — self-contained refactor, no shared file changes. Largest PR, needs careful review.
- **PR G** (2.5): `useWorkflowBuilder` split — same pattern as PR F, independent.
- **PR H** (2.6 + 2.7): Cleanup — dead code removal + dependency audit. Small.

### Verification

| Step | Command / Action |
|------|-----------------|
| Build | `npm run build` — zero errors |
| Lint | `npm run lint` — zero warnings |
| Token grep | `grep -rE "text-\[9px\]|rounded-\[" src/components/` — zero results (except justified `CanvasBlockCard` exception) |
| Hook API | All pages that use `useProjectPage` (`ProjectPrices`, `ServiceConfigCard`, etc.) render correctly with no console errors |
| Font check | Open any page, inspect `font-family` in DevTools — still shows `Libre Franklin` |

---

## Phase 3 — Polish (DX & Consistency)

> **Goal:** Clean up root directory, improve DX, and optimise bundle.  
> **Estimated effort:** 3–4 hours (~3 story points)  
> **Timeline:** Start of next sprint or as filler tasks

| # | Task | Source | Severity | Effort | Acceptance Criteria | Dependencies | Flags |
|---|------|--------|----------|--------|---------------------|--------------|-------|
| ✅ 3.1 | Clean root-level markdown files | 1.1 | Nice-to-have | trivial | 8 markdown files moved to `docs/` (audit-implementation-plan, codebase-audit, phase0/1/2-review, pricing-concepts-guide, dev_instruction_v3, workflow-logic-blocks). Root contains only README.md + 2 spec files. Build + lint pass. | None | |
| ✅ 3.2 | Resolve `shared/` directory intent | 1.2 | Nice-to-have | trivial | N/A — `src/shared/` directory does not exist. No action required. | None | |
| ✅ 3.3 | Standardise constants filenames | 8.1 | Nice-to-have | trivial | All files in `src/constants/` now follow kebab-case convention. Renamed `query.ts` → `query-config.ts` and `ui.ts` → `ui-tokens.ts`. Updated all 18 import paths across the codebase. Build + lint pass. | None | |
| ✅ 3.4 | Split `dnd-kit` into vendor chunk | 10.2 | Nice-to-have | small | Added `vendor-dnd` chunk to `vite.config.ts` including all 4 `@dnd-kit` packages. New `vendor-dnd.js` chunk created (47.95 kB). WorkflowBuilder chunk optimized. Build passes. | 2.7 (confirm `@dnd-kit/utilities` is used) | |
| ✅ 3.5 | Check `@dnd-kit/utilities` usage | 9.1 | Nice-to-have | trivial | Verified `@dnd-kit/utilities` is actively used in 2 files (DraggableBlock.tsx, CanvasBlock.tsx). Package kept in dependencies. | None | |
| ✅ 3.6 | Upgrade Husky to v9 | 9.2 | Nice-to-have | small | Upgraded `husky` from v8.0.0 to v9.0.0 in package.json. npm install succeeded. Git hooks working correctly. | None | |

### Batch strategy

- **PR I** (3.1 + 3.2 + 3.3): DX cleanup — file moves/renames only.
- **PR J** (3.4 + 3.5): Bundle optimisation — `vite.config.ts` + possible `package.json` change.
- **PR K** (3.6): Husky upgrade — isolated devDependency change.

### Verification

| Step | Command / Action |
|------|-----------------|
| Build | `npm run build` — zero errors |
| Lint | `npm run lint` — zero warnings |
| Bundle | Compare `npm run build` output chunk sizes before and after 3.4. `WorkflowBuilder` chunk should decrease. |
| Hooks | `git add . && git commit -m "test"` — lint-staged runs successfully (validates 3.6) |

---

## Deliverables Summary

### Total Effort Estimate

| Phase | Effort | Story Points | Calendar Time |
|-------|--------|-------------|---------------|
| Phase 0 | 1–2 hours | 2 SP | Same day (pre-push) |
| Phase 1 | 3–4 hours | 4 SP | Days 1–2 of sprint |
| Phase 2 | 8–12 hours | 8 SP | Days 2–5 of sprint |
| Phase 3 | 3–4 hours | 3 SP | Next sprint / filler |
| **Total** | **15–22 hours** | **17 SP** | **~1.5 sprints** |

### Risk Summary

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `index.css` merge conflicts (1.2, 2.3) | High | Medium | Schedule these PRs early; keep changes minimal and well-separated |
| `useProjectPage` refactor (2.4) breaks call sites | Medium | High | Keep the public API identical — sub-hooks are internal only. Test every page that imports `useProjectPage`. |
| `--heroui-primary-rgb` missing (1.2) | Low | High | If missing, the fix is straightforward (oklch replacements) but needs visual QA |
| Token replacements (2.1, 2.2) change visual appearance | Low | Low | `t-micro` is exactly 9px — visually identical. `rounded-premium-lg` (2.5rem) is close to `32px` (2rem) — may need minor tuning |
| `rounded-premium-lg` (40px) vs `rounded-[32px]` mismatch | Medium | Low | If `2.5rem` ≠ desired `32px`, define `--radius-premium-xl: 2rem` as a new token instead of forcing a mismatch |

### Recommended PR Strategy

```
Timeline:  ────────────────────────────────────────────────
           Day 0          Day 1-2         Day 3-5         Next Sprint

Phase 0:   PR-0 ─────→ merge → deploy
                        │
Phase 1:                PR-A (dark mode) ──→ merge
                        PR-B (index.css) ──→ merge
                        PR-C (a11y) ───────→ merge
                                            │
Phase 2:                                    PR-D (tokens) ──→ merge
                                            PR-E (css cleanup)─→ merge (after PR-B)
                                            PR-F (useProjectPage) ──→ merge
                                            PR-G (useWorkflowBuilder)→ merge
                                            PR-H (dead code) ──→ merge
                                                                │
Phase 3:                                                        PR-I (DX) ──→
                                                                PR-J (bundle)→
                                                                PR-K (husky)─→
```

**Key sequencing rules:**

1. **PR-B before PR-E** — both touch `index.css`; merge B first to avoid conflicts
2. **PR-0 before everything** — contains the only blocker
3. **PR-F and PR-G are independent** — can be reviewed in parallel
4. **PR-J depends on 2.7** (from PR-H) — need to confirm `@dnd-kit/utilities` is used before chunking it
