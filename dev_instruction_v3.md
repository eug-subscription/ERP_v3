# Developer Instructions v3.0 (Photography Order Management)

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

**When stuck:** Check `./docs/heroui-docs.txt` → Official docs → Ask team

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
2. **Search** the [Full Documentation](./docs/heroui-docs.txt)
3. **Use MCP Tools** (for AI): `list_components`, `get_component_info`, `get_component_props`, `get_component_examples`.

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

- **Anti-Pattern**: One 500-line `OrderInfo.tsx`.
- **Standard**: `OrderInfo.tsx` should orchestrate smaller parts.
  - `components/OrderInfo/ClientDetails.tsx`
  - `components/OrderInfo/LocationDetails.tsx`

### 2. Logic Extraction

Separate business logic from UI rendering using custom hooks.

- **Standard**: Create `hooks/useFeatureName.ts` for state and effects.
- **Example**: `useUnmatchedItems.ts` handles all drag-and-drop state and handlers, leaving `UnmatchedItems.tsx` purely for layout.

**Hook Return Pattern:**

```tsx
// hooks/useFeatureName.ts
export function useFeatureName() {
    // ... state and logic
    
    return {
        state: {
            items,
            isLoading,
            // ... other state
        },
        actions: {
            handleAction,
            setFilter,
            // ... other handlers
        }
    };
}
```

### 3. Routing (TanStack Router)

- **Mandatory**: Use **TanStack Router** for all navigation.
- **Configuration**: Centralized in `src/router.tsx`.
- **Navigation**: Use `<Link to="/path">` from `@tanstack/react-router`.
- **Forbidden**: `window.location.hash`, manual history manipulation, or state-based routing.

**Current Route Structure:**

| Route | Component |
| :--- | :--- |
| `/uploading` | `FileUploadSection` |
| `/original` | `OriginalPhotos` |
| `/items` | `UnmatchedItems` |
| `/messages` | `Messages` |
| `/team` | `TeamMembers` |
| `/finances` | `FinancialBreakdown` |
| `/timeline` | `Timeline` |

**Adding a New Route:**

```tsx
// In src/router.tsx
const newRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/new-feature",
    component: NewFeatureComponent,
});

// Add to routeTree
const routeTree = rootRoute.addChildren([
    // ... existing routes
    newRoute,
]);
```

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

### 2. 🎯 Semantic Variants

- Use `primary`, `secondary`, `danger`, not visual names (`blue`, `red`).
- **Hierarchy**:
  - `primary` → Main action
  - `secondary` → Alternative
  - `danger` → Destructive
  - `ghost` → Minimal

### 3. 🧩 Composition

- Use dot notation: `<Card.Header>`, `<Modal.Body>`.
- Avoid "configuration props" like `headerText="..."`.

---

## File Structure & Naming

```text
src/
├── components/             # All application components (PascalCase)
│   ├── OrderInfo.tsx
│   ├── TabNavigation.tsx
│   ├── TeamMembers.tsx
│   └── ...
├── data/                   # Mock data & constants (kebab-case)
│   ├── mock-order.ts
│   └── mock-unmatched-items.ts
├── hooks/                  # Shared hooks (camelCase)
│   ├── useOrder.ts
│   └── useUnmatchedItems.ts
├── providers/              # Context Providers
│   └── QueryProvider.tsx
├── types/                  # Shared TypeScript definitions
├── router.tsx              # TanStack Router configuration
├── App.tsx                 # Entry with QueryProvider + RouterProvider
├── main.tsx                # ReactDOM.createRoot
└── index.css               # Global styles (Tailwind + HeroUI)
```

**Naming Conventions:**

| Type | Case | Example |
| :--- | :--- | :--- |
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase | `usePermissions.ts` |
| Data files | kebab-case | `mock-team.ts` |
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

// ✅ Correct: Modal
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

**Themes are applied via body class.**

```tsx
// main.tsx
<main className="text-foreground bg-background">
    <App />
</main>
```

### 2. 🎨 CSS Variables & Custom Theming

**Use CSS variables for all custom values. Never hardcode hex.**

```css
/* index.css */
@import "tailwindcss";
@import "@heroui/styles";

@theme {
    --color-accent: var(--heroui-primary);
    --shadow-premium: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
    --shadow-accent-sm: 0 2px 8px rgba(var(--heroui-primary-rgb), 0.1);
    --shadow-accent-md: 0 4px 12px rgba(var(--heroui-primary-rgb), 0.2);
}

:root {
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### 3. ✨ Interactive States

**Use data attributes for state-based styling.**

```css
/* ✅ Correct: Data attributes */
.button[data-hover="true"] { background: var(--accent-hover); }
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
- [ ] **Data & Logic**:
  - [ ] Mock data lives in `src/data/`.
  - [ ] Complex logic extracted to `src/hooks/`.
  - [ ] Data fetching uses `useQuery` from TanStack Query.
- [ ] **Routing**:
  - [ ] New pages added to `src/router.tsx`.
  - [ ] Navigation uses `<Link>` from TanStack Router.
- [ ] **Styling & Theming**:
  - [ ] **Tested in both light AND dark themes**.
  - [ ] CSS variables used for all colors.
- [ ] **Accessibility**:
  - [ ] `onPress` used for interactions.
  - [ ] Keyboard navigation verified.
  - [ ] Focus indicators visible.
- [ ] **Performance**:
  - [ ] Components are efficient (no unnecessary re-renders).
  - [ ] Images optimized.

---

## Getting Help & Resources

1. **[Official HeroUI v3 Documentation](https://v3.heroui.com/)**
2. **[Components List](https://v3.heroui.com/docs/components-list)**
3. **[Component Source (React)](https://github.com/heroui-inc/heroui/tree/v3/packages/react/src/components)**
4. **[Tailwind CSS v4](https://tailwindcss.com/docs)**
5. **[TanStack Router Docs](https://tanstack.com/router/latest/docs/overview)**
6. **[TanStack Query Docs](https://tanstack.com/query/latest/docs/overview)**

**Local References:**

- `./docs/heroui-docs.txt` (Full API)
- `./migrationplan.md` (HeroUI v3 Migration Status)
