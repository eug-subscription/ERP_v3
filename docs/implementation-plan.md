# HeroUI v3 Beta.7 — Implementation Plan

> **Prerequisite:** Read `docs/report.md` for full context on each breaking change.

---

## Phase 1 — Remove `hideSeparator` from Tabs

**Dependency:** None. Start here.

### Task 1.1 — `ModifierInput.tsx`

- **File:** `src/components/pricing/ModifierInput.tsx`
- **Change:** Remove the `hideSeparator` prop from line 70.
- **Before:**

  ```tsx
  <Tabs
      selectedKey={type}
      onSelectionChange={(key) => onTypeChange(key as ModifierType)}
      className="w-full"
      hideSeparator
  >
  ```

- **After:**

  ```tsx
  <Tabs
      selectedKey={type}
      onSelectionChange={(key) => onTypeChange(key as ModifierType)}
      className="w-full"
  >
  ```

- **Acceptance:**
  - [ ] TypeScript compiles with no errors
  - [ ] `% Percent` / `$ Fixed` tabs render without separator lines (same appearance as before)

---

## Phase 2 — Add `<Tabs.Separator />` to standard Tabs

**Dependency:** Phase 1 must be verified complete.

The pattern is consistent across all tasks: add `<Tabs.Separator />` as the first child inside every `<Tabs.Tab>` **except the first tab**. For dynamically rendered tabs (`.map()`), use the `index` parameter.

### Task 2.1 — `TabNavigation.tsx`

- **File:** `src/components/TabNavigation.tsx`
- **Change:** Add `index` to the `.map()` callback (line 46) and insert `{index > 0 && <Tabs.Separator />}` inside each `<Tabs.Tab>`.
- **Before:**

  ```tsx
  {sections.map((section) => (
    <Tabs.Tab key={section.id} id={section.id}>
      <div className="flex items-center gap-2 px-2">
        <Icon icon={section.icon} className="w-4 h-4" />
        <span className="font-medium">{section.name}</span>
      </div>
      <Tabs.Indicator />
    </Tabs.Tab>
  ))}
  ```

- **After:**

  ```tsx
  {sections.map((section, index) => (
    <Tabs.Tab key={section.id} id={section.id}>
      {index > 0 && <Tabs.Separator />}
      <div className="flex items-center gap-2 px-2">
        <Icon icon={section.icon} className="w-4 h-4" />
        <span className="font-medium">{section.name}</span>
      </div>
      <Tabs.Indicator />
    </Tabs.Tab>
  ))}
  ```

- **Acceptance:**
  - [ ] Separator `|` lines visible between all 8 navigation tabs
  - [ ] First tab has no leading separator

### Task 2.2 — `ProjectTabs.tsx`

- **File:** `src/components/ProjectPage/ProjectTabs.tsx`
- **Change:** Add `index` to the `.map()` callback (line 40) and insert `{index > 0 && <Tabs.Separator />}` inside each `<Tabs.Tab>`.
- **Before:**

  ```tsx
  {sections.map((section) => (
    <Tabs.Tab key={section.id} id={section.id}>
      <div className="flex items-center gap-2">
        ...
      </div>
      <Tabs.Indicator />
    </Tabs.Tab>
  ))}
  ```

- **After:**

  ```tsx
  {sections.map((section, index) => (
    <Tabs.Tab key={section.id} id={section.id}>
      {index > 0 && <Tabs.Separator />}
      <div className="flex items-center gap-2">
        ...
      </div>
      <Tabs.Indicator />
    </Tabs.Tab>
  ))}
  ```

- **Acceptance:**
  - [ ] Separator lines visible between all 9 project section tabs
  - [ ] Matches the current visual appearance (Account details | Notifications | Security | …)

### Task 2.3 — `FileUploadSection.tsx`

- **File:** `src/components/FileUploadSection.tsx`
- **Change:** Add `<Tabs.Separator />` as the first child inside tabs `uploading`, `completed`, and `failed` (lines 117, 121, 125). Do NOT add to the `all` tab (first tab).
- **Before:**

  ```tsx
  <Tabs.Tab id="all">
    All ({fileCounts.all})
    <Tabs.Indicator />
  </Tabs.Tab>
  <Tabs.Tab id="uploading">
    Uploading ({fileCounts.uploading})
    <Tabs.Indicator />
  </Tabs.Tab>
  ...
  ```

- **After:**

  ```tsx
  <Tabs.Tab id="all">
    All ({fileCounts.all})
    <Tabs.Indicator />
  </Tabs.Tab>
  <Tabs.Tab id="uploading">
    <Tabs.Separator />
    Uploading ({fileCounts.uploading})
    <Tabs.Indicator />
  </Tabs.Tab>
  ...
  ```

- **Acceptance:**
  - [ ] Separators between All | Uploading | Completed | Failed
  - [ ] First tab (`All`) has no leading separator

### Task 2.4 — `UnmatchedPhotoPanel.tsx`

- **File:** `src/components/Matching/UnmatchedPhotoPanel.tsx`
- **Change:** Add `<Tabs.Separator />` as the first child inside the `grid` tab (line 58).
- **Before:**

  ```tsx
  <Tabs.Tab id="grid">
    Grid view
    <Tabs.Indicator />
  </Tabs.Tab>
  ```

- **After:**

  ```tsx
  <Tabs.Tab id="grid">
    <Tabs.Separator />
    Grid view
    <Tabs.Indicator />
  </Tabs.Tab>
  ```

- **Acceptance:**
  - [ ] Separator visible between List view | Grid view

### Task 2.5 — `TimelineConfigModal.tsx`

- **File:** `src/components/ProjectPage/WorkflowBuilder/TimelineConfigModal.tsx`
- **Change:** Add `index` to the `.map()` callback (line 140) and insert `{index > 0 && <Tabs.Separator />}` inside each `<Tabs.Tab>`.
- **Before:**

  ```tsx
  {(['client', 'pro', 'ops'] as TimelineAudience[]).map(audience => (
    <Tabs.Tab key={audience} id={audience}>
      <div className="flex items-center gap-2">
        ...
      </div>
      <Tabs.Indicator />
    </Tabs.Tab>
  ))}
  ```

- **After:**

  ```tsx
  {(['client', 'pro', 'ops'] as TimelineAudience[]).map((audience, index) => (
    <Tabs.Tab key={audience} id={audience}>
      {index > 0 && <Tabs.Separator />}
      <div className="flex items-center gap-2">
        ...
      </div>
      <Tabs.Indicator />
    </Tabs.Tab>
  ))}
  ```

- **Acceptance:**
  - [ ] Separators visible between Client | Pro | Ops tabs

### Task 2.6 — `TemplateSelectorModal.tsx`

- **File:** `src/components/ProjectPage/WorkflowBuilder/TemplateSelectorModal.tsx`
- **Change:** Add `<Tabs.Separator />` to the `user` tab (line 87).
- **Before:**

  ```tsx
  <Tabs.Tab id="system">System Templates<Tabs.Indicator /></Tabs.Tab>
  <Tabs.Tab id="user">My Templates<Tabs.Indicator /></Tabs.Tab>
  ```

- **After:**

  ```tsx
  <Tabs.Tab id="system">System Templates<Tabs.Indicator /></Tabs.Tab>
  <Tabs.Tab id="user"><Tabs.Separator />My Templates<Tabs.Indicator /></Tabs.Tab>
  ```

- **Acceptance:**
  - [ ] Separator visible between System Templates | My Templates

### Phase 2 — Verification Gate

- [ ] Run `npm run build` — zero TypeScript errors
- [ ] Visual review: all 6 files produce separator lines matching current beta.6 appearance
- [ ] Confirm `FilterBar.tsx` and `RateManagementPage.tsx` pill-style tabs are visually unchanged (no separators, as before)

---

## Phase 3 — Migrate DateInputGroup

**Dependency:** Phase 2 must be verified complete.

### Task 3.1 — `OrderInfo.tsx` — Import

- **File:** `src/components/OrderInfo.tsx`
- **Change:** Remove `DateInputGroup` from the import statement (line 11).
- **Before:**

  ```tsx
  import {
    Card, Separator, Button, Input, Select, Label,
    DateField, TimeField, DateInputGroup,
    ListBox, TagGroup, Tag, Chip,
  } from "@heroui/react";
  ```

- **After:**

  ```tsx
  import {
    Card, Separator, Button, Input, Select, Label,
    DateField, TimeField,
    ListBox, TagGroup, Tag, Chip,
  } from "@heroui/react";
  ```

- **Acceptance:**
  - [ ] No import error for `DateInputGroup`

### Task 3.2 — `OrderInfo.tsx` — DateField block

- **File:** `src/components/OrderInfo.tsx`
- **Change:** Replace `DateInputGroup` → `DateField.Group`, `DateInputGroup.Input` → `DateField.Input`, `DateInputGroup.Segment` → `DateField.Segment` (lines 238–242).
- **Before:**

  ```tsx
  <DateInputGroup>
    <DateInputGroup.Input>
      {(segment) => <DateInputGroup.Segment segment={segment} />}
    </DateInputGroup.Input>
  </DateInputGroup>
  ```

- **After:**

  ```tsx
  <DateField.Group>
    <DateField.Input>
      {(segment) => <DateField.Segment segment={segment} />}
    </DateField.Input>
  </DateField.Group>
  ```

- **Acceptance:**
  - [ ] Date field segments render in the Order Details schedule editor
  - [ ] Date segments are interactive (clickable, keyboard navigable)

### Task 3.3 — `OrderInfo.tsx` — TimeField block

- **File:** `src/components/OrderInfo.tsx`
- **Change:** Replace `DateInputGroup` → `TimeField.Group`, `DateInputGroup.Input` → `TimeField.Input`, `DateInputGroup.Segment` → `TimeField.Segment` (lines 255–259).
- **Before:**

  ```tsx
  <DateInputGroup>
    <DateInputGroup.Input>
      {(segment) => <DateInputGroup.Segment segment={segment} />}
    </DateInputGroup.Input>
  </DateInputGroup>
  ```

- **After:**

  ```tsx
  <TimeField.Group>
    <TimeField.Input>
      {(segment) => <TimeField.Segment segment={segment} />}
    </TimeField.Input>
  </TimeField.Group>
  ```

- **Acceptance:**
  - [ ] Time field segments render in the Order Details schedule editor
  - [ ] Time segments are interactive (clickable, keyboard navigable)

### Phase 3 — Verification Gate

- [ ] Run `npm run build` — zero TypeScript errors
- [ ] Order Details → click pencil on Schedule → date and time fields render and function

---

## Phase 4 — Upgrade Dependencies

**Dependency:** Phase 3 must be verified complete.

### Task 4.1 — Update `package.json`

- **File:** `package.json`
- **Change:** Bump both HeroUI packages to beta.7.
- **Before:**

  ```json
  "@heroui/react": "^3.0.0-beta.6",
  "@heroui/styles": "^3.0.0-beta.6",
  ```

- **After:**

  ```json
  "@heroui/react": "^3.0.0-beta.7",
  "@heroui/styles": "^3.0.0-beta.7",
  ```

### Task 4.2 — Install

- **Command:** `npm install`
- **Acceptance:**
  - [ ] `npm install` completes without errors
  - [ ] `node_modules/@heroui/react/package.json` shows version `3.0.0-beta.7`

### Phase 4 — Final Verification Gate

- [ ] `npm run build` — zero errors
- [ ] `npm run dev` — app starts, no console errors
- [ ] Full visual regression check per the verification matrix below

---

## Verification Matrix

| Area | Expected Behavior | How to Verify |
|------|-------------------|---------------|
| TabNavigation | 8 tabs with `|` separators between each | Navigate to any order page, check top nav |
| ProjectTabs | 9 tabs with `|` separators between each | Navigate to any project page, check sub-nav |
| FileUploadSection | 4 tabs with separators: All \| Uploading \| Completed \| Failed | Upload page with active files |
| UnmatchedPhotoPanel | 2 tabs with separator: List view \| Grid view | Matching page |
| TimelineConfigModal | 3 tabs with separators: Client \| Pro \| Ops | Open Timeline Config from workflow builder |
| TemplateSelectorModal | 2 tabs with separator: System Templates \| My Templates | Open template selector from workflow builder |
| FilterBar (pricing) | Pill-style tabs, NO separators | Pricing catalog filter bar |
| RateManagementPage | Pill-style tabs, NO separators | Pricing Catalog main tabs |
| ModifierInput | NO separators (same as before) | Pricing modifier input |
| OrderInfo schedule | Date and time segment editors render and function | Order Details → edit Schedule |
