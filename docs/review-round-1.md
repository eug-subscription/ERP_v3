# Code Review — Moderation Tab (Round 1)

**Date:** 2026-02-23
**Reviewer:** AI (Senior Frontend)
**Scope:** All files comprising the new Moderation tab in the order page

## Files Reviewed

| File | Lines |
|------|------:|
| [ModerationTab.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Moderation/ModerationTab.tsx) | 71 |
| [ModerationTable.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Moderation/ModerationTable.tsx) | 106 |
| [mock-moderation.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/data/mock-moderation.ts) | 68 |
| [useModerationEntries.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useModerationEntries.ts) | 17 |
| [router.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/router.tsx) (moderation route only) | — |

## What's Done Well

- ✅ Named exports everywhere, no `export default`
- ✅ Correct HeroUI v3 compound component patterns (Tabs, Tooltip, Button)
- ✅ `onPress` used instead of `onClick`
- ✅ `onSelectionChange` used for Tabs (via `selectedKey` + `onSelectionChange`)
- ✅ Data in `src/data/`, hook in `src/hooks/`, component in `src/components/Moderation/`
- ✅ TanStack Query for data fetching with `staleTime` from `DEFAULT_STALE_TIME`
- ✅ Shared `Table` compound component reused properly
- ✅ Shared `EmptyState` reused for empty filtered results
- ✅ `formatRelativeTime` / `formatAbsoluteTime` from `format-time.ts` with Tooltip
- ✅ `TOOLTIP_DELAY` imported from `ui-tokens.ts`
- ✅ Tabs include `Tabs.Separator` and `Tabs.Indicator` per HeroUI v3 anatomy
- ✅ Lazy-loaded route with named-export bridge pattern in `router.tsx`
- ✅ Clean component decomposition: `ModerationTab` (orchestrator) → `ModerationTable` (presentational)

## Findings Table

| # | Issue | Category | File & Line | Severity | Suggested Fix |
|---|-------|----------|-------------|----------|---------------|
| 1 | Mock API delay is hard-coded as `400` instead of using `MOCK_API_DELAY` (800ms) from `constants/query-config.ts`. The only other file doing this is `useUsers.ts` — every other hook uses the shared constant. | Hard-coded | [useModerationEntries.ts:6](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useModerationEntries.ts#L6) | ⚠️ Medium | `import { MOCK_API_DELAY } from "../constants/query-config";` then `setTimeout(resolve, MOCK_API_DELAY)` |
| 2 | Duplicated action button className string `"rounded-full bg-default-100/50 border border-transparent hover:border-accent/20 hover:bg-accent/10 text-default-500"` appears on both icon buttons (L76 and L90). This same string also appears in `BillingLineRow.tsx`, `TeamMembers.tsx`, and `PhotoRow.tsx` — a strong candidate for a shared token in `ui-tokens.ts`. | Hard-coded | [ModerationTable.tsx:76,90](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Moderation/ModerationTable.tsx#L76) | ⚠️ Medium | Extract to `ACTION_BUTTON_ICON` in `ui-tokens.ts` (applies codebase-wide, not just this tab) |
| 3 | Both action buttons have empty `onPress` handlers: `onPress={() => { }}`. These are no-ops — placeholder callbacks with no TODO or comment explaining the intent. | Logic | [ModerationTable.tsx:77,91](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Moderation/ModerationTable.tsx#L77) | ℹ️ Low | Add `// TODO: navigate to detail view` / `// TODO: return to moderation` or use `isDisabled` until wired |
| 4 | `ModerationTab` handles `isLoading` and empty state but does **not** handle the `error` state from `useModerationEntries()`. Every other tab (e.g., OrderBilling, Timeline) handles `error`. | Logic | [ModerationTab.tsx:10](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Moderation/ModerationTab.tsx#L10) | ⚠️ Medium | Destructure `error` from the hook and render an error state (e.g., `Alert`) before the table |
| 5 | `ModerationEntry` interface is exported from the mock data file (`data/mock-moderation.ts`) rather than from `types/`. Project convention places shared type definitions in `src/types/`. | Consistency | [mock-moderation.ts:1](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/data/mock-moderation.ts#L1) | ℹ️ Low | Move `ModerationEntry` to `src/types/moderation.ts` and re-export from data file, or keep co-located if this type will never be reused outside the data/hook pair (pragmatic) |
| 6 | Icon sizes `"w-4 h-4"` on action button icons (L79, L93) are inline magic values. Other places in the codebase also use this pattern so it's consistent, but the dev instructions discourage magic sizing values. | Magic Number | [ModerationTable.tsx:79,93](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Moderation/ModerationTable.tsx#L79) | ℹ️ Low | Low priority — `w-4 h-4` is self-explanatory and consistent codebase-wide |

## Verdict

**⚠️ APPROVE WITH COMMENTS**

The moderation tab is well-structured and follows project conventions closely. HeroUI v3 component usage is correct per the official docs. The three medium-severity items (#1, #2, #4) are worth addressing but are safe to ship — recommend fixing before the next sprint:

1. **#1** — One-line fix, use `MOCK_API_DELAY` constant
2. **#4** — Add error state handling for robustness
3. **#2** — Extract the shared action button class to `ui-tokens.ts` (codebase-wide cleanup, can be a follow-up task)

Items #3, #5, #6 are low severity and can be deferred.
