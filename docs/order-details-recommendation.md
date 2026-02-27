# Order Details — Placement & Presentation Recommendation

## Current Page Structure

The order page uses `OrderLayout` with three layers:

1. **OrderPageHeader** — breadcrumbs, `Order: {client} | {orderId}`, status/photo/profit chips, created date
2. **TabNavigation** — 6 primary tabs (Overview, Upload, Photos, Messages, Timeline, Billing) + 4 overflow (Matching, Team, Moderation, Shot List)
3. **Content area** — either full-width or 3:1 grid with `OrderInfo` sidebar

The sidebar (`OrderInfo`) renders on tabs that show per-item content (Upload, Photos, Messages). It is hidden on full-width tabs: Overview, Billing, Team, Timeline, Moderation, Shot List.

### What exists today

| Surface | Fields shown |
|---|---|
| `OrderPageHeader` | order ID, client name, project name, status chip, photo count, profit margin, created date |
| `OrderInfo` sidebar | client (editable), location (editable), schedule date+time (editable), status, profit, tags, rating |
| `OverviewTab` bento grid | pipeline status, alerts, messages preview, operational metrics, financial snapshot (from billing summary), team snapshot |
| `OrderBillingTab` | billing line items table, order financial summary, project pricing card |

### What `CreateOrderModal` captures

Order name, contact (name, email, phone), address (line1, line2, city, country, postcode), session date, session time.

---

## Recommendation

### Where order details should live: `OrderInfo` sidebar

**Reason:** `OrderInfo` already serves as the order-level metadata panel. It already contains client, location, schedule, status, and profit — all of which are order details. Placing the new fields here follows the existing information architecture instead of creating a second surface for the same category of data.

### What to change in `OrderInfo`

#### 1. Rename heading from "Order Details" to "Order Details" (no change needed — already named correctly)

#### 2. Add order name display

Currently `OrderInfo` does not show the order name. The header shows it, but the sidebar should also display it as the first field.

**Reason:** The sidebar is the editable order record. The header is a summary. When a user edits the order name in the sidebar, the header should reflect it.

#### 3. Replace single "Client" field with "Contact" section

The sidebar currently has a single `client` string field. `CreateOrderModal` captures name, email, and phone. The sidebar should display and edit all three fields.

**Proposed structure:**

- Primary contact: name, email, phone
- Secondary contact: same fields (future, not in `CreateOrderPayload` yet — add when needed)

**Reason:** The creation modal already captures structured contact data. The sidebar must display what was captured.

#### 4. Expand "Location" to match address structure

The sidebar editable form currently shows line1, city, and country. `CreateOrderPayload` has line1, line2, city, country, postcode. The sidebar should display all five fields.

**Reason:** Data captured at creation should be viewable/editable on the order page. Currently line2 and postcode are lost after creation.

#### 5. Add "Billing Context" section (derived, read-only)

Add a read-only section below the editable fields that shows a summary derived from billing lines:

- **Order type** — inferred from the `rateItemId` values on active billing lines (e.g., if lines reference photography rate items, display "Photography"; if both photography and videography rate items exist, display "Photography + Videography")
- **Total session hours** — sum of `quantityEffective` for hour-based billing lines (`unitType === 'hour'`)
- **Scope summary** — count of distinct rate items billed (e.g., "3 line items: Food Photography ×2h, Editing ×15 images, Location Fee ×1")

**Reason:** The user stated billing lines are the source of truth. Displaying a derived summary on the sidebar gives immediate context without navigating to the Billing tab. The data already exists in `useOrderBillingLines`.

This section should link to the Billing tab (same pattern as `FinancialSnapshot` in `OverviewTab` which links to `/billing`).

---

### Sidebar visibility

`OrderInfo` is currently hidden on 6 tabs including Overview and Billing. For order details to be accessible, one of two things must change:

**Option A (recommended): Show the sidebar on Overview**

Remove `/overview` from `NO_SIDEBAR_ROUTES` in `OrderLayout`. The Overview bento grid already has a responsive 6-column layout that can coexist with a sidebar.

**Reason:** Overview is the landing tab. Users need order details immediately visible when opening an order. The Overview tab's `FinancialSnapshot` and `TeamSnapshot` cards duplicate data that already lives in the sidebar — with the sidebar visible, these cards could be simplified or removed.

**Option B: Keep sidebar hidden on Overview, accept that details are only visible on Upload/Photos/Messages tabs**

This is the current state. No layout change needed but order details are not visible on the most-visited tab.

---

### Additional fields worth adding

Each field below is justified by a concrete production management or client-facing need.

| Field | Justification |
|---|---|
| **Session date + time** (already exists) | Already in `OrderInfo` as "Schedule". No change needed. |
| **Order status** (already exists) | Already in `OrderInfo` as a chip. No change needed. |
| **Project link** | `OrderPageHeader` shows the project name in breadcrumbs. The sidebar should include a project link so users can navigate to project settings (rate card, workflow) without scrolling to breadcrumbs. The `projectId` is already available from `useOrder`. |
| **Created / Modified timestamps** | `OrderPageHeader` shows created date. The sidebar should show both created and last-modified timestamps. `BillingLineInstance` already tracks `createdAt` and `modifiedAt` — the order record should mirror this. Useful for audit trail and SLA tracking. |
| **Assigned photographer / team lead** | `TeamSnapshot` on Overview shows team members. The sidebar should show the primary assigned person (e.g., lead photographer) as a quick-access field. The data source is the same as `TeamMembers` / `TeamSnapshot`. Gives ops managers a fast answer to "who is on this order". |

### Fields NOT recommended

| Field | Why excluded |
|---|---|
| Order notes / internal comments | No existing data source or type. Would need a new data model. Out of scope. |
| Order priority | No existing priority concept in `OrderData` or `BillingLineInstance`. Would be speculative. |
| Delivery deadline | Not captured in creation flow, not present in mock data. Add only when the workflow/pipeline system supports deadlines. |

---

## Summary of changes

```
OrderInfo.tsx
├── Add: order name (editable, synced with header)
├── Modify: Client → Contact section (name, email, phone)
├── Modify: Location → full address (line1, line2, city, country, postcode)
├── Add: Billing Context section (read-only, derived from billing lines)
│   ├── Order type (from rateItemId)
│   ├── Total session hours (sum quantityEffective where unitType=hour)
│   └── Scope summary (distinct rate items with quantities)
├── Add: Project link
├── Add: Created + modified timestamps
└── Add: Assigned team lead

OrderLayout.tsx
└── Option A: Remove "/overview" from NO_SIDEBAR_ROUTES

order.ts (types)
└── Extend OrderData or create OrderDetails type to include contact, 
    address (full structured), and creation timestamps
```

No new tabs, no new routes, no new components. All changes are within existing surfaces.
