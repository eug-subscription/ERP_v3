# Photos Tab — Code Review

**Scope:** `PhotoRow.tsx`, `PhotosTable.tsx`, `OriginalPhotos.tsx`
**References:** HeroUI v3 MCP, `dev_instruction_v3.1.md`, `src/index.css`, `constants/ui-tokens.ts`

---

## Fix Verification Table

No previous review exists for Photos tab — this is the initial review.

---

## New Findings Table

| # | Issue | Category | File & Line | Severity | Suggested Fix |
|---|-------|----------|-------------|----------|---------------|
| 1 | `text-[10px]` is a hard-coded arbitrary value. `index.css` defines `t-micro` (0.5625rem ≈ 9px) which is the closest design token. | Hard-coded | `PhotoRow.tsx:105` | Medium | Replace `text-[10px]` with `t-micro` utility |
| 2 | `max-w-[180px]` is an arbitrary magic number for truncating file names. No existing token maps to this value. | Magic Number | `PhotoRow.tsx:22` | Low | Extract to `ui-tokens.ts` as `FILE_NAME_MAX_WIDTH = "max-w-[180px]"` or accept as layout-specific |
| 3 | `handleDownload` is an empty no-op stub (`() => { }`). While acceptable for mock phase, it silently swallows the user's click intent. | Logic | `PhotoRow.tsx:12` | Low | Add a `// TODO: implement download handler` comment or log to console for debugging |
| 4 | Avatars are missing `Avatar.Fallback`. Per HeroUI v3 docs, `Avatar.Fallback` should always be provided alongside `Avatar.Image` to handle broken image URLs gracefully. | HeroUI Pattern | `PhotoRow.tsx:42-44, 56-60` | Medium | Add `<Avatar.Fallback>` with initials, e.g. `<Avatar.Fallback>{photo.createdBy.name.split(' ').map(n => n[0]).join('')}</Avatar.Fallback>` |
| 5 | Date splitting `photo.createdAt.split(', ')` is fragile — depends on the mock data always containing exactly one comma-space separator. If the format changes (e.g. no comma, or a comma in a different position), `[1]` returns `undefined`. | Logic | `PhotoRow.tsx:103, 106` | Medium | Either: (a) parse with a dedicated `formatDate` utility in `utils/formatters.ts`, or (b) store date/time as separate fields in `PhotoData` |
| 6 | `Tooltip` import is still present but only used once (file name tooltip). The action column tooltips were removed in favour of the Dropdown menu. The remaining `Tooltip` usage is valid, but `TOOLTIP_DELAY` import can be verified as still needed. | — | `PhotoRow.tsx:1, 5` | None | No action needed — `Tooltip` and `TOOLTIP_DELAY` are both still used for the file name tooltip |
| 7 | Dropdown trigger uses `<Button>` as a direct child of `<Dropdown>` instead of `<Dropdown.Trigger>`. Per HeroUI v3 docs, both patterns work — `<Button>` as first child acts as implicit trigger. However, the explicit `<Dropdown.Trigger>` compound pattern is more consistent with the project's stated preference for dot-notation composition (dev_instruction_v3.1 §Core Principles #4). | Consistency | `PhotoRow.tsx:111-120` | Low | Consider wrapping with `<Dropdown.Trigger>` for explicit intent, though implicit trigger is valid |

---

## Verdict

**⚠️ APPROVE WITH COMMENTS**

The Photos tab implementation is solid. Component decomposition follows the established Billing/Upload patterns correctly. Named exports, proper HeroUI imports, TypeScript typing, and `onPress` usage are all correct.

**Must address before next sprint:**

- **#1** — Replace `text-[10px]` with `t-micro` token (trivial fix, prevents style drift)
- **#4** — Add `Avatar.Fallback` to both avatar instances (accessibility and resilience)

**Nice-to-have (address at convenience):**

- **#5** — Date parsing fragility should be addressed when connecting to real API
- **#2, #3, #7** — Minor improvements, acceptable for current mock phase
