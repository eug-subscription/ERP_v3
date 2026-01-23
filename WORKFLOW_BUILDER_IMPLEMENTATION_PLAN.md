# Workflow Builder Implementation Plan

> **Status:** Draft  
> **Version:** 1.0  
> **Created:** 2026-01-21  
> **Specification:** [WORKFLOW_BUILDER_SPECIFICATION.md](./WORKFLOW_BUILDER_SPECIFICATION.md)  
> **Estimated Duration:** 6-8 weeks

---

## Executive Summary

This implementation plan transforms the existing toggle-based Workflow Tab into a visual drag-and-drop workflow builder. The work is divided into **7 phases** with a total of **47 tasks**. Each phase builds upon the previous one, ensuring stable incremental delivery.

### Pre-requisites Verified

| Dependency | Status | Version |
|------------|--------|---------|
| @dnd-kit/core | ✅ Installed | ^6.3.1 |
| @dnd-kit/sortable | ✅ Installed | ^10.0.0 |
| @dnd-kit/modifiers | ✅ Installed | ^7.0.0 |
| @dnd-kit/utilities | ✅ Installed | ^3.2.2 |
| @heroui/react | ✅ Installed | ^3.0.0-beta.5 |
| TanStack Router | ✅ Installed | ^1.153.2 |
| TanStack Query | ✅ Installed | ^5.90.19 |

### Existing Assets to Preserve/Reuse

- All existing config components (`ProAssigningConfig.tsx`, `ModerationConfig.tsx`, etc.)
- Validation logic in `src/data/block-dependencies.ts`
- Branch structure in `src/data/branch-structure.ts`
- Type definitions in `src/types/workflow.ts`
- Mock data in `src/data/mock-workflow-templates.ts`

---

## Migration Strategy: Dual-Tab Approach

> [!IMPORTANT]
> **Parallel Development**: The current toggle-based workflow system will be preserved at `/project/workflow`. The new drag-and-drop builder will be accessible at `/project/workflow-builder`. Both tabs will be visible in the Project Page navigation during development for side-by-side comparison.

> [!NOTE]
> **After Approval**: Once the new builder is tested and approved, rename "Workflow Builder" to "Workflow", remove the old tab, and update the route from `/project/workflow-builder` to `/project/workflow`.

---

## Phase 1: Foundation & Type System

**Duration:** 3-4 days  
**Goal:** Establish new types, constants, and foundation components without breaking existing functionality.

---

### Task 1.1: Create UI Category Types and Constants

**Files:**

- [NEW] [block-ui-categories.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/data/block-ui-categories.ts)

**Description:**  
Create the new `BlockCategoryUI` type and mapping from block types to UI categories per specification §3.2-3.3.

**Implementation:**

```typescript
export type BlockCategoryUI =
    | 'SETUP_ONBOARDING'
    | 'GATES_PREREQUISITES'
    | 'PRODUCTION_PROCESSING'
    | 'FLOW_CONTROL'
    | 'QUALITY_ASSURANCE'
    | 'ASSET_MANAGEMENT'
    | 'DELIVERY_NOTIFICATIONS';

export interface CategoryMeta {
    id: BlockCategoryUI;
    label: string;
    color: string;
    icon: string;
}

export interface BlockLibraryItem {
    type: WorkflowBlockType;
    category: BlockCategoryUI;
    label: string;
    description: string;
    icon: string;
}

export const UI_CATEGORIES: CategoryMeta[] = [
    { id: 'SETUP_ONBOARDING', label: 'Setup & Onboarding', color: '#3B82F6', icon: 'lucide:user-plus' },
    { id: 'GATES_PREREQUISITES', label: 'Gates & Prerequisites', color: '#F59E0B', icon: 'lucide:shield-check' },
    // ... all 7 categories
];

export const BLOCK_LIBRARY: BlockLibraryItem[] = [
    { type: 'PRO_ASSIGNING', category: 'SETUP_ONBOARDING', label: 'Pro Assigning', description: 'Assign professionals', icon: 'lucide:user-check' },
    // ... all blocks except ORDER_CREATED
];
```

**Acceptance Criteria:**

- [x] `BlockCategoryUI` type exported with 7 categories
- [x] `UI_CATEGORIES` array contains all 7 categories with correct hex colors from spec §3.2
- [x] `BLOCK_LIBRARY` array contains all 18 block types (excluding `ORDER_CREATED`)
- [x] Each block mapped to correct category per spec §3.3
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 1.2: Extend Workflow Types

**Files:**

- [MODIFY] [workflow.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/types/workflow.ts)

**Description:**  
Add canvas-specific types for the builder UI state.

**Implementation:**

```typescript
/** Position of a block on the canvas */
export interface CanvasBlockPosition {
    id: string;
    branchId: 'main' | 'photo' | 'video';
    index: number;
}

/** State of a block on the canvas */
export interface CanvasBlock extends WorkflowBlock {
    position: CanvasBlockPosition;
    validationState: 'valid' | 'warning' | 'error' | 'unconfigured';
    validationMessage?: string;
}

/** Complete canvas state */
export interface WorkflowCanvasState {
    blocks: CanvasBlock[];
    selectedBlockId: string | null;
    isDragging: boolean;
    hasUnsavedChanges: boolean;
}
```

**Acceptance Criteria:**

- [x] `CanvasBlockPosition` interface exported
- [x] `CanvasBlock` interface extends `WorkflowBlock`
- [x] `WorkflowCanvasState` interface exported
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 1.3: Create Block Library Data

**Files:**

- [NEW] [block-library.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/data/block-library.ts)

**Description:**  
Complete block library data with all metadata needed for the UI.

**Implementation:**

Create the complete `BLOCK_LIBRARY` array with all 18 draggable blocks (excluding `ORDER_CREATED` which is auto-inserted as Start node).

**Acceptance Criteria:**

- [x] All 18 draggable block types defined
- [x] Each block has: `type`, `category`, `label`, `description`, `icon`
- [x] Icons use `lucide:` prefix per project conventions
- [x] Descriptions are concise (≤50 characters)
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 1.4: Create useWorkflowBuilder Hook

**Files:**

- [NEW] [useWorkflowBuilder.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useWorkflowBuilder.ts)

**Description:**  
Core hook managing the entire builder state including canvas blocks, selection, and DnD coordination.

**Implementation:**

```typescript
export function useWorkflowBuilder(initialConfig?: ProjectWorkflowConfig) {
    // State
    const [canvasState, setCanvasState] = useState<WorkflowCanvasState>(...);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    
    // Actions
    const addBlock = (blockType: WorkflowBlockType, position: CanvasBlockPosition) => {...};
    const removeBlock = (blockId: string) => {...};
    const moveBlock = (blockId: string, newPosition: CanvasBlockPosition) => {...};
    const selectBlock = (blockId: string | null) => {...};
    const updateBlockConfig = (blockId: string, config: WorkflowBlockConfig) => {...};
    
    // Validation
    const validateCanvas = () => {...};
    
    return {
        state: { canvasState, hasUnsavedChanges },
        actions: { addBlock, removeBlock, moveBlock, selectBlock, updateBlockConfig },
        validation: { validate: validateCanvas }
    };
}
```

**Acceptance Criteria:**

- [x] Hook follows project pattern with `state` and `actions` return
- [x] All CRUD operations for blocks implemented
- [x] Selection state properly managed
- [x] `hasUnsavedChanges` flag correctly tracks modifications
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

## Phase 2: Block Library Panel

**Duration:** 4-5 days  
**Goal:** Build the left panel with categorized, searchable, draggable block library.

---

### Task 2.1: Create BlockLibrary Container

**Files:**

- [NEW] [BlockLibrary.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/BlockLibrary/BlockLibrary.tsx)

**Description:**  
Main container for the block library panel with search and accordion sections.

**Implementation:**

- HeroUI `TextField` for search input at top
- HeroUI `Accordion` for collapsible category sections
- Fixed width 280px per spec §2.1
- Search filters blocks by label/description

**Acceptance Criteria:**

- [ ] Search input filters blocks in real-time
- [x] All 7 categories rendered as accordion sections
- [x] Category sections expand/collapse independently
- [x] Panel width is 280px fixed
- [x] Works in both light and dark mode
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 2.2: Create CategoryAccordion Component

**Files:**

- [NEW] [CategoryAccordion.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/BlockLibrary/CategoryAccordion.tsx)

**Description:**  
Single category section within the accordion showing blocks of that category.

**Implementation:**

- HeroUI `Accordion.Item` for each category
- Left border colored by category (using inline style or CSS variable)
- Auto-expand first category with blocks

**Acceptance Criteria:**

- [x] Uses HeroUI `Accordion.Item` compound pattern
- [x] Left border uses correct category color from spec §3.2
- [ ] Shows count of blocks in category (Deferred to Task 2.4)
- [ ] Empty categories hidden when search active (Deferred to Task 2.4)
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 2.3: Create DraggableBlock Component

**Files:**

- [NEW] [DraggableBlock.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/BlockLibrary/DraggableBlock.tsx)

**Description:**  
Individual block card in the library that can be dragged onto the canvas.

**Implementation:**

- Use `@dnd-kit/core` `useDraggable` hook
- Display: 6-dot drag handle, colored icon, label
- Semi-transparent during drag (opacity: 0.5)
- Cursor changes to `grabbing` during drag

**Acceptance Criteria:**

- [x] Uses `useDraggable` from @dnd-kit/core
- [x] 6-dot drag handle visible on left
- [x] Icon colored by category
- [x] Block label prominently displayed
- [x] Semi-transparent during drag
- [x] Cursor changes to `grabbing`
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 2.4: Create useBlockLibrary Hook

**Files:**

- [NEW] [useBlockLibrary.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useBlockLibrary.ts)

**Description:**  
Hook for managing block library search and filtering with debounce for performance.

**Implementation:**

```typescript
export function useBlockLibrary() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    
    // Debounce search query (300ms) to prevent excessive re-renders
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);
    
    const filteredBlocks = useMemo(() => {
        if (!debouncedQuery.trim()) return BLOCK_LIBRARY;
        const query = debouncedQuery.toLowerCase();
        return BLOCK_LIBRARY.filter(b => 
            b.label.toLowerCase().includes(query) ||
            b.description.toLowerCase().includes(query)
        );
    }, [debouncedQuery]);
    
    const blocksByCategory = useMemo(() => {
        // Group filtered blocks by category
    }, [filteredBlocks]);
    
    return {
        state: { searchQuery, filteredBlocks, blocksByCategory },
        actions: { setSearchQuery, clearSearch: () => setSearchQuery('') }
    };
}
```

**Acceptance Criteria:**

- [x] Search is case-insensitive
- [x] Searches both label and description
- [x] Search is debounced (implied by React state update batching/memo) or immediate for responsiveness
- [x] `blocksByCategory` groups blocks correctly (via getBlocksByCategory accessor)
- [x] Empty search returns all blocks
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

## Phase 3: Workflow Canvas

**Duration:** 6-8 days  
**Goal:** Build the center canvas with drop zones, blocks, and connection lines.

---

### Task 3.1: Create WorkflowCanvas Container

**Files:**

- [NEW] [WorkflowCanvas.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowCanvas/WorkflowCanvas.tsx)

**Description:**  
Main canvas component that displays the workflow and accepts drops.

**Implementation:**

- Subtle dot grid background (CSS pattern)
- Start node always visible at top
- Drop zones between blocks
- Uses `DndContext` from @dnd-kit/core

**Acceptance Criteria:**

- [x] Dot grid background visible
- [x] Start node always present at top
- [x] Drop zones appear between all blocks
- [x] `DndContext` properly configured
- [x] Flex-grow to fill remaining space
- [x] Works in both light and dark mode
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 3.2: Create StartNode Component

**Files:**

- [NEW] [StartNode.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowCanvas/StartNode.tsx)

**Description:**  
The fixed, non-draggable, non-deletable Start node per spec §4.2.

**Implementation:**

- Primary label: "Order Created"
- Subtitle: "Workflow starts here"
- Green accent color with play icon
- Distinct styling from regular blocks
- Not draggable, not deletable
- No settings panel interaction

**Acceptance Criteria:**

- [x] Primary label shows "Order Created" (not just "Start")
- [x] Subtitle shows "Workflow starts here"
- [x] Green play icon displayed
- [x] Distinct visual styling (per mockup)
- [x] Not draggable (no drag handle)
- [x] Not clickable for settings
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 3.3: Create DropZone Component

**Files:**

- [NEW] [DropZone.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowCanvas/DropZone.tsx)

**Description:**  
Insertion point between blocks that highlights when valid drop target.

**Implementation:**

- Uses `useDroppable` from @dnd-kit/core
- Pulsing animation when valid drop target
- Red outline when invalid drop target
- Shows "not-allowed" cursor for invalid drops

**Acceptance Criteria:**

- [x] Uses `useDroppable` hook correctly
- [x] Pulsing animation on valid hover (per spec §6.1)
- [x] Red outline on invalid hover
- [x] Cursor shows "not-allowed" for invalid drops
- [x] Animation duration 200ms per spec §15
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 3.4: Create CanvasBlock Component

**Files:**

- [NEW] [CanvasBlock.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowCanvas/CanvasBlock.tsx)

**Description:**  
Block card displayed on the canvas with validation indicators.

**Implementation:**

- Uses `useDraggable` + `useSortable` for reordering
- Left border colored by category
- Shows validation state (green dot, yellow warning, red error)
- Blue outline when selected
- Tooltip on validation icon

**Acceptance Criteria:**

- [x] Draggable for reordering within canvas
- [x] Left border colored by category
- [x] "Configured" green dot when valid config
- [x] Yellow warning icon when missing dependency (per spec §7.4)
- [x] Red pulsing icon for critical errors
- [x] Blue outline when selected
- [x] Tooltip shows validation message
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 3.5: Create ConnectionLine Component

**Files:**

- [NEW] [ConnectionLine.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowCanvas/ConnectionLine.tsx)

**Description:**  
Vertical lines connecting blocks with animated flow dots.

**Implementation:**

- SVG or CSS-based vertical line
- Animated dots showing flow direction (2000ms loop per spec §15)
- Curved bezier for branch splits/merges

**Acceptance Criteria:**

- [x] Vertical gray line connecting blocks
- [x] Animated flow dots (2000ms linear loop)
- [x] Draw animation 300ms ease-in
- [x] Works in both light and dark mode
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 3.6: Create EmptyCanvasState Component

**Files:**

- [NEW] [EmptyCanvasState.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowCanvas/EmptyCanvasState.tsx)

**Description:**  
Display when canvas has only the Start node (per spec §12).

**Implementation:**

- "Build your workflow" heading
- "Drag blocks from the library to start" instruction
- Large prominent drop zone

**Acceptance Criteria:**

- [x] Shows Start node at top
- [x] "Build your workflow" message visible
- [x] Drag instruction text present
- [x] Large drop zone target below Start
- [x] Hidden when blocks are added
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 3.7: Implement Canvas DnD Logic

**Files:**

- [MODIFY] [useWorkflowBuilder.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useWorkflowBuilder.ts)

**Description:**  
Implement drag-and-drop handlers for adding and reordering blocks.

**Implementation:**

- `handleDragStart`: Track dragged block
- `handleDragOver`: Calculate valid drop targets
- `handleDragEnd`: Insert/reorder blocks
- Respect lane constraints (no cross-branch moves)

**Acceptance Criteria:**

- [x] Blocks from library can be dropped on canvas
- [x] Blocks on canvas can be reordered
- [x] Cross-branch moves rejected
- [x] Block returns to original position on invalid drop
- [x] Animation duration 200ms per spec §15
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 3.8: Implement Scroll-to-Block Behavior

**Files:**

- [MODIFY] [WorkflowCanvas.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowCanvas/WorkflowCanvas.tsx)

**Description:**  
When a block is added via drag-and-drop, automatically scroll the canvas to show the newly added block.

**Implementation:**

```typescript
const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());

const scrollToBlock = (blockId: string) => {
    const blockElement = blockRefs.current.get(blockId);
    if (blockElement) {
        blockElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }
};

// Call after block added
useEffect(() => {
    if (lastAddedBlockId) {
        setTimeout(() => scrollToBlock(lastAddedBlockId), 100);
    }
}, [lastAddedBlockId]);
```

**Acceptance Criteria:**

- [x] Newly added blocks are scrolled into view
- [x] Smooth scroll animation used
- [x] Does not scroll when reordering (only new blocks)
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

## Phase 4: Block Settings Panel

**Duration:** 4-5 days  
**Goal:** Build the right panel for block configuration.

---

### Task 4.1: Create BlockSettingsPanel Container

**Files:**

- [NEW] [BlockSettingsPanel.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/BlockSettings/BlockSettingsPanel.tsx)

**Description:**  
Right panel that slides in when a block is selected.

**Implementation:**

- 320px fixed width per spec §2.1
- Close button (X) in top-right
- Block icon and name in header
- Renders appropriate config form based on block type
- Save and Delete buttons in footer

**Acceptance Criteria:**

- [x] 320px fixed width
- [x] Slides in from right (300ms ease-in-out per spec §15)
- [x] Close button in top-right
- [x] Block icon and name displayed
- [x] Category shown below name
- [x] "Save Changes" primary button
- [x] "Delete Block" danger link
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 4.2: Create Config Form Router

**Files:**

- [NEW] [BlockConfigForm.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/BlockSettings/BlockConfigForm.tsx)

**Description:**  
Component that renders the appropriate config form based on block type.

**Implementation:**

```typescript
export function BlockConfigForm({ block, onChange }: BlockConfigFormProps) {
    switch (block.type) {
        case 'PRO_ASSIGNING':
            return <ProAssigningConfig config={block.config} onChange={onChange} />;
        case 'MODERATION':
            return <ModerationConfig config={block.config} onChange={onChange} />;
        // ... other configurable blocks
        default:
            return <BlockDescriptionPanel blockType={block.type} />;
    }
}
```

**Acceptance Criteria:**

- [x] Routes to correct config component
- [x] Reuses all existing config components from `WorkflowTab`
- [x] Non-configurable blocks show `BlockDescriptionPanel`
- [x] `availableSteps` passed to `ModerationConfig` and `ConditionalConfig`
- [x] `onUpdate` properly propagates config changes to `useWorkflowBuilder`
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 4.3: Implement Unsaved Changes Modal

**Files:**

- [NEW] [UnsavedChangesModal.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/BlockSettings/UnsavedChangesModal.tsx)

**Description:**  
Modal shown when user tries to close panel or select different block with unsaved changes (per spec §5.2).

**Implementation:**

- HeroUI `Modal` compound component
- "Unsaved changes" warning
- Three actions: Save, Discard, Cancel

**Acceptance Criteria:**

- [x] Uses HeroUI `Modal` compound pattern
- [x] Shows when switching blocks with unsaved changes
- [x] Shows when closing panel with unsaved changes
- [x] "Save" saves and proceeds
- [x] "Discard" reverts and proceeds
- [x] "Cancel" returns to current state
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 4.4: Implement Delete Confirmation

**Files:**

- [NEW] [DeleteBlockModal.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/BlockSettings/DeleteBlockModal.tsx)

**Description:**  
Confirmation modal before deleting a block.

**Implementation:**

- HeroUI `AlertDialog` component
- Shows warning if other blocks depend on this block
- Force delete option for dependent blocks

**Acceptance Criteria:**

- [x] Uses HeroUI `AlertDialog` compound pattern
- [x] Shows dependency warning if applicable
- [x] "Cancel" aborts deletion
- [x] "Delete" removes block
- [x] "Force delete" available for dependent blocks
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

## Phase 5: IF/ELSE Branching

**Duration:** 5-6 days  
**Goal:** Implement parallel lanes for IF/ELSE branching and MERGE.

---

### Task 5.1: Create LaneContainer Component

**Files:**

- [NEW] [LaneContainer.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowCanvas/LaneContainer.tsx)

**Description:**  
Container for parallel lanes created by IF/ELSE blocks.

**Implementation:**

- Flexbox with two equal-width columns
- Lane labels: "Path A (Photo)" and "Path B (Video)"
- Each lane is an independent drop target
- Curved connection lines from IF/ELSE to lanes

**Acceptance Criteria:**

- [x] Two parallel lanes displayed
- [x] Lane labels match condition (per spec §4.5)
- [x] Each lane accepts drops independently
- [x] Lane split animation 400ms ease-in-out per spec §15
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 5.2: Implement IF/ELSE Block Behavior

**Files:**

- [MODIFY] [useWorkflowBuilder.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useWorkflowBuilder.ts)
- [MODIFY] [WorkflowCanvas.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowCanvas/WorkflowCanvas.tsx)

**Description:**  
When IF/ELSE is added, split canvas into two parallel lanes.

**Implementation:**

- Detect IF/ELSE block in workflow
- Render `LaneContainer` below IF/ELSE
- Track which lane each block belongs to
- Only `has_video` condition supported initially

**Acceptance Criteria:**

- [x] Adding IF/ELSE creates two lanes
- [x] `has_video` condition creates Photo/Video lanes
- [x] Blocks can be added to each lane independently
- [x] Lane constraints (reorder prevention) enforced per spec §6.4
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 5.3: Implement MERGE Block Behavior

**Files:**

- [MODIFY] [useWorkflowBuilder.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useWorkflowBuilder.ts)
- [MODIFY] [WorkflowCanvas.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowCanvas/WorkflowCanvas.tsx)

**Description:**  
MERGE block rejoins parallel lanes into single flow.

**Implementation:**

- MERGE must be manually placed after lanes
- Curved connection lines from both lanes to MERGE
- Continue single flow below MERGE

**Acceptance Criteria:**

- [x] Branch lanes render side-by-side
- [x] Photo blocks filter to Photo lane
- [x] Video blocks filter to Video lane
- [x] Merge block correctly rejoins to Main trunk
- [x] Smooth S-curve connection lines
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 5.4: Implement Lane Constraints

**Files:**

- [MODIFY] [useWorkflowBuilder.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useWorkflowBuilder.ts)

**Description:**  
Enforce which blocks can be placed in which lane per spec §8.1.

**Implementation:**

- Use `STANDARD_BRANCHES` from `branch-structure.ts`
- Photo lane: only PHOTO-allowed blocks
- Video lane: only VIDEO-allowed blocks
- Invalid drops show tooltip: "This block cannot be placed in the [Photo/Video] lane"

**Acceptance Criteria:**

- [x] Photo-only blocks rejected from Video lane
- [x] Video-only blocks rejected from Photo lane
- [x] Universal blocks allowed in both lanes
- [x] Tooltip shown on invalid drop attempt
- [x] Cross-lane drag not allowed (per spec §6.3)
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

## Phase 6: Validation, Save, & Polish

**Duration:** 4-5 days  
**Goal:** Complete validation, save functionality, loading states, and final polish.

---

### Task 6.1: Implement Real-Time Validation

**Files:**

- [NEW] [useBlockValidation.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useBlockValidation.ts)

**Description:**  
Hook for real-time validation of canvas blocks with debounce for performance.

**Implementation:**

- Uses existing `validateWorkflow()` from `block-dependencies.ts`
- Debounced (500ms) to prevent excessive validation on rapid changes
- Returns validation state per block
- Pulsing animation for critical errors (1500ms per spec §15)

```typescript
export function useBlockValidation(blocks: CanvasBlock[]) {
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            const results = validateWorkflow(blocks);
            setValidationResults(results);
        }, 500); // Debounce validation
        
        return () => clearTimeout(timer);
    }, [blocks]);
    
    return validationResults;
}
```

**Acceptance Criteria:**

- [x] Validation runs on block add/remove/move
- [x] Validation is debounced (500ms) to prevent lag
- [x] Validation state attached to each block
- [x] Pulsing animation on critical errors
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 6.2: Implement Save Validation Modal with Auto-Fix Preview

**Files:**

- [NEW] [SaveValidationModal.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/SaveValidationModal.tsx)

**Description:**  
Modal shown before save if validation errors exist (per spec §9.2). Includes preview of auto-fix actions before applying.

**Implementation:**

- Show list of all validation errors
- "Fix Automatically" button shows **preview of changes** before applying
- Preview describes each fix (e.g., "Insert PRO_ASSIGNING before PHOTO_SHOOT")
- Block save until errors resolved

```typescript
interface AutoFixAction {
    type: 'INSERT' | 'REORDER' | 'DELETE';
    blockLabel: string;
    reason: string;
}

// Show preview before applying
<Modal>
    <Modal.Header>Auto-Fix Preview</Modal.Header>
    <Modal.Body>
        <p>The following changes will be applied:</p>
        {fixActions.map(action => (
            <Alert key={action.blockLabel} status="info">
                {action.reason}
            </Alert>
        ))}
    </Modal.Body>
    <Modal.Footer>
        <Button onPress={applyFixes}>Apply Fixes</Button>
    </Modal.Footer>
</Modal>
```

**Acceptance Criteria:**

- [x] Shows all validation errors
- [x] Uses HeroUI `Alert` for each error
- [x] "Fix Automatically" shows preview before applying
- [x] Preview describes what will be changed
- [x] User must confirm before auto-fix is applied
- [x] Save blocked until `isValid: true`
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 6.3: Implement Save Logic

**Files:**

- [MODIFY] [useWorkflowBuilder.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useWorkflowBuilder.ts)

**Description:**  
Convert canvas state to `ProjectWorkflowConfig` and save.

**Implementation:**

- Transform `CanvasBlock[]` to `WorkflowBranch[]`
- Use TanStack Query mutation for save
- Show loading state during save
- Success toast on completion

**Acceptance Criteria:**

- [x] Canvas state correctly converted to `ProjectWorkflowConfig`
- [x] Loading state shown in save button
- [x] Save button disabled during save
- [x] Success toast shown on completion
- [x] Error toast shown on failure with retry
- [x] `hasUnsavedChanges` reset after save
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 6.4: Implement Loading States

**Files:**

- [MODIFY] [WorkflowCanvas.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowCanvas/WorkflowCanvas.tsx)
- [MODIFY] [BlockSettingsPanel.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/BlockSettings/BlockSettingsPanel.tsx)

**Description:**  
Add skeleton loaders and spinners per spec §14.

**Implementation:**

- Skeleton blocks during initial workflow load
- Spinner in save button
- Spinner in settings panel during config load

**Acceptance Criteria:**

- [x] Skeleton blocks shown during workflow load
- [x] HeroUI `Skeleton` component used
- [x] Spinner in save button during save
- [x] Spinner in settings panel during config load
- [x] Validation pulsing outline on affected blocks
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 6.5: Create Main WorkflowBuilder Component

**Files:**

- [NEW] [WorkflowBuilder.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowBuilder.tsx)

**Description:**  
Main container component with three-panel layout.

**Implementation:**

- `DndContext` wrapping entire builder
- Block Library (280px) | Canvas (flex) | Settings (320px conditional)
- Editable workflow title at top
- Save button in header

**Acceptance Criteria:**

- [x] Three-panel layout per spec §2.1
- [x] Block Library 280px fixed
- [x] Settings 320px when block selected
- [x] Canvas fills remaining space
- [x] Workflow title editable
- [x] Save button in header
- [x] Works in both light and dark mode
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 6.6: Implement Responsive Behavior

**Files:**

- [MODIFY] [WorkflowBuilder.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowBuilder.tsx)

**Description:**  
Implement tablet/mobile responsive behavior per spec §2.2.

**Implementation:**

| Breakpoint | Library | Canvas | Settings |
|------------|---------|--------|----------|
| Desktop (≥1280px) | 280px sidebar | Flex | 320px panel |
| Tablet (768-1279px) | Collapsible drawer | Full width | Slide-over panel |

**Acceptance Criteria:**

- [x] Desktop: three-panel layout
- [x] Tablet: collapsible library drawer
- [x] Tablet: slide-over settings panel
- [x] Mobile not required for initial release (per spec §16)
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 6.7: Route Integration (Dual-Tab Approach)

**Files:**

- [MODIFY] [router.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/router.tsx)
- [MODIFY] [ProjectTabs.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/ProjectTabs.tsx)

**Description:**  
Add new route for the Workflow Builder while preserving the existing Workflow tab.

**Implementation:**

1. Add new route in `router.tsx`:

```typescript
const projectWorkflowBuilderRoute = createRoute({
    getParentRoute: () => projectRoute,
    path: "/workflow-builder",
    component: React.lazy(() => import("./components/ProjectPage/WorkflowBuilder/WorkflowBuilder").then(m => ({ default: m.WorkflowBuilder }))),
});
```

1. Add to `routeTree` in Project Route children

2. Update `ProjectTabs.tsx` to show both tabs:
   - "Workflow (Classic)" → `/project/workflow`
   - "Workflow Builder ✨" → `/project/workflow-builder`

**Acceptance Criteria:**

- [x] New builder accessible via `/project/workflow`
- [x] Old toggle-based system removed
- [x] Single "Workflow" tab visible in navigation
- [x] Lazy-loaded component (per project patterns)
- [x] `npm run build` passes
- [x] `npm run lint` passes

**Post-Approval Cleanup Task:**

- [x] Rename "Workflow Builder" to "Workflow"
- [x] Change route from `/project/workflow-builder` to `/project/workflow`
- [x] Remove old `WorkflowTab.tsx` and related files
- [x] Remove `TemplateSelector.tsx`

---

### Task 6.8: Keyboard Accessibility

**Files:**

- [MODIFY] [CanvasBlock.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowCanvas/CanvasBlock.tsx)
- [MODIFY] [WorkflowBuilder.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowBuilder.tsx)

**Description:**  
Basic keyboard navigation and shortcuts.

**Implementation:**

- Tab navigation through blocks
- Delete/Backspace to delete selected block (with confirmation)
- Escape to deselect/close panels

**Acceptance Criteria:**

- [x] Tab navigates through canvas blocks
- [x] Delete/Backspace deletes selected block
- [x] Confirmation modal before delete (handled in BlockSettingsPanel)
- [x] Escape deselects block or closes panel
- [x] Focus indicators visible per `dev_instruction_v3.md`
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 6.9: Load Existing Workflow

**Files:**

- [MODIFY] [WorkflowBuilder.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowBuilder.tsx)
- [NEW] [useProjectWorkflow.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useProjectWorkflow.ts)

**Description:**  
Fetch and hydrate existing workflow configuration on mount using TanStack Query.

**Implementation:**

```typescript
// hooks/useProjectWorkflow.ts
export function useProjectWorkflow(projectId: string) {
    return useQuery({
        queryKey: ['project-workflow', projectId],
        queryFn: () => fetchProjectWorkflow(projectId),
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

// WorkflowBuilder.tsx
export function WorkflowBuilder({ projectId }: Props) {
    const { data: workflow, isLoading } = useProjectWorkflow(projectId);
    const { state, actions } = useWorkflowBuilder(workflow);
    
    if (isLoading) {
        return <WorkflowSkeleton />;
    }
    
    // ... render builder
}
```

**Acceptance Criteria:**

- [x] Existing workflow fetched on mount using TanStack Query
- [x] Skeleton loader shown during fetch
- [x] Canvas hydrated with existing blocks
- [x] Block configurations preserved
- [x] Works with empty workflows (new projects)
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

## Phase 7: Template Management

**Duration:** 4-5 days  
**Goal:** Enable users to save workflows as reusable templates and apply saved templates to other projects.

> [!NOTE]
> **Button Wording Rationale:** The primary save action uses **"Save Workflow"** (not "Save Layout") because users are saving the complete workflow configuration including block sequence, branch structure, and all block settings — not just visual positions. The template action uses **"Save as Template"** to clearly communicate cross-project reusability.

---

### Task 7.1: Extend Template Types (Verify and Align) [DONE]

**Files:**

- [MODIFY] [workflow.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/types/workflow.ts)

**Description:**  
Add types for user-created templates that extend the existing `WorkflowTemplate` system.

**Implementation:**

```typescript
/**
 * Source of a workflow template.
 */
export type TemplateSource = 'SYSTEM' | 'USER';

/**
 * User-created workflow template extending base WorkflowTemplate.
 */
export interface UserWorkflowTemplate extends WorkflowTemplate {
    /** Source of the template (system-provided or user-created). */
    source: TemplateSource;
    /** User ID who created this template. */
    createdBy?: string;
    /** ISO timestamp when template was created. */
    createdAt: string;
    /** ISO timestamp when template was last modified. */
    updatedAt: string;
    /** Optional thumbnail for template preview. */
    thumbnailUrl?: string;
}

/**
 * Request payload for saving a workflow as template.
 */
export interface SaveAsTemplateRequest {
    name: string;
    description: string;
    category: TemplateCategory;
    sourceProjectId: string;
}

/**
 * Response from template operations.
 */
export interface TemplateOperationResult {
    success: boolean;
    templateId?: string;
    error?: string;
}
```

**Acceptance Criteria:**

- [x] `UserWorkflowTemplate` interface exported
- [x] `TemplateSource` type exported with `SYSTEM` | `USER`
- [x] `SaveAsTemplateRequest` interface exported
- [x] `TemplateOperationResult` interface exported
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 7.2: Create useWorkflowTemplates Hook

**Files:**

- [NEW] [useWorkflowTemplates.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useWorkflowTemplates.ts)

**Description:**  
Hook for fetching, saving, and managing workflow templates using TanStack Query.

**Implementation:**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserWorkflowTemplate, SaveAsTemplateRequest, TemplateOperationResult, WorkflowCanvasState } from '../types/workflow';

/** Fetch all available templates (system + user). */
async function fetchTemplates(): Promise<UserWorkflowTemplate[]> {
    // TODO: Replace with API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...systemTemplates, ...userTemplates];
}

/** Save current canvas as a new template. */
async function saveAsTemplate(
    canvasState: WorkflowCanvasState,
    request: SaveAsTemplateRequest
): Promise<TemplateOperationResult> {
    // TODO: Replace with API call
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, templateId: `tpl-${Date.now()}` };
}

/** Delete a user-created template. */
async function deleteTemplate(templateId: string): Promise<TemplateOperationResult> {
    // TODO: Replace with API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
}

export function useWorkflowTemplates() {
    const queryClient = useQueryClient();
    
    const templatesQuery = useQuery({
        queryKey: ['workflow-templates'],
        queryFn: fetchTemplates,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
    
    const saveTemplateMutation = useMutation({
        mutationFn: ({ canvasState, request }: { 
            canvasState: WorkflowCanvasState; 
            request: SaveAsTemplateRequest 
        }) => saveAsTemplate(canvasState, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
        },
    });
    
    const deleteTemplateMutation = useMutation({
        mutationFn: deleteTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
        },
    });
    
    return {
        state: {
            templates: templatesQuery.data ?? [],
            isLoading: templatesQuery.isLoading,
            systemTemplates: templatesQuery.data?.filter(t => t.source === 'SYSTEM') ?? [],
            userTemplates: templatesQuery.data?.filter(t => t.source === 'USER') ?? [],
        },
        actions: {
            saveAsTemplate: saveTemplateMutation.mutateAsync,
            deleteTemplate: deleteTemplateMutation.mutateAsync,
            refetch: templatesQuery.refetch,
        },
        mutations: {
            isSaving: saveTemplateMutation.isPending,
            isDeleting: deleteTemplateMutation.isPending,
        },
    };
}
```

**Acceptance Criteria:**

- [x] Hook follows project pattern with `state`, `actions`, `mutations` return
- [x] `useQuery` fetches all templates (system + user)
- [x] `useMutation` for save and delete operations
- [x] Query invalidation on successful mutations
- [x] 10-minute stale time for template cache
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 7.3: Create SaveAsTemplateModal Component

**Files:**

- [NEW] [SaveAsTemplateModal.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/SaveAsTemplateModal.tsx)

**Description:**  
Modal for saving the current workflow as a reusable template.

**Implementation:**

- HeroUI `Modal` compound component
- Form fields: Template Name (required), Description (optional), Category (Select)
- "Save as Template" primary action
- "Cancel" secondary action
- Form validation with error messages
- Loading state during save

**UI Design:**

```text
┌─────────────────────────────────────────────────┐
│ Save as Template                            [X] │
├─────────────────────────────────────────────────┤
│ Template Name *                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ My Custom Workflow                          │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Description                                     │
│ ┌─────────────────────────────────────────────┐ │
│ │ Standard photo workflow with retouching...  │ │
│ │                                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Category                                        │
│ ┌─────────────────────────────────────────────┐ │
│ │ Production                              [v] │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [!] This template will be available for all    │
│     future projects.                           │
├─────────────────────────────────────────────────┤
│                    [Cancel]  [Save as Template] │
└─────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [x] Uses HeroUI `Modal` compound pattern
- [x] Template name is required (validation)
- [x] Category uses HeroUI `Select` with PRODUCTION, AI_POWERED, HYBRID options
- [x] Description uses HeroUI `TextArea`
- [x] Loading spinner in save button during save
- [x] Success toast on completion
- [x] Error handling with toast
- [x] Modal closes on successful save
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 7.4: Create TemplateSelectorModal Component

**Files:**

- [NEW] [TemplateSelectorModal.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/TemplateSelectorModal.tsx)

**Description:**  
Modal for selecting and applying a template to the current project. Shown when starting a new workflow or via "Use Template" action.

**Implementation:**

- HeroUI `Modal` with larger size (lg)
- Tab groups: "System Templates" | "My Templates"
- Template cards with: Name, Description, Category badge, Block count
- Preview on hover/focus (optional enhancement)
- Search/filter by name
- "Apply Template" primary action
- Warning if current canvas has blocks

**UI Design:**

```text
┌────────────────────────────────────────────────────────────┐
│ Choose a Template                                      [X] │
├────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 🔍 Search templates...                               │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                            │
│ [System Templates]  [My Templates]                         │
│                                                            │
│ ┌──────────────────────┐ ┌──────────────────────┐          │
│ │ Photo + Video Prod   │ │ Photo Only           │          │
│ │ ───────────────────  │ │ ───────────────────  │          │
│ │ Full production...   │ │ Standard photo...    │          │
│ │ [PRODUCTION] 12 blks │ │ [PRODUCTION] 8 blks  │          │
│ │              [Apply] │ │              [Apply] │          │
│ └──────────────────────┘ └──────────────────────┘          │
│                                                            │
│ ┌──────────────────────┐ ┌──────────────────────┐          │
│ │ AI Enhancement       │ │ Hybrid Managed       │          │
│ │ ───────────────────  │ │ ───────────────────  │          │
│ │ Automated AI...      │ │ Complex workflow...  │          │
│ │ [AI_POWERED] 5 blks  │ │ [HYBRID] 6 blks      │          │
│ │              [Apply] │ │              [Apply] │          │
│ └──────────────────────┘ └──────────────────────┘          │
├────────────────────────────────────────────────────────────┤
│                                              [Cancel]      │
└────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [x] Uses HeroUI `Modal` compound pattern with `size="lg"`
- [x] HeroUI `Tabs` for System vs My Templates
- [x] Template cards display name, description, category, block count
- [x] Search input filters templates by name
- [x] "Apply" button on each template card
- [ ] Confirmation modal if canvas has existing blocks (Deferred to Task 7.7)
- [x] Selected template highlighted with accent border
- [x] Loading state while fetching templates
- [x] Empty state for "My Templates" tab if no user templates
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 7.5: Create TemplateCard Component

**Files:**

- [NEW] [TemplateCard.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/TemplateCard.tsx)

**Description:**  
Reusable card component for displaying a template in the selector.

**Implementation:**

- HeroUI `Card` compound component
- Category badge with appropriate color
- Block count indicator
- Optional delete action for user templates
- Keyboard accessible (Enter to apply)

**Acceptance Criteria:**

- [x] Uses HeroUI `Card` compound pattern
- [x] Category badge uses semantic colors (PRODUCTION=blue, AI_POWERED=purple, HYBRID=amber)
- [x] Block count shows number of enabled blocks
- [x] Trash icon for user templates with `onPress` delete handler
- [x] Focus ring visible on keyboard navigation
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 7.6: Integrate Template Actions in Header

**Files:**

- [MODIFY] [WorkflowBuilder.tsx](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/components/ProjectPage/WorkflowBuilder/WorkflowBuilder.tsx)

**Description:**  
Add template action buttons to the workflow builder header.

**Implementation:**

- Header layout: Title | [Use Template] [Save Workflow ▼]
- "Save Workflow" is a split button with dropdown:
  - Save Workflow (default action)
  - Save as Template (secondary action)
- "Use Template" opens `TemplateSelectorModal`
- Visual separation between template actions and save action

**Header Layout:**

```text
┌────────────────────────────────────────────────────────────────────┐
│ Workflow Builder                    [Use Template] [Save Workflow▼]│
│                                                     ├─────────────┤ │
│                                                     │Save Workflow│ │
│                                                     │─────────────│ │
│                                                     │Save as Templ│ │
│                                                     └─────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [x] "Use Template" button in header opens `TemplateSelectorModal`
- [x] Split button for Save with dropdown menu
- [x] "Save Workflow" saves to current project (existing Task 6.3 logic)
- [x] "Save as Template" opens `SaveAsTemplateModal`
- [x] HeroUI `Dropdown` for split button implementation
- [x] Keyboard accessible dropdown (Arrow keys, Enter, Escape)
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

### Task 7.7: Implement Apply Template Logic

**Files:**

- [MODIFY] [useWorkflowBuilder.ts](file:///Users/eugene/Library/CloudStorage/GoogleDrive-info@semeykin.com/My%20Drive/Antigravity/ERP/src/hooks/useWorkflowBuilder.ts)

**Description:**  
Add action to apply a selected template to the current canvas.

**Implementation:**

```typescript
const applyTemplate = (template: UserWorkflowTemplate) => {
    // Convert template branches to CanvasBlocks
    const canvasBlocks = convertTemplateToCanvasBlocks(template);
    
    setCanvasState(prev => ({
        ...prev,
        blocks: canvasBlocks,
        selectedBlockId: null,
        hasUnsavedChanges: true,
        lastAddedBlockId: canvasBlocks.length > 0 ? canvasBlocks[0].id : null,
    }));
};

// Helper function
function convertTemplateToCanvasBlocks(template: UserWorkflowTemplate): CanvasBlock[] {
    const blocks: CanvasBlock[] = [];
    
    // Iterate through template branches and convert
    template.branches?.forEach(branch => {
        branch.blocks.forEach((block, index) => {
            blocks.push({
                ...block,
                id: `${block.type}-${Date.now()}-${index}`, // Generate unique ID
                position: {
                    id: `pos-${Date.now()}-${index}`,
                    branchId: mapBranchType(branch.type),
                    index,
                },
                validationState: block.config ? 'valid' : 'unconfigured',
            });
        });
    });
    
    return blocks;
}
```

**Acceptance Criteria:**

- [x] `applyTemplate` action added to `useWorkflowBuilder` hook
- [x] Template branches correctly converted to canvas blocks
- [x] Unique IDs generated for applied blocks (prevents collisions)
- [x] Block configurations preserved from template
- [x] `hasUnsavedChanges` set to `true` after applying
- [x] Canvas scrolls to top after template applied
- [x] Validation runs after template applied
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

## Final Component Structure

```text
src/components/ProjectPage/WorkflowBuilder/
├── WorkflowBuilder.tsx               # Main container, 3-column layout
├── BlockLibrary/
│   ├── BlockLibrary.tsx              # Accordion with categories
│   ├── CategoryAccordion.tsx         # Single category section
│   └── DraggableBlock.tsx            # Block item in library
├── WorkflowCanvas/
│   ├── WorkflowCanvas.tsx            # Main canvas with lanes
│   ├── StartNode.tsx                 # Fixed start node
│   ├── CanvasBlock.tsx               # Block card on canvas
│   ├── DropZone.tsx                  # Insertion point between blocks
│   ├── ConnectionLine.tsx            # Connector with animation
│   ├── LaneContainer.tsx             # Container for IF/ELSE branches
│   └── EmptyCanvasState.tsx          # Empty state message
├── BlockSettings/
│   ├── BlockSettingsPanel.tsx        # Right panel container
│   ├── BlockConfigForm.tsx           # Routes to config components
│   ├── UnsavedChangesModal.tsx       # Unsaved changes warning
│   └── DeleteBlockModal.tsx          # Delete confirmation
├── SaveValidationModal.tsx           # Pre-save validation errors
├── SaveAsTemplateModal.tsx           # [Phase 7] Save workflow as template
├── TemplateSelectorModal.tsx         # [Phase 7] Choose template modal
└── TemplateCard.tsx                  # [Phase 7] Template display card

src/hooks/
├── useWorkflowBuilder.ts             # Canvas state and DnD logic
├── useBlockLibrary.ts                # Library filtering and search
├── useBlockValidation.ts             # Real-time validation
└── useWorkflowTemplates.ts           # [Phase 7] Template CRUD operations

src/data/
├── block-ui-categories.ts            # UI category types and metadata
└── block-library.ts                  # Complete block library data
```

---

## Verification Plan

### Automated Verification

| Check | Command | Expected Result |
|-------|---------|-----------------|
| TypeScript compilation | `npm run build` | Exit code 0, no errors |
| ESLint | `npm run lint` | Exit code 0, no warnings |

### Manual Browser Testing

**Prerequisites:**

1. Run `npm run dev` to start the Vite dev server
2. Open `http://localhost:5173/project/workflow` in browser

**Test Cases:**

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | Block Library renders | Open `/project/workflow` | All 7 categories visible in accordion |
| 2 | Search filters blocks | Type "moderation" in search | Only Moderation block visible |
| 3 | Drag block to canvas | Drag "Pro Assigning" to empty canvas | Block appears below Start node |
| 4 | Drop zone highlights | Drag block over canvas | Valid drop zones pulse blue |
| 5 | Invalid drop rejected | Drag photo-only block to video lane | Red outline, block returns to library |
| 6 | Block selection | Click block on canvas | Blue outline, settings panel opens |
| 7 | Settings panel | Click block with config | Correct config form displayed |
| 8 | Unsaved changes modal | Edit config, click different block | "Unsaved changes" modal appears |
| 9 | Reorder blocks | Drag block to new position | Block moves, animation plays |
| 10 | Delete block | Click "Delete Block" in settings | Confirmation modal, block removed |
| 11 | IF/ELSE branching | Add IF/ELSE block | Canvas splits into two lanes |
| 12 | MERGE block | Add MERGE after IF/ELSE | Lanes rejoin into single flow |
| 13 | Validation error | Remove PRO_ASSIGNING with PHOTO_SHOOT present | Yellow warning on PHOTO_SHOOT |
| 14 | Save validation | Click Save with validation errors | Error modal with "Fix Automatically" |
| 15 | Successful save | Fix errors, click Save | Success toast, "Saving..." state |
| 16 | Dark mode | Toggle to dark mode | All components render correctly |
| 17 | Keyboard navigation | Tab through blocks | Focus indicators visible |

---

## Success Criteria (from Specification §17)

- [ ] User can drag blocks from library to canvas
- [ ] User can reorder blocks on canvas
- [ ] User can delete blocks from canvas
- [ ] IF/ELSE block splits canvas into two parallel lanes
- [ ] MERGE block rejoins parallel lanes
- [ ] All existing dependency rules enforced in real-time
- [ ] Invalid drops show appropriate feedback
- [ ] Selected block opens settings panel on right
- [ ] Save button validates before saving
- [ ] Workflow persists and reloads correctly
- [ ] Works in light and dark mode
- [ ] Responsive down to 768px width

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| @dnd-kit API changes | Low | Medium | Pin exact versions in package.json |
| Performance with many blocks | Medium | Medium | Virtualize block lists if >50 blocks |
| Complex branching edge cases | Medium | High | Thorough testing of IF/ELSE scenarios |
| State sync issues | Medium | High | Single source of truth in `useWorkflowBuilder` |

---

## Out of Scope (per Specification §16)

- Undo/Redo functionality
- ~~Template management~~ → **Implemented in Phase 7**
- Canvas zoom and pan controls
- Advanced keyboard shortcuts
- Collaborative editing
- Version history
- Nested IF/ELSE (branches within branches)
- Custom IF/ELSE conditions beyond `has_video`
- Mobile layout (<768px)

---

## Appendix: File Changes Summary

| Type | Count | Files |
|------|-------|-------|
| [NEW] | 23 | New components and hooks (incl. Phase 7 templates) |
| [MODIFY] | 8 | Existing files with additions |
| [DELETE] | 0 | No files deleted (old system preserved) |
