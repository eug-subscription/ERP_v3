# Workflow Builder Specification

> **Status:** Draft  
> **Version:** 1.2  
> **Last Updated:** 2026-01-21  
> **Changelog:**
>
> - **v1.2:** Updated Block Card Design (§4.2) to reflect compact 56px implementation. Updated Drop Zones (§6.1) to document ghost projection system.
> - **v1.1:** Added clarifications for Start node, IF/ELSE conditions, drop zones, settings panel state, empty canvas, error handling, loading states, and animation timing based on developer review.

## 1. Overview

### 1.1 Purpose

Transform the existing Workflow Tab from a toggle-based template system to a visual drag-and-drop workflow builder where users can construct custom workflows by dragging blocks from a categorized library onto a live canvas.

### 1.2 Goals

- Enable users to build custom workflows without relying on pre-defined templates
- Provide intuitive visual feedback for workflow structure including branching logic
- Maintain all existing block dependency and validation rules
- Support IF/ELSE branching with parallel lanes that converge at MERGE blocks

---

## 2. Layout Structure

### 2.1 Three-Panel Design

```
┌─────────────────┬───────────────────────────────┬─────────────────┐
│  BLOCK LIBRARY  │         WORKFLOW CANVAS       │  BLOCK SETTINGS │
│     (280px)     │          (flex-grow)          │     (320px)     │
│                 │                               │   (conditional) │
└─────────────────┴───────────────────────────────┴─────────────────┘
```

| Panel | Width | Behavior |
|-------|-------|----------|
| **Block Library** | 280px fixed | Always visible, scrollable accordion |
| **Workflow Canvas** | Flexible (remaining space) | Main drag target, zoom/pan support |
| **Block Settings** | 320px fixed | Appears when a block is selected |

### 2.2 Responsive Behavior

| Breakpoint | Library | Canvas | Settings |
|------------|---------|--------|----------|
| Desktop (≥1280px) | 280px sidebar | Flex | 320px panel |
| Tablet (768-1279px) | Collapsible drawer | Full width | Slide-over panel |
| Mobile (<768px) | Bottom sheet | Full | Modal |

---

## 3. Block Library (Left Panel)

### 3.1 Structure

- Search input at top
- 7 collapsible accordion sections
- Each section has a color-coded left border
- Blocks displayed as draggable cards with:
  - 6-dot drag handle
  - Category-colored icon
  - Block label
  - Short description (optional)

### 3.2 Block Categories

| Category | Color | Hex | Blocks |
|----------|-------|-----|--------|
| **Setup & Onboarding** | Blue | `#3B82F6` | Pro assign, Retoucher onboarding, SST |
| **Gates & Prerequisites** | Yellow | `#F59E0B` | Items to shoot, Wait payment, Matching |
| **Production & Processing** | Purple | `#8B5CF6` | Photo shoot, Video shoot, Photo Retouching, Video Retouching, External process |
| **Flow Control** | Orange | `#F97316` | If/else, Merge |
| **Quality Assurance** | Red | `#EF4444` | Moderation |
| **Asset Management** | Gray | `#6B7280` | File renaming, File storage |
| **Delivery & Notifications** | Green | `#10B981` | Send to client, Send notification |

### 3.3 Block Mapping

| Block Type | UI Category | Current `BlockCategory` |
|------------|-------------|-------------------------|
| `ORDER_CREATED` | (Auto-inserted, not in library) | `STARTING` |
| `PRO_ASSIGNING` | Setup & Onboarding | `STARTING` |
| `RETOUCHER_ASSIGNING` | Setup & Onboarding | `STARTING` |
| `SST` | Setup & Onboarding | `STARTING` |
| `ITEMS_TO_SHOOT` | Gates & Prerequisites | `STARTING` |
| `WAIT_PAYMENT` | Gates & Prerequisites | `STARTING` |
| `MATCHING` | Gates & Prerequisites | `PROCESSING` |
| `PHOTO_SHOOT` | Production & Processing | `PROCESSING` |
| `VIDEO_SHOOT` | Production & Processing | `PROCESSING` |
| `PHOTO_RETOUCHING` | Production & Processing | `PROCESSING` |
| `VIDEO_RETOUCHING` | Production & Processing | `PROCESSING` |
| `EXTERNAL_PROCESS` | Production & Processing | `UNIVERSAL` |
| `IF_ELSE` | Flow Control | `UNIVERSAL` |
| `MERGE` | Flow Control | `UNIVERSAL` |
| `MODERATION` | Quality Assurance | `UNIVERSAL` |
| `FILE_RENAMING` | Asset Management | `PROCESSING` |
| `FILE_STORAGE` | Asset Management | `FINALISATION` |
| `SEND_TO_CLIENT` | Delivery & Notifications | `FINALISATION` |
| `SEND_NOTIFICATION` | Delivery & Notifications | `UNIVERSAL` |

---

## 4. Workflow Canvas (Center Panel)

### 4.1 Canvas Structure

- Subtle dot grid background
- Workflow title at top (editable)
- **Start** node (always present, non-removable)
- Vertical flow of connected blocks
- Drop zones between blocks for insertion
- Lane expansion for IF/ELSE branches

### 4.2 Start Node Behavior

The **Start** node represents `ORDER_CREATED` and has special behavior:

| Property | Behavior |
| --- | --- |
| Primary Label | "Order Created" |
| Subtitle | "Workflow starts here" |
| Draggable | No — fixed at top of canvas |
| Deletable | No — always present |
| Configurable | No — no settings panel |
| Visual | Green accent color, play icon, distinct styling |

### 4.2 Block Card Design

Each block on the canvas displays as a **compact card** (280px × 56px):

```
┌──┬────────────────────────────────────────┐
│▌ │ ⋮⋮  [Icon]  Block Label         ● ✓   │
│▌ │           CATEGORY NAME                │
└──┴────────────────────────────────────────┘
```

| Element | Description |
|---------|-------------|
| Left accent bar | 6px colored bar matching block category |
| Drag handle | 6-dot grip icon for drag affordance |
| Icon container | Category-colored background with block icon |
| Block label | Bold primary text |
| Category subtitle | Uppercase, smaller text showing block type |
| Validation indicator | Green check (valid), yellow warning, or red pulsing dot |

- Selected state shows blue outline with subtle shadow
- Hover state shows elevated shadow
- Compact design maximizes vertical space for longer workflows

### 4.3 Connection Lines

- Vertical gray lines connecting blocks
- Animated "flow dots" showing direction
- Curved bezier lines for branch splits and merges

### 4.5 IF/ELSE Branching Behavior

When an IF/ELSE block is added:

1. The canvas splits into two parallel vertical lanes below the IF/ELSE block
2. Lanes labeled "Path A (Photo)" and "Path B (Video)" based on condition
3. Each lane accepts blocks independently
4. A MERGE block is required to rejoin the lanes
5. The IF/ELSE block displays its condition

**Initial Conditions:**

For the initial implementation, only `has_video` condition is supported:

| Condition | Path A | Path B |
| --- | --- | --- |
| `has_video` | Photo (when false) | Video (when true) |

> **Future:** Custom conditions may be added later, but initially the system only supports file-type branching.

**MERGE Block Placement:**

- MERGE must be **manually placed** by the user
- Validation shows error if branches exist without a MERGE block after them
- One MERGE block per IF/ELSE pair

```
        ┌──────────────┐
        │   IF/ELSE    │
        │  has_video   │
        └──────┬───────┘
               │
     ┌─────────┴─────────┐
     ▼                   ▼
┌─────────┐         ┌─────────┐
│ Path A  │         │ Path B  │
│ (Photo) │         │ (Video) │
│         │         │         │
│ Block   │         │ Block   │
│   ↓     │         │   ↓     │
│ Block   │         │ Block   │
└────┬────┘         └────┬────┘
     │                   │
     └─────────┬─────────┘
               ▼
        ┌──────────────┐
        │    MERGE     │
        └──────────────┘
```

---

## 5. Block Settings (Right Panel)

### 5.1 Trigger

- Panel slides in from right when a block on the canvas is clicked
- Close button (X) in top-right corner
- Panel shows block-specific configuration form

### 5.2 Unsaved Changes Handling

| Scenario | Behavior |
| --- | --- |
| Select different block with unsaved changes | Show modal: "Unsaved changes. Save / Discard / Cancel" |
| Close panel with unsaved changes | Show modal: "Unsaved changes. Save / Discard / Cancel" |
| Click Save | Save changes, show success indicator |
| Click Discard | Revert to last saved state |

### 5.3 Panel Structure

```text
┌─────────────────────────────────┐
│ [Icon] Block Name            ✕  │
│        Category                 │
├─────────────────────────────────┤
│                                 │
│  [Configuration Form Fields]    │
│                                 │
│  - Text inputs                  │
│  - Selects/Dropdowns            │
│  - Toggles/Switches             │
│  - Number fields                │
│                                 │
├─────────────────────────────────┤
│  [Save Changes]  (Primary Btn)  │
│  Delete Block    (Danger Link)  │
└─────────────────────────────────┘
```

### 5.3 Existing Config Interfaces

All existing configuration interfaces remain unchanged:

- `ProAssigningConfig`
- `RetoucherAssigningConfig`
- `SSTConfig`
- `ModerationConfig`
- `IfElseConfig`
- `ExternalProcessConfig`
- `SendNotificationConfig`
- `FileStorageConfig`
- `FileRenamingConfig`

---

## 6. Drag-and-Drop Behavior

### 6.1 Drag from Library (Ghost Projection System)

The drag-and-drop system uses a **ghost projection** approach for precise visual feedback:

| Action | Behavior |
| --- | --- |
| Drag start | Block card becomes semi-transparent (50%), cursor changes to grabbing |
| Drag preview | A rotated (2°) card follows cursor, matching final appearance |
| Drag over canvas | **Ghost block** appears at projected insertion point |
| Ghost appearance | Semi-transparent, grayscale version of the block card |
| Existing blocks | Shift up/down to make room for the ghost |
| Drop | Block inserted exactly where ghost was shown ("What You See Is What You Get") |
| Drag over invalid zone | No ghost shown, cursor shows "not-allowed" |

> **Note:** The traditional "Drop Here" zone boxes are hidden when dragging from library. The ghost provides clearer feedback about exact placement.

### 6.2 Drop Zone Clarification

Drop zones appear **between** blocks and at the **end** of the flow:

```text
┌─────────────┐
│   Block A   │
└─────────────┘
    ↓ [Drop Zone: Insert After A]
┌─────────────┐
│   Block B   │
└─────────────┘
    ↓ [Drop Zone: Append to Workflow]
```

| Drop Target | Result |
| --- | --- |
| Drop zone between blocks | Insert new block at that position |
| Drop zone at end | Append block to workflow |
| Drop on existing block | Not allowed (no replace behavior) |

### 6.3 Reorder on Canvas

| Action | Behavior |
| --- | --- |
| Drag existing block | Block lifts with shadow, drop zones appear |
| Drop at new position | Blocks reorder with animation |
| Drop outside valid zone | Block returns to original position |
| Cross-branch move | **Not allowed** — blocks stay within their lane |

### 6.4 Lane Constraints (IF/ELSE)

| Action | Behavior |
| --- | --- |
| Drag photo-only block to Video lane | Drop zones do not highlight, drop is rejected |
| Drag universal block between lanes | Allowed if block type is valid for target lane |
| Reorder within same lane | Allowed, respects dependency rules |

### 6.5 Delete Block

| Method | Behavior |
| --- | --- |
| Settings panel "Delete Block" | Confirmation modal, then remove |
| Keyboard (Delete/Backspace) | When block selected, removes with confirmation |

---

## 7. Block Dependencies & Validation

### 7.1 Existing Dependency Rules (Must Be Preserved)

```typescript
// From block-dependencies.ts
{
    blockType: 'PHOTO_SHOOT',
    requires: ['PRO_ASSIGNING'],
    mustComeAfter: ['PRO_ASSIGNING']
},
{
    blockType: 'VIDEO_SHOOT',
    requires: ['PRO_ASSIGNING'],
    mustComeAfter: ['PRO_ASSIGNING']
},
{
    blockType: 'PHOTO_RETOUCHING',
    requires: ['RETOUCHER_ASSIGNING'],
    mustComeAfter: ['RETOUCHER_ASSIGNING', 'PHOTO_SHOOT']
},
{
    blockType: 'VIDEO_RETOUCHING',
    requires: ['RETOUCHER_ASSIGNING'],
    mustComeAfter: ['RETOUCHER_ASSIGNING', 'VIDEO_SHOOT']
},
{
    blockType: 'MATCHING',
    requires: ['PHOTO_SHOOT'],
    mustComeAfter: ['PHOTO_SHOOT']
},
{
    blockType: 'MERGE',
    mustComeAfter: ['PHOTO_RETOUCHING', 'VIDEO_RETOUCHING', 'MODERATION']
}
```

### 7.2 Global Mandatory Rules

- `ORDER_CREATED` is always present (auto-inserted as Start node)
- `SEND_TO_CLIENT` must exist at least once in a valid workflow

### 7.3 Real-Time Validation

| Trigger | Behavior |
|---------|----------|
| Drop block | Validate immediately, show warning icon if invalid |
| Delete block | Check if other blocks depend on it, show warning |
| Before save | Full validation, block save if errors exist |

### 7.4 Visual Indicators

| State | Indicator |
|-------|-----------|
| Valid block | Green "Configured" dot |
| Missing dependency | Yellow warning icon with tooltip |
| Critical error | Red pulsing icon with tooltip |
| Unconfigured | Gray dot |

---

## 8. Branch Constraints

### 8.1 Allowed Block Types by Branch

From `branch-structure.ts`:

| Branch | Allowed Blocks |
|--------|----------------|
| **GENERAL** | ORDER_CREATED, ITEMS_TO_SHOOT, SST, WAIT_PAYMENT, SEND_NOTIFICATION, MERGE, FILE_STORAGE |
| **PHOTO** | PRO_ASSIGNING, PHOTO_SHOOT, SST, MATCHING, RETOUCHER_ASSIGNING, PHOTO_RETOUCHING, FILE_RENAMING, MODERATION, EXTERNAL_PROCESS, IF_ELSE, SEND_TO_CLIENT |
| **VIDEO** | PRO_ASSIGNING, VIDEO_SHOOT, RETOUCHER_ASSIGNING, VIDEO_RETOUCHING, FILE_RENAMING, MODERATION, EXTERNAL_PROCESS, IF_ELSE, SEND_TO_CLIENT |

### 8.2 Enforcement

- When dragging a block, only valid drop zones light up
- Invalid drops show tooltip: "This block cannot be placed in the [Photo/Video] lane"
- IF/ELSE condition determines which lane type each path becomes

---

## 9. Save Behavior

### 9.1 Save Trigger

- Explicit "Save" button in header (no auto-save)
- Shows loading state during save
- Success toast on completion

### 9.2 Save Validation

Before saving:

1. Run full `validateWorkflow()` check
2. If errors exist, show modal with error list
3. Offer "Fix Automatically" option using `autoFixWorkflow()`
4. Block save until all errors resolved

### 9.3 Data Structure

Workflow is saved as `ProjectWorkflowConfig`:

```typescript
interface ProjectWorkflowConfig {
    projectId: string;
    templateId: string;  // Empty for custom workflows
    branches: WorkflowBranch[];
}
```

---

## 10. Template System (Future)

> **Note:** Not in initial scope, but design should accommodate.

### 10.1 Future Capabilities

- Save current workflow as template
- Duplicate existing workflow
- Start from blank canvas (initial implementation)
- Start from template (future)

### 10.2 Initial State

For the initial implementation, the canvas starts blank with only the **Start** node.

---

## 11. Technical Implementation Notes

### 11.1 Libraries

- `@dnd-kit/core` (already in project) for drag-and-drop
- `@dnd-kit/sortable` for reordering
- `@dnd-kit/utilities` for sensors and modifiers

### 11.2 New Types Required

```typescript
// New UI category type
type BlockCategoryUI = 
    | 'SETUP_ONBOARDING'
    | 'GATES_PREREQUISITES'
    | 'PRODUCTION_PROCESSING'
    | 'FLOW_CONTROL'
    | 'QUALITY_ASSURANCE'
    | 'ASSET_MANAGEMENT'
    | 'DELIVERY_NOTIFICATIONS';

// Category metadata
interface CategoryMeta {
    id: BlockCategoryUI;
    label: string;
    color: string;
    icon: string;
}

// Block with UI metadata
interface BlockLibraryItem {
    type: WorkflowBlockType;
    category: BlockCategoryUI;
    label: string;
    description: string;
    icon: string;
}
```

### 11.3 Component Structure (Proposed)

```
WorkflowTab/
├── WorkflowTab.tsx              # Main container, 3-column layout
├── BlockLibrary/
│   ├── BlockLibrary.tsx         # Accordion with categories
│   ├── CategoryAccordion.tsx    # Single category section
│   └── DraggableBlock.tsx       # Block item in library
├── WorkflowCanvas/
│   ├── WorkflowCanvas.tsx       # Main canvas with lanes
│   ├── CanvasBlock.tsx          # Block card on canvas
│   ├── DropZone.tsx             # Insertion point between blocks
│   ├── ConnectionLine.tsx       # Connector with animation
│   └── LaneContainer.tsx        # Container for IF/ELSE branches
├── BlockSettings/
│   ├── BlockSettingsPanel.tsx   # Right panel container
│   └── [existing config forms]  # ProAssigningConfig.tsx, etc.
└── hooks/
    ├── useWorkflowCanvas.ts     # Canvas state and DnD logic
    ├── useBlockLibrary.ts       # Library filtering and search
    └── useBlockValidation.ts    # Real-time validation
```

---

## 12. Empty Canvas State

When a user opens the Workflow Builder for a new project (no saved workflow):

```text
┌─────────────────────────────────────────────────┐
│                                                 │
│            ┌───────────────────┐                │
│            │    📋 Start       │                │
│            └───────────────────┘                │
│                     │                           │
│                     ▼                           │
│        ┌───────────────────────┐                │
│        │   Build your workflow │                │
│        │                       │                │
│        │  Drag blocks from the │                │
│        │  library to start     │                │
│        │                       │                │
│        │      [Drop Here]      │                │
│        └───────────────────────┘                │
│                                                 │
└─────────────────────────────────────────────────┘
```

| Element | Description |
| --- | --- |
| Start node | Always visible, anchored at top |
| Empty message | "Build your workflow" with instructions |
| Drop zone | Large, prominent drop target below Start |

---

## 13. Error Handling

### 13.1 Error Types and Feedback

| Error Type | User Feedback | Recovery Action |
| --- | --- | --- |
| Invalid drop (wrong lane) | Red outline + tooltip | Block returns to library |
| Missing dependency | Yellow warning icon on block | Tooltip shows "Requires X" |
| Orphan branch (no MERGE) | Warning on last block in branch | Prompt to add MERGE |
| Unsaved changes on navigate | Modal confirmation | Save / Discard / Cancel |
| Save failed | Error toast with retry button | Show error details |
| Delete breaks dependencies | Warning modal before delete | Cancel / Force delete |

### 13.2 Validation Timing

| Trigger | Validation Scope |
| --- | --- |
| Drop block | Immediate single-block validation |
| Delete block | Check dependent blocks |
| Click Save | Full workflow validation |
| Open existing workflow | Full validation on load |

---

## 14. Loading States

| State | Indicator |
| --- | --- |
| Initial workflow load | Skeleton blocks in canvas |
| Saving workflow | Spinner in save button, button disabled |
| Loading block settings | Spinner in settings panel |
| Validation running | Subtle pulsing outline on affected blocks |

---

## 15. Animation Timing

| Animation | Duration | Easing |
| --- | --- | --- |
| Block drop | 200ms | ease-out |
| Block reorder | 200ms | ease-out |
| Settings panel slide | 300ms | ease-in-out |
| Lane split (IF/ELSE) | 400ms | ease-in-out |
| Lane merge (MERGE) | 400ms | ease-in-out |
| Connection line draw | 300ms | ease-in |
| Flow dot animation | 2000ms | linear (loop) |
| Validation indicator pulse | 1500ms | ease-in-out (loop) |

---

## 16. Out of Scope (Initial Release)

- Undo/Redo functionality (consider "Revert to saved" as simpler alternative)
- Template management (save as template, start from template)
- Canvas zoom and pan controls
- Advanced keyboard shortcuts
- Collaborative editing
- Version history
- Nested IF/ELSE (branches within branches)
- Custom IF/ELSE conditions beyond `has_video`

---

## 17. Acceptance Criteria

- [ ] User can drag blocks from library to canvas
- [ ] User can reorder blocks on canvas
- [ ] User can delete blocks from canvas
- [ ] IF/ELSE block splits canvas into two parallel lanes
- [ ] MERGE block rejoins parallel lanes
- [ ] All existing dependency rules are enforced in real-time
- [ ] Invalid drops show appropriate feedback
- [ ] Selected block opens settings panel on right
- [ ] Save button validates before saving
- [ ] Workflow persists and reloads correctly
- [ ] Works in light and dark mode
- [ ] Responsive down to 768px width

---

## 18. Visual Reference

The following generated mockup illustrates the target design:

![Workflow Builder Mockup](/Users/eugene/.gemini/antigravity/brain/e95366ef-5ab8-4c4b-a91f-f9a2d16abdf0/uploaded_image_1768990962418.jpg)

---

## Appendix A: Current Block Dependency Summary

| Block | Requires | Must Come After |
|-------|----------|-----------------|
| PHOTO_SHOOT | PRO_ASSIGNING | PRO_ASSIGNING |
| VIDEO_SHOOT | PRO_ASSIGNING | PRO_ASSIGNING |
| PHOTO_RETOUCHING | RETOUCHER_ASSIGNING | RETOUCHER_ASSIGNING, PHOTO_SHOOT |
| VIDEO_RETOUCHING | RETOUCHER_ASSIGNING | RETOUCHER_ASSIGNING, VIDEO_SHOOT |
| MATCHING | PHOTO_SHOOT | PHOTO_SHOOT |
| MERGE | — | PHOTO_RETOUCHING, VIDEO_RETOUCHING, MODERATION |

## Appendix B: Block Configuration Summary

| Block | Has Config | Config Interface |
|-------|------------|------------------|
| ORDER_CREATED | No | — |
| ITEMS_TO_SHOOT | No | — |
| SST | Yes | `SSTConfig` |
| WAIT_PAYMENT | No | — |
| PRO_ASSIGNING | Yes | `ProAssigningConfig` |
| RETOUCHER_ASSIGNING | Yes | `RetoucherAssigningConfig` |
| PHOTO_SHOOT | No | — |
| VIDEO_SHOOT | No | — |
| PHOTO_RETOUCHING | No | — |
| VIDEO_RETOUCHING | No | — |
| MATCHING | No | — |
| MODERATION | Yes | `ModerationConfig` |
| IF_ELSE | Yes | `IfElseConfig` |
| MERGE | No | — |
| FILE_RENAMING | Yes | `FileRenamingConfig` |
| FILE_STORAGE | Yes | `FileStorageConfig` |
| EXTERNAL_PROCESS | Yes | `ExternalProcessConfig` |
| SEND_NOTIFICATION | Yes | `SendNotificationConfig` |
| SEND_TO_CLIENT | No | — |
