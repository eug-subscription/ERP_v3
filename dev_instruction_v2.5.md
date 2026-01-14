# Developer Instructions v2.5

> [!IMPORTANT]
> **READ THIS BEFORE STARTING ANY WORK**
>
> This document is the **primary source of truth** for all development work. Adherence to these guidelines is **mandatory** to ensure consistency, maintainability, and alignment with HeroUI v3 principles.

## TL;DR (Too Long; Didn't Read)

1. **Check HeroUI first** - Don't reinvent what exists (Rule #0)
2. **Named Exports ONLY** - `export function Component`, never `export default`.
3. **TanStack Router** - Use `src/router.tsx` for all navigation. No hash routing.
4. **Use `onPress`** - Not `onClick` (for HeroUI components).
5. **Strict Typing** - No `any`. All props must be defined.
6. **Direct Imports** - From `@heroui/react`. **NO WRAPPER COMPONENTS.**
7. **Path Aliases** - Always use `@/` for internal imports.
8. **No `use client`** - This is a Vite SPA.
9. **Lazy Load Devtools** - Keep production bundles small.
10. **Test Dark Mode** - Every component must work in both themes.
11. **No Hardcoded Values** - Use tokens for colors (`bg-accent`) and sizing.

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
8. [Performance & Reliability](#performance--reliability)
9. [Styling & Theming](#styling--theming)
10. [Developer Workflow](#developer-workflow)
11. [Pre-Commit Checklist](#pre-commit-checklist)

---

## Vision & Mission

We build **premium, accessible, and maintainable** interfaces. We do not build "good enough" – we build "excellent".

**Our Standards:**

- ✅ **Type-Safe**: Complete TypeScript coverage.
- ✅ **Accessible**: Keyboard navigation and screen reader support (React Aria).
- ✅ **Performant**: Tree-shaking and lazy loading by default.
- ✅ **Consistent**: Uniform code style via Named Exports and Aliases.

---

## 🛑 Rule #0: Check HeroUI First

**Before creating ANY component, styling, or pattern:**

1. **Check** the [Components List](https://v3.heroui.com/docs/components-list)
2. **Search** the [Full Documentation](./docs/heroui-docs.txt)
3. **Review** existing project components
4. **Use MCP Tools** (for AI): `list_components`, `get_component_info`, `get_component_props`, `get_component_examples`, `get_docs`.

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

- **Anti-Pattern**: One 500-line `AccountSettings.tsx`.
- **Standard**: `AccountSettings.tsx` should only orchestrate.
  - `sections/BillingSection.tsx`
  - `sections/CompanyInfoSection.tsx`
  - `sections/ManagersSection.tsx`

### 2. Logic Extraction

Separate business logic from UI rendering using custom hooks.

- **Standard**: Create `hooks/useFeatureName.ts` for state and effects.
- **Example**: `useAccountSettings.ts` handles API calls, leaving `AccountSettings.tsx` purely for layout.

### 3. Routing (TanStack Router)

- **Mandatory**: Use **TanStack Router** for all navigation.

- **Configuration**: Centralized in `src/router.tsx`.
- **Navigation**: Use `router.navigate()` or `<Link>`.
- **Forbidden**: `window.location.hash` or manual history manipulation.

### 4. Data Management

- **Single Source of Truth**: All mock data must reside in `src/data/`.

- **Forbidden**: Hardcoded data arrays inside component files.

### 5. Context File Structure (Fast Refresh)

**Split Context files into separate files for React Fast Refresh compatibility.**

Files that export both components AND non-components (hooks, constants) break Fast Refresh in development. ESLint rule: `react-refresh/only-export-components`.

```text
src/context/
├── ThemeContext.ts      # Types + createContext ONLY
├── ThemeProvider.tsx    # Provider component ONLY
├── LayoutContext.ts     # Types + createContext ONLY
└── LayoutProvider.tsx   # Provider component ONLY
```

**Pattern:**

```tsx
// ThemeContext.ts (Types + Context)
import { createContext } from 'react';

export type Theme = 'light' | 'dark';
export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ThemeProvider.tsx (Component only)
import { ThemeContext } from './ThemeContext';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // ... state logic
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// useTheme.ts (Hook in src/hooks/)
import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

---

## Coding Standards

### 1. Named Exports Only

- **Rule**: Use `export function ComponentName() {}`.

- **Forbidden**: `export default function ...` or `export default ComponentName`.
- **Reasoning**: Better tree-shaking, predictable imports, easier refactoring.

### 2. Import Aliases

- **Rule**: Use `@/` for all internal source imports.

- **Forbidden**: Deep relative paths like `../../../../components`.
- **Example**: `import { Button } from '@/components/ui';` (if using custom UI, but prefer direct HeroUI).

### 3. No `use client`

- **Context**: This is a Vite Single Page Application (SPA).

- **Rule**: **Do not** use the `"use client"` directive. It is specific to Next.js App Router/RSC.

### 4. Strict Typing

- **Rule**: Zero tolerance for `any`.

- **Standard**: Define interfaces for **all** component props.

    ```tsx
    interface UserCardProps {
      user: User; // Defined in '@/types'
      isActive?: boolean;
    }
    ```

### 5. Avoid Synchronous setState in Effects

- **Rule**: Never call `setState` synchronously in the body of a `useEffect`.
- **Why**: Causes cascading renders and hurts performance. ESLint rule: `react-hooks/set-state-in-effect`.

```tsx
// ❌ Incorrect
useEffect(() => {
  setMounted(true); // Direct setState in effect body
}, []);

// ✅ Correct (defer with requestAnimationFrame)
useEffect(() => {
  const handle = requestAnimationFrame(() => {
    setMounted(true);
  });
  return () => cancelAnimationFrame(handle);
}, []);
```

### 6. Switch Case Lexical Scoping

- **Rule**: Always wrap `switch` case blocks containing `const`/`let` declarations in braces `{}`.
- **Why**: Prevents scope leakage and satisfies ESLint `no-case-declarations` rule.

```tsx
// ❌ Incorrect
switch (type) {
  case 'daily':
    const multiplier = 7; // Error: lexical declaration in case block
    return value * multiplier;
}

// ✅ Correct
switch (type) {
  case 'daily': {
    const multiplier = 7;
    return value * multiplier;
  }
}
```

### 7. TypeScript Error Suppressions

- **Rule**: Use `@ts-expect-error` instead of `@ts-ignore`.
- **Why**: `@ts-expect-error` errors if there's nothing to suppress, making refactoring safer.

```tsx
// ❌ Incorrect
// @ts-ignore
someCode();

// ✅ Correct (with explanation)
// @ts-expect-error - HeroUI Button href prop workaround
someCode();
```

---

## Core Principles

### 1. ♿ Accessibility First (onPress vs onClick)

- **Rule**: Use `onPress` for all interaction handlers in HeroUI components.
- **Reasoning**: `onPress` (via [React Aria](https://react-spectrum.adobe.com/react-aria/)) handles touch, keyboard (Enter/Space), and screen readers correctly. `onClick` does not always capture these uniformly.
- **Non-negotiable Requirements**:
  - ✅ Keyboard navigation works everywhere
  - ✅ Focus indicators are always visible
  - ✅ Color contrast meets WCAG AA
  - ✅ Screen readers announce all changes

1. **[Component Source (React)](https://github.com/heroui-inc/heroui/tree/v3/packages/react/src/components)**
2. **[Component Styles (CSS)](https://github.com/heroui-inc/heroui/tree/v3/packages/styles/components)**
3. **[Tailwind CSS v4](https://tailwindcss.com/docs)**
4. **Project Discord/Slack** (Ask team)

### 2. 🎯 Semantic Variants

- Use `primary`, `secondary`, `danger`, not visual names (`blue`, `red`).
- Reference `DESIGN_SYSTEM.md` for the strict token set.

**Hierarchy:**

- `primary` → Main action
- `secondary` → Alternative
- `tertiary` → Dismissive
- `danger` → Destructive
- `ghost` → Minimal

| ❌ DON'T Use Visual Names      | ✅ DO Use Semantic Names       |
|--------------------------------|--------------------------------|
| `<Button variant="solid">`     | `<Button variant="primary">`   |
| `<Button variant="bordered">`  | `<Button variant="secondary">` |
| `className="bg-red-500"`       | `variant="danger"`             |

### 3. 🧩 Composition

- Use dot notation: `<Card.Header>`, `<Modal.Body>`.

- Avoid "configuration props" like `headerText="..."`.

---

## File Structure & Naming

```text
src/
├── app/                    # Feature modules (pages + their components)
│   ├── HomePage.tsx        # Home page
│   ├── admin/              # Admin/Account settings feature
│   │   ├── AccountSettings.tsx
│   │   ├── billing/        # Billing components & modals
│   │   ├── developers/     # Developer settings & API keys
│   │   └── sections/       # Settings form sections
│   ├── orders/             # Orders feature module
│   │   ├── OrdersPage.tsx
│   │   ├── OrderDetailPage.tsx
│   │   └── components/     # Orders-specific components
│   └── team/               # Team management feature
│       ├── TeamPage.tsx
│       └── components/     # Team-specific components
│           ├── tabs/       # Tab panels (MembersTab, SecurityTab, etc.)
│           ├── modals/     # Team modals (InviteMember, etc.)
│           ├── security/   # Security-related components
│           └── settings/   # Settings-related components
├── components/             # Shared/global components
│   ├── common/             # Generic (ErrorBoundary, Suspense wrappers)
│   ├── design-system/      # Design system documentation components
│   ├── navigation/         # CommandPalette, LeftMenu, ThemeSwitcher
│   ├── layout/             # Layout wrappers
│   └── ui/                 # Custom UI components (Progress, toast)
├── context/                # React Contexts (split: Context.ts + Provider.tsx)
├── data/                   # Mock data (mock-*.ts) & constants (*-constants.ts) - no subfolders
├── hooks/                  # ALL shared hooks (useOrders, useBilling, useAccountSettings, useSecurity, useTheme)
├── types/                  # Global TypeScript definitions
├── utils/                  # Utility functions (billing.ts, date-utils.ts, security.ts, team-permissions.ts)
├── router.tsx              # TanStack Router configuration
└── main.tsx                # Entry point
```

### Feature-First Organization Pattern

Each feature module in `app/` should be self-contained:

```text
app/[feature]/
├── [Feature]Page.tsx       # Main page component
├── components/             # Feature-specific components
│   ├── tabs/               # Tab panels (if applicable)
│   ├── modals/             # Feature modals
│   └── ...                 # Other subfolders as needed
```

**Rules:**

- ✅ Feature pages and their components live together in `app/[feature]/`
- ✅ All shared hooks go in `src/hooks/` (not nested in feature folders)
- ✅ Shared components go in `src/components/` with appropriate subfolders
- ❌ Do NOT nest hooks inside feature folders (e.g., `app/admin/hooks/`)
- ❌ Do NOT create `components/components/` nesting

**Naming:**

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase (`usePermissions.ts`)
- **Data**: kebab-case or camelCase (`mock-team.ts`, `order-constants.ts`)

---

## Icons

**Library:** [Iconify](https://iconify.design/) with `gravity-ui` collection.

```bash
npm i @iconify/react
```

```tsx
import { Icon } from '@iconify/react';

<Button variant="primary">
  <Icon icon="gravity-ui:check" className="size-4 mr-2" />
  Submit
</Button>
```

---

## Component Patterns

### ✅ Direct Imports (No Wrappers)

**Strictly Forbidden Checklist (If you do this, it's a wrapper):**

1. 🔴 **Duplicate imports**: Bundle includes both your wrapper AND HeroUI.
2. 🔴 **Type drift**: Re-exported types fall out of sync.
3. 🔴 **Confusion**: Two import paths for the same component.
4. 🔴 **No value**: Component does nothing but return props.
5. 🔴 **Maintenance**: You maintain code HeroUI already maintains.

```tsx
// ✅ Correct
import { Button } from '@heroui/react';

// ❌ Incorrect
import { Button } from '@/components/ui/button';
```

### ✅ Compound Components (Mandatory)

**HeroUI v3 uses composition over configuration. Always use dot notation.**

```tsx
// ✅ Correct: Accordion
<Accordion>
  <Accordion.Item key="1" aria-label="Accordion 1">
    <Accordion.Trigger>Section 1</Accordion.Trigger>
    <Accordion.Content>Content 1</Accordion.Content>
  </Accordion.Item>
</Accordion>

// ✅ Correct: TextField
<TextField>
  <TextField.Label>Email</TextField.Label>
  <TextField.Input type="email" placeholder="john@doe.com" />
  <TextField.Description>We'll never share your email.</TextField.Description>
  <TextField.ErrorMessage>Invalid email address</TextField.ErrorMessage>
</TextField>

// ✅ Correct: Tabs
<Tabs aria-label="Options">
  <Tabs.List>
    <Tabs.Tab key="photos">Photos</Tabs.Tab>
    <Tabs.Tab key="music">Music</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel key="photos">Photos Content</Tabs.Panel>
  <Tabs.Panel key="music">Music Content</Tabs.Panel>
</Tabs>
```

### 🎭 Render Props Pattern

**Use when you need dynamic access to interaction states.**

```tsx
<Button>
  {({ isPressed, isHovered }) => (
    <>
      <Icon className={isPressed ? 'scale-90' : 'scale-100'} icon="..." />
      {isHovered ? 'Release' : 'Press'}
    </>
  )}
</Button>
```

### 🎨 Extending Components (tailwind-variants)

**Use `tv` to extend HeroUI components with custom variants.**

```tsx
import { Button, buttonVariants } from '@heroui/react';
import { tv } from 'tailwind-variants';

const customButton = tv({
  extend: buttonVariants,
  variants: {
    variant: {
      gradient: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
    }
  }
});

// Usage
<Button className={customButton({ variant: 'gradient' })}>Gradient Button</Button>
```

### ✅ Conditional Devtools

Lazy load heavy development tools to keep production bundles light.

```tsx
const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : React.lazy(() => import('@tanstack/router-devtools').then(...));
```

### ✅ Error Boundaries

Wrap all major features or routes in an `ErrorBoundary` to prevent entire app crashes.

---

## Performance & Reliability

### 1. Lazy Loading (Main Bundle Optimization)

- **Rule**: Lazy load ALL route components, heavy page sections (Tabs), and Modals.
- **Pattern (Named Exports)**: Since we use Named Exports, always use the resolution pattern:

  ```tsx
  const MyComponent = lazy(() => import('./MyComponent').then(m => ({ default: m.MyComponent })));
  ```

- **Pattern (Modals)**: Never bundle modals with their parent. Load them on demand:

  ```tsx
  {isOpen && (
    <Suspense fallback={null}>
      <LazyModal isOpen={isOpen} onClose={close} />
    </Suspense>
  )}
  ```

### 2. Layout Shift & UX

- **Rule**: Use `Skeleton` or themed `Spinner` for `Suspense` fallbacks.
- **Goal**: Maintain the "Premium" feel (Aesthetics) even during chunk loading.

### 3. Dependency Management

- **Rule**: Check bundle size impact before adding new libraries.
- **Standard**: Use tree-shakeable imports.
- **Target**: Keep the main entry bundle below **500 KB**.

---

## Styling & Theming

### 1. 🌓 Theme Setup (Mandatory)

**Themes are applied via `data-theme` attribute on HTML tag.**

```html
<!-- Light -->
<html class="light" data-theme="light">
<!-- Dark -->
<html class="dark" data-theme="dark">
```

### 2. 🎨 CSS Variables & Custom Theming

**Use CSS variables for all custom values. Never hardcode hex.**

```css
/* Implementation in global CSS */
:root {
  --splento-cyan: oklch(0.7 0.25 260);
  --radius: 0.375rem;
}

.custom-card {
  background: var(--surface-1); /* Semantic token */
  border-radius: var(--radius);
}
```

### 3. Design Tokens (Color System)

- Reference **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)**.
- **Primary**: `--splento-cyan`
- **Backgrounds**: `--canvas` (Light) / `--midnight` (Dark)
- **Semantic**: `bg-accent`, `bg-danger`, `text-success`

### 4. ✨ Interactive States

**Use data attributes for state-based styling (Reliable for touch/keyboard).**

```css
/* ✅ Correct: Data attributes */
.button[data-hover="true"] { background: var(--accent-hover); }
.button[data-pressed="true"] { transform: scale(0.97); }

/* ❌ Avoid: :hover (inconsistent on touch) */
```

---

## State Management

**Local State:** `useState`, `useReducer`
**Shared State:** React Context

```tsx
// Local state
const [isOpen, setIsOpen] = useState(false);

// Form state
const [formData, setFormData] = useState({ email: '', password: '' });
```

---

## Error Handling

**Pattern: use `<Alert>` for inline errors.**

```tsx
import { Alert } from '@heroui/react';

if (error) {
  return (
    <Alert status="danger">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>{error.message}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
```

---

## Time Window Logic (Last Active)

**Follow this ruleset for relative timestamps:**

| Time Window | Display Text |
| :--- | :--- |
| **< 1 minute** | `Just now` |
| **< 1 hour** | `X minutes ago` |
| **< 24 hours** | `X hours ago` |
| **24 - 48 hours** | `Yesterday` |
| **3 - 7 days** | `X days ago` |
| **> 7 days** | `MMM DD` |
| **> 1 year** | `MMM DD, YYYY` |

---

## Developer Workflow

### 1. Node Version

- **Mandatory**: Use the Node.js version specified in `.nvmrc` (pinned via `package.json` engines).

### 2. Pre-commit Hooks (Husky)

- **Workflow**: Commits will fail if `npm run lint` or `npm run typecheck` fails.

- **Action**: Fix errors; do not bypass with `--no-verify`.

### 3. 🚨 Code Review Standards (Rule #0 Enforcement)

**Reviewers MUST reject PRs that:**

1. Create new wrapper components in `src/components/ui/`.
2. Re-export HeroUI components without adding logic.
3. Import from `@/components/ui/button` instead of `@heroui/react`.

### 4. 🔍 Wrapper Detection Scripts

**Wrapper Checklist (If YES, delete it):**

- [ ] Imports from `@heroui/react`?
- [ ] Just returns that component with `{...props}`?
- [ ] Has no business logic?
- [ ] Just re-exports types?

**Run these commands to find violations:**

```bash
# Find potential wrappers (files that import HeroUI)
find src/components/ui -name "*.tsx" -exec grep -l "from '@heroui/react'" {} \;

# Check if file just re-exports content
grep -A 5 "export function" src/components/ui/button.tsx
```

---

## Quick Reference

### 📦 Installation

```bash
npm i @heroui/styles@alpha @heroui/react@alpha
```

### 🧩 Component Template

```tsx
import { Button } from '@heroui/react';

export interface MyComponentProps {
  label: string;
  onPress: () => void;
}

export function MyComponent({ label, onPress }: MyComponentProps) {
  return (
    <Button variant="primary" onPress={onPress}>
      {label}
    </Button>
  );
}
```

### 📄 Import Styles (`index.css`)

```css
@import "tailwindcss";
@import "@heroui/styles"; /* Must come after tailwindcss */
```

### 📏 Styling Rules

- **No Hardcoded Text Sizes**: Use `text-sm`, `text-base` (No `text-[13px]`).

- **No Hardcoded Colors**: Use `text-accent`, `bg-surface-1`.

### 🎭 BEM Reference (for custom CSS)

| Component     | Base         | Modifiers           | Elements               |
|---------------|--------------|---------------------|------------------------|
| **Button**    | `.button`    | `--primary`, `--sm` | N/A                    |
| **Accordion** | `.accordion` | `--outline`         | `__item`, `__trigger`  |

---

## Getting Help & Resources

1. **[Official Documentation](https://v3.heroui.com/)**
2. **[Components List](https://v3.heroui.com/docs/components-list)**
3. **[Design System Hub](/#design-hub)**
4. **[Storybook Examples](https://storybook.heroui.com)**
5. **[Component Source (React)](https://github.com/heroui-inc/heroui/tree/v3/packages/react/src/components)**
6. **[Component Styles (CSS)](https://github.com/heroui-inc/heroui/tree/v3/packages/styles/components)**
7. **[Tailwind CSS v4](https://tailwindcss.com/docs)**
8. **Project Discord/Slack** (Ask team)

**Local References:**

- `./docs/heroui-docs.txt` (Full API)
- `./DESIGN_SYSTEM.md` (Tokens)

---

## Pre-Commit Checklist

- [ ] **Functional & Testing**:
  - [ ] `npm run build` passes.
  - [ ] `npm run lint` passes.
  - [ ] `npm test` passes.
  - [ ] **Edge cases handled** (loading, empty, error).
  - [ ] **Form validation works**.
- [ ] **Code Quality**:
  - [ ] Named exports used everywhere.
  - [ ] No `any` types.
  - [ ] No `use client`.
  - [ ] Imports use `@/` alias.
  - [ ] **No wrapper components**.
- [ ] **Styling & Theming**:
  - [ ] **Tested in both light AND dark themes**.
  - [ ] CSS variables used for all colors.
  - [ ] Import order verified in `index.css`.
- [ ] **Accessibility**:
  - [ ] `onPress` used for interactions.
  - [ ] Keyboard navigation verified.
  - [ ] Icon-only buttons have `aria-label`.
  - [ ] Focus indicators visible.
- [ ] **Architecture**:
  - [ ] Logic extracted to hooks.
  - [ ] Data moved to `src/data`.
  - [ ] Devtools lazy loaded.
- [ ] **Documentation**:
  - [ ] Complex components have JSDoc.
  - [ ] Custom props documented.
- [ ] **Performance**:
  - [ ] **Main bundle stays under 500 KB**.
  - [ ] All route components in `router.tsx` are lazy loaded.
  - [ ] All heavy modals are lazy loaded and conditionally rendered.
  - [ ] `Suspense` boundaries have appropriate themed fallbacks (Skeleton).
  - [ ] Tree-shakeable imports used.
  - [ ] No console errors/warnings.
  - [ ] Images optimized.
