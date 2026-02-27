# Phase 5 — Peer Code Review

**Scope:** Grid Layout & Team Lead Card (equal-height rows, wider lead column, hover states, edit affordance)
**Reviewed against:** `dev_instruction_v3.1.md`, `ui-tokens.ts`, `index.css`, HeroUI v3 MCP, UX plan Phase 5
**Reviewed files:** `OrderDetailsTab.tsx`, `OrderSummaryCard.tsx`, `ContactDetailsCard.tsx`, `SessionDetailsCard.tsx`, `BillingContextCard.tsx`, `TeamLeadCard.tsx`

---

## ✅ Acceptance Criteria

| Criterion | Status | Evidence |
|:--|:--|:--|
| Cards in same row stretch to equal height | ✅ | `items-stretch` on grid (L33 `OrderDetailsTab.tsx`), `h-full` on each Card |
| Assigned Lead card spans 3 of 6 columns | ✅ | `lg:col-span-3` (L68 `OrderDetailsTab.tsx`) |
| Hovering over lead row shows subtle bg highlight | ✅ | `hover:bg-default/40 cursor-default` (L44 `TeamLeadCard.tsx`) |
| Hovering over any card reveals pencil edit button | ✅ | `group` on Card + `opacity-0 group-hover:opacity-100 transition-opacity` on Button — all 5 cards |
| `npm run build` / `npm run lint` | ⬜ | To be verified by implementer |

---

## Findings

### F-01 · Skeleton loading Cards missing `h-full` and `group` (LOW)

**Files:** All 5 card components

Each card's loaded state uses `<Card className="group h-full">`, but the skeleton/loading state uses just `<Card>` (no `h-full`, no `group`).

While `group` is harmless on skeleton states (no edit button rendered), the missing `h-full` means cards won't stretch equally during loading. Since `items-stretch` is on the grid, the grid cell stretches but the Card inside won't fill it without `h-full`.

| File | Loading Card (line) | Loaded Card (line) |
|:--|:--|:--|
| `OrderSummaryCard.tsx` | L40: `<Card>` | L57: `<Card className="group h-full">` |
| `ContactDetailsCard.tsx` | L61: `<Card>` | L84: `<Card className="group h-full">` |
| `SessionDetailsCard.tsx` | L21: `<Card>` | L31: `<Card className="group h-full">` |
| `BillingContextCard.tsx` | L20: `<Card>` | L36: `<Card className="group h-full">` |
| `TeamLeadCard.tsx` | L14: `<Card>` | L30: `<Card className="group h-full">` |

**Fix:** Add `className="h-full"` to each loading-state `<Card>`.

---

### F-02 · `BillingContextCard` header — extra wrapper `div` around edit button + link (LOW)

**File:** [BillingContextCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/BillingContextCard.tsx#L44-L54)

```tsx
<div className="flex items-center gap-1">
    <Button size="sm" variant="ghost" isIconOnly aria-label="Edit" ...>
        <Icon icon="lucide:pencil" className="size-3.5" />
    </Button>
    <Link to="/billing" ...>View Billing</Link>
</div>
```

The other 4 cards place the edit `Button` directly as a sibling to the header label group inside the top-level `justify-between` div — no extra wrapper. `BillingContextCard` is the only card that wraps the button + link in a child `<div className="flex items-center gap-1">` because it has two right-side elements.

**Verdict:** Functionally correct and justified (two elements need grouping). **Not a bug** — just flagging for awareness. No fix needed.

---

### F-03 · TeamLeadCard Tooltip shows role, but role is already visible below the name (MEDIUM)

**File:** [TeamLeadCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/OrderDetails/TeamLeadCard.tsx#L56-L68)

```tsx
<Tooltip delay={TOOLTIP_DELAY}>
    <Tooltip.Trigger>
        <p className="... truncate">{assignedLead.name}</p>
    </Tooltip.Trigger>
    <Tooltip.Content>
        <p>{assignedLead.role}</p>    // ← shows role
    </Tooltip.Content>
</Tooltip>
<p className="... truncate">
    {assignedLead.role}               // ← also shows role
</p>
```

The UX plan says: *"Add a HeroUI Tooltip around the name showing the full role on hover."* This is implemented correctly per spec. However, the role is **also** visible as text below the name — so the tooltip duplicates already-visible information.

**Verdict:** Matches the spec as written. If the spec intends the tooltip as a fallback for truncated text, this is fine. But if the role text below the name is always visible (it's `truncate` but in the current layout it's unlikely to truncate on a 3-col card), the tooltip adds no new information.

**Suggestion for spec owner:** Consider whether the tooltip should show something distinct (e.g., email/phone) or whether the visible role text should be removed in favour of tooltip-only. No code change required unless spec is updated.

---

## Standards Compliance — All Passed ✅

| Check | Result |
|:--|:--|
| Named exports only (`export function`) | ✅ |
| No `export default` | ✅ |
| No `any` types | ✅ |
| No wrapper components | ✅ |
| `onPress` (not `onClick`) | ✅ N/A — edit buttons have no handler yet |
| Direct `@heroui/react` imports | ✅ (`Card`, `Button`, `Skeleton`, `Tooltip`, `Avatar`, `Chip`) |
| HeroUI compound components | ✅ (`Card.Content`, `Tooltip.Trigger`, `Tooltip.Content`, `Avatar.Fallback`) |
| UI tokens used | ✅ (`TEXT_SECTION_LABEL`, `ICON_SIZE_CONTAINER`, `TOOLTIP_DELAY`) |
| No hardcoded colours/hex | ✅ |
| No magic numbers | ✅ |
| No `console.*` | ✅ |
| No `"use client"` | ✅ |
| No dead code / orphaned imports | ✅ |
| No unnecessary comments | ✅ — structural section markers only |

---

## Summary

| Severity | Count | IDs |
|:--|:--|:--|
| High | 0 | — |
| Medium | 1 | F-03 (informational — matches spec) |
| Low | 2 | F-01, F-02 |

**Verdict:** Phase 5 implementation is **correct and complete**. F-01 (missing `h-full` on skeleton Cards) should be fixed for visual consistency during loading. F-02 is a justified pattern deviation. F-03 is spec-level feedback, not a code bug.
