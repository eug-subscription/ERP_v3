# Agent Skills Reference

Quick reference for all available Agent Skills in this project.

---

## 🟢 Low-Risk Skills (Read-Only)

### `project-context`

**Purpose:** Loads project structure, tech stack, and coding conventions.  
**Triggers:** "project context", "understand project", "codebase overview"

### `code-review`

**Purpose:** Validates code against `dev_instruction_v3.md` standards.  
**Triggers:** "code review", "check standards", "pre-commit check"  
**Script:** `scripts/check-standards.sh src/`

### `mock-data`

**Purpose:** Creates typed mock data files in `src/data/`.  
**Triggers:** "create mock", "mock data", "test data"

---

## 🟡 Medium-Risk Skills (Creates New Files)

### `heroui-component`

**Purpose:** Scaffolds HeroUI v3 components with compound patterns.  
**Triggers:** "create component", "new component", "add component"  
**Resources:** `resources/card-example.tsx`, `resources/modal-example.tsx`

### `tanstack-hook`

**Purpose:** Generates TanStack Query hooks with `useQuery`.  
**Triggers:** "create hook", "data hook", "query hook", "useQuery"

### `route-generator`

**Purpose:** Adds routes to `src/router.tsx`.  
**Triggers:** "add route", "new page", "create page"

---

## 🔴 High-Risk Skills (Controlled Execution)

### `controlled-implementation`

**Purpose:** Execute implementation work step-by-step with mandatory approval gates.  
**Triggers:** "controlled implementation", "step-by-step", "gated execution"  
**Rules:** Single-task execution, explicit approval required, no forward-looking work.

---

## Quick Commands

```bash
# Run code review
.agent/skills/code-review/scripts/check-standards.sh src/
```
