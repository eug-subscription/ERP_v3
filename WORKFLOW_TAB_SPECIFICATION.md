# Timeline Tab Specification

> **Status:** Implemented (Phase 1 Complete)
> **Purpose:** Definitive reference for Timeline Tab feature
> **Last Updated:** 2026-01-20 (v3 - synced with implementation)

---

## Overview

The **Timeline Tab** (positioned alongside the existing Prices tab on the Project page) enables project administrators to define custom order workflows. Each project can configure the exact sequence of steps that orders will follow—from creation through final delivery.

### Design Approach

**Template-Based with Preview (Simple Mode)** — Users select from predefined workflow templates, toggle optional steps, and configure branch-specific settings. A live preview visualizes the complete workflow.

---

## Block Categories

### Starting Blocks

Blocks that initiate the workflow and establish prerequisites.

| Block | Description | Configuration Fields |
| :--- | :--- | :--- |
| **Order Created** | Universal starting point for all workflows (implicit) | — |
| **Items to Shoot** | Waits until a shot list is created (manually or via link) | *Description only* |
| **SST** | Generates an SST link for client submissions | 5 fields (see detailed section) |
| **Pro Assigning** | Waits for photographer/videographer assignment | 9 fields (see detailed section) |
| **Retoucher Assigning** | Waits for retoucher assignment to the archive | 6 fields (see detailed section) |
| **Wait Payment** | Pauses workflow until payment is received | *Description only* |

### Processing Blocks

Core production activities.

| Block | Description | Configuration Fields |
| :--- | :--- | :--- |
| **Photo Shoot** | Photo capture process through upload completion | *Description only* |
| **Video Shoot** | Video capture process through upload completion | *Description only* |
| **Photo Retouching** | Retouching workflow through final upload | *Description only* |
| **Video Retouching** | Video retouching workflow through final upload | *Description only* |
| **Matching** | Links captured frames to corresponding menu items | *Description only* |
| **File Renaming** | Auto-renames files based on configurable patterns | 4 fields (see detailed section) |

### Finalisation Blocks

Delivery and archival steps.

| Block | Description | Configuration Fields |
| :--- | :--- | :--- |
| **Send to Client** | Delivers completed assets via configured channels | *Description only* |
| **File Storage** | Defines file retention policy | `timeToLife` (0 = forever) |

### Universal Blocks

Flexible blocks insertable at any workflow stage.

| Block | Description | Configuration Fields |
| :--- | :--- | :--- |
| **Moderation** | Quality review with configurable moderator and outcomes | 5 fields (see detailed section) |
| **If/Else** | Conditional branching based on order properties | *Phase 2* |
| **Merge** | Rejoins conditional branches | *Description only* |
| **External Process** | Triggers external automation (e.g., n8n webhook) | `webhookUrl`, Test Connection |
| **Send Notification** | Dispatches custom message to client | `title`, `body`, `channel` |

---

## Detailed Block Configurations

### SST Block

Generates a Self-Service Tool link for client submissions.

| Field | Type | Description |
| :--- | :--- | :--- |
| `userCanAddNewItem` | Switch | Whether users can add items beyond the initial list |
| `domain` | Select | SST domain/branding to use |
| `resourcePack` | Select | Visual resource pack for the SST interface |
| `submitMode` | Switch | Single item or Bulk submission mode |
| `minPhotosToSubmit` | Number | Minimum photos required (conditional on submitMode) |

---

### Pro Assigning Block

Waits for photographer/videographer assignment with detailed configuration.

| Field | Type | Description |
| :--- | :--- | :--- |
| `whoHasAccess` | RadioGroup | ANY_PRO / MANUAL / PROJECT_POOL |
| `welcomeText` | TextField | Message shown to assigned pro |
| `proMustBeConfirmed` | Switch | Require pro to confirm acceptance |
| `photographerSlots` | Number | Number of photographer slots available |
| `defaultPhotoshootDuration` | Number | Default duration in minutes |
| `videographerSlots` | Number | Number of videographer slots available |
| `defaultVideoshootDuration` | Number | Default duration in minutes |
| `showProToClient` | Switch | Whether client sees assigned pro info |
| `minProLevel` | Number | Minimum professional level required |

---

### Retoucher Assigning Block

Waits for retoucher assignment to the archive.

| Field | Type | Description |
| :--- | :--- | :--- |
| `welcomeText` | TextField | Message shown to assigned retoucher |
| `whoHasAccess` | RadioGroup | ANY / MANUAL / PROJECT_POOL |
| `guidelines` | Placeholder | Link to retouching guidelines |
| `needAcceptGuidelines` | Switch | Require retoucher to accept guidelines |
| `showRetoucherToClient` | Switch | Whether client sees retoucher info |
| `minRetoucherLevel` | Number | Minimum retoucher level required |

---

### File Renaming Block

Auto-renames files based on configurable patterns.

| Field | Type | Description |
| :--- | :--- | :--- |
| `autoRenameMode` | Select | NONE / PREFIX / POSTFIX / PATTERN |
| `pattern` | TextField | Custom naming pattern template |
| `customPrefix` | TextField | Prefix to add to filenames |
| `includeDate` | Switch | Include date in renamed files |

---

### Moderation Block

Unified moderation block for internal team and client reviews.

| Field | Type | Description |
| :--- | :--- | :--- |
| `type` | RadioGroup | INTERNAL / EXTERNAL (client) |
| `whoCanAccess` | MultiSelect | Moderators / Retouchers / Photographers (INTERNAL only) |
| `outcomes` | Checkboxes | Approve / Request Revision / Reject |
| `maxRevisions` | Number | Maximum revision rounds (0 = unlimited) |
| `onRejectBlockId` | Select | Block to return to on rejection |

---

### Send Notification Block

Dispatches custom message to client.

| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | TextField | Notification title |
| `body` | TextArea | Notification message body |
| `channel` | Select | EMAIL / SMS / APP / ALL |

---

### External Process Block

Triggers external automation via webhook.

| Field | Type | Description |
| :--- | :--- | :--- |
| `webhookUrl` | TextField | URL to trigger (e.g., n8n endpoint) |
| *Test Connection* | Button | Validates webhook connectivity |

---

### If/Else Block (Phase 2)

Conditional branching based on order properties. Enables dynamic workflow paths.

| Option | Description |
| :--- | :--- |
| **Condition** | Order property to evaluate (e.g., hasVideo, hasPhoto) |
| **True Path** | Branch to follow when condition is true |
| **False Path** | Branch to follow when condition is false (or skip) |
| **Merge Point** | Where branches rejoin (uses Merge block) |

> **Note:** If/Else is planned for Phase 2. Phase 1 uses predefined templates.

---

## Workflow Architectures

### Independent Branches Model

Orders can have **multiple independent branches** that run in parallel after a split point.

* Run in parallel after a split point
* Have their own complete lifecycle
* Deliver to the client independently (at different times)
* Implicitly merge when ALL branches complete → Order marked complete

```
                    ┌─────────────────┐
                    │  ORDER CREATED  │  ◄─ Universal start (implicit)
                    └────────┬────────┘
                             │
                    [Shared Starting Blocks]
                             │
           ╔══════════════════╧══════════════════╗
           ║              SPLIT                  ║
           ╚══════════════════╤══════════════════╝
                             │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌─────────────┐                             ┌─────────────┐
│  BRANCH A   │                             │  BRANCH B   │
│  (Photo)    │                             │  (Video)    │
│             │                             │             │
│  Own steps  │                             │  Own steps  │
│  Own timing │                             │  Own timing │
│  Own deliver│                             │  Own deliver│
└──────┬──────┘                             └──────┬──────┘
       │                                           │
       └─────────────────────┬─────────────────────┘
                             │
           ╔══════════════════╧══════════════════╗
           ║         ORDER COMPLETE              ║  ◄─ When ALL branches done
           ╚═════════════════════════════════════╝
```

---

## Workflow Examples

### Example 1: Photo + Video Production

Full production order with independent photo and video branches, different delivery timelines.

* Split occurs BEFORE Pro Assigning (different pros for photo/video)
* Photo branch: No retouching, delivers same day
* Video branch: Includes retouching, delivers +2 days
* Order complete only when BOTH deliveries done

```
                          ┌─────────────────┐
                          │  ORDER CREATED  │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │  Items to Shoot │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │  Wait Payment   │
                          └────────┬────────┘
                                   │
               ╔═══════════════════╧═══════════════════╗
               ║               SPLIT                   ║
               ╚═══════════════════╤═══════════════════╝
                                   │
          ┌────────────────────────┴────────────────────────┐
          │                                                 │
          ▼                                                 ▼
┌─────────────────┐                               ┌─────────────────┐
│   📸 PHOTO      │                               │   🎬 VIDEO      │
│   BRANCH        │                               │   BRANCH        │
└────────┬────────┘                               └────────┬────────┘
         │                                                 │
┌────────▼────────┐                               ┌────────▼────────┐
│  Pro Assigning  │                               │  Pro Assigning  │
│  (Photographer) │                               │  (Videographer) │
└────────┬────────┘                               └────────┬────────┘
         │                                                 │
┌────────▼────────┐                               ┌────────▼────────┐
│  Photo Shoot    │                               │  Video Shoot    │
└────────┬────────┘                               └────────┬────────┘
         │                                                 │
┌────────▼────────┐                               ┌────────▼────────┐
│  Matching       │                               │  Retoucher      │
└────────┬────────┘                               │  Assigning      │
         │                                        └────────┬────────┘
┌────────▼────────┐                                        │
│  📤 Send Photos │  ◄─ Same day                  ┌────────▼────────┐
│  to Client      │                               │  Video          │
└────────┬────────┘                               │  Retouching     │
         │                                        └────────┬────────┘
         │                                                 │
         │                                        ┌────────▼────────┐
         │                                        │  📤 Send Video  │  ◄─ +2 days
         │                                        │  to Client      │
         │                                        └────────┬────────┘
         │                                                 │
         └────────────────────────┬────────────────────────┘
                                   │
               ╔═══════════════════╧═══════════════════╗
               ║           ORDER COMPLETE              ║
               ╚═══════════════════════════════════════╝
```

---

### Example 2: AI Enhancement Only

Streamlined workflow for AI-powered photo enhancement. Client uploads photos, AI processes them.

> **Note:** AI Enhancement uses External Process block (via n8n webhook).

```
                          ┌─────────────────┐
                          │  ORDER CREATED  │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │  Wait Payment   │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │  External       │  ◄─ AI Enhancement
                          │  Process        │     via n8n webhook
                          │  (AI Enhance)   │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │  Internal       │  ◄─ Optional QA review
                          │  Moderation     │
                          │  (Optional)     │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │  📤 Send to     │
                          │  Client         │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │  File Storage   │
                          └────────┬────────┘
                                   │
               ╔═══════════════════╧═══════════════════╗
               ║           ORDER COMPLETE              ║
               ╚═══════════════════════════════════════╝
```

---

## UI Design

### Layout Structure

**Template-based with Preview** structure ensures visual consistency across projects.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Project: [Project Name]                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  [Account] [Notifications] [Security] [Managers] [Prices] [Timeline] [Settings] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────┐  ┌──────────────────────────────────┐   │
│  │  WORKFLOW CONFIGURATION            │  │  PREVIEW                         │   │
│  │  ──────────────────────────────────│  │  ────────────────────────────────│   │
│  │                                    │  │                                  │   │
│  │  Base Template:                    │  │       ┌─────────┐                │   │
│  │  ┌─────────────────────────────┐   │  │       │ Order   │                │   │
│  │  │  Photo + Video Production ▼ │   │  │       │ Created │                │   │
│  │  └─────────────────────────────┘   │  │       └────┬────┘                │   │
│  │                                    │  │            │                     │   │
│  │  ──────────────────────────────────│  │       ┌────▼────┐                │   │
│  │                                    │  │       │ Items   │                │   │
│  │  📸 PHOTO BRANCH                   │  │       └────┬────┘                │   │
│  │  ┌────────────────────────────┐    │  │            │                     │   │
│  │  │ ✓ Pro Assigning            │    │  │       ┌────▼────┐                │   │
│  │  │ ✓ Photo Shoot              │    │  │       │ Payment │                │   │
│  │  │ ○ Photo Retouching         │    │  │       └────┬────┘                │   │
│  │  │ ✓ Matching                 │    │  │       ┌────┴────┐                │   │
│  │  │ ✓ Send to Client           │    │  │       ▼         ▼                │   │
│  │  └────────────────────────────┘    │  │   ┌──────┐  ┌──────┐             │   │
│  │    Delivery: [Same day ▼]          │  │   │Photo │  │Video │             │   │
│  │                                    │  │   │Branch│  │Branch│             │   │
│  │  🎬 VIDEO BRANCH                   │  │   └──┬───┘  └──┬───┘             │   │
│  │  ┌────────────────────────────┐    │  │      │         │                 │   │
│  │  │ ✓ Pro Assigning            │    │  │      └────┬────┘                 │   │
│  │  │ ✓ Video Shoot              │    │  │           ▼                      │   │
│  │  │ ✓ Video Retouching         │    │  │      ┌─────────┐                 │   │
│  │  │ ✓ Send to Client           │    │  │      │Complete │                 │   │
│  │  └────────────────────────────┘    │  │      └─────────┘                 │   │
│  │    Delivery: [+2 days ▼]           │  │                                  │   │
│  │                                    │  │  ────────────────────────────────│   │
│  │  ──────────────────────────────────│  │  📸 Photo: Same day delivery     │   │
│  │                                    │  │  🎬 Video: +2 days delivery      │   │
│  │                                    │  │                                  │   │
│  └────────────────────────────────────┘  └──────────────────────────────────┘   │
│                                                                                 │
│                                                      [Reset]  [Save Workflow]   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Notes

### Order Instance Model

1. Project's workflow template is **copied** to the order instance.
2. Order tracks: `currentBlock`, `completedBlocks[]`, `blockMetadata{}`.
3. Changes do NOT affect in-flight orders.

### Order Tracking

| Level | What It Shows | Example |
| :--- | :--- | :--- |
| **Block Status** | Current state of the block | "Photo Shoot: In Progress" |
| **Sub-Status** | Detailed progress within block | "Uploading batch 2 of 3" |
| **Batch Tracking** | Multiple uploads/iterations | "Batch 1: ✓ 15 photos" |

### Validation Rules

* Every workflow must have at least one path to completion.
* No orphaned blocks (all blocks must connect to the flow).
* At least one finalisation block per branch.
* Warning if no payment block is included.

---

## Implementation Status

| Phase | Status |
| :--- | :--- |
| Phase 1: Block Configurations | ✅ Complete |
| Phase 2: If/Else & Conditional Logic | ✅ Complete |
| Phase 3: Backend API Integration | 🔲 Planned |

---

*Last updated: 2026-01-20*
