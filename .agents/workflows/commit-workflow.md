---
description: Full pre-commit validation workflow. Audits staged changes, checks for conflicts and regressions, runs lint and build, verifies dev instruction alignment, then commits and pushes only when all gates pass.
---

Your task is to perform a full pre-commit validation of all uncommitted staged changes before pushing to GitHub.
Step 1 — Understand the changes:

List all staged files
Summarise what each change does and what problem it solves
Flag anything that looks unintentional or out of scope before proceeding

Step 2 — Conflict and regression check:

Verify staged changes do not conflict with or duplicate logic in existing non-staged files
Verify no existing functionality is broken by the changes

Step 3 — Pre-commit checklist:

Run through every item in @dev_instructions pre-commit checklist and confirm pass/fail per item

Step 4 — Lint:

Run {lint_command}
Fix all errors, then re-run to confirm clean pass before proceeding

Step 5 — Build:

Run {build_command}
Fix all errors, then re-run to confirm clean pass before proceeding

Step 6 — Alignment verification:

Verify all staged changes comply with @dev_instructions and project styling standards
Use project-specific verification tools defined in @project_config

Rules:

Complete each step fully before moving to the next
If any issue is found — stop, fix it, re-run the step to confirm it passes, then continue
Do not modify files outside the scope of staged changes
If a fix introduces a new issue, stop and report to me before proceeding
Do not commit if any step has unresolved issues

Commit message standard:

Format: type(scope): short description — e.g. fix(auth): correct token refresh logic
Types: fix, feat, refactor, chore, style
Must describe what changed and where — no generic messages like "fix stuff" or "update"

Final go/no-go gate — only commit and push when all confirm ✅:

Staged changes intent understood and verified as intentional
No conflicts or regressions detected
{lint_command} — ✅ pass
{build_command} — ✅ pass
Pre-commit checklist — ✅ all items verified
@dev_instructions alignment — ✅ confirmed
Commit message — ✅ follows standard
