# Phase 4 — Review Round 1

**Scope:** All files changed since Phase 2+3 approval  
**Files reviewed:**

- `src/components/layouts/OrderLayout.tsx` (83 lines)
- `src/components/CreateOrderModal.tsx` (300 lines)
- `src/types/order.ts` (43 lines)
- `src/hooks/useCreateOrder.ts` (23 lines — unchanged)
- `src/data/mock-create-order.ts` (8 lines — unchanged)
- `src/components/OrderPageHeader.tsx` (67 lines — verified `actions` prop)

---

## Mandatory Checks

| Check | Result |
|:------|:-------|
| Named exports only | ✅ All files |
| No `export default` | ✅ Zero occurrences |
| No `any` types | ✅ Zero occurrences |
| No `onClick` | ✅ Zero occurrences — `onPress` used throughout |
| No `use client` | ✅ Zero occurrences |
| HeroUI compound patterns | ✅ Modal, DatePicker, Calendar, TimeField — all use dot notation |
| Direct imports from `@heroui/react` | ✅ No wrappers |
| Token usage | ✅ `MODAL_WIDTH_MD`, `TEXT_SECTION_LABEL`, `FLEX_COL_GAP_4` |
| `useOverlayState()` | ✅ Used in `OrderLayout.tsx:21` — not raw `useState` |
| TanStack Router navigation | ✅ `useNavigate` in hook |

---

## Phase 4 Integration Checks

| Check | Result |
|:------|:-------|
| `OrderPageHeader.actions` prop | ✅ Prop `actions?: ReactNode` exists (line 16). Button rendered via prop — no wrapper. |
| `CreateOrderModal` rendered outside layout tree | ✅ Rendered at bottom of fragment in `OrderLayout.tsx:76-79` — outside the `<div className="p-6 ...">` tree. Correct. |
| Modal state passed correctly | ✅ `isOpen={createOrderState.isOpen}` + `onOpenChange={createOrderState.setOpen}` |
| Button trigger | ✅ `variant="primary" size="sm" onPress={createOrderState.open}` with `lucide:plus` icon |

---

## Extra Fields Review

The form was expanded from 5 simple fields to structured objects. Changes:

| Before | After | Assessment |
|:-------|:------|:-----------|
| `contact1: string`, `contact2: string` | `contact: ContactPayload` (`name`, `email`, `phone`) | ✅ More structured. Type-safe. |
| `shootingAddress: string` (TextArea) | `address: AddressPayload` (`line1`, `line2`, `city`, `country`, `postcode`) | ✅ Proper address structure. Matches existing `StructuredAddress` from `mock-order.ts`. |
| — | `sessionTime: TimeValue \| null` with `TimeField` | ✅ New field. HeroUI v3 `TimeField` composed correctly: `TimeField.Group > TimeField.Input > TimeField.Segment`. |
| `TextArea` import | Removed | ✅ Clean — no orphaned imports. |

---

## Findings

| # | Severity | File & Line | Category | Finding | Suggested Fix |
|:--|:---------|:------------|:---------|:--------|:--------------|
| F-01 | **Info** | `CreateOrderModal.tsx:90` | Design deviation | `isRequired` added to Order Name field. The approved design report (§5) explicitly states "Since all fields are optional, there are no required-field checks" and the Create button "should always be enabled". Adding `isRequired` means the HeroUI form validation will block submission if Order Name is empty, which contradicts the report. | Intentional design change — document and confirm. If the decision is to keep `isRequired`, the design report §5 should be updated. No code change needed if approved. |
| F-02 | **Nitpick** | `CreateOrderModal.tsx:282` | Consistency | `Modal.Footer` no longer has `className="border-t border-default-100"` (was present in Round 2). This is a style choice, and the default `Modal.Footer` may already have a separator. Just flagging for awareness — if the visual shows no top border, this may look flat. | Verify visually. If the footer blends into the body, re-add the border class. |
| F-03 | **Nitpick** | `order.ts` vs `mock-order.ts` | Consistency | `AddressPayload` has fields `line1`, `line2`, `city`, `country`, `postcode`. The existing `StructuredAddress` in `mock-order.ts` has the same fields plus `state`. Consider whether `state` should also be in `AddressPayload` for parity. | Minor — depends on whether "state" is needed for the creation flow. No code change required. |

---

## Code Hygiene Sweep

| Category | Result |
|:---------|:-------|
| Dead code | ✅ None — `TextArea` import correctly removed. All imports used. |
| Hard-coded values | ✅ None — all tokens from `ui-tokens.ts`. Grid classes (`grid-cols-2`, `gap-3`) are standard Tailwind layout, not tokenizable. |
| Magic numbers | ✅ `hourCycle={24}` on TimeField is semantic (24h format). No unexplained numbers. |
| Unnecessary comments | ✅ Section comments are structural landmarks — `{/* Contact */}`, `{/* Address */}`, `{/* Date + Time */}` |
| Logical issues | ✅ Reset-on-close works. Submit flow correct (mutation → onSuccess → close). Past-date check correct. |
| Orphaned imports | ✅ None |

---

## Verdict

### ⚠️ APPROVE WITH COMMENTS

**No blocking issues.** The code is clean and well-structured.

Three items flagged for awareness:

1. **F-01** (Info): `isRequired` on Order Name deviates from the approved "all optional" design. Confirm this is intentional.
2. **F-02** (Nitpick): Footer border removed — verify visually.
3. **F-03** (Nitpick): `AddressPayload` missing `state` vs existing `StructuredAddress` — check if needed.

All are design decisions, not code defects. Safe to ship as-is.
