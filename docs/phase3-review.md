# Phase 3 Peer Review

**Reviewer:** Senior Frontend Developer (independent review)  
**Date:** 2026-02-12  
**Scope:** Phase 3 — Polish (DX & Consistency), 6 tasks

---

## Task 3.1 — Clean Root-Level Markdown Files

**Directories reviewed:** project root, `docs/`

| Aspect | Status | Detail |
|--------|--------|--------|
| Correctness | ✅ Pass | Root directory contains only `README.md`. All 10 markdown files relocated to `docs/`. |
| Regression risk | ✅ Pass | No source code affected by doc relocation. |
| Completeness | ✅ Pass | Acceptance criteria met: root is clean, `docs/` contains all documentation. |
| Consistency | ✅ Pass | `Splento Project  Logic blocks. Description.md` renamed to `workflow-logic-blocks.md` — follows kebab-case convention. |
| Side effects | ✅ Pass | No import paths reference markdown files. Build unaffected. |

**No issues found. Clean implementation.**

---

## Task 3.2 — Resolve `shared/` Directory Intent

**Verification:** `find src/shared` → 0 results

| Aspect | Status | Detail |
|--------|--------|--------|
| Correctness | ✅ Pass | `src/shared/` directory does not exist. No action required. |
| Completeness | ✅ Pass | N/A task — correctly identified as already resolved. |

**No issues found.**

---

## Task 3.3 — Standardise Constants Filenames

**Files reviewed:** `src/constants/` directory, all import consumers

| Aspect | Status | Detail |
|--------|--------|--------|
| Correctness | ✅ Pass | `query.ts` → `query-config.ts`, `ui.ts` → `ui-tokens.ts`. Old files deleted, no remnants. |
| Regression risk | ✅ Pass | All 18 import paths updated. Build + lint pass. |
| Type safety | ✅ Pass | No type changes, only path renames. |
| Consistency | ✅ Pass | All 5 constants files now follow kebab-case: `pricing-data.ts`, `pricing.ts`, `timeline.ts`, `query-config.ts`, `ui-tokens.ts`. |
| Completeness | ⚠️ Concern | One stale **comment** still references the old filename (see Finding 1). |

### ⚠️ Finding 1 — Stale comment referencing old `constants/ui.ts` path `LOW`

**What's wrong:** `Table.tsx` line 27 contains:

```
 * - Opacity tokens: defined in `src/constants/ui.ts`
```

The file was renamed to `ui-tokens.ts`. The actual import on line 5 is correct (`../../constants/ui-tokens`), but the JSDoc comment still references the old path.

**Why it matters:** Developers following the comment will look for a file that doesn't exist. Minor DX friction.

**Suggested fix:**

```diff
- * - Opacity tokens: defined in `src/constants/ui.ts`
+ * - Opacity tokens: defined in `src/constants/ui-tokens.ts`
```

---

## Task 3.4 — Split `dnd-kit` into Vendor Chunk

**Files reviewed:** `vite.config.ts`

| Aspect | Status | Detail |
|--------|--------|--------|
| Correctness | ✅ Pass | `vendor-dnd` chunk created with 4 packages. Build produces `vendor-dnd.js` (47.95 kB). |
| Regression risk | ✅ Pass | No functional changes — only bundle organisation. |
| Consistency | ✅ Pass | Follows existing vendor chunk pattern (`vendor-tanstack`, `vendor-react`). |
| Performance | ✅ Pass | DnD libraries separated for independent caching. |
| Completeness | ⚠️ Concern | `@dnd-kit/modifiers` included in the chunk but not imported anywhere in source code (see Finding 2). |

### ⚠️ Finding 2 — `@dnd-kit/modifiers` in vendor chunk but unused in source `LOW`

**What's wrong:** `vite.config.ts` line 23 includes `@dnd-kit/modifiers` in the `vendor-dnd` chunk, but no file in `src/` imports from `@dnd-kit/modifiers`. The package is listed as a dependency in `package.json` (`^7.0.0`) but has zero usage.

**Why it matters:** Including an unused package in a manual chunk:

- Adds dead bytes to the vendor bundle (minor — the package itself is small)
- More importantly, having an unused dependency in `package.json` is tech debt

**Suggested fix — option A** (if the package is planned for future use):
Add a comment in `vite.config.ts` noting it's reserved for future DnD modifiers.

**Suggested fix — option B** (clean up):
Remove `@dnd-kit/modifiers` from both `vite.config.ts` and `package.json` if not needed.

> [!NOTE]
> The audit plan (Task 3.5) was specifically to verify `@dnd-kit/utilities` — `@dnd-kit/modifiers` was not covered by the audit scope. This is a pre-existing unused dependency, not a regression.

---

## Task 3.5 — Check `@dnd-kit/utilities` Usage

**Verification:** `grep -r "@dnd-kit/utilities" src/`

| Aspect | Status | Detail |
|--------|--------|--------|
| Correctness | ✅ Pass | `@dnd-kit/utilities` is actively used in 2 files: `DraggableBlock.tsx` and `CanvasBlock.tsx` (both import `CSS`). |
| Completeness | ✅ Pass | Package confirmed in use. Kept in dependencies. |

**No issues found. Clean verification.**

---

## Task 3.6 — Upgrade Husky to v9

**Files reviewed:** `package.json`, `.husky/pre-commit`

| Aspect | Status | Detail |
|--------|--------|--------|
| Correctness | ⚠️ Concern | `package.json` updated from `^8.0.0` to `^9.0.0` ✅. However, the hook format and prepare script are still v8-style (see Finding 3). |
| Regression risk | ✅ Pass | Husky v9 is backward-compatible with v8 hooks — they still work. |
| Completeness | ⚠️ Concern | The upgrade is only a version bump in `package.json`. The migration to v9's new format was not completed. |

### ⚠️ Finding 3 — Husky v9 migration incomplete `MEDIUM`

**What's wrong:** Two v8 patterns remain after the v9 version bump:

1. **`package.json` line 11:** `"prepare": "husky install"` — deprecated in v9. The v9 equivalent is just `"prepare": "husky"`.

2. **`.husky/pre-commit` line 2:** `. "$(dirname -- "$0")/_/husky.sh"` — this is the v8 hook preamble. Husky v9 hooks don't need this line; they run directly.

**Why it matters:** While v9 is backward-compatible and the hooks still work:

- `husky install` prints a deprecation warning on `npm install`
- The `.husky/_/` directory structure is v8 legacy
- Developers running `npx husky init` (v9 command) will get confused by the mixed formats

**Suggested fix:**

```diff
# package.json
- "prepare": "husky install"
+ "prepare": "husky"
```

```bash
# .husky/pre-commit (v9 format — no preamble)
npx lint-staged
```

> [!NOTE]
> This is low-urgency since v9 backward compatibility means everything works. But completing the migration would clean up the deprecation warning and align with v9 conventions.

---

## Verdict

### 4.5/5 ✅ APPROVE WITH COMMENTS

All 6 tasks achieve their acceptance criteria. The findings are minor and non-blocking.

### Must-fix (before marking Phase 3 complete)

| # | Issue | Finding | Effort | File |
|---|-------|---------|--------|------|
| 1 | Stale comment referencing `constants/ui.ts` | Finding 1 | trivial (10 sec) | `Table.tsx` line 27 |

### Recommended improvements (can be deferred)

| # | Issue | Finding | Effort | Reasoning |
|---|-------|---------|--------|-----------|
| A | Unused `@dnd-kit/modifiers` dependency | Finding 2 | trivial | Pre-existing tech debt, not a regression. Remove if not planned for future use. |
| B | Husky v9 migration incomplete | Finding 3 | small (5 min) | Hooks work fine via backward compat. Complete migration to eliminate deprecation warnings and align with v9 conventions. |
