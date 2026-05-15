# Widget Persistence

## Overview

Save widget configurations to localStorage so the dashboard survives page refreshes. Widgets are loaded on startup and saved whenever the list changes.

## What to Build

### Storage Key

`flex-midi-widgets` — stores the serialized `WidgetConfig[]` array as JSON.

### Save Behavior

In `App.tsx`, whenever the `widgets` state changes (add or remove), persist to localStorage:

```typescript
useEffect(() => {
  localStorage.setItem('flex-midi-widgets', JSON.stringify(widgets));
}, [widgets]);
```

### Load Behavior

Initialize `widgets` state from localStorage on mount:

```typescript
const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
  try {
    const saved = localStorage.getItem('flex-midi-widgets');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
});
```

### Error Handling

- If localStorage is unavailable (private browsing, quota exceeded): silently skip save, log a console warning
- If stored JSON is corrupt or doesn't parse: start with empty array, overwrite on next save
- If stored configs contain invalid data (missing fields): filter them out on load

### Validation on Load

When loading from localStorage, validate each config has the required fields:
- `id` (string)
- `type` (one of: value, onoff, range, toggle, note)
- `channel` (number, 0-15)
- `cc` (number, 0-127)
- `label` (string)

Invalid configs are silently dropped.

## Tests

### Persistence Tests (`tests/web/persistence.test.ts`)

Use vitest's jsdom environment — `localStorage` is available in jsdom.

- Loads widgets from localStorage on mount
- Saves widgets to localStorage when a widget is added
- Handles corrupt JSON in localStorage gracefully (starts empty)
- Handles missing localStorage key (starts empty)
- Filters out invalid widget configs on load

Test approach: directly test the load/save utility functions rather than mounting the full App component. Extract the logic into a helper:

**`src/web/persistence.ts`** (NEW):
```typescript
export function loadWidgets(): WidgetConfig[] { ... }
export function saveWidgets(widgets: WidgetConfig[]): void { ... }
```

App.tsx imports and uses these instead of inline localStorage calls.

## File Structure

```
flex-midi/
  src/
    web/
      persistence.ts                  # NEW — load/save helpers
      App.tsx                         # MODIFY — use persistence helpers
  tests/
    web/
      persistence.test.ts             # NEW
```

## Verification Commands

`npm run build`, `npx tsc --noEmit`, `npm test` must all pass.
