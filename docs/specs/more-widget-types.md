# More Widget Types

## Overview

Add three new monitoring widget types to the existing widget system: range slider, toggle indicator, and note monitor. Extends the `WidgetConfig.type` union and the AddWidgetDialog type selector.

## New Widget Types

### Range Widget (`type: 'range'`)

Displays a CC value as a horizontal progress bar (0-127).

- Full-width horizontal bar inside the card
- Bar fills from left to right proportional to the value (0 = empty, 127 = full)
- Bar color: `bg-blue-500`
- Bar background: `bg-gray-700`
- Bar height: `h-3` with `rounded-full`
- Current numeric value displayed next to the bar (right-aligned)
- Label, channel/CC caption below

### Toggle Widget (`type: 'toggle'`)

Displays a CC value as a binary toggle switch visualization.

- Shows a pill-shaped toggle: `w-14 h-7 rounded-full`
- When value >= threshold: pill is `bg-green-500` with the circle on the right
- When value < threshold: pill is `bg-gray-600` with the circle on the left
- Circle: `w-6 h-6 rounded-full bg-white` positioned with `translate-x`
- Label shows "ON" or "OFF" text next to the toggle
- Threshold configurable (default 64), same as OnOffWidget
- `data-testid="toggle"` and `data-state="on|off"` for testing

### Note Widget (`type: 'note'`)

Monitors a specific note number instead of CC. Shows note activity.

- Displays the note name (e.g., "C4") using the `midiNoteName` helper from StatusPanel
- Shows a pulsing indicator when the note is currently held (noteOn received, no noteOff yet)
- Indicator: `w-4 h-4 rounded-full` — `bg-green-500 animate-pulse` when active, `bg-gray-600` when inactive
- Shows last velocity value when the note was struck
- `data-testid="note-indicator"` and `data-state="active|inactive"` for testing

**Note widget data flow difference:** Unlike CC widgets that read from `ccValues`, the note widget reads from `activeNotes` (the existing `Set<number>`) and a new `noteVelocities` map.

## Type Changes (`src/types.ts`)

Update the `WidgetConfig.type` union:

```typescript
export interface WidgetConfig {
  id: string;
  type: 'value' | 'onoff' | 'range' | 'toggle' | 'note';
  channel: number;
  cc: number;                    // CC number for CC widgets, note number for note widgets
  label: string;
  threshold?: number;            // for onoff and toggle types
}
```

The `cc` field is reused for note number in note widgets. The field name stays `cc` to avoid breaking existing configs — the label in the AddWidgetDialog changes contextually.

## App.tsx Changes

Add `noteVelocities` state:

```typescript
const [noteVelocities, setNoteVelocities] = useState<Map<string, number>>(new Map());
```

In `handleMidiInput`, when a `noteOn` message arrives:
```typescript
setNoteVelocities(prev => {
  const next = new Map(prev);
  next.set(`${message.channel}:${message.note}`, message.velocity);
  return next;
});
```

Pass `activeNotes` and `noteVelocities` to `WidgetGrid`.

## WidgetGrid Changes

Accept new props: `activeNotes: Set<number>`, `noteVelocities: Map<string, number>`.

Render the new widget types based on `config.type`.

For note widgets, determine active state: check if `config.cc` (the note number) is in `activeNotes`. Get velocity from `noteVelocities.get("${config.channel}:${config.cc}")`.

## AddWidgetDialog Changes

Add "Range", "Toggle", and "Note Monitor" to the type selector options.

When type is "note", change the "CC Number" label to "Note Number".

Show threshold field for both "On/Off Indicator" and "Toggle" types.

## StatusPanel — Export midiNoteName

The `midiNoteName` helper already exists in StatusPanel.tsx. Move it to `src/web/utils.ts` so both StatusPanel and NoteWidget can import it. StatusPanel imports from the new location.

## File Structure

```
flex-midi/
  src/
    types.ts                          # MODIFY — add range, toggle, note to type union
    web/
      utils.ts                        # NEW — midiNoteName helper (moved from StatusPanel)
      App.tsx                         # MODIFY — add noteVelocities state
      AddWidgetDialog.tsx             # MODIFY — add new type options, contextual label
      StatusPanel.tsx                 # MODIFY — import midiNoteName from utils
      WidgetGrid.tsx                  # MODIFY — render new widget types, accept new props
      widgets/
        RangeWidget.tsx               # NEW
        ToggleWidget.tsx              # NEW
        NoteWidget.tsx                # NEW
  tests/
    web/
      widgets/
        RangeWidget.test.ts           # NEW
        ToggleWidget.test.ts          # NEW
        NoteWidget.test.ts            # NEW
```

## Tests

### RangeWidget Tests
- Renders label and value
- Shows "—" when value is undefined
- Bar width is proportional to value (test via data attribute `data-value`)

### ToggleWidget Tests
- Shows "on" state when value >= threshold
- Shows "off" state when value < threshold
- Uses default threshold of 64
- Shows "—" when no value

### NoteWidget Tests
- Shows note name (e.g., "C4" for note 60)
- Shows active indicator when note is active
- Shows inactive indicator when note is not active
- Shows velocity value
- Shows "—" when no velocity data

## Verification Commands

`npm run build`, `npx tsc --noEmit`, `npm test` must all pass.
