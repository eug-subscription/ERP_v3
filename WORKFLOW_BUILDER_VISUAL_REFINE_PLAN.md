# Visual Refactoring of Block Library

**Goal:** Reduce visual noise and improve scannability by shifting context from blocks to category headers.

**Reference:** n8n node library — category-driven hierarchy, minimalist items.

**Scope:** Visual improvements to Block Library ONLY. No Canvas, Navbar, or logic changes.

> [!IMPORTANT]
> **HeroUI v3 MCP Required**
> Before implementing any component, use MCP tools: `list_components`, `get_component_docs`.
> Use `onPress` (not `onClick`). No wrapper components.

---

## Phase 1: Data Layer

Update types and data to support category descriptions.

### Tasks

- [x] **1.1** Update `CategoryMeta` interface in `src/data/block-ui-categories.ts`
  - Add `description: string` field

- [x] **1.2** Populate category descriptions (max 6-8 words each):

  | Category | Description |
  |----------|-------------|
  | Setup & Onboarding | Configure project and assign team. |
  | Gates & Prerequisites | Conditions that must be met first. |
  | Production & Processing | Capture, process, and retouch. |
  | Flow Control | Branch, merge, and route workflows. |
  | Quality Assurance | Review and approve assets. |
  | Asset Management | Handle files and storage. |
  | Delivery & Notifications | Send assets and notify stakeholders. |

---

## Phase 2: CategoryAccordion

Display category descriptions in accordion headers.

**File:** `src/components/ProjectPage/WorkflowBuilder/BlockLibrary/CategoryAccordion.tsx`

### Tasks

- [x] **2.1** Add description below category label in `Accordion.Trigger`
- [x] **2.2** Show description **only when expanded** (Intentional Deviation: User requested always visible for better scannability)
- [x] **2.3** Style description: `text-tiny text-default-500`

---

## Phase 3: DraggableBlock

Minimal block items with hover-only grip.

**File:** `src/components/ProjectPage/WorkflowBuilder/BlockLibrary/DraggableBlock.tsx`

### Tasks

- [x] **3.1** Remove `Card` and `Card.Content` wrappers
- [x] **3.2** Remove `block.description` from render
- [x] **3.3** Create `tv()` variants for icon colors:

  ```tsx
  const blockIcon = tv({
    base: "flex h-7 w-7 items-center justify-center rounded-md",
    variants: {
      category: {
        setup: "bg-primary/10 text-primary",
        gates: "bg-warning/10 text-warning",
        production: "bg-secondary/10 text-secondary",
        flow: "bg-success/10 text-success",
        quality: "bg-danger/10 text-danger",
        asset: "bg-default-200 text-default-600",
        delivery: "bg-success/10 text-success",
      }
    }
  });
  ```

- [x] **3.4** Apply new container styles:

  ```tsx
  "group flex items-center gap-3 px-3 py-2 rounded-lg"
  "hover:bg-default-100 cursor-grab active:cursor-grabbing"
  "focus-visible:ring-2 focus-visible:ring-primary"
  ```

- [x] **3.5** Make grip icon hover-only:

  ```tsx
  "opacity-0 group-hover:opacity-100 transition-opacity"
  ```

- [x] **3.6** Add accessibility attributes:
  - `tabIndex={0}`
  - `role="option"` (parent needs `role="listbox"`)
  - `aria-roledescription="draggable block"`

---

## Phase 4: Verification

### Build & Lint

- [x] **4.1** Run `npm run build` — passes
- [x] **4.2** Run `npm run lint` — passes

### Functional Tests

- [ ] **4.3** Drag block from library to canvas — works
- [ ] **4.4** Tab through blocks with keyboard — focus visible
- [ ] **4.5** Grip icon appears on hover, hidden otherwise

### Visual Tests

- [ ] **4.6** Light mode: clean minimal appearance
- [ ] **4.7** Dark mode: `text-default-500` descriptions readable
- [ ] **4.8** Fits ~80% more items above fold vs. before

### Scope Check

- [ ] **4.9** NO changes outside `src/components/ProjectPage/WorkflowBuilder/BlockLibrary`

---

## Summary

| Phase | File(s) | Est. Time |
|-------|---------|-----------|
| 1 | `block-ui-categories.ts` | 10 min |
| 2 | `CategoryAccordion.tsx` | 15 min |
| 3 | `DraggableBlock.tsx` | 30 min |
| 4 | Verification | 15 min |

**Total:** ~1 hour
