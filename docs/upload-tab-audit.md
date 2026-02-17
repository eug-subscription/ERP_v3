# Upload Tab Audit Report

> **Date:** 2026-02-17  
> **Scope:** `FileUploadTabs.tsx`, `FileUploadSection.tsx`, `useUpload.ts`  
> **References:** Billing (Beta) tab, Rate Management pages, Project → Pricing (Beta) tab, shared `Table` component, `ui-tokens.ts`, `index.css`

---

## Executive Summary

The Upload tab is the **most visually inconsistent** section in the application. It predates the Avant-Garde design system established across Billing, Rate Management, and Pricing tabs. It uses raw HTML `<table>` elements instead of the shared `Table` compound component, ignores design tokens from `ui-tokens.ts`, builds ad-hoc skeleton loading states instead of using HeroUI `<Skeleton>`, and violates the hook return pattern convention. The end result is a tab that looks and feels like a different application.

---

## 1. What's Inconsistent

### 1.1 Table Implementation

| Aspect | Upload Tab (❌) | Rest of App (✅) |
|:---|:---|:---|
| **Component** | Raw `<table>` / `<thead>` / `<tbody>` / `<tr>` / `<td>` | Shared `Table` compound component (`Table.Header`, `Table.Row`, `Table.Cell`) |
| **Header styling** | `bg-default-50 text-default-500 font-medium` | `t-mini uppercase font-bold tracking-[0.15em] text-default-400` (via `TABLE_HEADER_TRACKING`) |
| **Row hover** | `hover:bg-default-50/50` (ad-hoc) | `HOVER_OPACITY_SUBTLE` token (`hover:bg-accent/5`) |
| **Zebra stripes** | None | `odd:bg-[var(--color-zebra-odd)] even:bg-[var(--color-zebra-even)]` (from `index.css` theme tokens) |
| **Cell padding** | `px-4 py-3` / `px-4 py-4` (inconsistent) | Uniform `px-6 py-4` via `Table.Cell` |
| **Border radius** | `rounded-xl` | `rounded-2xl` (via `Table` wrapper `tv()` slot) |
| **Sticky headers** | No | `sticky top-0 z-10` (built into `Table.Header`) |
| **Shadow** | `shadow-premium` (non-existent token?) | `shadow-sm` (from `Table` wrapper) |

**Location:** [FileUploadSection.tsx L84–154](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/FileUploadSection.tsx#L84-L154)

### 1.2 Section Header Pattern

The Billing and Pricing tabs use a consistent Card header pattern with:

- An icon in a circular accent container (`ICON_CONTAINER_LG` = `size-10 rounded-full bg-accent/10`)
- A bold uppercase section title (`TEXT_SECTION_TITLE` = `text-sm font-black uppercase tracking-widest`)
- A muted description below
- An action button on the right

**Upload tab instead uses:**

```tsx
<h2 className="text-xl font-bold mb-1 text-default-900">{title}</h2>
<p className="text-default-500 text-sm mb-6">{description}</p>
```

This is a plain, unstyled header with:

- No icon or icon container
- `text-xl font-bold` instead of `text-sm font-black uppercase tracking-widest`
- No `Card.Header` wrapper — the title sits outside any Card
- No action button (e.g., "Clear All Files")

**Reference:** [BillingLinesSection.tsx L57–92](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderBilling/BillingLinesSection.tsx#L57-L92)

### 1.3 Loading State

| Aspect | Upload Tab (❌) | Rest of App (✅) |
|:---|:---|:---|
| **Technique** | Raw `<div>`s with `animate-pulse` and `bg-default-200` | HeroUI `<Skeleton>` component with `rounded-xl` / `rounded-2xl` / `rounded-lg` |
| **Structure** | 3 generic rectangles | Mimics actual content structure (e.g., `<Skeleton className="w-full h-16 rounded-lg" />` per row) |
| **Container** | Plain `<section>` | Within `<Card.Content>` for visual consistency |

**Upload tab skeleton (L24–28):**

```tsx
<div className="h-8 w-64 bg-default-200 animate-pulse rounded-lg mb-2" />
<div className="h-4 w-96 bg-default-100 animate-pulse rounded-lg mb-6" />
<div className="h-48 bg-default-50 animate-pulse rounded-2xl border border-default-200 shadow-sm" />
```

**Billing tab skeleton (BillingLinesSection L95–100):**

```tsx
<div className="p-6 space-y-4">
    {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="w-full h-16 rounded-lg" />
    ))}
</div>
```

### 1.4 Error State

The Upload tab has **no error handling at all**. When `query.error` exists, nothing is displayed.

Every other data-driven tab uses the `Alert` compound component:

```tsx
<Alert status="danger" className="rounded-2xl">
    <Alert.Indicator />
    <Alert.Content>
        <Alert.Title className="font-bold">Error Loading...</Alert.Title>
        <Alert.Description>Failed to fetch data...</Alert.Description>
        <Button size="sm" variant="danger-soft" onPress={() => refetch()}>Retry</Button>
    </Alert.Content>
</Alert>
```

**Used in:** `BillingLinesSection.tsx`, `RateItemsList.tsx`, `ProjectPricingTab.tsx`

### 1.5 Empty State

The Upload tab shows nothing when `fileCounts.all === 0` — the file table simply doesn't render.

The established pattern uses the shared `EmptyState` component with:

- Premium icon animation (hover glow, scale, rotation)
- Bold title + description
- CTA button

**Used in:** `BillingLinesSection.tsx`, `RateItemsList.tsx`

### 1.6 Typography & Spacing

| Element | Upload Tab | Design System |
|:---|:---|:---|
| **Section title** | `text-xl font-bold` | `TEXT_SECTION_TITLE` = `text-sm font-black uppercase tracking-widest` |
| **Description** | `text-default-500 text-sm mb-6` | `text-xs text-default-400 font-medium` |
| **Table header text** | `font-medium` | `font-bold` (always bold in the design system) |
| **File name** | `font-medium text-default-900` | `font-bold t-compact text-foreground` with `PRICING_ITEM_TRACKING` |
| **File size** | `text-default-600 font-mono text-xs` | `font-mono text-xs text-default-500` (consistent, but sizing differs) |
| **Section spacing** | `mb-10` between sections | `space-y-8` (from `OrderBillingTab`) |
| **Card padding** | `p-8` | `p-0` (content flush to edges with table, or structured `p-6`/`px-6 pt-6 pb-4`) |

### 1.7 Status Chips

Status chips use `variant="soft"` which is correct, but the color mapping doesn't use semantic color tokens consistently:

```tsx
color={file.status === "completed" ? "success"
     : file.status === "failed"    ? "danger"
     : "accent"}
```

The "paused" status gets the same color as "uploading" (`accent`). It should have its own semantic color (e.g., `warning` or `default`) to differentiate, matching how Rate Items distinguish between `active`, `deprecated`, and `archived`.

### 1.8 Progress Bar

The progress bar is a custom raw implementation:

```tsx
<div className="w-full bg-default-100 rounded-full h-1.5">
    <div className="bg-accent h-full rounded-full transition-all duration-500"
         style={{ width: `${file.progress}%` }} />
</div>
```

This doesn't match any established pattern in the app and uses a fixed width (`w-32`) container. It should either use a HeroUI `Slider` (read-only) or be standardized with the design tokens (e.g., `rounded-premium` borders, consistent heights).

### 1.9 Action Buttons

| Aspect | Upload Tab (❌) | Rest of App (✅) |
|:---|:---|:---|
| **Shape** | Default (rectangular) | `rounded-full` with `bg-default-100/50` |
| **Hover state** | `hover:bg-danger/10` (ad-hoc) | `hover:border-danger/20 hover:bg-danger/10` with `border border-transparent` transition |
| **Tooltips** | None | Wrapped in `<Tooltip delay={TOOLTIP_DELAY}>` + `<Tooltip.Trigger>` + `<Tooltip.Content>` |
| **Spacing** | `gap-1` | `gap-2` |
| **"Cancel All" button** | `className="text-danger border-danger/20 hover:bg-danger/10"` | Uses `variant="danger"` or `variant="danger-soft"` |

**Reference (BillingLineRow):**

```tsx
<Tooltip delay={TOOLTIP_DELAY}>
    <Tooltip.Trigger>
        <Button isIconOnly variant="ghost" size="sm"
            className="rounded-full bg-default-100/50 border border-transparent 
                       hover:border-danger/20 hover:bg-danger/10 text-danger">
            <Icon icon="lucide:trash-2" className="w-4 h-4" />
        </Button>
    </Tooltip.Trigger>
    <Tooltip.Content>Void Line</Tooltip.Content>
</Tooltip>
```

### 1.10 Tabs Component

The filter tabs (`All`, `Uploading`, `Completed`, `Failed`) use the correct HeroUI `<Tabs>` component, but lack the styled indicator pattern used in Rate Management:

```tsx
// Rate Management (styled):
<Tabs.Tab className="h-10 px-6 data-[selected=true]:text-white text-default-500 
                      font-bold transition-all duration-300">
    <span className="relative z-10 whitespace-nowrap text-sm">{tab.label}</span>
    <Tabs.Indicator className="bg-accent rounded-xl shadow-accent-glow" />
</Tabs.Tab>

// Upload (unstyled):
<Tabs.Tab id="all">
    All ({fileCounts.all})
    <Tabs.Indicator />
</Tabs.Tab>
```

Missing: `bg-accent rounded-xl shadow-accent-glow` on the indicator, `font-bold`, `text-default-500` styling, and the `data-[selected=true]:text-white` active state.

### 1.11 Hook Return Pattern

The `useUpload` hook returns a nested `{ state, actions }` object:

```tsx
return {
    state: { files, filteredFiles, fileCounts, activeTab, isLoading, error },
    actions: { setActiveTab },
};
```

This **directly violates** the coding standard (dev_instruction_v3.1.md §2):

> Hooks return flat objects — do **not** nest into `{ state, actions }` groups.

Every other hook uses a flat return:

```tsx
// useOrder, useRateItems, useOrderBilling, etc.
return { items, isLoading, error, handleAction, setFilter };
```

---

## 2. What Can Be Reused

### 2.1 Shared Components

| Component | Location | Use Case in Upload Tab |
|:---|:---|:---|
| `Table` | `components/pricing/Table.tsx` | Replace raw `<table>` for the file list |
| `Table.Header`, `Table.Column`, `Table.Row`, `Table.Cell` | Same | All table structure |
| `EmptyState` | `components/pricing/EmptyState.tsx` | "No files uploaded" state |
| `FilterBar` | `components/pricing/FilterBar.tsx` | Replace the filter tabs (All/Uploading/Completed/Failed) |
| `Alert` (HeroUI) | `@heroui/react` | Error state handling |
| `Skeleton` (HeroUI) | `@heroui/react` | Loading state |
| `Tooltip` (HeroUI) | `@heroui/react` | Action button tooltips |
| `Spinner` (HeroUI) | `@heroui/react` | Optional loading spinner |

### 2.2 Design Tokens from `ui-tokens.ts`

| Token | Value | Use Case |
|:---|:---|:---|
| `ICON_CONTAINER_LG` | `size-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0` | Section header icon |
| `ICON_SIZE_CONTAINER` | `size-5 text-accent` | Icon inside container |
| `TEXT_SECTION_TITLE` | `text-sm font-black uppercase tracking-widest text-foreground` | Section title |
| `TOOLTIP_DELAY` | `300` | All tooltip delays |
| `SKELETON_ROW_HEIGHT` | `h-12` | Loading row height |
| `HOVER_OPACITY_SUBTLE` | `hover:bg-accent/5` | Row hover state |
| `DENSITY_CHIP_HEIGHT` | `h-5` | Status chip height |
| `CONTAINER_BASE_RATES` | `p-3 rounded-xl border border-default-100 bg-default-50/50` | Drop zone container styling |

### 2.3 CSS Theme Tokens from `index.css`

| Token | Use Case |
|:---|:---|
| `--color-zebra-odd` / `--color-zebra-even` | File table row alternation |
| `--shadow-premium-sm` / `--shadow-premium-md` | Card and container elevation |
| `--shadow-accent-glow` | Active tab indicator |
| `--font-size-compact` / `t-compact` | Table body text |
| `--font-size-mini` / `t-mini` | Table header text, secondary labels |
| `--radius-premium` | Drop zone border radius |

### 2.4 Architectural Patterns

| Pattern | Source | Application |
|:---|:---|:---|
| **Card + Card.Header + Card.Content** wrapping table | `BillingLinesSection.tsx` | Wrapping the file upload table |
| **Icon + Title + Description + Action** header layout | `BillingLinesSection.tsx`, `ProjectPricingTab.tsx` | Upload section header |
| **Alert compound component** for errors | `BillingLinesSection.tsx`, `RateItemsList.tsx` | Error state |
| **EmptyState** for no-data | `BillingLinesSection.tsx`, `RateItemsList.tsx` | No files uploaded |
| **Skeleton rows** for loading | `BillingLinesSection.tsx`, `RateItemsList.tsx` | Loading state |
| **Tooltip-wrapped actions** | `BillingLineRow.tsx`, `RateItemsList.tsx` | Pause/Delete buttons |
| **Flat hook return** | Every hook except `useUpload` | Refactor `useUpload` |

---

## 3. How to Improve It

### 3.1 Replace Raw Table with `Table` Component

Replace the entire HTML `<table>` block (L84–154) with the shared `Table` compound component:

```tsx
<Table>
    <Table.Header>
        <tr>
            <Table.Column isBlack>File Name</Table.Column>
            <Table.Column>Status</Table.Column>
            <Table.Column>Progress</Table.Column>
            <Table.Column>Size</Table.Column>
            <Table.Column align="right">Actions</Table.Column>
        </tr>
    </Table.Header>
    <Table.Body>
        {filteredFiles.map((file) => (
            <Table.Row key={file.id}>
                <Table.Cell>...</Table.Cell>
                ...
            </Table.Row>
        ))}
    </Table.Body>
</Table>
```

This automatically brings zebra stripes, sticky headers, consistent padding, `t-mini` header text, hover tokens, and `rounded-2xl` wrapper.

### 3.2 Wrap in Card with Proper Header

Replace the plain `<section>` + `<h2>` pattern with the Card header pattern:

```tsx
<Card>
    <Card.Header className="flex items-center justify-between p-8 gap-4 
                             border-b border-default-200 bg-default-50/50">
        <div className="flex items-center gap-4">
            <div className={ICON_CONTAINER_LG}>
                <Icon icon="lucide:upload-cloud" className={ICON_SIZE_CONTAINER} />
            </div>
            <div>
                <h2 className={TEXT_SECTION_TITLE}>{title}</h2>
                <p className="text-xs text-default-400 font-medium">{description}</p>
            </div>
        </div>
        {/* Bulk actions (Pause All, Cancel All) go here */}
    </Card.Header>
    <Card.Content className="p-0">
        {/* Drop zone + Table */}
    </Card.Content>
</Card>
```

### 3.3 Add Proper Loading, Error, and Empty States

**Loading:**

```tsx
if (isLoading) {
    return (
        <Card>
            <Card.Content className="p-6 space-y-4">
                <Skeleton className="h-48 w-full rounded-2xl" />
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-full h-16 rounded-lg" />
                ))}
            </Card.Content>
        </Card>
    );
}
```

**Error:**

```tsx
if (error) {
    return (
        <Alert status="danger" className="rounded-2xl">
            <Alert.Indicator />
            <Alert.Content>
                <Alert.Title className="font-bold">Upload Error</Alert.Title>
                <Alert.Description>Failed to load upload data.</Alert.Description>
                <Button size="sm" variant="danger-soft" onPress={refetch}>Retry</Button>
            </Alert.Content>
        </Alert>
    );
}
```

**Empty:**

```tsx
{filteredFiles.length === 0 && (
    <EmptyState
        icon="lucide:upload-cloud"
        title="No Files Uploaded"
        description="Drag and drop files or click the upload area to get started."
    />
)}
```

### 3.4 Refactor `useUpload` to Flat Return

```diff
  return {
-     state: {
-         files,
-         filteredFiles,
-         fileCounts,
-         activeTab,
-         isLoading: query.isLoading,
-         error: query.error,
-     },
-     actions: {
-         setActiveTab,
-     },
+     files,
+     filteredFiles,
+     fileCounts,
+     activeTab,
+     isLoading: query.isLoading,
+     error: query.error,
+     setActiveTab,
  };
```

Update the destructuring in `FileUploadSection.tsx` accordingly:

```diff
- const { state, actions } = useUpload();
- const { filteredFiles, fileCounts, activeTab, isLoading } = state;
- const { setActiveTab } = actions;
+ const { filteredFiles, fileCounts, activeTab, isLoading, error, setActiveTab } = useUpload();
```

### 3.5 Style the Tabs Indicator

Apply the same accent indicator styling used in Rate Management:

```tsx
<Tabs.Tab
    id="all"
    className="h-10 px-6 data-[selected=true]:text-white text-default-500 
               font-bold transition-all duration-300"
>
    <span className="relative z-10 whitespace-nowrap text-sm">
        All ({fileCounts.all})
    </span>
    <Tabs.Indicator className="bg-accent rounded-xl shadow-accent-glow" />
</Tabs.Tab>
```

### 3.6 Upgrade Action Buttons

Add tooltips, rounded styling, and proper hover transitions:

```tsx
<Tooltip delay={TOOLTIP_DELAY}>
    <Tooltip.Trigger>
        <Button isIconOnly variant="ghost" size="sm"
            className="rounded-full bg-default-100/50 border border-transparent 
                       hover:border-default-200 hover:bg-default-100 text-default-500">
            <Icon icon="lucide:pause" className="w-4 h-4" />
        </Button>
    </Tooltip.Trigger>
    <Tooltip.Content>Pause Upload</Tooltip.Content>
</Tooltip>
```

### 3.7 Differentiate "Paused" Status Color

Add `warning` color for paused files:

```tsx
color={
    file.status === "completed" ? "success"
  : file.status === "failed"    ? "danger"
  : file.status === "paused"    ? "warning"
  : "accent"
}
```

### 3.8 Polish the Drop Zone

Align the drop zone with the design system's container tokens and premium border radius:

```diff
- <div className="border-2 border-dashed border-default-300 rounded-2xl p-10 ...">
+ <div className="border-2 border-dashed border-default-200 rounded-premium p-10 
+                  bg-default-50/30 hover:bg-accent/5 hover:border-accent/30 
+                  transition-all duration-300 cursor-pointer group">
```

Use `rounded-premium` (`2rem`) from the theme tokens. The icon container inside should use the established `ICON_CONTAINER_LG` pattern.

### 3.9 Component Decomposition

`FileUploadSection.tsx` handles too many concerns (161 lines). Following the Billing tab's decomposition pattern:

| New Component | Responsibility |
|:---|:---|
| `UploadDropZone.tsx` | Drag-and-drop area with icon and text |
| `UploadFileTable.tsx` | File list using shared `Table` component |
| `UploadFileRow.tsx` | Single file row with status, progress, actions |
| `UploadProgressBar.tsx` | Reusable progress bar (or consider HeroUI `Slider`) |

This mirrors:

- `BillingLinesSection.tsx` → `BillingLinesTable.tsx` → `BillingLineRow.tsx`

---

## 4. Priority Matrix

| Priority | Item | Impact | Effort |
|:---|:---|:---|:---|
| 🔴 **P0** | Replace raw `<table>` with shared `Table` component | High | Medium |
| 🔴 **P0** | Refactor `useUpload` to flat return pattern | High | Low |
| 🔴 **P0** | Add error state (`Alert`) | High | Low |
| 🟡 **P1** | Wrap in `Card` with icon header (token-based) | High | Medium |
| 🟡 **P1** | Replace ad-hoc skeleton with HeroUI `Skeleton` | Medium | Low |
| 🟡 **P1** | Add empty state (`EmptyState`) | Medium | Low |
| 🟡 **P1** | Add tooltips to action buttons | Medium | Low |
| 🟡 **P1** | Style tabs indicator to match Rate Management | Medium | Low |
| 🟢 **P2** | Differentiate "paused" chip color (`warning`) | Low | Low |
| 🟢 **P2** | Polish drop zone with theme tokens | Low | Low |
| 🟢 **P2** | Decompose into sub-components | Medium | Medium |
| 🟢 **P2** | Round action buttons (`rounded-full`) | Low | Low |
