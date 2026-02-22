# Timeline Tab — Code Review Findings

Audit of the Timeline tab and related components from a senior front-end / premium SaaS perspective.

All findings below have been **resolved** ✅.

---

## 1. ✅ Hardcoded `orderId` in ActivityLog

**File:** `src/components/ActivityLog/ActivityLog.tsx`

`ActivityLog` had `useActivityLog('ord-12345')` hardcoded. Now accepts `orderId` as a prop.

---

## 2. ✅ Dead width tokens in `ui-tokens.ts`

Removed `PIPELINE_SIDEBAR_WIDTH` (`w-[320px]`) and `PIPELINE_LAB_SIDEBAR_WIDTH` (`w-[400px]`). Both pipeline components now use `w-full`, with width controlled by the grid column in `Timeline.tsx`.

---

## 3. ✅ `OrderPipelineLab` fixed width with `shrink-0`

Replaced `className={PIPELINE_LAB_SIDEBAR_WIDTH} shrink-0` with `className="w-full"` for consistency with `OrderPipeline`.

---

## 4. ✅ Unnecessary template literal in className

Cleaned up `className={\`w-full\`}` → `className="w-full"` across both pipeline components.

---

## 5. ✅ Sticky sidebar for pipeline column

Added `lg:sticky lg:top-4 lg:self-start` to the right column wrapper in `Timeline.tsx`. Pipeline cards now stay visible while scrolling through the activity log.
