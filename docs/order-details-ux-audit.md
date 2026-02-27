# Order Details Tab — UI/UX Audit

> Analysis date: 25 Feb 2026  
> Benchmark: Linear, Vercel Dashboard, Stripe Dashboard  
> Scope: Five cards visible on `/details` — Order Summary, Contacts, Session Details, Billing Context, Assigned Lead, plus page-level layout.

---

## 1. Page-Level Layout

| Area | Issue | Recommendation |
|---|---|---|
| **Tab title** | "Order Details" in `text-2xl font-black` is oversized for a tab that lives under an already-prominent page header (`Order: Budget King Berlin \| order-1`). Creates a double-header effect. Linear and Vercel never repeat what the parent chrome already tells you. | Remove or demote to a single-line muted subtitle (`text-sm text-default-500`). The tab bar already indicates which tab is active. |
| **Subtitle text** | "Contact, location, schedule, and billing context for this order." is a description of the tab itself — the user already clicked into Details, so it's obvious. Vercel and Stripe omit these. | Remove entirely. Every line of copy that doesn't add information pushes content below the fold. |
| **Grid symmetry** | Row 3 places `TeamLeadCard` at `col-span-2` out of 6 columns, leaving 4 columns of dead whitespace. The card is visually orphaned. | Either widen it to `col-span-3` to match the upper cards, or group it inline with Billing Context / Session Details if it can fit. |
| **Vertical spacing** | The gap between the header block (`mb-1`) and the bento grid (`gap-6`) is inconsistent — 4 px above, 24 px between rows. | Standardise: remove `mb-1` on the header, let the grid's `gap-6` provide the only vertical rhythm. |
| **Max width** | `max-w-screen-2xl` is extremely wide. On ultrawide monitors the two-column cards are stretched far apart, breaking proximity. Stripe caps at ~1200 px for detail views. | Reduce to `max-w-screen-xl` or `max-w-[1200px]`. |

---

## 2. Order Summary Card

| Area | Issue | Recommendation |
|---|---|---|
| **"Name" label** | A tiny `text-xs text-default-400` label that says "Name" sits above the order name. The order name is the only prominent string in the card — labelling it "Name" is redundant noise. Linear and Stripe never label the primary entity name. | Remove the "Name" label. Let the order name stand alone as the card's hero text. |
| **Session hours stat block** | The clock icon sits inside `ICON_CONTAINER_SM` (a 28 px circle with accent background), but immediately below it the number `3` is in `text-2xl font-black`. The icon container is disproportionately large relative to the value it annotates — and the icon sits alone in an oversized row (`flex items-center gap-2 mb-1`) with nothing beside it. | Inline the icon next to the value: `<Icon> 3 session hours` in a single row, similar to how Billing Context already displays `⏱ 3 session hours`. Eliminate the separate container circle. |
| **Stats grid visual weight** | The `CONTAINER_DETAIL_BLOCK` (rounded-xl grey bg + border) around the session-hours and status blocks makes them look like embedded sub-cards. This double-boxing (card-within-card) adds visual noise without aiding scanability. | Remove the container blocks. Use a `border-t border-default` separator to divide the stats row from the name above, then lay out metrics inline as key-value pairs — simpler, flatter, consistent with Stripe's detail panels. |
| **Status chip placement** | Status is buried inside a sub-block labelled "Status" — despite the fact that the **page header above already shows the status chip** (`Completed`). This is pure duplication. | Remove status from this card. It's already in the page-level header and visible without scrolling. |
| **Order-type chip** | `Photography` chip duplicates the **Billing Context** card, which also renders the same chip. | Keep the chip in one place only. Since the order type is billing-relevant metadata, it belongs in Billing Context. Remove it from Order Summary. |
| **Timestamps** | `Created` and `Modified` timestamps use `text-xs font-medium text-default-600` — the same visual weight as the "Name" label, making them indistinguishable. They also use absolute format only; relative time is hidden in a `title` attribute. | Display relative time as the primary string (e.g., "5 weeks ago") with absolute time in a Tooltip on hover. This is the standard pattern in Linear, GitHub, and Vercel. |
| **Card header icon** | `lucide:file-text` doesn't meaningfully represent "Order Summary". It's a generic document icon. | Use `lucide:clipboard-list` or `lucide:package` — something that signals "order". |

---

## 3. Contacts Card

| Area | Issue | Recommendation |
|---|---|---|
| **Card height imbalance** | The Contacts card is taller than Order Summary because it renders two contact blocks stacked. This means Row 1 has mismatched card heights with visible whitespace below Order Summary. | Either add `h-full` to both Row 1 cards so they stretch to match, or consider restructuring the layout so the mismatch doesn't occur (e.g., place Contact inline with a smaller card). |
| **"PRIMARY" / "SECONDARY" labels** | Rendered via `TEXT_SUBSECTION_LABEL` — tiny uppercase bold. Visually they look like the card header rather than sub-labels, creating hierarchy confusion. The user can't quickly tell what level of heading they're reading. | Differentiate: make the subsection labels sentence-case (`Primary`, `Secondary`) at `text-xs font-semibold text-default-400`. This separates them from the `TEXT_SECTION_LABEL` pattern used for card titles. |
| **Contact block background** | Each contact block uses `CONTAINER_DETAIL_BLOCK` (grey bg + border rounded-xl) — again the card-within-card anti-pattern. Two nested rounded rectangles per card. | Replace with a simple top-border separator between Primary and Secondary. Remove the background blocks. |
| **Email / Phone icon colour** | Icons are `text-default-400` — the same grey as labels. They don't provide affordance that these are actionable values. | Make them `text-accent` or at minimum slightly darker (`text-default-500`) to hint at interactivity. |
| **No interaction on contact values** | Email and phone values are plain text. There is no `mailto:` link on email, no `tel:` link on phone, no copy-on-click. Stripe and Linear make these clickable / copyable. | Wrap email in `<Link href="mailto:...">` and phone in `<Link href="tel:...">`. Add a copy-to-clipboard action on hover (small icon button). |
| **Empty state icon** | `lucide:user-x` for "No primary contact" is aggressive — the "x" implies error/deletion. | Use `lucide:user-plus` to encourage adding a contact, or plain `lucide:user` for neutral empty state. |

---

## 4. Session Details Card

| Area | Issue | Recommendation |
|---|---|---|
| **Address as a form dump** | The address block shows individual fields with labels like "Line 1", "Line 2", "City", "Postcode", "Country" — this is a database schema, not a readable address. Linear and Stripe display addresses as a single formatted string, e.g., `Johannisstraße 20, Hinterhaus 2. OG, 10117 Berlin, DE`. | Format the address as a composed string. Remove field-level labels in the read-only view. |
| **Country as raw code** | Country shows `DE` — an ISO code, not a human-readable name. | Map to full name: `Germany`. The `countries` array or a lookup util should handle this. |
| **"ADDRESS" subsection label** | Uppercase, bold, `text-xs` — sits below the card title "SESSION DETAILS" and visually competes with it. The label is also redundant because the card is titled "Session Details" and the address block is the only content before the schedule. | Remove the "ADDRESS" label. The address block's visual separation from the schedule section is sufficient. Alternatively, use a Border separator. |
| **"SCHEDULED" subsection label** | Same issue — it's uppercase bold and competes with the card title. The date is self-evidently a schedule. | Demote to sentence-case muted label, or remove and let the calendar icon + date speak for itself. |
| **Scheduled date block** | Uses `CONTAINER_DETAIL_BLOCK` (full grey bg + border rounded-xl). The calendar icon is `text-accent`, the date is `font-bold`, the time is `font-medium text-default-500` — three different visual treatments in one row. | Simplify: `📅 10 January 2025 · 10:00` — icon, date, and time in a single consistent `text-sm font-medium text-default-700` row, separated by a middot. Remove the container. |
| **Card icon** | `lucide:map-pin` is fine for address, but the card now also includes "Scheduled" — so the icon should represent the session broadly. | Consider `lucide:calendar-clock` which combines location-in-time, or keep `map-pin` but acknowledge the card is address-weighted. |

---

## 5. Billing Context Card

| Area | Issue | Recommendation |
|---|---|---|
| **Duplicate order-type chip** | `Photography` chip duplicates the Order Summary card. | As noted above, keep in one place. If kept here, remove from Order Summary. |
| **Session hours duplication** | `⏱ 3 session hours` repeats the Order Summary stat exactly. | Remove from here. Session hours belongs in Order Summary where it's the primary metric. Billing Context should focus on scope lines only. |
| **Scope lines layout** | Lines are separated by `border-b border-default` — standard but flat. Every row has the same visual weight. In Stripe's invoice view, line items have subtle row hover states and a slightly larger font for quantities. | Add `hover:bg-default/40` on rows for scanability. Make the quantity value `font-bold` and the unit `font-normal text-default-500` to create a clear value → unit hierarchy. |
| **"View Billing" link** | Positioned top-right in `text-xs text-default-400`. It's so muted it disappears. Linear uses a ghost button or underlined link for cross-tab navigation. | Upgrade to a small ghost button: `<Button size="sm" variant="ghost">View Billing →</Button>`. The arrow adds directionality. |
| **Card height** | Billing Context is shorter than Session Details, leaving Row 2 visually unbalanced (same issue as Row 1 but reversed). | Stretch to equal height, or let the grid handle it with `items-stretch` instead of `items-start`. |
| **No total / summary** | The card shows line items but no aggregate — no total hours, no total count, no subtotal. Stripe always shows a total row at the bottom of line items. | Add a bold separator line at the bottom with a summary (e.g., total session hours as a sum of line items, or just a count of scope lines). |

---

## 6. Assigned Lead Card

| Area | Issue | Recommendation |
|---|---|---|
| **Orphaned layout** | Takes `col-span-2` of 6, leaving a 4-column void. This is the most visually broken part of the page — a tiny card floating in empty space. | Increase to `col-span-3` (half-width like other cards) or merge into the Order Summary card as a sub-section (Linear groups assignees inside the main detail panel). |
| **Minimal content** | The card shows an avatar, name, and role — 3 data points. This doesn't justify a standalone card. It's a single row of metadata. | Fold into Order Summary or create a composite "Team & Assignment" card that can grow (e.g., multiple team members, assignment history). |
| **Avatar colour** | Uses `color="accent"` — blue fallback. There's no avatar image, but the initials fallback works. However, the circle is the only splash of accent color in the entire card, making it look like a button. | Use a neutral `color="default"` or `color="foreground"` for the avatar to keep it informational, not actionable. |
| **No interaction** | No way to click through to a team member profile, reassign, or view assignment history. In Linear, clicking an assignee opens their profile. | Add a hover state on the entire card or the name as a `<Link>` to a team member detail page (if it exists), or at minimum a Tooltip with extended info. |

---

## 7. Cross-Cutting Patterns

| Pattern | Issue | Recommendation |
|---|---|---|
| **Card-within-card (CONTAINER_DETAIL_BLOCK)** | Used in Order Summary (stats), Contacts (each block), Session Details (address + schedule). Creates a layered-boxes effect that increases visual complexity without aiding comprehension. Premium SaaS apps (Linear, Stripe) use flat layouts with separators. | Audit and remove most `CONTAINER_DETAIL_BLOCK` usages. Replace with `border-t` / `border-b` separators or whitespace-only grouping. Reserve the container pattern for genuinely nested entities (e.g., an expandable sub-record). |
| **Uppercase labels everywhere** | `TEXT_SECTION_LABEL` and `TEXT_SUBSECTION_LABEL` are both uppercase + tracking-wider. When a card has both, they're visually identical. This collapses the typographic hierarchy into a single level. | Keep card titles uppercase. Make subsection labels sentence-case, lighter weight, and no letter-spacing. This creates a clear two-level heading system. |
| **Data duplication** | Order type chips appear in Order Summary and Billing Context. Session hours appear in Order Summary and Billing Context. Status appears in Order Summary and the page header. | Each data point should appear once. Assign a canonical home for each value and remove duplicates. |
| **No edit affordances** | None of the cards have edit buttons, inline editing, or even hover states that suggest editability. For an ERP, this is a significant gap — users viewing details usually need to correct or update them. | Add a subtle edit icon button (pencil) in each card header, visible on card hover. On press, either open an inline editing mode or a pre-filled modal. |
| **`items-start` on the grid** | The parent grid uses `items-start`, so cards in the same row have different heights. This leaves ragged gaps at the bottom of shorter cards in each row. | Change to `items-stretch` so cards in the same row share the same height. This eliminates whitespace gaps and looks more polished. |

---

*End of audit. All recommendations are achievable within HeroUI v3 + Tailwind v4 + the existing `ui-tokens.ts` design system.*
