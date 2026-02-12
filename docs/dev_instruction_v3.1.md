# Developer Instructions v3.1 (Photography Order Management)

> [!IMPORTANT]
> **READ THIS BEFORE STARTING ANY WORK**
>
> This document is the **primary source of truth** for all development work. Adherence to these guidelines is **mandatory** to ensure consistency, maintainability, and alignment with HeroUI v3 principles.

## TL;DR (Too Long; Didn't Read)

1. **Check HeroUI first** - Don't reinvent what exists (Rule #0)
2. **Named Exports ONLY** - `export function Component`, never `export default`.
3. **TanStack Router** - Use `src/router.tsx` for all navigation. No hash routing.
4. **TanStack Query** - Use `useQuery` hooks for all data fetching.
5. **Use `onPress`** - Not `onClick` (for HeroUI components).
6. **Strict Typing** - No `any`. All props must be defined.
7. **Direct Imports** - From `@heroui/react`. **NO WRAPPER COMPONENTS.**
8. **No `use client`** - This is a Vite SPA.
9. **Test Dark Mode** - Every component must work in both themes.
10. **No Hardcoded Values** - Use tokens for colors (`bg-accent`) and sizing.

**When stuck:** Official HeroUI v3 docs → HeroUI MCP tools → Context7 MCP → Ask team

### Current Technology Stack

| Layer | Technology | Actual Version | Standard |
| :--- | :--- | :--- | :--- |
| **Framework** | React | `^19.2.4` | `19.x` |
| **Build** | Vite | `^7.3.1` | `7.x` |
| **Styling** | Tailwind CSS | `^4.1.18` | `4.x` |
| **UI Library** | HeroUI | `^3.0.0-beta.6` | `v3.0.0-beta.x` |
| **Routing** | TanStack Router | `^1.159.5` | `1.x` |
| **Data** | TanStack Query | `^5.90.21` | `5.x` |
| **Icons** | Iconify (lucide) | `^6.0.0` | `6.x` |

---

## Table of Contents

1. [Vision & Mission](#vision--mission)
2. [🛑 Rule #0: Check HeroUI First](#-rule-0-check-heroui-first)
3. [Architectural Standards](#architectural-standards)
4. [Coding Standards](#coding-standards)
5. [Core Principles](#core-principles)
6. [File Structure & Naming](#file-structure--naming)
7. [Component Patterns](#component-patterns)
8. [Styling & Theming](#styling--theming)
9. [Developer Workflow](#developer-workflow)
10. [Pre-Commit Checklist](#pre-commit-checklist)

---

## Vision & Mission

We build **premium, accessible, and maintainable** interfaces. We do not build "good enough" – we build "excellent".

**Our Standards:**

- ✅ **Type-Safe**: Complete TypeScript coverage.
- ✅ **Accessible**: Keyboard navigation and screen reader support (React Aria).
- ✅ **Consistent**: Uniform code style via Named Exports.

---

## 🛑 Rule #0: Check HeroUI First

**Before creating ANY component, styling, or pattern:**

1. **Check** the [Components List](https://v3.heroui.com/docs/components-list)
2. **Search** the [Official HeroUI v3 Docs](https://v3.heroui.com/)
3. **Use MCP Tools** (for AI):
   - **HeroUI**: `list_components`, `get_component_docs`, `get_component_source_code`.
   - **Latest Docs**: Use `context7` MCP (`resolve-library-id` followed by `query-docs`) for up-to-date documentation on TanStack, React 19, Tailwind v4, etc.

**Decision Tree:**

```text
Does HeroUI have it?
├─ YES → Import directly from @heroui/react (NO wrappers!)
├─ ALMOST → Extend it (use composition or tv variants)
└─ NO → Only then build custom (with approval)
```

❌ **Never reinvent what exists**
❌ **Never create wrapper components**
✅ **Always import directly from @heroui/react**

---

## Architectural Standards

### 1. Component Decomposition

Break monolithic components into domain-specific sub-components.

- **Anti-Pattern**: One 500-line component handling UI, state, and business logic.
- **Standard**: A parent component orchestrates focused child components.
  - `components/OrderBilling/OrderBillingTab.tsx` — orchestrator
  - `components/OrderBilling/BillingLinesSection.tsx` — table
  - `components/OrderBilling/BillingLineRow.tsx` — single row
  - `components/OrderBilling/BillingLineDetail.tsx` — expanded detail
  - `components/OrderBilling/OrderBillingSummary.tsx` — totals card

### 2. Logic Extraction

Separate business logic from UI rendering using custom hooks.

- **Standard**: Create `hooks/useFeatureName.ts` for state and effects.
- **Example**: `useUnmatchedItems.ts` handles all drag-and-drop state and handlers, leaving `UnmatchedItems.tsx` purely for layout.

**Hook Return Pattern (flat object):**

```tsx
// hooks/useFeatureName.ts
export function useFeatureName() {
    // ... state and logic
    
    return {
        // State
        items,
        isLoading,
        selectedItem,
        // Actions
        handleAction,
        setFilter,
    };
}
```

> [!NOTE]
> Hooks return flat objects — do **not** nest into `{ state, actions }` groups. This keeps destructuring simple: `const { items, handleAction } = useFeatureName();`

### 3. Routing (TanStack Router)

- **Mandatory**: Use **TanStack Router** for all navigation.
- **Configuration**: Centralized in `src/router.tsx`.
- **Navigation**: Use `<Link to="/path">` from `@tanstack/react-router`.
- **Forbidden**: `window.location.hash`, manual history manipulation, or state-based routing.

**Current Route Structure:**

Routes are organised into 3 layout groups:

**Order Layout** (pathless `_order` layout → `OrderLayout`):

| Path | Component | Notes |
| :--- | :--- | :--- |
| `/` | — | Redirects to `/uploading` |
| `/uploading` | `FileUploadTabs` | |
| `/original` | `OriginalPhotos` | |
| `/items` | `UnmatchedItems` | |
| `/team` | `TeamMembers` | |
| `/billing` | `OrderBillingRoute` | |
| `/timeline` | `Timeline` | |
| `/messages` | `Messages` | |

**Project Layout** (`/project/$projectId` → `ProjectPage`):

| Path | Component | Notes |
| :--- | :--- | :--- |
| `/` | — | Redirects to `/prices` |
| `/prices` | `ProjectPrices` | |
| `/workflow` | `WorkflowBuilder` | Lazy loaded |
| `/pricing-beta` | `ProjectPricingTab` | Lazy loaded |
| `/account` | `AccountComingSoon` | Eager (< 1KB) |
| `/notifications` | `NotificationsComingSoon` | Eager |
| `/security` | `SecurityComingSoon` | Eager |
| `/managers` | `ManagersComingSoon` | Eager |
| `/guidelines` | `GuidelinesComingSoon` | Eager |
| `/settings` | `SettingsComingSoon` | Eager |

**Rates Layout** (pathless `_rates` layout → `RatesLayout`):

| Path | Component | Notes |
| :--- | :--- | :--- |
| `/rates` | `RateManagementPage` | Has `?tab=` search param |
| `/rates/rate-cards/$cardId` | `RateCardDetailPage` | |

**Adding a New Route:**

Routes use nested layouts. Always add to the correct parent:

```tsx
// In src/router.tsx
const newRoute = createRoute({
    getParentRoute: () => orderLayoutRoute, // or projectRoute, ratesLayoutRoute
    path: "/new-feature",
    component: React.lazy(() =>
        import("./components/NewFeature").then(m => ({ default: m.NewFeature }))
    ),
});

// Add to the parent's children in routeTree
const routeTree = rootRoute.addChildren([
    orderLayoutRoute.addChildren([
        // ... existing routes
        newRoute,
    ]),
]);
```

> [!IMPORTANT]
> **React.lazy + Named Exports:** Since the project uses named exports exclusively, the `React.lazy` bridge pattern `.then(m => ({ default: m.ComponentName }))` is required. This converts named exports to the default export that `React.lazy` expects.

### 4. Data Management

- **Single Source of Truth**: All mock data must reside in `src/data/`.
- **Forbidden**: Hardcoded data arrays inside component files.
- **Data Fetching**: Use **TanStack Query** (`useQuery`) to wrap data access.

**Data Hook Pattern:**

```tsx
// hooks/useOrder.ts
import { useQuery } from "@tanstack/react-query";
import { mockOrderData, OrderData } from "../data/mock-order";

async function fetchOrderData(): Promise<OrderData> {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API
    return mockOrderData;
}

export function useOrder() {
    return useQuery({
        queryKey: ["order"],
        queryFn: fetchOrderData,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
```

**Usage in Component:**

```tsx
export function OrderInfo() {
    const { data: order, isLoading, error } = useOrder();
    
    if (isLoading) return <Skeleton />;
    if (error) return <Alert status="danger">...</Alert>;
    
    return <div>{order.client}</div>;
}
```

---

## Coding Standards

### 1. Named Exports Only

- **Rule**: Use `export function ComponentName() {}`.
- **Forbidden**: `export default function ...` or `export default ComponentName`.
- **Reasoning**: Better tree-shaking, predictable imports, easier refactoring.

```tsx
// ✅ Correct
export function OrderInfo() { ... }
export function useOrder() { ... }

// ❌ Incorrect
export default function App() { ... }
export const TeamMembers = () => { ... }
```

### 2. No `use client`

- **Context**: This is a Vite Single Page Application (SPA).
- **Rule**: **Do not** use the `"use client"` directive. It is specific to Next.js.

### 3. Strict Typing

- **Rule**: Zero tolerance for `any`.
- **Standard**: Define interfaces for **all** component props.

```tsx
interface UserCardProps {
    user: User; // Defined in 'types/'
    isActive?: boolean;
}

export function UserCard({ user, isActive }: UserCardProps) { ... }
```

### 4. TypeScript Error Suppressions

- **Rule**: Use `@ts-expect-error` instead of `@ts-ignore`.
- **Why**: `@ts-expect-error` errors if there's nothing to suppress, making refactoring safer.

```tsx
// ❌ Incorrect
// @ts-ignore
someCode();

// ✅ Correct (with explanation)
// @ts-expect-error - HeroUI v3 beta version mismatch
someCode();
```

---

## Core Principles

### 1. ♿ Accessibility First (onPress vs onClick)

- **Rule**: Use `onPress` for all interaction handlers in HeroUI components.
- **Reasoning**: `onPress` handles touch, keyboard (Enter/Space), and screen readers correctly. `onClick` is inconsistent.

### 2. 🎛️ Controlled Select Components

- **Rule**: Use `onSelectionChange` (not `onChange`) for HeroUI `Select` components.
- **Rule**: Use `selectedKey` (not `value`) for controlled single-select.
- **Reasoning**: HeroUI v3 Select uses React Aria's collection API, which has its own selection model.

```tsx
// ✅ Correct
<Select selectedKey={country} onSelectionChange={(key) => setCountry(key as string)}>

// ❌ Incorrect
<Select value={country} onChange={(val) => setCountry(val)}>
```

### 3. 🎯 Semantic Variants

- Use `primary`, `secondary`, `danger`, not visual names (`blue`, `red`).
- **Hierarchy**:
  - `primary` → Main action
  - `secondary` → Alternative
  - `danger` → Destructive
  - `ghost` → Minimal

### 4. 🧩 Composition

- Use dot notation: `<Card.Header>`, `<Modal.Body>`.
- Avoid "configuration props" like `headerText="..."`.

---

## File Structure & Naming

```text
src/
├── components/             # All application components (PascalCase)
│   ├── layouts/            # Layout shells (AppLayout, OrderLayout)
│   ├── shared/             # Shared reusable components (StatisticCard)
│   ├── pricing/            # Shared pricing UI (CurrencyDisplay, Table)
│   ├── OrderBilling/       # Order billing domain components
│   ├── RateManagement/     # Rate management domain components
│   ├── ProjectPage/        # Project page & sub-features
│   │   ├── Pricing/        # Project pricing tab
│   │   └── WorkflowBuilder/ # Workflow builder
│   └── ...                 # Top-level page components
├── constants/              # App-wide constants (kebab-case)
│   ├── ui-tokens.ts        # Shared UI styling tokens (see §UI Tokens)
│   ├── pricing.ts          # Pricing enums and labels
│   ├── pricing-data.ts     # Pricing static data
│   ├── query-config.ts     # TanStack Query staleTime defaults
│   └── timeline.ts         # Timeline/workflow constants
├── data/                   # Mock API responses (kebab-case)
│   ├── mock-order.ts
│   ├── mock-billing-lines.ts
│   ├── mock-rate-cards.ts
│   └── ...
├── hooks/                  # Shared hooks (camelCase)
│   ├── useOrder.ts
│   ├── useOrderBilling.ts
│   ├── useRateCards.ts
│   └── ...
├── utils/                  # Pure utility functions (camelCase)
│   ├── currency.ts         # Currency formatting
│   ├── formatters.ts       # Generic formatters
│   ├── billingCalculations.ts
│   └── ...
├── styles/                 # Shared style definitions
│   └── modal-variants.ts   # tv() variants for modals
├── types/                  # Shared TypeScript definitions
│   ├── workflow.ts
│   └── pricing.ts
├── providers/              # Context Providers
│   └── QueryProvider.tsx
├── router.tsx              # TanStack Router configuration
├── App.tsx                 # Entry with QueryProvider + RouterProvider
├── main.tsx                # ReactDOM.createRoot
└── index.css               # Global styles (Tailwind + HeroUI)
```

### Constants vs Data

| Directory | Purpose | Example |
| :--- | :--- | :--- |
| `constants/` | Enums, labels, config, UI tokens, static lookup tables | `ui-tokens.ts`, `pricing.ts` |
| `data/` | Mock API responses that simulate backend data | `mock-order.ts`, `mock-rate-cards.ts` |

- **Rule**: If the value would come from an API in production → `data/`. If it's a static config or UI constant → `constants/`.

### UI Tokens (`constants/ui-tokens.ts`)

Shared Tailwind class strings used across 20+ components to prevent style drift. Always import from `ui-tokens.ts` instead of writing ad-hoc classes.

**Categories:**

| Category | Examples | Purpose |
| :--- | :--- | :--- |
| **Containers** | `CONTAINER_BASE_RATES`, `CONTAINER_INFO_ITEM` | Consistent card/panel styling |
| **Typography** | `TEXT_SECTION_LABEL`, `TEXT_TINY_LABEL` | Uniform label hierarchy |
| **Layout** | `FLEX_COL_GAP_2`, `SPACE_Y_4` | Reusable spacing patterns |
| **Sizing** | `DENSITY_CHIP_HEIGHT`, `SKELETON_ROW_HEIGHT` | Consistent element heights |
| **Modals** | `MODAL_BACKDROP`, `MODAL_WIDTH_MD` | Unified modal chrome |
| **Formatting** | `CURRENCY_DECIMALS`, `PERCENTAGE_DECIMALS` | Number precision constants |

```tsx
// ✅ Correct: import shared token
import { CONTAINER_INFO_ITEM, TEXT_SECTION_LABEL } from "../constants/ui-tokens";

<div className={CONTAINER_INFO_ITEM}>
    <span className={TEXT_SECTION_LABEL}>Section</span>
</div>

// ❌ Incorrect: ad-hoc classes that duplicate tokens
<div className="p-3 rounded-xl border border-default-200 bg-default-50/50">
    <span className="text-xs font-bold uppercase tracking-wider">Section</span>
</div>
```

**Naming Conventions:**

| Type | Case | Example |
| :--- | :--- | :--- |
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase | `usePermissions.ts` |
| Data files | kebab-case | `mock-team.ts` |
| Constants | kebab-case | `ui-tokens.ts` |
| Utils | camelCase | `currency.ts` |
| Providers | PascalCase | `QueryProvider.tsx` |

---

## Icons

**Library:** [Iconify](https://iconify.design/) with `lucide` collection.

```tsx
import { Icon } from "@iconify/react";

<Button variant="primary">
    <Icon icon="lucide:check" className="w-4 h-4 mr-2" />
    Submit
</Button>
```

---

## Component Patterns

### ✅ Direct Imports (No Wrappers)

**Strictly Forbidden:** Creating "proxy" components that just wrap HeroUI components without adding significant logic.

```tsx
// ✅ Correct
import { Button } from "@heroui/react";

// ❌ Incorrect
import { Button } from "./components/ui/button";
```

### ✅ Compound Components (Mandatory)

**HeroUI v3 uses composition over configuration. Always use dot notation.**

```tsx
// ✅ Correct: Card
<Card>
    <Card.Content className="p-6">
        <h3>Title</h3>
        <p>Content</p>
    </Card.Content>
</Card>

// ✅ Correct: Modal (CRITICAL: Container/Dialog MUST be nested INSIDE Backdrop)
<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
    <Modal.Backdrop>
        <Modal.Container>
            <Modal.Dialog>
                <Modal.CloseTrigger />
                <Modal.Header>
                    <Modal.Heading>Title</Modal.Heading>
                </Modal.Header>
                <Modal.Body>Content</Modal.Body>
                <Modal.Footer>
                    <Button>OK</Button>
                </Modal.Footer>
            </Modal.Dialog>
        </Modal.Container>
    </Modal.Backdrop>
</Modal>

// ❌ Incorrect: Sibling Backdrop (Causes stacking/visibility issues)
<Modal>
    <Modal.Backdrop />
    <Modal.Container>...</Modal.Container>
</Modal>

// ✅ Correct: Select (v3 Pattern)
<Select>
    <Select.Trigger>
        <Select.Value placeholder="Select..." />
    </Select.Trigger>
    <Select.Popover>
        <ListBox>
            <ListBox.Item key="1">Option 1</ListBox.Item>
        </ListBox>
    </Select.Popover>
</Select>

// ✅ Correct: Tabs with Router Links
<Tabs selectedKey={activeTab}>
    <Tabs.List>
        <Tabs.Tab key="upload" id="upload">
            <Link to="/uploading">Upload</Link>
        </Tabs.Tab>
    </Tabs.List>
</Tabs>
```

### 🎨 Extending Components (tailwind-variants)

**Use `tv` to extend HeroUI components with custom variants.**

```tsx
import { tv } from "tailwind-variants";

const customButton = tv({
    base: "font-bold px-6",
    variants: {
        premium: {
            true: "shadow-accent-md",
        }
    }
});

<Button className={customButton({ premium: true })}>Premium</Button>
```

---

## Styling & Theming

### 1. 🌓 Theme Setup

**Theme classes are applied via a wrapper `<div>` in `main.tsx`.**

```tsx
// main.tsx
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="text-foreground bg-background">
      <App />
    </div>
  </React.StrictMode>
);
```

### 2. 🎨 CSS Variables & Custom Theming

**Use CSS variables for all custom values. Never hardcode hex.**

```css
/* index.css */
@import "tailwindcss";
@import "@heroui/styles";

@theme {
    /* Identity — OKLCH for perceptual uniformity */
    --color-accent: oklch(0.6 0.18 255);
    --color-accent-600: oklch(0.5 0.18 255);

    /* Surface Layers */
    --color-surface-base: oklch(1 0 0);
    --color-glass: rgba(255, 255, 255, 0.7);

    /* Shadows — Premium Elevation */
    --shadow-premium-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
    --shadow-premium-md: 0 10px 30px -5px rgba(0, 0, 0, 0.08);
    --shadow-accent-sm: 0 4px 12px oklch(0.6 0.18 255 / 0.2);
    --shadow-accent-md: 0 8px 24px oklch(0.6 0.18 255 / 0.3);

    /* Typography — Libre Franklin primary, Inter fallback */
    --font-sans: 'Libre Franklin', 'Inter', -apple-system, sans-serif;

    /* Custom font sizes */
    --font-size-tiny: 0.75rem;
    --font-size-compact: 0.6875rem;
    --font-size-mini: 0.625rem;
}
```

### 3. ✨ Interactive States

**Use Tailwind `hover:` / `focus:` utilities as the default.** HeroUI also exposes data attributes (`data-hovered`, `data-pressed`, `data-focus-visible`) for advanced cases where CSS pseudo-classes are insufficient.

```tsx
// ✅ Default: Tailwind utilities
<Button className="hover:bg-accent/10 focus:ring-2">

// ✅ Advanced: Data attributes (when you need state-driven styling in CSS)
// .button[data-hovered="true"] { background: var(--accent-hover); }
// .button[data-pressed="true"] { transform: scale(0.97); }
```

---

## Developer Workflow

### 1. Dev Server

```bash
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run lint    # Run ESLint
```

### 2. Pre-commit Hooks (Husky + lint-staged)

**Commits will automatically:**

1. Run **Prettier** to format staged `.ts`/`.tsx` files.
2. Run **ESLint** with auto-fix on staged files.

**If errors occur:** Fix them before committing. Do not bypass with `--no-verify`.

### 3. 🚨 Code Review Standards (Rule #0 Enforcement)

**Reviewers MUST reject PRs that:**

1. Create new wrapper components.
2. Re-export HeroUI components without adding logic.
3. Import from local paths when `@heroui/react` is available.
4. Use raw `onClick` on HeroUI components.
5. Use `export default` or arrow function exports for components.

---

## Pre-Commit Checklist

- [ ] **Functional**:
  - [ ] `npm run build` passes.
  - [ ] `npm run lint` passes.
  - [ ] **Edge cases handled** (loading, empty, error states).
- [ ] **Code Quality**:
  - [ ] Named exports (`export function`) used everywhere.
  - [ ] No `any` types.
  - [ ] **No wrapper components**.
  - [ ] No `console.*` calls in production code.
- [ ] **Data & Logic**:
  - [ ] Mock data lives in `src/data/`.
  - [ ] Static constants live in `src/constants/`.
  - [ ] UI class strings use tokens from `ui-tokens.ts`.
  - [ ] Complex logic extracted to `src/hooks/`.
  - [ ] Data fetching uses `useQuery` from TanStack Query.
- [ ] **Routing**:
  - [ ] New pages added to `src/router.tsx`.
  - [ ] Navigation uses `<Link>` from TanStack Router.
- [ ] **Styling & Theming**:
  - [ ] **Tested in both light AND dark themes**.
  - [ ] CSS variables used for all colors.
- [ ] **Accessibility**:
  - [ ] `onPress` used for interactions (not `onClick`).
  - [ ] `onSelectionChange` used for Select (not `onChange`).
  - [ ] Keyboard navigation verified.
  - [ ] Focus indicators visible.
- [ ] **Performance**:
  - [ ] Components are efficient (no unnecessary re-renders).
  - [ ] Images optimized.

---

## Getting Help & Resources

1. **[Official HeroUI v3 Documentation](https://v3.heroui.com/)**
2. **[Components List](https://v3.heroui.com/docs/components-list)**
3. **HeroUI v3 MCP**: Primary tool for HeroUI component docs, props, and source code.
4. **Context7 MCP**: Use for any other library (e.g., `/tanstack/query`, `/tanstack/router`, `/react`).
5. **[Tailwind CSS v4](https://tailwindcss.com/docs)**
6. **[TanStack Router Docs](https://tanstack.com/router/latest/docs/overview)**
7. **[TanStack Query Docs](https://tanstack.com/query/latest/docs/overview)**

**Local References:**

- `./docs/dev_instruction_v3.1.md` (This file — Developer Instructions)
- `./docs/erp_pricing_spec_v1_7.md` (Pricing Engine Specification)
- `./docs/erp_timeline_spec_v1.md` (Timeline Specification)
- `./docs/pricing-concepts-guide.md` (Pricing Concepts Guide)
- `./docs/workflow-logic-blocks.md` (Workflow Logic Blocks)
