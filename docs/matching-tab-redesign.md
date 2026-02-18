# Matching Tab — Visual Redesign Report

> **Goal:** Bring the Matching Tab to premium SaaS quality, consistent with Billing Beta, Upload, and Pricing tabs.

---

## 1. Progress Bar — Broken Line Artifact

**Current state:** `MatchProgress.tsx` uses a HeroUI `Slider` in `isDisabled` mode with `Slider.Track` / `Slider.Fill`. The progress bar renders with a visible "broken line" — a hairline gap between the fill and track edges caused by `rounded-full` on the fill not aligning with the track's overall border radius. The disabled Slider also shows a muted/dimmed appearance that feels dead rather than informative.

**Proposed fix:**

| Aspect | Before | After |
|--------|--------|-------|
| Component | `Slider` (disabled) | Dedicated `div`-based progress bar |
| Track | `h-2 rounded-full` | `h-2.5 rounded-full bg-default-200` |
| Fill | `bg-accent rounded-full` | `bg-accent rounded-full` with `transition-all duration-500` |
| Labels | Raw `span` with mixed sizes | Unified `text-xs font-bold` for both labels |
| Visual polish | — | Add a subtle `shadow-accent-sm` glow on the fill when > 0% |

**Implementation plan — `MatchProgress.tsx`:**

```tsx
// Replace Slider with a simple semantic progress bar
<div className="mb-6 bg-default-50 p-6 rounded-3xl border border-default-200">
  <div className="flex justify-between items-center mb-3">
    <span className="text-xs text-default-500 font-bold">
      {remaining} of {total} items left to match
    </span>
    <span className="text-xs font-black text-accent">{percent}% complete</span>
  </div>
  <div className="h-2.5 rounded-full bg-default-200 overflow-hidden">
    <div 
      className="h-full rounded-full bg-accent transition-all duration-500"
      style={{ width: `${percent}%` }}
    />
  </div>
</div>
```

- Removes `@heroui/react` `Slider` + `Label` imports from this file (cleanup).
- Uses CSS `overflow-hidden` on the track to **guarantee** no broken-line artifact — the fill never bleeds outside the track's rounded corners.
- Adds smooth `transition-all duration-500` so the bar animates when items are matched.

---

## 2. File Name Visibility

**Current state:** File names truncate aggressively with `truncate` (single-line ellipsis). On narrow viewports or the 2-column grid, names like `Chicken_Burger.jpg` render as `Chicken_B…` — destroying readability.

**Proposed fixes (apply together):**

| Layer | Change |
|-------|--------|
| **Font size** | Change `font-bold` → `text-sm font-bold` on `h4` in list view rows (`UnmatchedPhotoPanel.tsx` line 82). Already uses `text-sm` in `ItemMatchPanel.tsx` — unify both panels. |
| **Tooltip on hover** | ✅ Already implemented via `Tooltip` wrapping the filename. No change needed. |
| **Two-line layout** | Allow filename to wrap to 2 lines max instead of single-line truncate: replace `truncate` with `line-clamp-2` on the `h4` element. This gives ~80% more visible characters while still capping vertical growth. |
| **Remove `.jpg` extension** | Strip the file extension from the display name, show full extension only in the tooltip. Reduces character count by 4-5 chars. |
| **Grid view overlay** | In grid view (`UnmatchedPhotoPanel.tsx` line 116), the filename overlay is `text-xs font-bold truncate` — keep as-is since it's on hover only, but ensure the full name shows in the tooltip too. Currently missing tooltip in grid view — **add Tooltip wrapping the grid overlay text.** |

**Impact on `UnmatchedPhotoPanel.tsx`:**

```diff
- <h4 className="font-bold text-default-900 truncate">
+ <h4 className="text-sm font-bold text-default-900 line-clamp-2">
```

**Grid view — add Tooltip wrapper:**

```tsx
<Tooltip delay={TOOLTIP_DELAY}>
  <Tooltip.Trigger>
    <p className="text-xs font-bold truncate text-white w-full">
      {photo.filename}
    </p>
  </Tooltip.Trigger>
  <Tooltip.Content>{photo.filename}</Tooltip.Content>
</Tooltip>
```

---

## 3. Drop Zone Clarity

**Current state:** Drop targets in `ItemMatchPanel.tsx` are styled as flat `bg-surface p-4 rounded-2xl border-2 border-transparent` cards. The only drop affordance is a small download icon and a color change on `dragOverItem`. There's **no visual cue** before dragging starts that these are valid targets.

**Proposed redesign:**

### 3a. Idle state (no drag in progress)

Add a subtle dashed border + "Drop photo here" label below the item description:

```diff
- border-transparent
+ border-dashed border-default-200
```

Add a drop hint line below the description:

```tsx
<p className="text-xs text-default-400 mt-1 flex items-center gap-1">
  <Icon icon="lucide:image-down" className="w-3.5 h-3.5" />
  Drop photo here
</p>
```

### 3b. Active drag state (photo being dragged)

When `draggedPhoto` is non-null (a drag is in progress), apply a **pulsing border animation** and highlight to ALL drop targets to signal they're ready to receive:

```tsx
className={`... ${
  draggedPhoto 
    ? "border-accent/30 bg-accent/5 animate-pulse-subtle" 
    : "border-dashed border-default-200"
} ${
  dragOverItem === item.id 
    ? "border-accent ring-4 ring-accent/10 scale-[1.02] border-solid" 
    : ""
}`}
```

This requires **passing `draggedPhoto` as a new prop** to `ItemMatchPanel` (currently not passed — only `dragOverItem` is).

### 3c. Column-level header

In `ItemMatchPanel.tsx`, update the subtitle from "Drop photos here." to "Drop photos onto items to match them." — more descriptive guidance.

---

## 4. Scalability (20+ Items)

**Current state:** Both panels use `max-h-[600px]` (photos) and `max-h-[500px]` (items) with `overflow-y-auto`. This is correct behavior for scalability. However, there are inconsistencies and refinements needed:

| Issue | Fix |
|-------|-----|
| **Mismatched heights** | Unify both panels to `max-h-[560px]`. The unmatched photos panel uses `max-h-[600px]`, items panel uses `max-h-[500px]` — they should match for visual balance. |
| **Matched section unbounded** | `MatchedItemsSection.tsx` uses `max-h-[400px]` which is fine. |
| **No item count badge** | Add a count chip to the Unmatched Photos header (like "Items to Match" has `{unmatchedItems.length} left`). Show `{photos.length} photos` in the header. |
| **Sticky search** | Search in `ItemMatchPanel.tsx` is `sticky top-0 z-10` — ✅ correct. But `bg-default-50` may not match the `Card variant="secondary"` background. Use `bg-inherit` or the Card's actual secondary surface token. |
| **custom-scrollbar class** | This class isn't defined in `index.css`. The global `::-webkit-scrollbar` styles already handle thin scrollbars. **Remove `custom-scrollbar` class references** — they're no-ops. |

**Mock data expansion:** To properly test scalability, expand `mock-unmatched-items.ts` from 3 items + 3 photos to **8 items + 8 photos**. This lets us validate scroll behavior, search filtering, and matched section growth without needing real data.

---

## 5. Card Alignment

**Current state:** The two-column grid (`grid-cols-1 lg:grid-cols-2 gap-6`) renders correctly, but the `Tabs` component sitting above the Unmatched Photos card on the left creates a visual offset — the left card starts ~50px lower than the right card because of the `mb-6` on the Tabs wrapper.

**Proposed fix:**

Move the Tabs into the Card header area so both cards start at the same vertical baseline:

```tsx
<Card variant="secondary">
  <Card.Header className="px-6 pt-5 pb-0 flex-row justify-between items-start">
    <div>
      <h3 className="text-sm font-black mb-1 text-default-900">Unmatched Photos</h3>
      <p className="text-xs text-default-400 font-medium">
        Drag and drop photos to match them.
      </p>
    </div>
    <Chip color="accent" variant="soft" className="font-black">
      {photos.length} photos
    </Chip>
  </Card.Header>
  <div className="px-6 pt-3">
    <Tabs ...>
      ...
    </Tabs>
  </div>
  <Card.Content className="p-6 pt-4">
    {/* list/grid content */}
  </Card.Content>
</Card>
```

This puts the Tabs widget **inside** the left Card, mirroring how the right card has its header + search inside the Card. Both Card tops now align.

---

## 6. Grid View Thumbnails

**Current state:** Grid view uses `grid-cols-2 sm:grid-cols-3` inside a Card. Each thumbnail is `aspect-square` — but because the Card is only ~50% viewport width (2-column layout), each thumbnail resolves to roughly 80-100px. The `2 sm:3` column setup means thumbnails are tiny.

**Proposed fix:**

| Aspect | Before | After |
|--------|--------|-------|
| Grid columns | `grid-cols-2 sm:grid-cols-3` | `grid-cols-2` (always 2 cols — larger thumbnails) |
| Gap | `gap-4` | `gap-3` |
| Card wrapper | `Card variant="transparent"` | Remove Card wrapper — use a simple `div` with `rounded-xl overflow-hidden` |
| Hover overlay | Opacity-based gradient overlay | Always-visible subtle gradient at bottom with filename; full overlay on hover |
| Filename | Hidden until hover | Show basename always via a `line-clamp-1 text-xs` below the image |
| Cursor | Default | `cursor-grab active:cursor-grabbing` to match list view drag affordance |
| Drag chip | None | Add a small "Drag" chip overlay on hover (matches list view's "Drag to match" chip) |

**Implementation:**

```tsx
<div className="grid grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-2">
  {photos.map((photo) => (
    <div
      key={photo.id}
      draggable
      onDragStart={(e) => onDragStart(e, photo)}
      onDragEnd={onDragEnd}
      className="cursor-grab active:cursor-grabbing group"
    >
      <div className="aspect-square rounded-xl overflow-hidden border border-default-100 hover:border-accent/30 transition-all hover:shadow-accent-sm">
        <img src={photo.image} alt={photo.filename} className="w-full h-full object-cover" />
      </div>
      <p className="text-xs font-medium text-default-600 mt-1.5 line-clamp-1">
        {photo.filename}
      </p>
    </div>
  ))}
</div>
```

---

## 7. Additional Findings

### 7a. "Drag to match" Chip — Redundant & Noisy

The list view shows a `Chip color="accent" variant="soft"` reading "Drag to match" on **every single row**. With 8+ photos, this becomes visual noise.

**Proposed:** Remove the per-row chip. Instead, rely on the section subtitle ("Drag and drop photos to match them."), the `cursor-grab` affordance, and the grip handle icon. The chip clutters the row without adding value.

### 7b. Grip Handle Alignment

The grip handle (`lucide:grip-vertical`) is in a `w-6` container that creates inconsistent left margin. **Proposed:** Use `opacity-0 group-hover:opacity-100 transition-opacity` on the grip icon — show it only on hover, like premium drag-and-drop UIs (Notion, Linear).

### 7c. Item Drop Target — Download Arrow Icon Misleading

The drop target rows in `ItemMatchPanel.tsx` use `lucide:arrow-down-to-dot` wrapped in a styled circle. The "download" connotation is misleading for a drop-to-match action. **Proposed:** Replace with `lucide:image-down` or `lucide:plus-circle` — either conveys "add photo here" more clearly.

### 7d. MatchedItemsSection — Missing Animation Consistency

The matched section uses `animate-in slide-in-from-bottom-4 fade-in` for the Card wrapper, which is good. However, individual matched rows have no entrance animation. **Proposed:** Add `animate-in fade-in duration-300` with a staggered delay on individual rows for a polished reveal effect.

### 7e. Search Field Background Mismatch

In `ItemMatchPanel.tsx` line 56, the sticky search has `bg-default-50` but it lives inside a `Card variant="secondary"` which uses HeroUI's secondary surface color. This creates a subtle color mismatch on scroll. **Proposed:** Change to `bg-[var(--heroui-default-100)]` or use `bg-inherit` to match the Card's actual background.

### 7f. Separator in Photo List

`UnmatchedPhotoPanel.tsx` line 93 uses `Separator className="my-2 opacity-50"`. This is unnecessary visual noise between already-padded rows. **Proposed:** Remove the Separator entirely — the `space-y-4` on the container and each row's `p-2` padding provides sufficient visual separation, consistent with how `ItemMatchPanel.tsx` handles spacing (no separators).

### 7g. Card.Header Pattern Inconsistency

The outer `MatchingTab.tsx` Card uses `Card.Header` with icon + title, which is correct. But the inner panels (`UnmatchedPhotoPanel.tsx`, `ItemMatchPanel.tsx`) don't use `Card.Header` — they put headers inside `Card.Content`. **Proposed:** Move each panel's header content into proper `Card.Header` elements for semantic consistency with the Billing tab pattern.

### 7h. Missing `aria-label` on the View Mode Tabs

The `Tabs` component in `UnmatchedPhotoPanel.tsx` lacks an `aria-label`. **Proposed:** Add `aria-label="Photo view mode"` to the `Tabs` component.

---

## Summary of Files to Modify

| File | Priority | Changes |
|------|----------|---------|
| `MatchProgress.tsx` | 🔴 High | Replace Slider with div-based bar, fix broken line |
| `UnmatchedPhotoPanel.tsx` | 🔴 High | Move Tabs into Card, fix alignment, enlarge grid thumbnails, file name `line-clamp-2`, remove Separator, remove per-row chip |
| `ItemMatchPanel.tsx` | 🔴 High | Add dashed drop zone borders, add draggedPhoto prop, replace arrow icon, fix search bg |
| `MatchedItemsSection.tsx` | 🟡 Medium | Add row entrance animations |
| `MatchingTab.tsx` | 🟡 Medium | Pass `draggedPhoto` prop to ItemMatchPanel |
| `mock-unmatched-items.ts` | 🟡 Medium | Expand to 8 items + 8 photos for scalability testing |
| `useUnmatchedItems.ts` | 🟢 Low | No changes needed |
| `matching.ts` (types) | 🟢 Low | No changes needed |

---

## Implementation Order

| Phase | Scope | Estimated effort |
|-------|-------|------------------|
| **Phase 1** ✅ | Progress bar fix, card alignment, file name visibility | Small |
| **Phase 2** ✅ | Drop zone clarity (dashed borders, drag state, icon swap) | Medium |
| **Phase 3** ✅ | Grid view thumbnail redesign, scalability (mock data expansion, unified heights) | Medium |
| **Phase 4** ✅ | Polish pass — remove chip noise, grip hover, row animations, separator cleanup, aria labels | Small |
