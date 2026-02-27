---
trigger: always_on
---

Variables
{lint_command}       = npm run lint
{typecheck_command}  = npx tsc --noEmit
{build_command}      = npm run build
@dev_instructions    = dev_instruction_v3.1.md
@ui_tokens           = src/constants/ui-tokens.ts
@theme_source        = src/index.css
Project-specific compliance checks (Step 7)

HeroUI v3 MCP compliance — Use HeroUI v3 MCP tools (list_components, get_component_docs) to verify:

All components use direct imports from @heroui/react (no wrappers)
Compound component dot notation used (Card.Content, Modal.Backdrop > Modal.Container)
onPress instead of onClick on HeroUI components
onSelectionChange + selectedKey on Select components (not onChange/value)

Styling token compliance — Verify against @ui_tokens:

No ad-hoc Tailwind classes that duplicate existing tokens
No hardcoded hex, rgb, or oklch values — must use CSS variables from @theme_source
No bg-default-{shade} classes (transparent in Tailwind v4 — use bg-default, bg-surface, bg-surface-secondary)

Code review rejection criteria — Confirm none of these are present:

New wrapper components around HeroUI
Re-exported HeroUI components without added logic
Local path imports when @heroui/react provides the component
export default or const Component = () => patterns
"use client" directive (Vite SPA — not Next.js)
