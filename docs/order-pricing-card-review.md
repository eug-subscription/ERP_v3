# OrderPricingCard — Code Review Findings

**File:** `src/components/OrderBilling/OrderPricingCard.tsx`  
**Reviewed:** 2026-02-26

---

## Findings to Fix

### 1. No `ui-tokens.ts` imports

The component uses inline Tailwind strings for every label, even where tokens already exist.

| Inline class string | Existing token |
|---|---|
| `t-mini font-black uppercase tracking-widest text-default-400` | `TEXT_TINY_MUTED_BOLD` |
| `text-xs font-bold uppercase tracking-wider` | `TEXT_SECTION_LABEL` |

**Fix:** Import and use `TEXT_TINY_MUTED_BOLD` and `TEXT_SECTION_LABEL` from `../../constants/ui-tokens`.

---

### 2. Magic `tracking-[0.15em]` value (appears twice)

Used on the "PROJECT PRICING" header label and the "Configure in Project" footer link — not tokenised.

```tsx
// Line 109 — header
className="t-mini font-bold uppercase tracking-[0.15em] text-accent/60"

// Line 221 — footer
className="t-mini font-bold uppercase tracking-[0.15em] text-accent/70"
```

**Fix:** Extract to a named constant in `ui-tokens.ts`, e.g.:

```ts
export const TRACKING_WIDE_LABEL = 'tracking-[0.15em]';
```

---

### 3. `bg-default-100/30` on `Card.Header` — likely invisible

Per `dev_instruction_v3.1.md §4`, `bg-default-{shade}` classes **do not generate real background utilities** in Tailwind v4 + HeroUI v3.

```tsx
// Line 104
<Card.Header className="px-6 pt-6 pb-4 flex flex-col items-start bg-default-100/30 border-b border-default-100">
```

**Fix:** Replace with a working semantic token:

```tsx
className="... bg-default/30"   // or bg-surface-secondary
```

---

### 4. `bg-warning-50/50 border border-warning-100` on overrides banner

Same shade-scale risk as above — `warning-50` and `warning-100` are HeroUI shade classes that may not generate visible backgrounds.

```tsx
// Line 204
<div className="bg-warning-50/50 border border-warning-100 rounded-xl px-4 py-3">
```

**Fix:** Use base semantic tokens:

```tsx
className="bg-warning/10 border border-warning/20 rounded-xl px-4 py-3"
```

---

### 5. Ad-hoc rate price classes — not tokenised

Each rate row renders prices with inline class strings rather than any shared token or component.

```tsx
// Line 175
className={`text-xs font-bold font-mono ${hasOverride ? 'text-warning' : 'text-default-900'}`}
```

These are fine for now but worth consolidating into a small `tv()` variant if the pattern grows.

---

## What's Already Correct ✅

- Uses `formatCurrencyAmount(amount, currency)` from `utils/formatters` — no inline `Intl`.
- Named export, no `export default`.
- No `any` types.
- All interactions use `onPress`.
- `Separator` component used correctly between rows.
- All imports from `@heroui/react` directly, no wrappers.
- Proper `useMemo` for derived data (card lookup, override map, rate items).
