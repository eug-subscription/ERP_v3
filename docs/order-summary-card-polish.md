# Order Summary Card — Design Polish Plan

## Findings

| # | Finding | Priority | Root Cause |
|---|---|---|---|
| 1 | Asymmetric separator spacing | 9 | All three `<Separator>` elements are placed *inside* section-wrapping `<div>`s. Parent `gap-4` (16 px) fires between divs, then `my-4` (16 px) adds on top — giving **32 px above** the line but only **16 px below** it. |
| 2 | Timestamp label-value hierarchy too flat | 6 | "Created"/"Modified" labels and their values both use `text-xs font-medium`, differentiated only by a subtle color step (`text-default-400` → `text-default-600`). |

---

## Proposed Changes

Single file, no new imports, no new dependencies.

#### [MODIFY] [OrderSummaryCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/OrderSummaryCard.tsx)

### Fix 1 — Symmetric separator spacing (Priority 9)

Extract each `<Separator>` from its section wrapper and place it as a **standalone flex sibling**, using `my-1` (same pattern as the fixed `ContactDetailsCard`). The parent `gap-4` applies equally on both sides, producing symmetric 20 px clearance.

**Session hours section (L81–92):**

```diff
                {/* Session hours — inline row */}
-               <div>
-                   <Separator className="my-4" />
-                   <div className="flex items-center gap-2 text-sm font-medium text-default-700">
+               <Separator className="my-1" />
+               <div>
+                   <div className="flex items-center gap-2 text-sm font-medium text-default-700">
                        <Icon icon="lucide:clock" className="size-4 shrink-0" />
                        <span>
                            {totalSessionHours > 0
                                ? `${totalSessionHours} session hours`
                                : 'No session hours'}
                        </span>
                    </div>
                </div>
```

**Tags section (L94–112):**

```diff
                {/* Tags */}
-               <div>
-                   <Separator className="my-4" />
-                   <p className="text-xs text-default-400 font-medium mb-2">Tags</p>
+               <Separator className="my-1" />
+               <div>
+                   <p className="text-xs text-default-400 font-medium mb-2">Tags</p>
                    <TagGroup aria-label="Order tags" selectionMode="none" size="md">
                        ...
                    </TagGroup>
                </div>
```

**Timestamps section (L114–131):**

```diff
                {/* Timestamps */}
-               <div>
-                   <Separator className="my-4" />
-                   <div className="grid grid-cols-2 gap-2">
+               <Separator className="my-1" />
+               <div>
+                   <div className="grid grid-cols-2 gap-2">
                        ...
                    </div>
                </div>
```

> [!NOTE]
> After this refactor, the section-wrapping `<div>`s around the session-hours and timestamps sections become unnecessary (they each contain a single child). They can optionally be removed to flatten the DOM, but this is cosmetic — leaving them has zero impact.

---

### Fix 2 — Timestamp label-value hierarchy (Priority 6)

Increase the typographic contrast between "Created"/"Modified" labels and their timestamp values.

**TimestampWithTooltip component (L28):**

```diff
-               <span className="text-xs font-medium text-default-600 cursor-default">
+               <span className="text-sm font-semibold text-default-700 cursor-default">
```

**Fallback dash for missing "Modified" (L127):**

```diff
-               <span className="text-xs font-medium text-default-600">—</span>
+               <span className="text-sm font-semibold text-default-700">—</span>
```

This creates a clear hierarchy step:

- Labels: `text-xs font-medium text-default-400` (12 px, medium, muted)
- Values: `text-sm font-semibold text-default-700` (14 px, semibold, prominent)

---

## Verification

### Automated

```bash
npm run build
```

### Visual (ask developer to screenshot)

1. Open `http://localhost:5173/details`
2. Verify Order Summary card:
   - All three separators have **equal whitespace** above and below
   - "10 Jan 2025" and "Mon · 09:00" are visually heavier than their "Created"/"Modified" labels
3. Compare spacing rhythm with Contacts card (should feel consistent)
4. Toggle dark mode and repeat
