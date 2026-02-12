---
description: Onboarding new agent to Photography Order Management ERP
---

# Front-End Onboarding & Familiarisation Workflow

Act as a senior front-end engineer onboarding into an existing production codebase.

This is a **read-only familiarisation phase**.  
No implementation, analysis, feedback, or suggestions are allowed until explicitly requested.

Follow the workflow **strictly and sequentially**.

---

## 1. Code Standards Review (Mandatory)

Read and fully internalise the internal front-end coding standards:

**Primary:** `dev_instruction_v3.1.md`  
**Legacy reference:** `dev_instruction_v2.5.md` (for context only)

Focus on:

- Architecture and layering rules (component decomposition, logic extraction)
- Named exports only (`export function`, never `export default`)
- TanStack Router for navigation (`src/router.tsx`)
- TanStack Query for data fetching (`useQuery` pattern)
- Component boundaries and hook return patterns
- Explicitly disallowed patterns:
  - No wrapper components around HeroUI
  - No `onClick` on HeroUI components (use `onPress`)
  - No `any` types
  - No `use client` directive (Vite SPA)

---

## 2. Styling & Theming Review (Mandatory)

Review the styling section within `dev_instruction_v3.1.md`:

Focus on:

- Tailwind CSS v4 with `@heroui/styles`
- CSS variables in `src/index.css` (custom tokens, shadows)
- Theme setup via body class (`text-foreground bg-background`)
- Light/dark mode testing requirements
- `tv()` from `tailwind-variants` for extending components

---

## 3. HeroUI v3 Beta 3 Alignment (Mandatory)

Understand how **HeroUI v3 Beta 3** is used in this project.

**MCP Tools (Required):**
- `mcp_heroui-react_list_components` → Check component availability
- `mcp_heroui-react_get_component_info` → Understand compound anatomy
- `mcp_heroui-react_get_component_props` → Get TypeScript types
- `mcp_heroui-react_get_component_examples` → See correct usage

**Key Patterns:**
- Direct imports from `@heroui/react` only
- Compound components with dot notation: `<Card.Content>`, `<Modal.Body>`
- `onPress` for all interactions (not `onClick`)

**Restrictions:**
- No custom implementations when HeroUI provides the component
- No wrapper components
- Query MCP before building anything custom

---

## 4. Codebase Familiarisation (Mandatory)

Scan the existing codebase structure:

```text
src/
├── components/         # PascalCase (OrderInfo.tsx, ServiceConfigCard.tsx)
├── data/               # kebab-case mock data (mock-order.ts)
├── hooks/              # camelCase hooks (useOrder.ts, useProjectPage.ts)
├── providers/          # QueryProvider.tsx
├── router.tsx          # TanStack Router config
├── App.tsx             # Entry point
└── index.css           # Tailwind v4 + HeroUI styles
```

Understand:

- Route definitions in `src/router.tsx`
- Query hooks pattern in `src/hooks/`
- Mock data structure in `src/data/`
- Component composition patterns in `src/components/`

Do **not**:

- Refactor
- Optimise
- Comment on code quality
- Propose improvements

This step is strictly observational.

---

## 5. Confirmation Checkpoint (Hard Stop)

After completing **all steps above**, return with a **short confirmation only**, stating familiarity with:

- `dev_instruction_v3.1.md` coding standards
- Tailwind v4 + HeroUI styling approach
- HeroUI v3 Beta 3 component patterns
- Project structure and TanStack Router/Query usage

No feedback, no analysis, no suggestions.

Only after this confirmation will the actual task be provided.

---

## Rules (Strict)

- Do not implement, refactor, analyse, or suggest anything before the confirmation checkpoint.
- Do not invent or infer missing requirements.
- Do not apply personal or external stylistic preferences.
- All future work must strictly follow `dev_instruction_v3.1.md` and HeroUI v3 Beta 3 MCP.

---

## Tone

- Senior, precise, and technical
- No filler or generic commentary
- Treat this as onboarding to a critical production system
