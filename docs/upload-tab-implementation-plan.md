# Upload Tab — Implementation Plan

> **Source:** [upload-tab-audit.md](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/docs/upload-tab-audit.md)  
> **Target files:** `FileUploadSection.tsx`, `FileUploadTabs.tsx`, `useUpload.ts`

---

## Phase 1: Foundation Fixes (4/4) ✅

Quick, low-risk changes that immediately align the Upload tab with project conventions.

---

### ☑ 1.1 — Flatten `useUpload` hook return

**Why:** Violates the project's mandatory flat-return convention (dev_instruction_v3.1 §2). Every other hook uses flat returns — this one must too.

**Goal:** `useUpload()` returns a flat object; consumers destructure directly.

**Acceptance criteria:**

- `useUpload.ts` returns `{ files, filteredFiles, fileCounts, activeTab, isLoading, error, setActiveTab }` — no `state` / `actions` nesting
- `FileUploadSection.tsx` destructures as `const { filteredFiles, fileCounts, activeTab, isLoading, error, setActiveTab } = useUpload()`
- `error` is now accessible in the component (previously ignored)
- App compiles, no regressions

---

### ☑ 1.2 — Add error state with `Alert`

**Why:** Upload tab silently swallows errors. Users get a blank screen when the fetch fails — unacceptable in production.

**Goal:** Fetch errors display a branded `Alert` with a retry button, identical to Billing and Rate Management.

**Acceptance criteria:**

- Uses HeroUI `Alert` compound component (`Alert.Indicator`, `Alert.Content`, `Alert.Title`, `Alert.Description`)
- Includes a `Retry` button using `variant="danger-soft"` and `onPress` (not `onClick`)
- Matches structure in `BillingLinesSection.tsx` L35–52
- Visually identical to the Billing tab error state

---

### ☑ 1.3 — Replace ad-hoc skeleton with HeroUI `Skeleton`

**Why:** Loading state uses raw `div` + `animate-pulse` + hardcoded colors. Every other tab uses the HeroUI `<Skeleton>` component.

**Goal:** Loading state uses `<Skeleton>` and visually matches the Billing tab's loading pattern.

**Acceptance criteria:**

- No raw `animate-pulse` divs remain
- Uses `<Skeleton className="..." />` from `@heroui/react`
- Loading skeleton mirrors the actual content structure (drop zone placeholder + 3 table row placeholders)
- Wrapped inside `<Card.Content>` (not a bare `<section>`)

---

### ☑ 1.4 — Differentiate "paused" chip color

**Why:** "Paused" and "uploading" both render as `accent` — users can't visually distinguish them at a glance.

**Goal:** Each status has a unique, semantically correct color.

**Acceptance criteria:**

- Color map: `uploading` → `accent`, `completed` → `success`, `failed` → `danger`, `paused` → `warning`
- Chip still uses `variant="soft"` and `size="sm"`

---

## Phase 2: Component Alignment (5/5) ✅

Replace one-off implementations with the shared design-system components used everywhere else.

---

### ☑ 2.1 — Replace raw `<table>` with shared `Table` component

**Why:** The raw HTML table ignores zebra stripes, sticky headers, `t-mini` header typography, `HOVER_OPACITY_SUBTLE`, and consistent cell padding — all baked into the shared `Table`.

**Goal:** File list renders using `Table`, `Table.Header`, `Table.Column`, `Table.Row`, `Table.Cell` from `components/pricing/Table.tsx`.

**Acceptance criteria:**

- Zero raw `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`, `<th>` elements in `FileUploadSection.tsx`
- Column headers use `Table.Column` (inherits `t-mini uppercase font-bold tracking-[0.15em]`)
- "File Name" column uses `isBlack` prop
- "Actions" column uses `align="right"`
- Rows alternate with `--color-zebra-odd` / `--color-zebra-even`
- Row hover shows `hover:bg-accent/5` (from `HOVER_OPACITY_SUBTLE` token)
- Wrapper has `rounded-2xl shadow-sm`

---

### ☑ 2.2 — Wrap section in `Card` with icon header

**Why:** Upload tab uses a plain `<h2>` outside any container. Every other tab wraps content in `<Card>` with a structured header using design tokens.

**Goal:** Upload section uses `Card` + `Card.Header` + `Card.Content` with the standard icon-title-description-action header layout.

**Acceptance criteria:**

- Section wrapped in `<Card>`
- `Card.Header` contains:
  - Icon container using `ICON_CONTAINER_LG` token with `lucide:upload-cloud` icon using `ICON_SIZE_CONTAINER`
  - Title using `TEXT_SECTION_TITLE` token
  - Description using `text-xs text-default-400 font-medium`
  - Bulk actions ("Pause All", "Cancel All") positioned on the right
- `Card.Content` wraps drop zone + table with `className="p-0"` (table flush to edges)
- Tokens imported from `constants/ui-tokens.ts`

---

### ☑ 2.3 — Add empty state using `EmptyState` component

**Why:** When no files exist, the table area is just blank. Every other list uses the shared `EmptyState` with icon animation and CTA.

**Goal:** Zero-file state renders the `EmptyState` component from `components/pricing/EmptyState.tsx`.

**Acceptance criteria:**

- When `fileCounts.all === 0`, renders `<EmptyState>` instead of nothing
- Props: `icon="lucide:upload-cloud"`, title, description, no action button (drop zone is the CTA)
- When a filter tab is active and yields 0 results, shows a filter-specific empty state with "Clear Filter" action (see `RateItemsList.tsx` L290–305)

---

### ☑ 2.4 — Add tooltips to action buttons

**Why:** Bare icon buttons have no label — users must guess what each icon does. Every other table uses `Tooltip` on icon-only buttons.

**Goal:** Pause and Delete buttons are wrapped in HeroUI `Tooltip` with descriptive labels.

**Acceptance criteria:**

- Both icon buttons wrapped in `<Tooltip delay={TOOLTIP_DELAY}>` + `<Tooltip.Trigger>` + `<Tooltip.Content>`
- `TOOLTIP_DELAY` imported from `constants/ui-tokens.ts`
- Tooltip text: "Pause Upload" / "Cancel Upload"
- Buttons styled as `rounded-full bg-default-100/50 border border-transparent` with proper hover transitions (matching `BillingLineRow.tsx` L242–268)

---

### ☑ 2.5 — Style filter tabs with accent indicator

**Why:** The tab bar lacks the accent indicator glow and selected-state styling used in Rate Management — looks unfinished.

**Goal:** Filter tabs visually match the Rate Management tab bar.

**Acceptance criteria:**

- `Tabs.Tab` has `className="h-10 px-6 data-[selected=true]:text-white text-default-500 font-bold transition-all duration-300"`
- Tab content wrapped in `<span className="relative z-10 whitespace-nowrap text-sm">`
- `Tabs.Indicator` has `className="bg-accent rounded-xl shadow-accent-glow"`
- Active tab text is white on accent background

---

## Phase 3: Polish & Decomposition (0/3)

Structural improvements and visual refinements for premium feel.

---

### ☐ 3.1 — Polish drop zone styling

**Why:** Drop zone uses `rounded-2xl` and `border-default-300` — doesn't match the premium border radius tokens or accent hover pattern.

**Goal:** Drop zone uses design-system tokens and feels cohesive with the rest of the Card.

**Acceptance criteria:**

- Border radius uses `rounded-premium` (`2rem` from `index.css`)
- Border color: `border-default-200` (lighter, more subtle)
- Hover state: `hover:bg-accent/5 hover:border-accent/30` with `transition-all duration-300`
- Inner icon container uses `ICON_CONTAINER_LG` pattern (not ad-hoc `w-12 h-12 bg-accent/10 rounded-full`)

---

### ☐ 3.2 — Decompose `FileUploadSection` into sub-components

**Why:** 161-line component handling drop zone, table, rows, progress bars, and formatting. Billing tab decomposes into `Section → Table → Row → Detail`.

**Goal:** Upload tab follows the same decomposition pattern as Billing.

**Acceptance criteria:**

- `FileUploadSection.tsx` — orchestrator only (Card + header + children)
- `UploadDropZone.tsx` — drag-and-drop area (extracted)
- `UploadFileTable.tsx` — file list using shared `Table` (extracted)
- `UploadFileRow.tsx` — single row with status chip, progress, actions (extracted)
- `formatSize` utility moved to `utils/formatters.ts`
- Each file uses named exports, no `export default`

---

### ☐ 3.3 — Visual QA pass

**Why:** Final sweep to catch any remaining inconsistencies before shipping.

**Goal:** Upload tab is pixel-consistent with Billing tab in both light and dark modes.

**Acceptance criteria:**

- ☐ Light mode: all tokens render correctly
- ☐ Dark mode: zebra stripes use `--color-zebra-odd/even` dark variants, drop zone background adapts
- ☐ `npm run build` passes with zero errors
- ☐ `npm run lint` passes with zero warnings
- ☐ No `console.*` calls in any touched file
- ☐ No `any` types in any touched file
- ☐ No `onClick` on HeroUI components (all `onPress`)
- ☐ No `export default` in any touched file
- ☐ Side-by-side screenshot comparison with Billing tab shows consistent visual language
