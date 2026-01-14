# Developer Instructions (Customized for Photography Order Management)

> [!IMPORTANT]
> **READ THIS BEFORE STARTING ANY WORK**
>
> This document is the **primary source of truth** for all development work. Adherence to these guidelines is **mandatory** to ensure consistency, maintainability, and alignment with HeroUI v3 principles.

## TL;DR (Too Long; Didn't Read)

1. **Check HeroUI first** - Don't reinvent what exists (Rule #0)
2. **Named Exports ONLY** - `export function Component`, never `export default`.
3. **App State Navigation** - Use `App.tsx` state for navigation. No complex routers yet.
4. **Use `onPress`** - Not `onClick` (for HeroUI components).
5. **Strict Typing** - No `any`. All props must be defined.
6. **Direct Imports** - From `@heroui/react`. **NO WRAPPER COMPONENTS.**
7. **No `use client`** - This is a Vite SPA.
8. **Test Dark Mode** - Every component must work in both themes.
9. **No Hardcoded Values** - Use tokens for colors (`bg-accent`) and sizing.

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
- ✅ **Consistent**: Uniform code style via Named Exports and Aliases.

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

- **Standard**: Create `hooks/useOrderLogic.ts` if logic becomes complex.
- **Goal**: Components should primarily handle layout and rendering.

### 3. Navigation & State

- **Pattern**: Single Page View with State-Based Routing.
- **Mechanism**: Use high-level state (e.g., `activeTab` in `App.tsx`) to orchestrate views.
- **Future-Proofing**: Keep view components (e.g., `TeamMembers`, `Timeline`) self-contained.
- **Forbidden**: Direct DOM manipulation for view switching.

### 4. Data Management

- **Single Source of Truth**: Mock data should reside in `src/data/`.
- **Forbidden**: Hardcoded data arrays inside component files.

---

## Coding Standards

### 1. Named Exports Only

- **Rule**: Use `export function ComponentName() {}`.
- **Forbidden**: `export default function ...` or `export default ComponentName`.
- **Reasoning**: Better tree-shaking, predictable imports, easier refactoring.

### 2. No `use client`

- **Context**: This is a Vite Single Page Application (SPA).
- **Rule**: **Do not** use the `"use client"` directive.

### 3. Strict Typing

- **Rule**: Zero tolerance for `any`.
- **Standard**: Define interfaces for **all** component props.

    ```tsx
    interface UserCardProps {
      user: User; // Defined in '@/types'
      isActive?: boolean;
    }
    ```

### 4. TypeScript Error Suppressions

- **Rule**: Use `@ts-expect-error` instead of `@ts-ignore`.
- **Why**: `@ts-expect-error` errors if there's nothing to suppress, making refactoring safer.

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

### 3. 🧩 Composition

- Use dot notation: `<Card.Header>`, `<Modal.Body>`.
- Avoid "configuration props" like `headerText="..."`.

---

## File Structure & Naming

```text
src/
├── components/             # All application components (PascalCase)
│   ├── OrderInfo.tsx
│   ├── Timeline.tsx
│   └── ...
├── data/                   # Mock data & constants (kebab-case)
├── types/                  # Shared TypeScript definitions
├── hooks/                  # Shared hooks (camelCase)
├── App.tsx                 # Main layout & View orchestration
└── main.tsx                # Entry point & Providers
```

**Naming:**
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase (`usePermissions.ts`)
- **Data**: kebab-case or camelCase (`mock-team.ts`)

---

## Component Patterns

### ✅ Direct Imports (No Wrappers)

**Strictly Forbidden:** Creating "proxy" components that just wrap HeroUI components without adding significant logic.

```tsx
// ✅ Correct
import { Button } from '@heroui/react';

// ❌ Incorrect
import { Button } from './components/ui/button';
```

### ✅ Compound Components (Mandatory)

**HeroUI v3 uses composition over configuration. Always use dot notation.**

```tsx
// ✅ Correct: TextField
<TextField>
  <TextField.Label>Email</TextField.Label>
  <TextField.Input type="email" />
</TextField>
```

### 🎨 Extending Components (tailwind-variants)

**Use `tv` to extend HeroUI components with custom variants.**

```tsx
import { tv } from 'tailwind-variants';
const customButton = tv({ ... });
```

---

## Styling & Theming

### 1. 🌓 Theme Setup (Mandatory)

**Themes are applied via `data-theme` attribute on HTML tag.**

### 2. 🎨 CSS Variables & Custom Theming

**Use CSS variables for all custom values. Never hardcode hex.**

```css
/* Implementation in index.css */
:root {
  --splento-cyan: oklch(0.7 0.25 260);
}
.custom-card {
  background: var(--surface-1);
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

### 1. Node Version
- **Recommended**: Use the latest LTS version of Node.js.

### 2. Linting
- **Action**: Fix errors; do not bypass. Ensure `npm run lint` passes.

### 3. 🚨 Code Review Standards (Rule #0 Enforcement)

**Reviewers MUST reject PRs that:**
1. Create new wrapper components.
2. Re-export HeroUI components without adding logic.
3. Import from local paths when `@heroui/react` is available.
4. Use raw `onClick` on HeroUI components.

---

## Pre-Commit Checklist

- [ ] **Functional**:
  - [ ] `npm run build` passes.
  - [ ] `npm run lint` passes.
  - [ ] **Edge cases handled** (loading, empty, error).
- [ ] **Code Quality**:
  - [ ] Named exports used everywhere.
  - [ ] No `any` types.
  - [ ] **No wrapper components**.
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
