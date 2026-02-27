# Tags Edit Modal — Design Polish Plan

## Verification Against Source & HeroUI v3 Docs

All findings verified against `TagsEditModal.tsx` (L1–142), the live screenshot, and the official HeroUI v3 Modal anatomy.

| # | Finding | Priority | Root Cause in Code |
|---|---|---|---|
| 1 | Modal header uses `bg-accent/10` icon — not the HeroUI semantic token | 9 | `Modal.Icon className="bg-accent/10 text-accent"` — HeroUI v3 docs use `bg-accent-soft text-accent-soft-foreground` for the icon container. The `/10` opacity approach can wash out in dark mode. |
| 2 | Header missing subtitle / description text | 8 | `Modal.Header` contains only `Modal.Icon` + `Modal.Heading`. HeroUI v3 "With Form" and "Dismiss Behavior" examples add a `<p>` description below `Modal.Heading` to set context. |
| 3 | Tag chips are visually anonymous on white | 8 | Default `TagGroup`/`Tag` styling on `bg-surface` is near-invisible — plain grey outline pills. No accent-tinted variant applied. |
| 4 | "Add tag" `<Label>` has no visual separation from the chips above | 7 | `Modal.Body` uses `gap-4` between the two sections. There is no `<Separator />` between the current-tags area and the "Add tag" ComboBox, so they read as one undifferentiated block. |
| 5 | "Save changes" button renders as faded/disabled-looking when `isUnchanged` | 7 | When `isUnchanged=false` (changes made), the button still inherits the default `variant="default"` which in HeroUI v3 beta renders with a muted blue rather than the full `bg-accent` solid fill. `variant="primary"` is the correct semantic choice. |
| 6 | `Modal.Footer` Cancel button uses `variant="secondary"` — competes with Add button | 6 | Both "Cancel" (footer) and "+ Add" (body) use `variant="secondary"`. Footer cancel should be `variant="ghost"` to avoid competing with the primary CTA and the inline Add button. |
| 7 | `Modal.Body` bottom padding `pb-2` creates unequal body-to-footer whitespace | 5 | `Modal.Body className="... pb-2"` — the HeroUI `Modal.Body` default already handles spacing. The `pb-2` overrides it and leaves only 8px between the ComboBox and the footer divider, feeling cramped. Should be `pb-0` or removed. |
| 8 | ComboBox label "Add tag" renders in default font weight — same as body copy | 5 | `<Label>Add tag</Label>` inherits default `text-sm` weight. Should use the project's `TEXT_SUBSECTION_LABEL` token (`text-xs font-bold text-default-500 uppercase tracking-wider`) to clearly signal a new section. |
| 9 | Empty state text inside `TagGroup.List` is plain and unstyled | 4 | `renderEmptyState` returns `<span className="text-sm text-default-400">No tags added yet.</span>` — no icon, no min-height placeholder, looks like broken content. |

> [!NOTE]
> Findings #5 and #6 are the highest-impact UX issues — they affect the user's ability to understand which action is primary and whether changes have been made.

---

## Proposed Changes

All changes in a single file. No new imports beyond what's already present.

### TagsEditModal

#### [MODIFY] [TagsEditModal.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/TagsEditModal.tsx)

**Fix 1 — Modal.Icon semantic token (Priority 9)**

Use HeroUI v3's semantic `accent-soft` color pair, which correctly adapts in dark mode, instead of raw opacity.

```diff
-<Modal.Icon className="bg-accent/10 text-accent">
+<Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
```

**Fix 2 — Add subtitle to Modal.Header (Priority 8)**

Following the HeroUI v3 "With Form" pattern: add a short `<p>` description below `Modal.Heading` to set context for the user.

```diff
 <Modal.Heading>Tags</Modal.Heading>
+<p className="text-sm leading-5 text-muted">Add or remove tags to categorise this order.</p>
```

**Fix 3 — Accent-tinted tag chips (Priority 8)**

Apply `color="primary"` to the `TagGroup` so chips render with an accent-tinted background, making them read as active selections rather than ghost labels.

```diff
 <TagGroup
     aria-label="Order tags"
     selectionMode="none"
     size="md"
+    color="primary"
     onRemove={handleRemove}
 >
```

**Fix 4 — Separator between chips and "Add tag" section (Priority 7)**

Add a `<Separator />` between the two functional areas so the modal has a clear visual break.

```diff
+import { Button, ComboBox, Input, Label, ListBox, Modal, Separator, Tag, TagGroup } from '@heroui/react';
```

```diff
         </TagGroup>
+        <Separator />
         {/* Add tag — ComboBox + Add button */}
```

**Fix 5 — "Save changes" button use `variant` aligned with primary CTA (Priority 7)**

The Save button has no explicit `variant`, causing it to inherit a muted default. Making it `variant="primary"` gives it the full `bg-accent` solid fill expected of a primary action.

```diff
 <Button
+    variant="primary"
     onPress={handleSave}
     isPending={isPending}
     isDisabled={isUnchanged}
 >
```

**Fix 6 — Cancel button to `variant="ghost"` (Priority 6)**

Demote Cancel so it doesn't compete visually with Save changes.

```diff
-<Button slot="close" variant="secondary">
+<Button slot="close" variant="ghost">
```

**Fix 7 — Remove `pb-2` override on Modal.Body (Priority 5)**

Let HeroUI's built-in `Modal.Body` padding handle spacing uniformly.

```diff
-<Modal.Body className="flex flex-col gap-4 px-6 pb-2">
+<Modal.Body className="flex flex-col gap-4 px-6">
```

**Fix 8 — "Add tag" label uses `TEXT_SUBSECTION_LABEL` token (Priority 5)**

```diff
+import { MODAL_WIDTH_MD, MODAL_BACKDROP, TEXT_SUBSECTION_LABEL } from '../../constants/ui-tokens';
```

```diff
-<Label>Add tag</Label>
+<Label className={TEXT_SUBSECTION_LABEL}>Add tag</Label>
```

**Fix 9 — Empty state with icon (Priority 4)**

Replace the plain text empty state with an icon+text pair for a more intentional feel.

```diff
 renderEmptyState={() => (
-    <span className="text-sm text-default-400">No tags added yet.</span>
+    <div className="flex items-center gap-2 py-1 text-sm text-default-400">
+        <Icon icon="lucide:tag" className="size-4 shrink-0" />
+        <span>No tags added yet</span>
+    </div>
 )}
```

---

## Verification Plan

### Automated

```bash
npm run build
```

### Visual (Browser)

1. Open `http://localhost:5173/details`
2. Click the edit (pencil) button on the Order Summary card to open the Tags modal
3. Verify:
   - Icon container has correct accent-soft background (not washed out)
   - Subtitle text appears below "Tags" heading
   - Tag chips are accent-tinted, clearly readable
   - A separator line appears between the chips and the "Add tag" section
   - "Add tag" label renders as an uppercase section label
   - "Save changes" is visually dominant (solid accent) when changes are made
   - "Cancel" is ghost — does not compete with Save
4. Clear all tags, verify the icon+text empty state renders
5. Toggle dark mode and repeat
