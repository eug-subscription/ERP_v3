# Contacts Card — Design Polish Plan

## Verification Against Screenshot & Source

All 4 findings verified against `ContactDetailsCard.tsx` (L1–123) and the live screenshot.

| # | Finding | Verified | Root Cause in Code |
|---|---|---|---|
| 1 | Asymmetrical divider spacing | ✅ | Secondary block uses `border-t border-default pt-5` (20 px below divider), but the parent `flex flex-col gap-4` only gives ~16 px above it. The gap is produced by the flex gap, not by a symmetric margin on the separator itself. |
| 2 | Header → "Primary" gap too tight | ✅ | `Card.Content` uses `gap-4` uniformly. Header row and the first `ContactBlock` share the same 16 px gap. `OrderSummaryCard` and `BillingContextCard` use the same `gap-4`, but their first content element (`<div>` with a label + value) visually occupies more vertical space, making the clearance *feel* more generous. In Contacts, the first child is a `<p>` with `text-xs`, so the gap reads tighter. |
| 3 | Role label → name micro-gap | ✅ | Inside `ContactBlock` (L36–51), `gap-2` controls spacing between the role `<p>` and the inner `<div>` (name + rows), but the role `<p>` and the bold name `<p>` stack with only the flex gap between the two containers — there's no dedicated micro-gap between the label and the name. |
| 4 | Icon-to-text optical alignment | ⚠️ Partially | `ContactRow` (L16–25) already uses `flex items-center gap-2.5`. The icon is `size-3.5` (14 px) vs `text-sm` (14 px line-height). Alignment is *structurally correct* but can float optically depending on the icon's SVG viewbox. This is a low-severity optical refinement, not a structural bug. |

> [!NOTE]
> Finding #4 is the weakest of the four. The `flex items-center` is already applied. A `translate-y-[0.5px]` nudge *may* help at certain zoom levels but is a magic number. I recommend checking visually before committing a fix and only applying if the misalignment is noticeable at 100% zoom.

---

## Proposed Changes

All changes are in a single file. No new files, no new dependencies.

### ContactDetailsCard

#### [MODIFY] [ContactDetailsCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/ContactDetailsCard.tsx)

**Fix 1 — Symmetrical divider spacing (Priority 9)**

Replace the CSS border approach with a HeroUI `<Separator />` using symmetric vertical margin, matching the pattern in `OrderSummaryCard` (`<Separator className="my-4" />`).

```diff
 // ContactBlock — remove border-t from the component itself
-className="border-t border-default pt-5"
+// (remove — separator is now rendered between blocks)
```

In the main card body, render an explicit `<Separator>` between the two `ContactBlock` elements:

```diff
 <ContactBlock
     label="Primary"
     contact={contact ?? null}
     emptyMessage="No primary contact"
 />
+<Separator className="my-1" />
 <ContactBlock
     label="Secondary"
     contact={secondaryContact ?? null}
     emptyMessage="No secondary contact"
-    className="border-t border-default pt-5"
 />
```

> [!IMPORTANT]
> The parent already has `gap-4` (16 px). Combined with `my-1` on the Separator (4 px top + 4 px bottom), the total visual clearance above and below the divider becomes 20 px each — perfectly symmetrical.

**Fix 2 — Header → first element gap (Priority 8)**

Add `mb-1` to the header flex container to create extra clearance before the first `ContactBlock`, matching the visual weight of sibling cards.

```diff
-<div className="flex items-center justify-between">
+<div className="flex items-center justify-between mb-1">
```

**Fix 3 — Role-to-name micro-gap (Priority 7)**

Inside `ContactBlock`, increase the gap between the role label and the contact details block, and ensure the role label uses a muted color token.

```diff
-<div className={`flex flex-col gap-2 ${className ?? ''}`}>
-    <p className="text-xs font-semibold text-default-400">{label}</p>
+<div className={`flex flex-col gap-3 ${className ?? ''}`}>
+    <p className="text-xs font-semibold text-default-500">{label}</p>
```

- `gap-2` → `gap-3`: adds ~4 px micro-gap between role and name (8 px → 12 px)
- `text-default-400` → `text-default-500`: slightly stronger to read as a section label rather than a ghost hint, while still receding behind the bold name

**Fix 4 — Icon optical alignment (Priority 6)**

Add `leading-none` to the text span in `ContactRow` to tighten the line-height and force the text baseline closer to the icon center.

```diff
-<span className={value ? 'text-default-700 font-medium' : 'text-default-400'}>
+<span className={value ? 'text-default-700 font-medium leading-5' : 'text-default-400 leading-5'}>
```

Using `leading-5` (20 px) instead of the default `leading-normal` (~22.4 px for `text-sm`) tightens the text box without resorting to magic-number transforms.

---

## Verification Plan

### Automated

```bash
npm run build
```

A clean build confirms no import or JSX errors were introduced.

### Visual (Browser)

1. Open `http://localhost:5173/details` in the browser
2. Screenshot the Contacts card
3. Verify:
   - Divider has equal whitespace above and below
   - Header → "Primary" gap matches the gap in Order Summary and Billing Context cards
   - "Primary" label and "Marcus Hoffmann" name have visible micro-separation
   - Mail/phone icons sit on the same optical baseline as the text
4. Toggle dark mode and repeat the visual check
