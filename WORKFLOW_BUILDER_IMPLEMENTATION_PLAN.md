# Workflow Builder Implementation Plan

> **Status:** Draft  
> **Version:** 1.0  
> **Created:** 2026-01-21  
> **Specification:** [WORKFLOW_BUILDER_SPECIFICATION.md](./WORKFLOW_BUILDER_SPECIFICATION.md)  
> **Estimated Duration:** 6-8 weeks

---

## Executive Summary

This implementation plan transforms the existing toggle-based Workflow Tab into a visual drag-and-drop workflow builder. The work is divided into **6 phases** with a total of **40 tasks**. Each phase builds upon the previous one, ensuring stable incremental delivery.

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

- [ ] Validation runs on block add/remove/move
- [ ] Validation is debounced (500ms) to prevent lag
- [ ] Validation state attached to each block
- [ ] Pulsing animation on critical errors
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

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

- [ ] Shows all validation errors
- [ ] Uses HeroUI `Alert` for each error
- [ ] "Fix Automatically" shows preview before applying
- [ ] Preview describes what will be changed
- [ ] User must confirm before auto-fix is applied
- [ ] Save blocked until `isValid: true`
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

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

- [ ] Canvas state correctly converted to `ProjectWorkflowConfig`
- [ ] Loading state shown in save button
- [ ] Save button disabled during save
- [ ] Success toast shown on completion
- [ ] Error toast shown on failure with retry
- [ ] `hasUnsavedChanges` reset after save
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

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

- [ ] Skeleton blocks shown during workflow load
- [ ] HeroUI `Skeleton` component used
- [ ] Spinner in save button during save
- [ ] Spinner in settings panel during config load
- [ ] Validation pulsing outline on affected blocks
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

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

- [ ] Three-panel layout per spec §2.1
- [ ] Block Library 280px fixed
- [ ] Settings 320px when block selected
- [ ] Canvas fills remaining space
- [ ] Workflow title editable
- [ ] Save button in header
- [ ] Works in both light and dark mode
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

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

- [ ] Desktop: three-panel layout
- [ ] Tablet: collapsible library drawer
- [ ] Tablet: slide-over settings panel
- [ ] Mobile not required for initial release (per spec §16)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

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

- [ ] New builder accessible via `/project/workflow-builder`
- [ ] Old toggle-based system preserved at `/project/workflow`
- [ ] Both tabs visible in Project Page navigation
- [ ] Lazy-loaded component (per project patterns)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

**Post-Approval Cleanup Task:**

- [ ] Rename "Workflow Builder" to "Workflow"
- [ ] Change route from `/project/workflow-builder` to `/project/workflow`
- [ ] Remove old `WorkflowTab.tsx` and related files
- [ ] Remove `TemplateSelector.tsx`

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

- [ ] Tab navigates through canvas blocks
- [ ] Delete/Backspace deletes selected block
- [ ] Confirmation modal before delete
- [ ] Escape deselects block or closes panel
- [ ] Focus indicators visible per `dev_instruction_v3.md`
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

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

- [ ] Existing workflow fetched on mount using TanStack Query
- [ ] Skeleton loader shown during fetch
- [ ] Canvas hydrated with existing blocks
- [ ] Block configurations preserved
- [ ] Works with empty workflows (new projects)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

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
└── SaveValidationModal.tsx           # Pre-save validation errors

src/hooks/
├── useWorkflowBuilder.ts             # Canvas state and DnD logic
├── useBlockLibrary.ts                # Library filtering and search
└── useBlockValidation.ts             # Real-time validation

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
- Template management (save as template, start from template)
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
| [NEW] | 19 | New components and hooks |
| [MODIFY] | 6 | Existing files with additions |
| [DELETE] | 0 | No files deleted (old system preserved) |
