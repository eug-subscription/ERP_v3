# Contact Edit Modal — Data Binding Issues

During the implementation of the `ContactEditModal`, two issues were identified that prevented the UI from updating after saving edits:

## 1. React Query & Reference Equality (Cache Invalidation)

**The Problem:**
In `useUpdateContacts.ts`, we mutated `mockOrderData` in-place (`mockOrderData.contact = ...`). When `queryClient.invalidateQueries({ queryKey: ["order"] })` triggered a re-fetch, `useOrder.ts` returned the exact same `mockOrderData` object reference.
Because TanStack Query uses structural sharing and reference equality (`oldData === newData`), it concluded that the data had not changed, completely bypassing a UI re-render.

**The Solution:**
`useOrder.ts` must return a fresh object reference when "fetching" the mock data to simulate a new network response:

```typescript
// useOrder.ts
async function fetchOrderData(): Promise<OrderData> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  // Return a new reference so TanStack Query detects the change
  return { ...mockOrderData };
}
```

## 2. HeroUI v3 Compound Components (Input Value Placement)

**The Problem:**
In `ContactEditModal.tsx`, the `value` prop was passed to the parent `<TextField>` component.
In HeroUI v3's compound component pattern, the `value` and `onChange` props must be passed directly to the nested `<Input>` slot. Because it was on the parent, the `Input` functioned as an uncontrolled component on initial render and failed to correctly bind to the React state `onOpenChange`.

**The Solution:**
Move the `value` prop down from `<TextField>` to `<Input>`:

```tsx
// Incorrect
<TextField value={value.name} onChange={(name) => onChange({ ...value, name })}>
    <Label>Name</Label>
    <Input placeholder="Full name" />
</TextField>

// Correct
<TextField onChange={(name) => onChange({ ...value, name })}>
    <Label>Name</Label>
    <Input value={value.name} placeholder="Full name" />
</TextField>
```
