# Widget System Foundation

## Overview

Add a widget system to the MIDI dashboard. Users can add monitoring widgets that display real-time MIDI CC data. Each widget is mapped to a specific MIDI channel + CC number and shows the current value.

Two widget types to start:
- **Value Display** — shows the current CC value (0-127) as a number with a label
- **On/Off Indicator** — shows whether the CC value is above a threshold (default: 64), displayed as a colored dot (green = on, grey = off)

## Data Model

### Widget Configuration

```typescript
// src/types.ts — add to existing file
export interface WidgetConfig {
  id: string;                    // unique ID (crypto.randomUUID())
  type: 'value' | 'onoff';
  channel: number;               // 0-15
  cc: number;                    // 0-127
  label: string;                 // user-provided label (e.g., "Volume", "Sustain")
  threshold?: number;            // for onoff type, default 64
}
```

### Widget State

The App component maintains:
- `widgets: WidgetConfig[]` — list of configured widgets
- `ccValues: Map<string, number>` — current CC values, keyed by `"${channel}:${cc}"`. Updated on every incoming `controlChange` message.

## What to Build

### 1. Add Widget Dialog (`src/web/AddWidgetDialog.tsx`)

A MUI `Dialog` with a form for adding a new widget:

**Fields:**
- **Label** — text input (required), e.g., "Master Volume"
- **Channel** — number input, 0-15
- **CC Number** — number input, 0-127
- **Type** — MUI `Select` with options: "Value Display", "On/Off Indicator"
- **Threshold** — number input, 0-127, only shown when type is "On/Off Indicator", default 64

**Buttons:**
- "Add" — validates inputs, calls `onAdd(config: WidgetConfig)` callback, closes dialog
- "Cancel" — closes dialog without adding

Validation: label required, channel 0-15, CC 0-127. Show MUI error states on invalid inputs.

### 2. Widget Components

**`src/web/widgets/ValueWidget.tsx`**
- Displays the label and current CC value
- MUI `Card` with `CardContent`
- Value shown as large text (Typography variant h3)
- Label shown as subtitle
- Channel and CC number shown as small caption text
- If no value received yet, show "—"

**`src/web/widgets/OnOffWidget.tsx`**
- Displays the label and an on/off indicator
- MUI `Card` with `CardContent`
- Colored circle: green (`#4caf50`) when value >= threshold, grey (`#616161`) when below
- Circle is a `Box` with `borderRadius: '50%'`, width/height 40px
- Label and channel/CC shown same as ValueWidget
- Current value shown as small text below the indicator

### 3. Widget Grid (`src/web/WidgetGrid.tsx`)

Renders all configured widgets in a MUI `Grid` layout:
- Each widget takes 3 columns on md+ screens (4 widgets per row)
- Each widget takes 6 columns on sm (2 per row)
- Full width on xs (1 per row)
- Each widget card has a delete button (MUI `IconButton` with `DeleteIcon`) in the top-right corner

Props:
```typescript
{
  widgets: WidgetConfig[];
  ccValues: Map<string, number>;
  onRemove: (id: string) => void;
}
```

### 4. App Integration (`src/web/App.tsx`)

**State additions:**
- `widgets: WidgetConfig[]` — starts empty
- `ccValues: Map<string, number>` — updated on every controlChange message
- `addDialogOpen: boolean`

**Message handling update:**
In the `handleMidiInput` function, when a `controlChange` message arrives, update `ccValues`:
```typescript
if (message.type === 'controlChange') {
  setCcValues(prev => {
    const next = new Map(prev);
    next.set(`${message.channel}:${message.controller}`, message.value);
    return next;
  });
}
```

**UI additions:**
- "Add Widget" button (MUI `Button` with `AddIcon`) in the header bar, next to the mode toggle
- `<AddWidgetDialog>` rendered when `addDialogOpen` is true
- `<WidgetGrid>` rendered between the keyboard/status panel row and the message log
- When a widget is removed, filter it from the `widgets` array

### Layout

```
┌───────────────────────────────────────────────────────┐
│  MIDI Dashboard  [Simulator|Play] [Start] [Add Widget]│
├────────────────────────┬──────────────────────────────┤
│      Keyboard          │      Status Panel            │
├────────────────────────┴──────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │
│  │Widget│ │Widget│ │Widget│ │Widget│  ← WidgetGrid    │
│  └──────┘ └──────┘ └──────┘ └──────┘                 │
├───────────────────────────────────────────────────────┤
│              Message Log (scrollable)                  │
└───────────────────────────────────────────────────────┘
```

## Tests

### AddWidgetDialog Tests (`tests/web/AddWidgetDialog.test.ts`)
- Renders the dialog when open
- Does not render when closed
- Calls onAdd with correct WidgetConfig when form is filled and Add is clicked
- Shows threshold field only when type is "On/Off Indicator"
- Validates that label is required (Add button disabled when empty)

### ValueWidget Tests (`tests/web/widgets/ValueWidget.test.ts`)
- Renders label and value
- Shows "—" when value is undefined
- Shows channel and CC number

### OnOffWidget Tests (`tests/web/widgets/OnOffWidget.test.ts`)
- Shows green indicator when value >= threshold
- Shows grey indicator when value < threshold
- Uses default threshold of 64 when not specified
- Shows "—" when no value received

### WidgetGrid Tests (`tests/web/WidgetGrid.test.ts`)
- Renders correct number of widget cards
- Renders ValueWidget for type "value"
- Renders OnOffWidget for type "onoff"
- Calls onRemove when delete button is clicked

## File Structure

```
flex-midi/
  src/
    types.ts                          # MODIFY — add WidgetConfig
    web/
      App.tsx                         # MODIFY — add widget state, CC tracking, Add Widget button
      AddWidgetDialog.tsx             # NEW
      WidgetGrid.tsx                  # NEW
      widgets/
        ValueWidget.tsx               # NEW
        OnOffWidget.tsx               # NEW
  tests/
    web/
      AddWidgetDialog.test.ts         # NEW
      WidgetGrid.test.ts              # NEW
      widgets/
        ValueWidget.test.ts           # NEW
        OnOffWidget.test.ts           # NEW
```

## Verification Commands

`npm run build`, `npx tsc --noEmit`, `npm test` must all pass.
