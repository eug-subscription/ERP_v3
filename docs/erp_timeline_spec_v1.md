# Order Timeline Configuration Specification

**Version:** 1.0  
**Status:** Draft (pending approval)  
**Last updated:** 2026-02-09

---

## 1. Purpose

Define a configurable, audience-aware timeline view derived from the project workflow. The timeline filters and relabels workflow steps to present only relevant milestones to different stakeholders — clients, professionals (photographers/videographers), and the operations team — without altering the underlying operational workflow.

---

## 2. Problem

Workflows define the complete operational process, including internal steps (file storage, SST processing, retouching assignment queues) that are irrelevant to external stakeholders. Today, all audiences see the same raw workflow, creating confusion and information overload.

**Example:**

Internal workflow:

```
Order Created → Items to Shoot → Pro Assigned → Photo Shoot → SST → 
File Storage → Retouching → Moderation → Send to Client
```

What the client should see:

```
Received → Photo Shoot → Quality Review → Ready for Delivery
```

Same workflow, filtered and relabelled per audience.

---

## 3. Glossary

| Term | Definition |
|:---|:---|
| **Workflow** | The operational sequence of blocks configured in the Workflow Builder tab. Defines what happens internally for each order. |
| **Timeline** | A filtered, relabelled projection of the workflow, configured per audience. Does not alter the workflow itself. |
| **Timeline Step** | One entry in the timeline, mapped 1:1 to a workflow block instance. Each step has visibility and label overrides per audience. |
| **Audience** | A stakeholder group that views the timeline. Three audiences are supported: Client, Pro, and Ops. |
| **Timeline Override** | A user-defined deviation from the default timeline presentation — either hiding a step or renaming it for a specific audience. |
| **Block Instance** | A specific block on the workflow canvas, identified by its unique `id`. The same block type (e.g., `MODERATION`) can appear multiple times as separate instances. |

---

## 4. Audiences

Three fixed audience groups, each with a default visibility rule:

| Audience | Key | Description | Default Visibility |
|:---|:---|:---|:---|
| **Client** | `client` | End customers who placed the order. See delivery-relevant milestones only. | **Visible** |
| **Pro** | `pro` | Photographers, videographers, and retouchers assigned to the order. See steps relevant to their work. | **Visible** |
| **Ops** | `ops` | Internal operations and project managers. See the full operational picture. | **Visible** |

> [!NOTE]
> All audiences default to **visible** for every step. Users opt-out (hide) steps that are irrelevant to each audience, rather than opt-in. This ensures new workflow blocks are immediately visible everywhere until explicitly curated.

---

## 5. Data model

### 5.1 Core principle: Workflow-derived, not standalone

The timeline is **not** a separate entity. It is a projection of the existing workflow, auto-generated from the canvas blocks. Users store only **overrides** — deviations from the defaults.

This means:

- Opening the timeline sidebar immediately shows all workflow blocks with their default labels
- No manual "create timeline" step is needed
- Adding a block to the workflow automatically adds it to the timeline
- Removing a block from the workflow automatically removes it from the timeline

### 5.2 Override structure

```typescript
/**
 * Audience-specific presentation override for a single timeline step.
 * Only non-default values need to be stored.
 */
interface TimelineStepOverride {
  /** Hide this step from the audience. Default: false (visible). */
  visible?: boolean;
  /** Custom label for this audience. Default: block's label from the canvas. */
  label?: string;
  /** Custom description for this audience. Default: audience-specific template or empty. */
  description?: string;
}

/**
 * Per-audience overrides for a single block instance.
 * Keys are audience identifiers. Absent keys = use defaults.
 */
interface TimelineBlockOverrides {
  client?: TimelineStepOverride;
  pro?: TimelineStepOverride;
  ops?: TimelineStepOverride;
}

/**
 * Complete timeline configuration for a workflow.
 * Stored alongside the workflow canvas state.
 * Keys are block instance IDs (CanvasBlock.id).
 */
interface TimelineConfig {
  steps: Record<string, TimelineBlockOverrides>;
}
```

### 5.3 Resolution logic

For any block instance and audience, the resolved timeline step is:

```
resolved.visible     = overrides[blockId]?.[audience]?.visible     ?? DEFAULT_AUDIENCE_VISIBILITY[blockType]?.[audience] ?? true
resolved.label       = overrides[blockId]?.[audience]?.label       ?? DEFAULT_AUDIENCE_LABELS[blockType]?.[audience] ?? block.label
resolved.description = overrides[blockId]?.[audience]?.description ?? DEFAULT_AUDIENCE_DESCRIPTIONS[blockType]?.[audience] ?? ''
```

If `resolved.visible` is `false`, the step is omitted from that audience's timeline.

### 5.4 Ordering

Timeline steps follow the **workflow canvas order** (top-to-bottom within each branch, main branch first). No independent reordering is supported in v1.

### 5.5 Lifecycle and cleanup

| Event | Behaviour |
|:---|:---|
| Block added to canvas | Appears in timeline sidebar with defaults (visible, original label). No override entry created. |
| Block removed from canvas | Override entry for that block ID is cleaned up (deleted from `steps`). |
| Block reordered on canvas | Timeline order updates automatically (derived from canvas order). |
| Block label changed on canvas | Timeline steps without a label override reflect the new label. Steps with an explicit label override retain their custom label. |
| Workflow saved without timeline changes | `TimelineConfig.steps` may be empty `{}` — all defaults apply. |

---

## 6. UI specification

### 6.1 Entry point

A **"Timeline"** button in the Workflow Builder header bar, placed to the left of "Use Template". Icon: `lucide:milestone`.

```
[☰ Library]  Workflow Builder                    [Timeline] [Use Template] [Save ▾]
```

Clicking opens a right sidebar modal using the existing `sidebarModalStyles` pattern (matching the Override modal from Pricing Beta tab).

### 6.2 Sidebar layout

```
┌──────────────────────────────────┐
│ ⏱ Timeline Configuration      ✕ │
├──────────────────────────────────┤
│                                  │
│  Audience: [Client | Pro | Ops]  │  ← Tab selector
│                                  │
│  ┌── Order Created ────────────┐ │
│  │ ☑ Visible                   │ │  ← Toggle
│  │ Label: [Order Created     ] │ │  ← Input (editable)
│  └─────────────────────────────┘ │
│                                  │
│  ┌── Photo Shoot ──────────────┐ │
│  │ ☑ Visible                   │ │
│  │ Label: [Photo Session     ] │ │  ← Custom label override
│  └─────────────────────────────┘ │
│                                  │
│  ┌── SST Processing ───────────┐ │
│  │ ☐ Hidden                    │ │  ← Toggled off for client
│  └─────────────────────────────┘ │
│                                  │
│  ┌── Moderation ───────────────┐ │
│  │ ☑ Visible                   │ │
│  │ Label: [Quality Review    ] │ │
│  └─────────────────────────────┘ │
│                                  │
│  ─── Preview ─────────────────── │
│  ● Order Created                 │
│  ● Photo Session                 │  ← Live preview of resolved
│  ● Quality Review                │     timeline for selected audience
│  ● Send to Client                │
│                                  │
├──────────────────────────────────┤
│  [Reset Defaults]       [Save]   │
└──────────────────────────────────┘
```

### 6.3 Component breakdown

| Component | Description |
|:---|:---|
| **Audience Tabs** | HeroUI `Tabs` component. Three tabs: Client, Pro, Ops. Switching tabs shows the overrides for that audience. |
| **Step Card** | One card per workflow block instance. Shows: block icon + original name (read-only subtitle), visibility toggle, label input, description textarea. Collapsed when hidden (toggle off = card collapses to a single line). |
| **Label Input** | HeroUI `TextField`. Pre-filled with the block's canvas label. Only appears when step is visible. Clearing the field resets to the default label. |
| **Description Input** | HeroUI `TextField` wrapping `TextArea`. Pre-filled with audience-specific default description template. Shows placeholder tokens like `{User Role and Name}`. |
| **Visibility Toggle** | HeroUI `Switch`. ON = visible in this audience's timeline. OFF = hidden. |
| **Preview Strip** | A compact vertical timeline at the bottom. Shows resolved steps with label, description (truncated, tooltip on hover), and timestamp placeholder. Updates live as toggles, labels, and descriptions change. |
| **Reset Defaults** | Clears all overrides for the currently selected audience (or all audiences — TBD based on UX preference). |
| **Save** | Persists the `TimelineConfig` alongside the workflow. |

### 6.4 Interaction rules

- Switching audience tabs retains unsaved changes across tabs (changes are held in local state until Save).
- The preview strip updates instantly on every toggle/label change — no save required for preview.
- When a step is toggled to hidden, the label input collapses smoothly (animation via HeroUI Disclosure or CSS transition).
- The step list is read-only in terms of ordering — no drag-to-reorder.

---

## 7. Persistence

The `TimelineConfig` is stored as a property on the workflow's saved state, alongside `WorkflowCanvasState`. It is:

- Saved when the user clicks "Save" in the timeline sidebar (or when the workflow itself is saved).
- Loaded when the workflow is loaded.
- Included in workflow templates (so templates carry timeline configuration).

### 7.1 Storage location

```typescript
interface ProjectWorkflowConfig {
  projectId: string;
  templateId: string;
  branches: WorkflowBranch[];
  timelineConfig?: TimelineConfig;  // NEW — timeline overrides
}
```

### 7.2 Template behaviour

When saving a workflow as a template, the `TimelineConfig` is included. When applying a template, the timeline overrides are applied alongside the workflow structure. Block IDs in the template's timeline config are remapped to the new block instance IDs generated during template application.

---

## 8. Scope boundaries (v1)

### In scope

- Timeline sidebar modal with audience tabs
- Per-step visibility toggle and custom label
- Three audiences: Client, Pro, Ops
- Live preview of resolved timeline
- Persistence alongside workflow
- Cleanup on block add/remove
- Template inclusion

### Out of scope (future versions)

- Independent step reordering (beyond workflow order)
- Custom step icons or colours per audience
- Step grouping or collapsing (e.g., merge 3 steps into 1 milestone)
- Notification configuration per step (e.g., "notify client when this step completes")
- Timeline preview outside the workflow builder (e.g., client portal preview)
- Conditional visibility based on order properties (e.g., show "Video Editing" step only if order contains video)
- Timeline analytics (e.g., average time per step)

---

## 9. Example scenarios

### 9.1 Standard photo workflow

**Workflow blocks:**

1. Order Created
2. Items to Shoot
3. Pro Assigned
4. Photo Shoot
5. SST Processing
6. File Storage
7. Retouching
8. Moderation
9. Send to Client

**Timeline configuration (Client audience):**

| Block | Visible | Label |
|:---|:---|:---|
| Order Created | ✅ | "Order Received" |
| Items to Shoot | ❌ | — |
| Pro Assigned | ✅ | "Photographer Assigned" |
| Photo Shoot | ✅ | "Photo Session" |
| SST Processing | ❌ | — |
| File Storage | ❌ | — |
| Retouching | ✅ | "Photo Enhancement" |
| Moderation | ✅ | "Quality Review" |
| Send to Client | ✅ | "Ready for Delivery" |

**Client sees:** Order Received → Photographer Assigned → Photo Session → Photo Enhancement → Quality Review → Ready for Delivery

**Stored overrides (sparse):**

```json
{
  "steps": {
    "order-created-1": { "client": { "label": "Order Received" } },
    "items-to-shoot-1": { "client": { "visible": false } },
    "pro-assigned-1": { "client": { "label": "Photographer Assigned" } },
    "photo-shoot-1": { "client": { "label": "Photo Session" } },
    "sst-1": { "client": { "visible": false } },
    "file-storage-1": { "client": { "visible": false } },
    "retouching-1": { "client": { "label": "Photo Enhancement" } },
    "moderation-1": { "client": { "label": "Quality Review" } },
    "send-to-client-1": { "client": { "label": "Ready for Delivery" } }
  }
}
```

### 9.2 Retouching with revision loop

**Workflow blocks:**

1. Order Created
2. Retouching
3. Moderation (on reject → loops back to Retouching)
4. Send to Client

**Client timeline configuration:**

| Block | Visible | Label |
|:---|:---|:---|
| Order Created | ✅ | "Received" |
| Retouching (`retouching-1`) | ✅ | "Enhancement" |
| Moderation (`moderation-1`) | ✅ | "Quality Review" |
| Send to Client | ✅ | "Delivered" |

When a revision occurs, the client sees the "Enhancement" and "Quality Review" steps re-activate in sequence — same instance IDs, same labels.

### 9.3 Pro audience for the same workflow

**Pro timeline for scenario 9.1:**

| Block | Visible | Label |
|:---|:---|:---|
| Order Created | ✅ | (default) |
| Items to Shoot | ✅ | (default) |
| Pro Assigned | ✅ | "Your Assignment" |
| Photo Shoot | ✅ | (default) |
| SST Processing | ✅ | (default) |
| File Storage | ❌ | — |
| Retouching | ❌ | — |
| Moderation | ❌ | — |
| Send to Client | ✅ | "Delivery" |

**Pro sees:** Order Created → Items to Shoot → Your Assignment → Photo Shoot → SST Processing → Delivery

---

## 10. Relationship to other specifications

| Specification | Relationship |
|:---|:---|
| **ERP Pricing Spec (v1.7)** | Independent. Timeline configuration does not affect pricing, billing, or rate items. |
| **Workflow Builder** | Timeline is a presentation layer on top of the workflow. It reads workflow block instances but does not modify them. |
| **Order Execution** | Future: orders use the resolved timeline to show progress to each audience. This spec defines the configuration; order-level timeline rendering is a separate implementation concern. |
