# Matching Tab Redesign — Review Report

> **Baseline:** [matching-tab-redesign.md](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/docs/matching-tab-redesign.md) (Phases 1-4)
> **Scope:** All files changed since the redesign plan was approved.

---

## Fix Verification Table

| Original Finding | Status | Notes |
|-----------------|--------|-------|
| **§1 Progress bar broken line** | ✅ Resolved | Slider replaced with `div`-based bar using `overflow-hidden`. `Slider` and `Label` imports removed. Track uses proper `bg-default` via inline style. ARIA `role="progressbar"` added — solid accessibility. |
| **§2a File name font size** | ✅ Resolved | Changed to `text-sm font-bold` in list view ([UnmatchedPhotoPanel.tsx:91](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Matching/UnmatchedPhotoPanel.tsx#L91)). Consistent with `ItemMatchPanel.tsx`. |
| **§2b File name two-line layout** | ✅ Resolved | `truncate` → `line-clamp-2` applied in list view. |
| **§2c Grid view tooltip** | ✅ Resolved | Tooltip wrapping grid overlay text added ([UnmatchedPhotoPanel.tsx:118-125](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Matching/UnmatchedPhotoPanel.tsx#L118-L125)). |
| **§2d File extension stripping** | ⚠️ Partial | Extension stripped in grid view basename ([line 129](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Matching/UnmatchedPhotoPanel.tsx#L129)) but **not in list view** ([line 92](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Matching/UnmatchedPhotoPanel.tsx#L92)). Plan specified both contexts. |
| **§3a Drop zone dashed border** | ✅ Resolved | `border-dashed border-default-200` applied as idle state ([ItemMatchPanel.tsx:80](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Matching/ItemMatchPanel.tsx#L80)). |
| **§3b Active drag highlight** | ✅ Resolved | `draggedPhoto` prop threaded through to `ItemMatchPanel`. When non-null, items get `border-accent/30 bg-accent/5`. Active drop target gets `border-solid ring-4` treatment. |
| **§3c Drop hint label** | ✅ Resolved | "Drop photo here" with `lucide:image-down` icon shown when no drag in progress ([lines 108-113](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Matching/ItemMatchPanel.tsx#L108-L113)). |
| **§3c Subtitle update** | ✅ Resolved | Changed to "Drop photos onto items to match them." |
| **§3d Icon replacement** | ✅ Resolved | `lucide:arrow-down-to-dot` → `lucide:image-down` in both inline + circle icon. |
| **§4 Unified scroll heights** | ⚠️ Partial | Unmatched Photos panel unified to `max-h-[560px]` ✅. But Items panel still uses `max-h-[500px]` ([ItemMatchPanel.tsx:75](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Matching/ItemMatchPanel.tsx#L75)). Plan specified both at `560px`. |
| **§4 Photo count badge** | ✅ Resolved | `{photos.length} photos` Chip added to Card.Header. |
| **§4 Sticky search bg** | ✅ Resolved | Changed from `bg-default-50` → `bg-inherit`. |
| **§4 custom-scrollbar removal** | ✅ Resolved | Removed from all Matching files. Only `TeamMembers.tsx` retains it (out of scope). |
| **§4 Mock data expansion** | ✅ Resolved | Expanded to 8 items + 8 photos with proper descriptions. |
| **§5 Card alignment** | ✅ Resolved | Tabs moved inside Card with `Card.Header` + `px-6 pt-3` wrapper. Both columns now share same top edge. |
| **§6 Grid thumbnail sizing** | ✅ Resolved | `grid-cols-2 sm:grid-cols-3` → `grid-cols-2`. Card wrapper removed, replaced with `div + rounded-xl`. Filename shown below thumbnail with `line-clamp-1`. |
| **§6 Grid cursor** | ✅ Resolved | `cursor-grab active:cursor-grabbing` added. |
| **§6 Grid hover border** | ✅ Resolved | `hover:border-accent/30 hover:shadow-accent-sm` added. |
| **§7a "Drag to match" chip removal** | ✅ Resolved | Per-row chip removed from list view. |
| **§7b Grip handle hover** | ✅ Resolved | `opacity-0 group-hover:opacity-100 transition-opacity` applied. |
| **§7c Icon swap** | ✅ Resolved | (Covered by §3d above) |
| **§7d Matched row animations** | ✅ Resolved | `animate-in fade-in duration-300` + staggered `animationDelay` using `MATCHED_ROW_STAGGER_MS` token. |
| **§7e Search bg mismatch** | ✅ Resolved | (Covered by §4 above) |
| **§7f Separator removal** | ✅ Resolved | `Separator` component and import removed from `UnmatchedPhotoPanel.tsx`. |
| **§7g Card.Header pattern** | ✅ Resolved | Both `UnmatchedPhotoPanel` and `ItemMatchPanel` now use `Card.Header`. |
| **§7h aria-label on Tabs** | ✅ Resolved | `aria-label="Photo view mode"` added. |
| **Magic numbers in hook** | ✅ Resolved | `500ms` timeout literals replaced with `DROP_EXIT_ANIMATION_MS` from `ui-tokens.ts`. |

---

## New Findings Table

| # | Issue | Category | File & Line | Severity | Suggested Fix |
|---|-------|----------|-------------|----------|---------------|
| 1 | ~~Progress bar track uses inline `style={{ backgroundColor: "var(--color-default)" }}` with comment "bg-default-N not available at runtime". This is incorrect — Tailwind `bg-default-200` **is** available at runtime. The inline style references a non-existent `--color-default` variable.~~ | ~~Hard-coded / Logic~~ | [MatchProgress.tsx:21](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Matching/MatchProgress.tsx#L21) | ✅ Fixed | HeroUI v3 exposes `--default` (not `--default-200`). Corrected to `style={{ backgroundColor: "var(--default)" }}`. Removed incorrect comment. |
| 2 | ~~File extension not stripped in list view — grid view strips with `.replace(/\.[^/.]+$/, "")` but list view renders `renderHighlightedText(photo.filename, ...)` with full filename including `.jpg`. Inconsistent with the plan and with grid view behavior.~~ | ~~Logic~~ | [UnmatchedPhotoPanel.tsx:92](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Matching/UnmatchedPhotoPanel.tsx#L92) | ✅ Fixed | Extension stripped via `.replace(/\.[^/.]+$/, "")` on display text. Tooltip still shows full filename. |
| 3 | ~~Items panel scroll height still `max-h-[500px]` while Photos panel is `max-h-[560px]`. Plan specified unified `560px` for visual balance.~~ | ~~Hard-coded~~ | [ItemMatchPanel.tsx:75](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Matching/ItemMatchPanel.tsx#L75) | ✅ Fixed | Changed to `max-h-[560px]`. Both panels now unified. |
| 4 | ~~`ItemMatchPanel.tsx` still has `index === 0` image gate removed (confirmed fixed — all items now show images). However, the `(item)` parameter shadow — `filteredItems.map((item) =>` — was previously `(item, index)` and the `index` is no longer used. The current code correctly doesn't use `index`, but the drop hint has `!draggedPhoto` condition that hides the hint during drag. During drag, the drop hint disappears but the dashed border + accent highlight appear — this is intentional and correct.~~ | — | — | ✅ Acknowledged | No action needed — behaviour is intentional and correct. |
| 5 | ~~`error` is destructured from `useUnmatchedItems()` in the hook's return ([useUnmatchedItems.ts:150](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useUnmatchedItems.ts#L150)) but never consumed by `MatchingTab.tsx` — it only uses `isError`.~~ | ~~Dead code~~ | [useUnmatchedItems.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useUnmatchedItems.ts) | ✅ Fixed | Removed `error` from both `useQuery` destructuring and the hook's return object. |
| 6 | ~~`MatchProgress.tsx` wraps content in `Card` + `Card.Content`, but the parent `MatchingTab.tsx` already wraps everything in a `Card`. The progress bar is effectively a Card nested inside another Card's content. While this renders fine with `variant="secondary"` on the inner card, the plan specified a simple `div` wrapper — not a Card.~~ | ~~Logic~~ | [MatchProgress.tsx:11](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Matching/MatchProgress.tsx#L11) | ✅ Fixed | Changed to `<Card variant="secondary">` — the HeroUI-correct secondary surface. No doubled shadow/border. Consistent with the two panels below it. |
| 7 | ~~**Right panel item names truncate aggressively.** With 8 items, names like "Chicken B…", "Mediterra…", "Classic C…" are barely readable. Descriptions also truncate: "Grilled chick…", "Atlantic sal…". Root cause: `w-16 h-16` thumbnail + icon circle + `p-4` padding + `gap-4` consume most of the card width, leaving ~100px for text.~~ | ~~Layout~~ | [ItemMatchPanel.tsx:85-117](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Matching/ItemMatchPanel.tsx#L85-L117) | ✅ Fixed | Reduced thumbnail to `w-12 h-12` and drop icon to `w-4 h-4`, freeing ~40px of horizontal space for item names and descriptions. |
| 8 | ~~**"Drop photo here" hint wraps to 2 lines** on narrow cards, causing inconsistent row heights across the right panel. The hint icon + text at `text-xs` still overflows when the text area is too narrow.~~ | ~~Layout~~ | [ItemMatchPanel.tsx:108-113](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Matching/ItemMatchPanel.tsx#L108-L113) | ✅ Fixed | Added `whitespace-nowrap` to the hint `<p>`. |
| 9 | ~~**Left panel filenames truncate** despite `line-clamp-2` — names like `Salmon_Fillet_`, `Beef_Tacos_S:` cut off. The `w-20 h-20` thumbnail + `w-6` grip handle leave limited text space. With extension stripping (Finding #2) the problem is reduced but not eliminated for long names.~~ | ~~Layout~~ | [UnmatchedPhotoPanel.tsx:72-97](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/Matching/UnmatchedPhotoPanel.tsx#L72-L97) | ✅ Fixed | Reduced thumbnail to `w-16 h-16`. Combined with extension stripping, filenames have significantly more display width. |

---

## Build & Lint Status

| Check | Result |
|-------|--------|
| `npm run lint` | ✅ Pass (0 warnings) |
| `npm run build` | ✅ Pass (5.15s) |

---

## Verdict

**🔁 REQUEST CHANGES**

Five items must be fixed before merge:

1. ~~**Finding #1 (High):** `MatchProgress.tsx` — replace inline `style` with Tailwind `bg-default-200` and delete the incorrect comment.~~ ✅
2. ~~**Finding #7 (High):** `ItemMatchPanel.tsx` — reduce thumbnail to `w-12 h-12` and icon circle to free text space. Item names are unreadable.~~ ✅
3. ~~**Finding #2 (Medium):** `UnmatchedPhotoPanel.tsx` — strip `.jpg` extension from list view display for consistency with grid view.~~ ✅
4. ~~**Finding #3 (Medium):** `ItemMatchPanel.tsx` — unify scroll height to `max-h-[560px]`.~~ ✅
5. ~~**Finding #6 (Medium):** `MatchProgress.tsx` — replace `Card` + `Card.Content` wrapper with a plain `div` as specified in the plan.~~ ✅

Recommended:

- ~~Finding #8: Add `whitespace-nowrap` to "Drop photo here" hint to prevent wrapping.~~ ✅
- ~~Finding #9: Reduce left panel thumbnails from `w-20 h-20` to `w-16 h-16` for more filename space.~~ ✅

Optional:

- Finding #5: Remove unused `error` from hook return (pre-existing, low priority).
