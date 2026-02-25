# Order Creation Flow — Implementation Plan

Based on the approved [design report](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/docs/order-creation-design-report.md).

---

## Phase 1 — Data Layer ✅ DONE

> No dependencies. Must complete before Phase 2.

### Task 1.1 · Create `CreateOrderPayload` type ✅

**File:** [NEW] [order.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/types/order.ts)

- Define `CreateOrderPayload` interface with 5 optional fields:

```ts
import type { DateValue } from "@internationalized/date";

export interface CreateOrderPayload {
  orderName: string;
  contact1: string;
  contact2: string;
  shootingAddress: string;
  sessionDate: DateValue | null;
}
```

- Export a `CREATE_ORDER_DEFAULTS` constant with all fields initialised to `""` / `null`.

**Acceptance:**

- File exists at `src/types/order.ts`.
- Named export `CreateOrderPayload` is importable.
- Named export `CREATE_ORDER_DEFAULTS` is importable.
- No `export default`. No `any` types.

---

### Task 1.2 · Create mock mutation ✅

**File:** [NEW] [mock-create-order.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/data/mock-create-order.ts)

- Export `async function createOrder(payload: CreateOrderPayload): Promise<{ id: string }>`.
- Simulate 800 ms delay with `setTimeout` + `Promise`.
- Return a generated order ID (e.g. `order-${Date.now()}`).

**Acceptance:**

- Named export `createOrder` exists.
- Returns `{ id: string }` after ~800 ms.
- Accepts `CreateOrderPayload` — type-checked, no `any`.

---

### Task 1.3 · Create `useCreateOrder` mutation hook ✅

**File:** [NEW] [useCreateOrder.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useCreateOrder.ts)

**Depends on:** Task 1.1, Task 1.2

- Import `useMutation` from `@tanstack/react-query`.
- Import `createOrder` from `../data/mock-create-order`.
- Import `useRouter` from `@tanstack/react-router`.
- Import `toast` from `@heroui/react`.
- `onSuccess`: call `toast.success("Order created")` and `router.navigate({ to: "/overview" })`.
- `onError`: call `toast.danger("Could not create order. Please try again.")`.
- Return flat object: `{ mutate, isPending }`.

**Acceptance:**

- Named export `useCreateOrder` exists.
- Uses `useMutation`, not manual `useState`.
- Calls `toast.success` on success, `toast.danger` on error.
- Navigates via TanStack Router `router.navigate()`, not `window.location`.
- No `onClick`, no `export default`, no `any`.

---

## Phase 2 — Toast Provider Setup ✅ DONE

> No dependencies on Phase 1. Can be done in parallel.

### Task 2.1 · Add `Toast.Provider` to App root ✅

**File:** [MODIFY] [App.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/App.tsx)

- Import `Toast` from `@heroui/react`.
- Render `<Toast.Provider />` as a sibling of `<RouterProvider />` inside the existing `QueryProvider`.
- Placement: `"bottom"` (default — non-intrusive).

**Acceptance:**

- `<Toast.Provider />` is rendered once, at root level.
- Calling `toast("test")` from any component shows a toast at the bottom of the viewport.
- No duplicate providers.

---

## Phase 3 — Modal Component ✅ DONE

> **Depends on:** Phase 1 (types + hook), Phase 2 (toast provider)

### Task 3.1 · Build `CreateOrderModal` component ✅

**File:** [NEW] [CreateOrderModal.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/CreateOrderModal.tsx)

**Props interface:**

```ts
interface CreateOrderModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}
```

**Structure (HeroUI v3 compound pattern):**

```
Modal (isOpen, onOpenChange)
└─ Modal.Backdrop (variant="blur")
   └─ Modal.Container (size="md")
      └─ Modal.Dialog (className={MODAL_WIDTH_MD})
         ├─ Modal.CloseTrigger
         ├─ Modal.Header
         │  ├─ Modal.Icon (lucide:clipboard-plus, bg-accent-soft text-accent-soft-foreground)
         │  ├─ Modal.Heading → "New Order"
         │  └─ <p className="text-muted"> → subtitle
         ├─ Modal.Body (className="p-6")
         │  ├─ Group 1: TextField (Order Name) — autoFocus
         │  ├─ Separator label "Contacts" (styled span, TEXT_SECTION_LABEL token)
         │  ├─ Group 2: TextField (Contact 1) + TextField (Contact 2)
         │  ├─ Separator label "Session Details"
         │  ├─ Group 3: TextField+TextArea (Shooting Address, rows=2)
         │  └─ DatePicker (Session Date) with Calendar popover
         └─ Modal.Footer (border-t border-default-100)
            ├─ Button (variant="secondary", slot="close") → "Cancel"
            └─ Button (variant="primary", onPress=handleSubmit, isLoading=isPending) → "Create Order"
```

**Component requirements:**

| Requirement | Implementation |
|:--|:--|
| State management | Local `useState` for each field, initialised from `CREATE_ORDER_DEFAULTS` |
| Submit handler | Calls `useCreateOrder().mutate(payload)` then closes modal on success |
| Auto-focus | `autoFocus` prop on Order Name `TextField` |
| Past-date warning | `DatePicker` uses `isInvalid={isPastDate}` + `FieldError` showing "This date is in the past" — does NOT block submit |
| Reset on close | `useEffect` watching `isOpen` — when `false`, reset all fields to defaults |
| Tokens | Import `MODAL_WIDTH_MD` from `ui-tokens.ts` for dialog width. Import `TEXT_SECTION_LABEL` for group labels |
| Icons | `Icon` from `@iconify/react` with `lucide:clipboard-plus` for header |
| All HeroUI imports | Direct from `@heroui/react` — `Modal`, `Button`, `TextField`, `Label`, `Input`, `TextArea`, `DatePicker`, `DateField`, `Calendar`, `FieldError`, `Separator` |

**Acceptance:**

- Named export `export function CreateOrderModal`.
- All imports from `@heroui/react` — no wrappers.
- Uses `onPress`, never `onClick`.
- No `export default`. No `any`. No `use client`.
- `MODAL_WIDTH_MD` and `TEXT_SECTION_LABEL` imported from `ui-tokens.ts` — not hardcoded.
- `Modal.Backdrop > Modal.Container > Modal.Dialog` nesting (not siblings).
- Form fields use HeroUI composition: `TextField > Label + Input`.
- DatePicker uses full composition: `DatePicker > DateField.Group > DateField.Input > DateField.Segment` + `DatePicker.Trigger` + `DatePicker.Popover > Calendar`.
- `npm run build` passes.
- `npm run lint` passes.

---

### 🖥️ Visual Checkpoint A — Modal Appearance

After Task 3.1, open the modal manually (wire a temporary button). Verify:

| Check | Expected |
|:------|:---------|
| Dark mode | Modal dialog surface adapts. Backdrop blurs background. All text readable |
| Light mode | Same — no invisible text, no broken contrast |
| Header | Icon (clipboard+) in accent-soft pill, "New Order" heading, muted subtitle |
| Field groups | Three groups separated by uppercase labels ("CONTACTS", "SESSION DETAILS") |
| Address field | Multi-line `TextArea`, 2 rows |
| Date picker | Calendar icon trigger, popover opens with month grid |
| Footer | Two buttons right-aligned: grey "Cancel", accent "Create Order" |
| Close | ✕ button, ESC key, backdrop click — all close the modal |
| Auto-focus | Cursor in "Order Name" field immediately on open |

---

## Phase 4 — Trigger Integration

> **Depends on:** Phase 3

### Task 4.1 · Add "New Order" button to `OrderLayout`

**File:** [MODIFY] [OrderLayout.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/layouts/OrderLayout.tsx)

- Import `useOverlayState` from `@heroui/react`.
- Import `CreateOrderModal` from `../CreateOrderModal`.
- Import `Button` from `@heroui/react`, `Icon` from `@iconify/react`.
- Add `const createOrderState = useOverlayState()`.
- Render a `<Button variant="primary" size="sm" onPress={createOrderState.open}>` with `lucide:plus` icon and label "New Order" in the header area near the breadcrumbs / order title.
- Render `<CreateOrderModal isOpen={createOrderState.isOpen} onOpenChange={createOrderState.setOpen} />` once, at the bottom of the layout return.

**Acceptance:**

- "New Order" button visible on the order page header.
- Clicking it opens `CreateOrderModal`.
- Modal close returns to previous state — no navigation, no side effects.
- Uses `onPress`, not `onClick`.
- Uses `useOverlayState()`, not raw `useState`.

---

### 🖥️ Visual Checkpoint B — End-to-End Flow

After Task 4.1, test the complete flow:

| Step | Expected result |
|:-----|:----------------|
| 1. Click "New Order" button | Modal opens with blur backdrop, Order Name focused |
| 2. Fill in "Test Order" | Text appears in field |
| 3. Pick a session date | Calendar popover opens, date selected, popover closes |
| 4. Click "Create Order" | Button shows loading spinner, then modal closes |
| 5. Toast appears | Green success toast at bottom: "Order created" |
| 6. Click "Cancel" instead | Modal closes, no toast, no navigation |
| 7. Submit with all fields empty | Works — no validation errors, toast still appears |
| 8. Select a past date | Inline warning "This date is in the past" shows — but submit still works |
| 9. Toggle dark mode | Repeat steps 1–6 — everything visually correct |

---

## Phase 5 — Verification

> **Depends on:** All previous phases

### Task 5.1 · Build verification

```bash
npm run build
```

**Acceptance:** Exit code 0. Zero TypeScript errors. Zero warnings.

### Task 5.2 · Lint verification

```bash
npm run lint
```

**Acceptance:** Exit code 0. Zero ESLint errors. Zero warnings.

### Task 5.3 · Visual verification (browser)

Open `http://localhost:5173` in the browser tool.

1. Navigate to the order page.
2. Click "New Order" button.
3. Capture screenshot — verify modal layout matches Visual Checkpoint A.
4. Fill in fields, submit — verify toast appears.
5. Toggle to dark mode — repeat steps 2–4.
6. Capture screenshot — verify dark mode rendering.

### Task 5.4 · Code review against `dev_instruction_v3.1.md`

Run through the pre-commit checklist:

| Rule | Check |
|:-----|:------|
| Named exports only | `grep "export default" src/components/CreateOrderModal.tsx src/hooks/useCreateOrder.ts src/types/order.ts src/data/mock-create-order.ts` → zero results |
| No `any` types | `grep ": any" src/components/CreateOrderModal.tsx src/hooks/useCreateOrder.ts src/types/order.ts` → zero results |
| No `onClick` | `grep "onClick" src/components/CreateOrderModal.tsx` → zero results |
| No `use client` | `grep "use client" src/components/CreateOrderModal.tsx` → zero results |
| No wrapper components | All UI imports come from `@heroui/react` |
| Tokens used | `MODAL_WIDTH_MD` and `TEXT_SECTION_LABEL` imported, not hardcoded |

---

## File Summary

| File | Action | Phase |
|:-----|:-------|:------|
| `src/types/order.ts` | NEW | 1 |
| `src/data/mock-create-order.ts` | NEW | 1 |
| `src/hooks/useCreateOrder.ts` | NEW | 1 |
| `src/App.tsx` | MODIFY (+2 lines) | 2 |
| `src/components/CreateOrderModal.tsx` | NEW | 3 |
| `src/components/layouts/OrderLayout.tsx` | MODIFY (+8 lines) | 4 |

**Total new files:** 4  
**Total modified files:** 2  
**Estimated lines of new code:** ~180
