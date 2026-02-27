---
description: Pre-commit validation workflow. Runs lint, type-check, and build on staged changes, verifies import safety, audits dev instructions checklist and project compliance, then commits only when all gates pass.
---

Your task is to perform a full pre-commit validation of all uncommitted staged changes before committing and pushing to GitHub.

Complete each step fully before moving to the next. If any step fails — stop, fix the issue, re-run the step to confirm it passes, then continue. Do not skip ahead.

---

## Step 1 — Scope check

Run:

```
git diff --cached --name-only
git diff --cached --stat
```

- List all staged files and line counts
- For commits touching **5+ files or 200+ changed lines**: summarise what each file change does and flag anything that looks unintentional or out of scope — wait for my confirmation before proceeding
- For smaller commits: note the scope briefly and continue

---

## Step 2 — Lint

Run `{lint_command}`.

- Fix all errors and warnings in staged files
- Re-run to confirm clean pass before proceeding
- If a fix requires modifying a non-staged file, stage that file too and note it

---

## Step 3 — Type check

Run `{typecheck_command}`.

- Fix all type errors related to staged files
- Re-run to confirm clean pass before proceeding

---

## Step 4 — Build

Run `{build_command}`.

- Fix all build errors
- Re-run to confirm clean pass before proceeding

---

## Step 5 — Import/export safety check

For every staged file, verify:

- No removed or renamed exports are imported by non-staged files (search with `grep -r`)
- No new imports reference files or modules that don't exist
- No circular dependencies introduced

---

## Step 6 — Dev instructions checklist

Run through **every item** in the `@dev_instructions` pre-commit checklist against the staged changes. Report each item as ✅ pass, ⚠️ not applicable, or ❌ fail.

**Functional:**

- [ ] `{build_command}` passes (confirmed in Step 4)
- [ ] `{lint_command}` passes (confirmed in Step 2)
- [ ] Edge cases handled (loading, empty, error states)

**Code quality:**

- [ ] Named exports (`export function`) used everywhere — no `export default`, no arrow const exports
- [ ] No `any` types
- [ ] No wrapper components around library components
- [ ] No `console.*` calls in production code

**Data & logic:**

- [ ] Mock data lives in `src/data/`
- [ ] Static constants live in `src/constants/`
- [ ] UI class strings use tokens from `@ui_tokens` — no hardcoded ad-hoc classes
- [ ] Complex logic extracted to `src/hooks/`
- [ ] Data fetching uses `useQuery` from TanStack Query

**Routing:**

- [ ] New pages added to router config
- [ ] Navigation uses `<Link>` from TanStack Router

**Styling & theming:**

- [ ] Tested in both light AND dark themes
- [ ] CSS variables used for all colors — no hardcoded hex/rgb

**Accessibility:**

- [ ] `onPress` used for interactions (not `onClick`) on UI library components
- [ ] `onSelectionChange` used for Select (not `onChange`)
- [ ] Keyboard navigation verified
- [ ] Focus indicators visible

**Performance:**

- [ ] No unnecessary re-renders
- [ ] Images optimized

---

## Step 7 — Project-specific compliance

Run all checks defined in `@project_config`:

- Verify component and pattern compliance using project-specific tools
- Verify all styling references project tokens — no hardcoded values
- Verify CSS variables match project theme source of truth

---

## Step 8 — Commit

Write a commit message and present it for my approval.

**Format:** `type(scope): short description`

- **Types:** `fix`, `feat`, `refactor`, `chore`, `style`, `docs`, `perf`, `test`
- **Scope:** affected area (e.g., `billing`, `auth`, `upload`, `routing`)
- Must describe *what* changed and *where* — no generic messages

**Examples:**

```
feat(billing): add line item detail expansion
fix(upload): correct file type validation for HEIC
refactor(hooks): extract drag-and-drop logic into useUnmatchedItems
chore(deps): update HeroUI to beta.7
```

---

## Final go/no-go gate

Only commit and push when ALL confirm ✅:

| Check | Status |
|:------|:-------|
| Scope understood, changes intentional | |
| `{lint_command}` | |
| `{typecheck_command}` | |
| `{build_command}` | |
| Import/export safety | |
| Pre-commit checklist — all items | |
| Project-specific compliance | |
| Commit message follows standard | |

If any row is not ✅ — do not commit. Report the blockers to me.

---

## Rules

- Complete each step fully before moving to the next
- If any issue is found — stop, fix it, re-run the step to confirm it passes, then continue
- Do not modify files outside the scope of staged changes UNLESS lint/build/type errors require it — stage those additional files and note them
- If a fix introduces a new issue, stop and report to me before proceeding
- Do not commit if any step has unresolved issues
- Never use `--no-verify` to bypass hooks
