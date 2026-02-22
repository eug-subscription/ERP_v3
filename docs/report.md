# HeroUI v3 Beta.7 Breaking Changes — Impact Report

> **Current version:** `@heroui/react@^3.0.0-beta.6`, `@heroui/styles@^3.0.0-beta.6`
> **Target version:** `v3.0.0-beta.7` (released February 19, 2026)
> **Release notes:** <https://v3.heroui.com/docs/react/releases/v3-0-0-beta-7>

---

## Root Cause

Beta.7 introduces three breaking API changes:

1. **Tabs separator mechanism inverted** — separators were automatic (opt-out via `hideSeparator`); now they're opt-in (explicit `<Tabs.Separator />`)
2. **`DateInputGroup` removed** — sub-components consolidated under `DateField` and `TimeField`
3. **`ColorInputGroup` removed** — sub-components consolidated under `ColorField`

---

## Breaking Change 1: Tabs Separators

### Mechanism Change

| | Beta.6 (current) | Beta.7 (target) |
|---|---|---|
| **Separator rendering** | Auto-generated via CSS `:before` pseudo-element on `.tabs__tab:not(:first-child)` | Must be explicitly added via `<Tabs.Separator />` |
| **How to hide** | Add `hideSeparator` prop to `<Tabs>` | Don't add `<Tabs.Separator />` (default = no separators) |
| **CSS class** | Pseudo-element selector | Dedicated `.tabs__separator` class |
| **Data attribute** | `[data-hide-separator]` present | Attribute removed entirely |

### Visual Impact

Without migration, **all Tabs that currently display separator lines will lose them**. The `|` divider lines between tab labels will disappear.

### Affected Files — Full Inventory

The project contains **10 files** that use the `<Tabs>` component. They fall into three categories:

#### Category A: Standard Tabs with visible separators (6 files — MUST add `<Tabs.Separator />`)

These files use default Tabs styling where CSS auto-separators are visually rendered. After beta.7, separators will vanish unless explicitly added.

| # | File | Location | Tab count | Rendering | Current separators |
|---|------|----------|-----------|-----------|-------------------|
| A1 | `TabNavigation.tsx` | `src/components/TabNavigation.tsx` | 8 tabs | Dynamic `.map()` over `sections` array | ✅ Visible — main app navigation bar |
| A2 | `ProjectTabs.tsx` | `src/components/ProjectPage/ProjectTabs.tsx` | 9 tabs | Dynamic `.map()` over `sections` array | ✅ Visible — project section nav |
| A3 | `FileUploadSection.tsx` | `src/components/FileUploadSection.tsx` | 4 tabs | Static (`all`, `uploading`, `completed`, `failed`) | ✅ Visible — upload file filters |
| A4 | `UnmatchedPhotoPanel.tsx` | `src/components/Matching/UnmatchedPhotoPanel.tsx` | 2 tabs | Static (`list`, `grid`) | ✅ Visible — view mode toggle |
| A5 | `TimelineConfigModal.tsx` | `src/components/ProjectPage/WorkflowBuilder/TimelineConfigModal.tsx` | 3 tabs | Dynamic `.map()` over `['client','pro','ops']` | ✅ Visible — audience selector |
| A6 | `TemplateSelectorModal.tsx` | `src/components/ProjectPage/WorkflowBuilder/TemplateSelectorModal.tsx` | 2 tabs | Static (`system`, `user`) | ✅ Visible — template type toggle |

#### Category B: Custom-styled Tabs where separators are hidden by styling (2 files — NO change needed)

These files apply heavy custom styling (pill/rounded shapes, custom backgrounds) that visually override or mask the CSS pseudo-element separators. The auto-separators were never visible to the user.

| # | File | Location | Why unaffected |
|---|------|----------|----------------|
| B1 | `FilterBar.tsx` | `src/components/pricing/FilterBar.tsx` | Uses `rounded-full` pill tabs with custom `bg-default-200/50` list background and `bg-surface-base` indicator |
| B2 | `RateManagementPage.tsx` | `src/components/RateManagement/RateManagementPage.tsx` | Uses `rounded-2xl` tabs with `bg-default-100/50` list and `bg-accent` indicator with shadow glow |

#### Category C: Tabs using `hideSeparator` prop (1 file — remove the prop)

| # | File | Location | Action |
|---|------|----------|--------|
| C1 | `ModifierInput.tsx` | `src/components/pricing/ModifierInput.tsx` | Remove `hideSeparator` prop (line 70) — separators are now hidden by default |

#### Not Affected

| File | Location | Reason |
|------|----------|--------|
| `FileUploadTabs.tsx` | `src/components/FileUploadTabs.tsx` | Wrapper component — renders `<FileUploadSection>`, does not use `<Tabs>` directly |
| `BlockLibrary.tsx` | `src/components/ProjectPage/WorkflowBuilder/BlockLibrary/BlockLibrary.tsx` | Uses `hideSeparator` on **`<Accordion>`**, not `<Tabs>` — Accordion's `hideSeparator` is unchanged in beta.7 |
| `index.css` | `src/index.css` | No custom CSS overrides targeting `.tabs__tab:before` or `[data-hide-separator]` |

---

## Breaking Change 2: DateInputGroup Removed

### Mechanism Change

`DateInputGroup` and its sub-components are no longer exported from `@heroui/react`. The functionality is consolidated under the parent field component.

| Before (beta.6) | After (beta.7) |
|---|---|
| `import { DateInputGroup } from "@heroui/react"` | No import needed |
| `<DateInputGroup>` | `<DateField.Group>` or `<TimeField.Group>` |
| `<DateInputGroup.Input>` | `<DateField.Input>` or `<TimeField.Input>` |
| `<DateInputGroup.Segment>` | `<DateField.Segment>` or `<TimeField.Segment>` |
| `<DateInputGroup.Prefix>` | `<DateField.Prefix>` or `<TimeField.Prefix>` |
| `<DateInputGroup.Suffix>` | `<DateField.Suffix>` or `<TimeField.Suffix>` |

> **Note:** The underlying CSS classes (`.date-input-group`) remain unchanged. Only the JS imports and component names changed.

### Affected Files

| # | File | Location | Usage |
|---|------|----------|-------|
| 1 | `OrderInfo.tsx` | `src/components/OrderInfo.tsx` | Imports `DateInputGroup` (line 11). Uses it **twice**: once inside `<DateField>` (lines 238–242) and once inside `<TimeField>` (lines 255–259) |

### Visual/Functional Impact

If not migrated, the `DateInputGroup` import will fail at build time — **TypeScript compilation error**. The Order Details schedule editor (date and time fields) will not render.

---

## Breaking Change 3: ColorInputGroup Removed

### Mechanism Change

Same consolidation pattern as `DateInputGroup`, but for `ColorField`.

| Before (beta.6) | After (beta.7) |
|---|---|
| `<ColorInputGroup>` | `<ColorField.Group>` |
| `<ColorInputGroup.Input>` | `<ColorField.Input>` |
| `<ColorInputGroup.Prefix>` | `<ColorField.Prefix>` |
| `<ColorInputGroup.Suffix>` | `<ColorField.Suffix>` |

### Affected Files

**None.** `ColorInputGroup` is not used anywhere in the project. Confirmed via exhaustive `grep` search.

---

## Dependency Changes (Non-Breaking, Informational)

Beta.7 also upgrades these peer dependencies:

| Package | From | To |
|---------|------|----|
| `react-aria-components` | 1.14.0 | 1.15.0 |
| `@react-aria/utils` | 3.32.0 | 3.33.0 |
| `@react-types/shared` | 3.32.1 | 3.33.0 |
| `@internationalized/date` | 3.10.1 | 3.11.0 |

New peer dependencies added: `@react-aria/i18n`, `@react-stately/utils` (for calendar i18n).

These are handled automatically by `npm install` given our `^` version ranges.

---

## Summary

| Breaking Change | Files Affected | Severity |
|----------------|---------------|----------|
| Tabs separators opt-in | 7 files need changes (6 add separator, 1 remove prop) | **Visual regression** — separators vanish silently |
| DateInputGroup removed | 1 file | **Build failure** — TypeScript error |
| ColorInputGroup removed | 0 files | None |
| **Total** | **8 files** | |
