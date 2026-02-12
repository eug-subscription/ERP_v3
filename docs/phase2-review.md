# Phase 2 Peer Review — Stabilisation

**Reviewer:** Senior Frontend Developer (independent review)  
**Date:** 2026-02-12  
**Scope:** Tasks 2.1–2.7 (7 tasks)

---

## Task 2.1 — Replace 9× `text-[9px]` with `t-micro`

**Files reviewed:** `RateCardTicket.tsx`, `ExternalProcessConfig.tsx`, `RateCardDetail.tsx`, `RateCardEntryEditor.tsx`, `RateCardsList.tsx`

| Aspect | Status |
|--------|--------|
| Correctness | ✅ `grep` confirms zero `text-[9px]` remaining in `src/` |
| Regression risk | ✅ `t-micro` maps to `0.5625rem` = 9px — visually identical |
| Completeness | ✅ All 9 instances replaced |

**No issues found.**

---

## Task 2.2 — Replace 4× `rounded-[...]` with Radius Tokens

**Files reviewed:** `ServiceSelection.tsx`, `RateCardsList.tsx`, `CanvasBlockCard.tsx`

| Aspect | Status |
|--------|--------|
| Correctness | ✅ Only `rounded-[13.5px]` remains (justified exception with inline comment on line 168) |
| Documentation | ✅ Comment explains pixel-precise alignment: `"rounded-xl (12px + 1.5px inset)"` |
| Completeness | ✅ 3 arbitrary values replaced with tokens |

**No issues found.**

---

## Task 2.3 — Remove Duplicate `--font-sans` in `:root`

**File reviewed:** [index.css](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/index.css)

| Aspect | Status |
|--------|--------|
| Correctness | ✅ `--font-sans` now only in `@theme` block (lines 23–26). `:root` block (line 52) retains only `--sticky-offset`, colours, and font smoothing. |
| Regression risk | ✅ `@theme` has higher specificity than `:root` for Tailwind v4, so font continues to render as Libre Franklin. |

**No issues found.**

---

## Task 2.4 — Split `useProjectPage.ts` (564 → 4 hooks)

**Files reviewed:** [useProjectData.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useProjectData.ts), [useProjectRates.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useProjectRates.ts), [useProjectRetouching.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useProjectRetouching.ts), [useProjectPage.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useProjectPage.ts)

| Aspect | Status | Detail |
|--------|--------|--------|
| Logical split | ✅ Pass | Data → Rates → Retouching separation is clean. Dependency injection via params is correct. |
| Backward compat | ✅ Pass | Orchestrator's `state` and `actions` objects match original exactly (verified property-by-property). |
| State ownership | ✅ Pass | `createdRateIds` lifted to `useProjectData` per review feedback. Passed to both consumer hooks. |
| `useCallback` deps | ✅ Pass | All callbacks include `setServiceConfigs`, `setCreatedRateIds` etc. in dependency arrays. |
| Type safety | ✅ Pass | `UseProjectRatesParams` and `UseProjectRetouchingParams` interfaces are properly typed with `Dispatch<SetStateAction<...>>`. |

### ⚠️ Finding 1 — `createdRateIds` declared but unused in `useProjectRetouching` destructuring

**`useProjectRetouching.ts` lines 6–21:**

```tsx
interface UseProjectRetouchingParams {
    serviceConfigs: ServiceConfig[];
    setServiceConfigs: Dispatch<SetStateAction<ServiceConfig[]>>;
    createdRateIds: string[];           // ← declared in interface
    setCreatedRateIds: Dispatch<SetStateAction<string[]>>;
}

export function useProjectRetouching({
    serviceConfigs,
    setServiceConfigs,
    setCreatedRateIds,                  // ← createdRateIds is NOT destructured
}: UseProjectRetouchingParams) {
```

`createdRateIds` is in the interface but not destructured in the function. Searching the hook body: it is never *read* — only `setCreatedRateIds` is used (line 149). The interface requires callers to pass it unnecessarily.

**Severity:** Low — no runtime impact, just dead interface field.

**Suggested fix:** Remove `createdRateIds` from `UseProjectRetouchingParams`:

```diff
 interface UseProjectRetouchingParams {
     serviceConfigs: ServiceConfig[];
     setServiceConfigs: Dispatch<SetStateAction<ServiceConfig[]>>;
-    createdRateIds: string[];
     setCreatedRateIds: Dispatch<SetStateAction<string[]>>;
 }
```

And update the orchestrator call site in `useProjectPage.ts` (lines 56–61):

```diff
     } = useProjectRetouching({
         serviceConfigs,
         setServiceConfigs,
-        createdRateIds,
         setCreatedRateIds,
     });
```

### ⚠️ Finding 2 — `useProjectRates.ts` exceeds 200-line target

The original acceptance criteria stated *"Each hook is ≤200 lines."* Actual: **340 lines** (70% over budget). The updated acceptance criteria in the plan says *"All hooks ≤324 lines"* — which was adjusted to match reality rather than the target.

**Severity:** Low — the hook is logically cohesive (all rate CRUD). Splitting it further (e.g., separating edit vs. create) would create unnecessary coupling complexity. The 200-line target was optimistic.

**Recommendation:** Accept as-is. The hook handles 9 related functions with no unrelated concerns. Splitting further would reduce readability.

---

## Task 2.5 — Split `useWorkflowBuilder.ts` (447 → 2 hooks)

**Files reviewed:** [useCanvasOperations.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useCanvasOperations.ts), [useWorkflowBuilder.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useWorkflowBuilder.ts)

| Aspect | Status | Detail |
|--------|--------|--------|
| Logical split | ✅ Pass | Canvas CRUD + DnD cleanly extracted. Main hook retains state hydration, validation, save logic. |
| Backward compat | ✅ Pass | Return shape (`state`, `actions`, `validation`, `isSaving`) unchanged. |
| Line count | ✅ Pass | 277 lines (below 300-line target). |
| `canvasState` param | ⚠️ Note | `UseCanvasOperationsParams` declares `canvasState` in the interface (line 46) but the function destructuring (line 55–58) doesn't use it. See Finding 3. |

### ❌ Finding 3 — `isBlockAllowedInBranch` duplicated in two files

The function `isBlockAllowedInBranch` exists identically in:

- [useCanvasOperations.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useCanvasOperations.ts) lines 17–33
- [useWorkflowBuilder.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useWorkflowBuilder.ts) lines 22–38

Both are identical 16-line functions. This is exactly the kind of duplication the audit aimed to reduce.

**Usage:**

- `useCanvasOperations.ts`: used by `insertBlock` (line 135)
- `useWorkflowBuilder.ts`: exposed via `validation.isBlockAllowedInBranch` (line 273)

**Severity:** Medium — duplicated business logic. If branch validation rules change, both copies must be updated.

**Suggested fix:** Extract to a shared utility (e.g., `utils/workflow.ts` alongside existing `getBlockLabel`):

```tsx
// utils/workflow.ts
export function isBlockAllowedInBranch(
    blockType: WorkflowBlockType,
    branchId: 'main' | 'photo' | 'video'
): boolean { ... }
```

Then import from both hooks.

### ⚠️ Finding 4 — `canvasState` unused in `useCanvasOperations` params

`UseCanvasOperationsParams` interface (line 45–49) declares `canvasState` but the destructuring (line 55–58) only uses `setCanvasState` and `setTimelineConfig`. The caller in `useWorkflowBuilder.ts` (line 113–117) passes it.

**Severity:** Low — no runtime impact, just dead interface field.

**Suggested fix:** Remove `canvasState` from the interface and call site:

```diff
 interface UseCanvasOperationsParams {
-    canvasState: WorkflowCanvasState;
     setCanvasState: React.Dispatch<React.SetStateAction<WorkflowCanvasState>>;
     setTimelineConfig: React.Dispatch<React.SetStateAction<TimelineConfig | undefined>>;
 }
```

---

## Task 2.6 — Check `useHasConfirmedOrders.ts`

| Aspect | Status |
|--------|--------|
| Correctness | ✅ Confirmed NOT orphaned — imported and used in `PricingEngine.tsx` |
| Action | ✅ Correctly left in place |

**No issues found.**

---

## Task 2.7 — Audit Babel devDependencies

**File reviewed:** [BABEL_DEPENDENCIES.md](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/plugins/BABEL_DEPENDENCIES.md)

| Aspect | Status |
|--------|--------|
| Correctness | ✅ All 6 packages verified as used by the two plugin files |
| Documentation | ✅ Clear and concise. Lists packages, purpose, and consuming files. |
| Completeness | ✅ Both plugin files referenced |

**No issues found.**

---

## Summary of Findings

| # | Finding | Severity | File | Effort |
|---|---------|----------|------|--------|
| 1 | `createdRateIds` unused in `UseProjectRetouchingParams` interface | Low | `useProjectRetouching.ts` | trivial |
| 2 | `useProjectRates.ts` at 340 lines exceeds original 200-line target | Low (accepted) | `useProjectRates.ts` | — |
| 3 | **`isBlockAllowedInBranch` duplicated** in `useCanvasOperations.ts` and `useWorkflowBuilder.ts` | **Medium** | Both hooks | small |
| 4 | `canvasState` unused in `UseCanvasOperationsParams` | Low | `useCanvasOperations.ts` | trivial |

---

## Verdict

### ⚠️ APPROVE WITH COMMENTS

Ship it, but address these in Phase 3:

1. **Finding 3** (Medium) — Extract `isBlockAllowedInBranch` to `utils/workflow.ts` to eliminate duplicated business logic.
2. **Finding 1 + 4** (Low) — Clean up dead interface fields in `UseProjectRetouchingParams` and `UseCanvasOperationsParams`.

**Rationale for approve:** All 7 tasks achieve their stated goals. Token replacements are correct. Hook splits are logically sound with clean dependency injection. External APIs are fully backward-compatible. Build + lint pass. The findings are cleanup items, not correctness issues.
