# Unified Template Model — Design Specification

> **Status:** ✅ Approved  
> **Date:** 2026-01-20  
> **Purpose:** Refactor template system so all templates expose all blocks with preset states

---

## Problem Statement

The current template model creates inconsistency:

- Each template shows a **different subset** of blocks
- Users cannot add blocks that aren't predefined in the template
- Templates feel like incompatible systems rather than presets

---

## Proposed Mental Model

### Current Model

```
Template = Curated block subset
├── Template A: [Block1, Block2, Block5]
├── Template B: [Block1, Block3, Block6]
└── Users can only toggle what's included
```

### New Model

```
Template = Full block set with preset states
├── Every template: [Block1, Block2, Block3, Block4, Block5, Block6, ...]
├── States:           ✓       ✓       ○       ○       ✓       ○
└── Users can toggle ANY block on/off
```

**Key principle:** Structure stays constant, behaviour changes.

---

## Standard Workflow Structure

All templates share the same branch structure:

| Branch | Purpose | Contains |
|--------|---------|----------|
| **Initial Steps** | Shared setup | Order Created, Items to Shoot, SST, Wait Payment |
| **Photo Branch** | Photo pipeline | Pro Assigning, Photo Shoot, Matching, Retouching, Moderation, Delivery |
| **Video Branch** | Video pipeline | Pro Assigning, Video Shoot, Retouching, Delivery |
| **Completion** | Merge & notify | Merge, Notify Client, File Storage |

---

## Complete Block Vocabulary

### Starting Blocks

| Block | Type | Can Be Disabled? |
|-------|------|------------------|
| Order Created | `ORDER_CREATED` | ❌ Always enabled |
| Items to Shoot | `ITEMS_TO_SHOOT` | ✓ |
| SST | `SST` | ✓ |
| Wait Payment | `WAIT_PAYMENT` | ✓ |
| Pro Assigning | `PRO_ASSIGNING` | ✓ |
| Retoucher Assigning | `RETOUCHER_ASSIGNING` | ✓ |

### Processing Blocks

| Block | Type | Can Be Disabled? |
|-------|------|------------------|
| Photo Shoot | `PHOTO_SHOOT` | ✓ |
| Video Shoot | `VIDEO_SHOOT` | ✓ |
| Photo Retouching | `PHOTO_RETOUCHING` | ✓ |
| Video Retouching | `VIDEO_RETOUCHING` | ✓ |
| Matching | `MATCHING` | ✓ |
| File Renaming | `FILE_RENAMING` | ✓ |

### Universal Blocks

| Block | Type | Can Be Disabled? |
|-------|------|------------------|
| Moderation | `MODERATION` | ✓ |
| External Process | `EXTERNAL_PROCESS` | ✓ |
| Send Notification | `SEND_NOTIFICATION` | ✓ |
| If/Else | `IF_ELSE` | ✓ |
| Merge | `MERGE` | ✓ (auto-enabled when branches exist) |

### Finalisation Blocks

| Block | Type | Can Be Disabled? |
|-------|------|------------------|
| Send to Client | `SEND_TO_CLIENT` | ✓ |
| File Storage | `FILE_STORAGE` | ✓ |

---

## Template = Preset Definition

A template becomes a **preset configuration**:

```typescript
interface WorkflowPreset {
    id: string;
    name: string;
    category: 'PRODUCTION' | 'AI_POWERED' | 'HYBRID';
    description: string;
    
    // Preset states: which blocks are enabled by default
    enabledBlocks: WorkflowBlockType[];
    
    // Preset configurations: default config values
    blockConfigs: Record<WorkflowBlockType, BlockConfig>;
}
```

**Example: "Photo Only" preset**

```typescript
{
    id: 'photo-only',
    name: 'Photo Only',
    enabledBlocks: [
        'ORDER_CREATED',
        'ITEMS_TO_SHOOT',
        'WAIT_PAYMENT',
        'PRO_ASSIGNING',
        'PHOTO_SHOOT',
        'MATCHING',
        'MODERATION',
        'SEND_TO_CLIENT'
    ],
    // Video branch blocks exist but are disabled
}
```

---

## UI Changes

### Left Panel (Configuration)

**Before:** Shows only template-defined blocks  
**After:** Shows ALL blocks, organized by branch

Visual states:

- **Enabled block:** Full opacity, toggle ON
- **Disabled block:** Reduced opacity (40%), toggle OFF, still visible
- **Locked block:** Cannot be disabled (e.g., Order Created)

### Preview Panel

- Shows enabled blocks in flow with connections
- Disabled blocks shown as faded/dashed nodes (optional)
- Or: Hide disabled blocks from preview entirely

---

## Migration Path

1. **Keep existing template definitions temporarily**
2. **Create master block list** with all blocks and default configs
3. **Refactor templates** to be preset overlays on master list
4. **Update UI** to render full list with enable/disable states

---

## Resolved Design Decisions

| Question | Decision |
|----------|----------|
| Preview visibility | **Faded** — Disabled blocks appear faded in preview |
| Branch visibility | **Fade** — Empty branches appear faded, not hidden |
| Block dependencies | **Yes** — Validate required block relationships |

---

## Block Positioning Flexibility

Blocks are not fixed to specific positions. The same block can appear at different points depending on the workflow:

### Example: Wait Payment

| Scenario | Position |
|----------|----------|
| Prepaid model | After `ORDER_CREATED` |
| Post-production | After `PHOTO_SHOOT` or `VIDEO_SHOOT` |
| Split payment | Multiple instances at different points |

### Positioning Model

```
Blocks are placed in SLOTS within branches.
Each branch has ordered slots.
Blocks can be dragged to different slots.
```

**Implications:**

- Blocks are not hardcoded to specific branch positions
- UI needs drag-and-drop reordering within branches
- Templates define initial slot positions as presets

---

## Block Dependencies & Validation

Some blocks require other blocks to be present or must follow specific predecessors.

### Required Blocks (Workflow-level)

| Block | Requirement |
|-------|-------------|
| `ORDER_CREATED` | **Always required** — cannot be disabled |
| `SEND_TO_CLIENT` | At least one instance required for valid workflow |

### Predecessor Constraints

| Block | Must Come After |
|-------|-----------------|
| `PHOTO_SHOOT` | `PRO_ASSIGNING` (photographer) |
| `VIDEO_SHOOT` | `PRO_ASSIGNING` (videographer) |
| `MATCHING` | `PHOTO_SHOOT` or `VIDEO_SHOOT` |
| `PHOTO_RETOUCHING` | `RETOUCHER_ASSIGNING` |
| `VIDEO_RETOUCHING` | `RETOUCHER_ASSIGNING` |
| `MERGE` | At least one branch with enabled blocks |

### Validation Rules

1. **On Save:** Validate all constraints before allowing save
2. **Warning indicators:** Show warnings in UI when constraints are violated
3. **Suggested fixes:** Offer to auto-enable required predecessor blocks

**Error example:**

```
⚠️ Cannot save: "Photo Retouching" requires "Retoucher Assigning" to be enabled.
   [Enable Retoucher Assigning] [Cancel]
```

---

## Success Criteria

- [x] Design approved
- [ ] All templates show identical block structure
- [ ] Users can enable/disable any block regardless of template
- [ ] Users can reorder blocks within branches
- [ ] Dependency validation prevents invalid workflows
- [ ] Templates feel like presets, not different products
- [ ] Switching templates changes enabled states, not available blocks
