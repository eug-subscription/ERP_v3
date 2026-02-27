# Order Details Layout Assessment

Two options evaluated against the existing codebase.

---

## Option 1 — Dedicated Sidebar (Drawer)

**What exists:** The codebase has `sidebarModalStyles` in `src/styles/modal-variants.ts` — a right-anchored, full-height, 360px-wide slide-in drawer with backdrop blur. Used by `OverrideModal` (project pricing overrides) and `TimelineConfigModal` (workflow builder). Both are edit-focused: form fields, save/cancel footer.

**Clarification:** The Pricing tab on the Project page does *not* use a persistent sidebar. It hides the `3fr_1fr` grid sidebar entirely (`showSidebar = false` for `/pricing-beta`). The drawer pattern it uses is a modal overlay triggered by an "Add Custom Rate" button.

### Feasibility

Fully feasible. The drawer pattern, styles, and animations are already built. A new component would use the same `sidebarModalStyles` and render inside `OrderLayout`, triggered by a button.

### Conflicts

| Issue | Severity | Detail |
|---|---|---|
| Width constraint | Moderate | The existing drawer is 360px (`max-w-[360px]`). Order details (contact, address, billing context) contain more data than override forms. 360px will likely feel cramped for structured address fields and billing summaries. Widening breaks consistency with existing drawer users. |
| Existing sidebar conflict | Low | `OrderInfo` already renders as a persistent sidebar on some tabs. A drawer that shows similar data creates two surfaces for the same information — one persistent (grid aside), one on-demand (drawer). Which is canonical? |
| Interaction pattern mismatch | Moderate | Existing drawers (`OverrideModal`, `TimelineConfigModal`) are transactional — open, edit, save, close. Order details are reference data you want to glance at, not a form to submit. Using a drawer for non-transactional content is a pattern mismatch. |

### Design/UX assessment

- **Pros:** Order details are accessible from any tab without affecting the main content layout. Users can view contact details while looking at billing lines or photos.
- **Cons:** Adds a click to reveal information that users need frequently. The drawer overlays the content area, so you can't reference both simultaneously without the drawer partially obscuring the main view. On mobile, 360px is the full screen width — the line between "sidebar" and "modal" vanishes, which weakens the conceptual distinction.

---

## Option 2 — Inline Button in Overview Header

**What exists:** The `OverviewTab` header is currently:

```tsx
<header className="mb-1">
    <h2 className="text-2xl font-black text-default-900 tracking-tight">
        Order Overview
    </h2>
    <p className="text-sm font-medium text-default-500 mt-1">
        At-a-glance status, alerts, and key metrics for this order.
    </p>
</header>
```

No right-aligned actions exist in this header. The pattern elsewhere in the codebase for header + right action:

- `BillingLinesSection`: flexbox with `justify-between`, heading left, "Add Line Item" button right
- `QuickActionsBar`: separate card below the header, not in the header itself
- `OrderPageHeader`: `justify-between` with h1 left, "New Order" button right

### Feasibility

Trivial. Change `<header>` to `flex justify-between`, add a button on the right. Follows the `OrderPageHeader` and `BillingLinesSection` patterns exactly.

### Conflicts

| Issue | Severity | Detail |
|---|---|---|
| Overview-only access | Moderate | The button would only be visible on the Overview tab. Users on Billing, Upload, or Photos tabs cannot access order details without navigating back to Overview first. |
| What does the button open? | Critical (design decision) | The button label is "View Order Details" — but it needs to open *something*. If it opens the drawer from Option 1, then this is really Option 1 + Option 2 combined. If it scrolls to a section within Overview, it changes the Overview tab's purpose from dashboard to dashboard + detail view. |

### Design/UX assessment

- **Pros:** Zero layout disruption. Minimal implementation effort. Follows existing header patterns.
- **Cons:** Only answers "where is the trigger" — does not answer "where does the content render". The button needs a target. On its own, this option is incomplete.

---

## Combined Assessment

Neither option is complete in isolation.

| Concern | Option 1 (Drawer) | Option 2 (Inline button) |
|---|---|---|
| Where does content render? | ✅ Answered (drawer panel) | ❌ Not answered |
| How is it triggered? | ❌ Not specified (need a button somewhere) | ✅ Answered (header button) |
| Accessible from all tabs? | ✅ If trigger is in `OrderLayout` | ❌ Only on Overview |
| Conflicts with existing sidebar? | ⚠️ Duplicates `OrderInfo` | ✅ No conflict |
| Aligns with design language? | ⚠️ Drawer pattern is for transactional edits | ✅ Matches header action patterns |

### What makes sense

If the goal is a **single on-demand panel accessible from any tab**, then:

1. **Trigger in `OrderPageHeader`** (not Overview header) — a button or icon next to the order name. This is visible on every tab since `OrderPageHeader` is rendered by `OrderLayout` above `TabNavigation`. Precedent: the "New Order" button already sits here.

2. **Content in a drawer** — using `sidebarModalStyles` but wider (e.g., `max-w-[480px]`). This is a new width variant, but justified because order details contain more structured data than pricing overrides. The drawer would be read-first, edit-capable, replacing the current `OrderInfo` sidebar entirely.

3. **Retire `OrderInfo` as a sidebar** — remove it from the grid `aside` in `OrderLayout`. All order metadata lives in the drawer. This eliminates two surfaces for the same data and frees the grid to be full-width on all tabs.

This approach combines both options: the trigger sits in a global header (variant of Option 2 at a higher level), and the content renders in a drawer (Option 1). No conflicts, no duplication, and the pattern already exists in the codebase.
