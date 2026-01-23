# Pre-Commit Lint Errors Report

> **Date:** 2026-01-23  
> **Build Status:** ✅ PASSED  
> **Lint Status:** ❌ FAILED (2 errors, 2 warnings)

---

## Summary

The codebase failed lint checks. The following must be fixed before commit.

| Severity | Count |
|----------|-------|
| Error | 2 |
| Warning | 2 |

---

## Errors (Blocking)

### Error 1: Variable Accessed Before Declaration

**File:** `src/components/ProjectPage/WorkflowBuilder/WorkflowBuilder.tsx`  
**Line:** 121  
**Rule:** `react-hooks/immutability`

**Problem:**  
`handleBlockSelect` is called inside a `useEffect` (line 121) before it's declared (line 252).

```tsx
// Line 121 (inside useEffect)
if (e.key === 'Escape') {
    handleBlockSelect(null);  // ❌ Used BEFORE declaration
}

// Line 252 (declared later)
const handleBlockSelect = (id: string | null) => { ... }
```

**Fix:**  
Move the `handleBlockSelect` function declaration BEFORE the `useEffect` that uses it, or wrap it in `useCallback` and move it up.

---

### Error 2: setState Called Synchronously in Effect

**File:** `src/hooks/useWorkflowBuilder.ts`  
**Line:** 90  
**Rule:** `react-hooks/set-state-in-effect`

**Problem:**  
`setCanvasState` is called directly inside `useEffect`, which can cause cascading renders.

```tsx
useEffect(() => {
    if (!initialConfig) return;
    // ...
    if (configBlocks.length > 0 && canvasState.blocks.length === 1) {
        setCanvasState(prev => ({ ... }));  // ❌ Direct setState in effect
    }
}, [initialConfig, canvasState.blocks.length]);
```

**Fix:**  
Use a ref to track hydration state, or initialize state conditionally:

```tsx
const [isHydrated, setIsHydrated] = useState(false);

useEffect(() => {
    if (!initialConfig || isHydrated) return;
    
    const configBlocks = /* ... */;
    if (configBlocks.length > 0) {
        setCanvasState(prev => ({ ...prev, blocks: configBlocks }));
        setIsHydrated(true);
    }
}, [initialConfig, isHydrated]);
```

---

## Warnings

### Warning 1: Missing Dependency in useEffect

**File:** `src/components/ProjectPage/WorkflowBuilder/WorkflowBuilder.tsx`  
**Line:** 128  
**Rule:** `react-hooks/exhaustive-deps`

**Problem:**  
`useEffect` dependency array is missing `handleBlockSelect`.

**Fix:**  
After moving `handleBlockSelect` before the effect, wrap it in `useCallback` and add to dependencies:

```tsx
const handleBlockSelect = useCallback((id: string | null) => {
    // ...
}, [isSettingsDirty, actions, settingsRef]);

useEffect(() => {
    // ...
}, [state.canvasState.selectedBlockId, actions, handleBlockSelect]);
```

---

### Warning 2: Missing Dependency in useEffect  

**File:** `src/hooks/useWorkflowBuilder.ts`  
**Line:** 96  
**Rule:** `react-hooks/exhaustive-deps`

**Problem:**  
`useEffect` dependency array is missing `canvasState.blocks`.

**Fix:**  
Use a ref-based hydration pattern to avoid adding `canvasState.blocks` as a dependency (which would cause infinite loops). See Error 2 fix above.

---

## Required Actions

1. **Move `handleBlockSelect` before the keyboard effect** in `WorkflowBuilder.tsx`
2. **Wrap `handleBlockSelect` in `useCallback`** and add to effect dependencies
3. **Refactor hydration logic** in `useWorkflowBuilder.ts` using a ref or separate state to track hydration

---

## Pre-Commit Checklist Status

| Check | Status |
|-------|--------|
| `npm run build` passes | ✅ |
| `npm run lint` passes | ❌ |
| Named exports only | ✅ |
| No `any` types | ✅ |
| No wrapper components | ✅ |
| Mock data in `src/data/` | ✅ |
| Complex logic in `src/hooks/` | ✅ |
| Data fetching uses `useQuery` | ✅ |
| Routes in `src/router.tsx` | ✅ |
| Navigation uses `<Link>` | ✅ |
| `onPress` for interactions | ✅ |

---

**COMMIT BLOCKED** until lint errors are resolved.
