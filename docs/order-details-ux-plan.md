# Order Details Tab — UX Implementation Plan

---

## Phase 1 — Order Summary Card Cleanup

**Goal:** Remove duplicated data, flatten the stats layout, and fix icon/timestamp presentation.

- [x] **Remove order-type chips** — delete the `orderTypes` rendering block (lines 58–67) in `OrderSummaryCard.tsx`. Remove `orderTypes` from `OrderSummaryCardProps` and its usage in `OrderDetailsTab.tsx`.
- [x] **Remove status chip and its container** — delete the entire Status sub-block (lines 86–103) in `OrderSummaryCard.tsx`.
- [x] **Flatten session hours** — replace `ICON_CONTAINER_SM` circle + `text-2xl` number + "session hours" label with a single inline row: `<Icon icon="lucide:clock" /> {totalSessionHours} session hours`, using `text-sm font-medium text-default-700`. Remove the `CONTAINER_DETAIL_BLOCK` wrapper and the `grid grid-cols-2` stats grid. Remove `ICON_CONTAINER_SM` and `CONTAINER_DETAIL_BLOCK` imports if no longer used.
- [x] **Add `border-t border-default pt-3` separator** above the session-hours row (between order name and metrics).
- [x] **Switch timestamps to relative primary** — display `formatRelativeTime(order.createdAt)` as the visible text. Wrap each timestamp in a HeroUI `<Tooltip>` showing `formatAbsoluteTime(...)` on hover. Import `Tooltip` from `@heroui/react`.
- [x] **Change card header icon** — replace `lucide:file-text` with `lucide:clipboard-list` in `OrderSummaryCard.tsx`.

### Acceptance Criteria

- No order-type chips rendered inside Order Summary.
- No status chip rendered inside Order Summary.
- Session hours displayed as a single inline row with icon, number, and unit label — no container box, no oversized circle.
- Timestamps show relative time as primary text; hovering reveals absolute time in a Tooltip.
- Card header icon is `lucide:clipboard-list`.
- `npm run build` and `npm run lint` pass with zero errors.

### Affected Files

- [OrderSummaryCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/OrderSummaryCard.tsx)
- [OrderDetailsTab.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/OrderDetailsTab.tsx)

---

## Phase 2 — Contacts Card Refinement

**Goal:** Fix hierarchy, remove card-within-card pattern, and soften the empty-state icon.

- [x] **Replace subsection labels** — in `ContactBlock`, replace `TEXT_SUBSECTION_LABEL` with inline `text-xs font-semibold text-default-400` (sentence-case: `Primary`, `Secondary`). Remove `TEXT_SUBSECTION_LABEL` import if no longer used in this file.
- [x] **Remove `CONTAINER_DETAIL_BLOCK` from contact blocks** — replace the container `<div className={CONTAINER_DETAIL_BLOCK ...}>` with a plain `<div>`. Add `border-t border-default pt-3` to the Secondary block for visual separation. Remove `CONTAINER_DETAIL_BLOCK` import if no longer used in this file.
- [x] **Change empty-state icon** — replace `lucide:user-x` with `lucide:user-plus` in the empty `ContactBlock`.

### Acceptance Criteria

- "Primary" and "Secondary" labels are sentence-case, `text-xs font-semibold text-default-400` — visually distinct from the card title.
- No grey background boxes around contact blocks.
- A top border separates Secondary from Primary.
- Empty-state icon is `lucide:user-plus`.
- `npm run build` and `npm run lint` pass with zero errors.

### Affected Files

- [ContactDetailsCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/ContactDetailsCard.tsx)

---

## Phase 3 — Session Details Card Simplification

**Goal:** Format address as a composed string, resolve country code, and flatten subsection labels and containers.

- [x] **Create `getCountryName` utility** — add a function in `utils/format-address.ts` (new file) that accepts an ISO code string and returns the full country name by looking up the `countries` array from `data/mock-order.ts`. Fallback: return the code as-is if not found.
- [x] **Create `formatAddress` utility** — in the same `utils/format-address.ts`, add a function that accepts an `AddressPayload` and returns a composed string: `"Johannisstraße 20, Hinterhaus 2. OG, 10117 Berlin, Germany"`. Omit empty fields. Use `getCountryName` for the country.
- [x] **Replace address field dump** — in `SessionDetailsCard.tsx`, replace the `AddressRow` grid with a single `<p>` element rendering `formatAddress(address)`. Delete the `AddressRow` component from the file.
- [x] **Remove "ADDRESS" subsection label** — delete the `<p className={TEXT_SUBSECTION_LABEL}>Address</p>` element. Remove `TEXT_SUBSECTION_LABEL` import if no longer used.
- [x] **Remove "SCHEDULED" subsection label** — delete the `<p className={TEXT_SUBSECTION_LABEL}>Scheduled</p>` element.
- [x] **Flatten scheduled date row** — remove the `CONTAINER_DETAIL_BLOCK` wrapper around the date. Render as: `<Icon icon="lucide:calendar" /> 10 January 2025 · 10:00` — all in `text-sm font-medium text-default-700`, date and time separated by ` · `. Remove `CONTAINER_DETAIL_BLOCK` import if no longer used.
- [x] **Remove `CONTAINER_DETAIL_BLOCK` from address block** — replace the container `<div className={CONTAINER_DETAIL_BLOCK ...}>` with a plain `<div>`.

### Acceptance Criteria

- Address renders as a single composed string (e.g., `Johannisstraße 20, Hinterhaus 2. OG, 10117 Berlin, Germany`).
- Country shows full name, not ISO code.
- No "ADDRESS" or "SCHEDULED" subsection labels visible.
- No grey background containers around the address or the date.
- Date and time are inline: `📅 10 January 2025 · 10:00`.
- `npm run build` and `npm run lint` pass with zero errors.

### Affected Files

- [NEW] [format-address.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/utils/format-address.ts)
- [SessionDetailsCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/SessionDetailsCard.tsx)

---

## Phase 4 — Billing Context Card Adjustments

**Goal:** Remove duplicated data and add a summary row.

- [x] **Remove session-hours line** — delete the `totalSessionHours > 0` block (lines 66–75) in `BillingContextCard.tsx`. Remove `totalSessionHours` from `BillingContextCardProps`. Remove the prop from `OrderDetailsTab.tsx`.
- [x] **Add scope-lines total row** — after the scope lines list, add a `border-t border-default pt-2 mt-1` separator with a bold summary: `"{scopeLines.length} line items"` right-aligned, using `text-xs font-bold text-default-900`.

### Acceptance Criteria

- No `⏱ 3 session hours` line inside Billing Context.
- A total row appears below scope lines with the count.
- `npm run build` and `npm run lint` pass with zero errors.

### Affected Files

- [BillingContextCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/BillingContextCard.tsx)
- [OrderDetailsTab.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/OrderDetailsTab.tsx)

---

## Phase 5 — Grid Layout & Team Lead Card

**Goal:** Fix row height alignment, widen Assigned Lead, and add card hover states.

- [x] **Change grid `items-start` to `items-stretch`** — in `OrderDetailsTab.tsx`, replace `items-start` with `items-stretch` on the parent grid `<div>`.
- [x] **Widen TeamLeadCard column** — change `lg:col-span-2` to `lg:col-span-3` on the TeamLeadCard wrapper in `OrderDetailsTab.tsx`.
- [x] **Add hover state to TeamLeadCard** — wrap the assigned-lead content row in a `<div>` with `rounded-xl -mx-2 px-2 py-1 transition-colors hover:bg-default/40 cursor-default`. Add a HeroUI `<Tooltip>` around the name showing the full role on hover.
- [x] **Add edit affordance to each card** — in each of the 5 card components (`OrderSummaryCard`, `ContactDetailsCard`, `SessionDetailsCard`, `BillingContextCard`, `TeamLeadCard`), add a ghost edit button in the card header row: `<Button size="sm" variant="ghost" isIconOnly aria-label="Edit"><Icon icon="lucide:pencil" className="size-3.5" /></Button>`. The button should be positioned via `justify-between` on the header flex container. Wrap the card in a `group` class so the button is `opacity-0 group-hover:opacity-100 transition-opacity`.

### Acceptance Criteria

- Cards in the same row stretch to equal height — no whitespace gaps below shorter cards.
- Assigned Lead card spans 3 of 6 columns.
- Hovering over the lead's row shows a subtle background highlight.
- Hovering over any card reveals a pencil edit button in the header.
- `npm run build` and `npm run lint` pass with zero errors.

### Affected Files

- [OrderDetailsTab.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/OrderDetailsTab.tsx)
- [OrderSummaryCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/OrderSummaryCard.tsx)
- [ContactDetailsCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/ContactDetailsCard.tsx)
- [SessionDetailsCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/SessionDetailsCard.tsx)
- [BillingContextCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/BillingContextCard.tsx)
- [TeamLeadCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/TeamLeadCard.tsx)

---

## Verification Plan

### Automated Tests

- `npm run build` — must exit 0 after each phase.
- `npm run lint` — must exit 0 after each phase.

### Visual Verification (after each phase)

1. Open `http://localhost:5173/details` in the browser.
2. Capture a screenshot of the full Details tab.
3. Confirm the specific acceptance criteria for the completed phase against the screenshot.
4. Verify in dark mode (toggle via sidebar button) — no contrast or background regressions.
