# Widget Drag-and-Drop Layout

## Overview

Add drag-and-drop reordering to the widget grid so users can arrange their monitoring widgets. Uses `@hello-pangea/dnd` (the maintained fork of `react-beautiful-dnd`).

## Dependencies to Add

- `@hello-pangea/dnd`

## What to Build

### WidgetGrid.tsx Changes

Wrap the widget grid in a `DragDropContext` and `Droppable`. Each widget card becomes a `Draggable`.

**Drag handle:** Each widget card gets a grip icon (three horizontal lines or dots) in the top-left corner as the drag handle. The delete button stays in the top-right.

**Drop behavior:** When a widget is dropped in a new position, call `onReorder(reorderedWidgets: WidgetConfig[])` callback prop. The parent (App) updates the widgets array with the new order.

**Visual feedback during drag:**
- Dragged widget: `opacity-75 shadow-2xl ring-2 ring-blue-500`
- Drop placeholder: handled automatically by the library

### App.tsx Changes

Add `handleReorder` function:

```typescript
const handleReorder = (reordered: WidgetConfig[]) => {
  setWidgets(reordered);
};
```

Pass `onReorder={handleReorder}` to `WidgetGrid`.

### WidgetGrid Props Update

```typescript
{
  widgets: WidgetConfig[];
  ccValues: Map<string, number>;
  activeNotes: Set<number>;
  noteVelocities: Map<string, number>;
  onRemove: (id: string) => void;
  onReorder: (widgets: WidgetConfig[]) => void;  // NEW
}
```

### Drag Handle Icon

Use a simple SVG grip icon (6 dots in a 2x3 grid) or the Unicode character `⠿` (braille pattern). Style with `cursor-grab` (and `cursor-grabbing` while dragging).

The drag handle is the only draggable area — clicking other parts of the widget card should not initiate a drag.

## Tests

### WidgetGrid Drag Tests (add to existing `tests/web/WidgetGrid.test.ts`)

Testing drag-and-drop with `@hello-pangea/dnd` in jsdom is notoriously brittle. Focus on:

- Drag handle is rendered for each widget (test by querying for the grip element)
- `onReorder` prop exists and is callable
- Widgets render in the correct order

Do NOT test the actual drag interaction (mousedown → mousemove → mouseup) — this requires browser-level event simulation that breaks in jsdom. The library's own tests cover that.

## File Structure

```
flex-midi/
  src/
    web/
      App.tsx                         # MODIFY — add handleReorder
      WidgetGrid.tsx                  # MODIFY — wrap with DragDropContext/Droppable/Draggable
  tests/
    web/
      WidgetGrid.test.ts              # MODIFY — add drag handle tests
```

## Verification Commands

`npm run build`, `npx tsc --noEmit`, `npm test` must all pass.
