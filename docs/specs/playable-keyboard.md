# Playable Keyboard

## Overview

Make the virtual keyboard interactive. Keys respond to mouse clicks — mousedown sends noteOn, mouseup sends noteOff. Add a mode toggle to switch between the existing simulator and manual play mode.

## Mode Toggle

Add a MUI `ToggleButtonGroup` in the header next to the existing Start/Stop button.

Two modes:
- **Simulator** — existing behavior. Simulator runs, Start/Stop button is visible.
- **Play** — simulator stops. Start/Stop button is hidden. Clicking keyboard keys generates messages.

Default mode: Simulator (preserves current behavior).

When switching from Play to Simulator, clear all active notes (release any held keys).
When switching from Simulator to Play, stop the simulator and clear active notes.

## Keyboard Click Handling

### Mouse Events on Keys

Add `onMouseDown` and `onMouseUp` handlers to each key element in `Keyboard.tsx`.

**onMouseDown(note):**
1. Create a raw MIDI noteOn byte array: `new Uint8Array([0x90, note, 100])` (channel 0, velocity 100)
2. Call a callback prop: `onNoteOn(data: Uint8Array)`

**onMouseUp(note):**
1. Create a raw MIDI noteOff byte array: `new Uint8Array([0x80, note, 0])` (channel 0, velocity 0)
2. Call a callback prop: `onNoteOff(data: Uint8Array)`

Also handle `onMouseLeave` on each key — if the mouse leaves a key while pressed, send noteOff. This prevents stuck notes when the user drags off a key.

### Keyboard Props Change

Current props:
```typescript
{ activeNotes: Set<number> }
```

New props:
```typescript
{
  activeNotes: Set<number>;
  interactive: boolean;           // true in Play mode, false in Simulator mode
  onNoteOn?: (data: Uint8Array) => void;
  onNoteOff?: (data: Uint8Array) => void;
}
```

When `interactive` is false, click handlers are not attached (keys are display-only, as they are today).
When `interactive` is true, keys get cursor: pointer styling and the mouse handlers.

### Message Flow

Same as simulator messages — raw bytes go through `parseMidiMessage`:

```
Key click → Uint8Array → parseMidiMessage() → MidiMessage → App state → UI
```

No new message paths. The App component handles the callbacks:

```typescript
const handleMidiInput = (data: Uint8Array) => {
  const message = parseMidiMessage(data);
  // Same logic as simulator onMessage callback
};
```

## App.tsx Changes

- Add `mode` state: `'simulator' | 'play'`
- Add `ToggleButtonGroup` with Simulator/Play options
- When mode is `'play'`:
  - Stop simulator
  - Hide Start/Stop button
  - Pass `interactive={true}` and `onNoteOn`/`onNoteOff` callbacks to Keyboard
- When mode is `'simulator'`:
  - Pass `interactive={false}` to Keyboard (no callbacks needed)
  - Show Start/Stop button
- Both modes feed messages through the same handler that updates messages, activeNotes, and status panel state

## Visual Feedback

In Play mode, keys should have:
- `cursor: pointer` on hover
- A subtle hover effect (slightly lighter background) using MUI `sx` or `:hover` pseudo-class
- Active (pressed) keys still use the same green highlight as simulator mode

## Tests

### Keyboard Interaction Tests (`tests/web/Keyboard.test.ts` — add to existing)

- In interactive mode, mousedown on a white key calls onNoteOn with correct bytes
- In interactive mode, mouseup on a key calls onNoteOff with correct bytes
- In non-interactive mode, mousedown does not call onNoteOn
- onMouseLeave on a pressed key calls onNoteOff

### App Mode Toggle Tests (`tests/web/App.test.ts` — new file)

- Default mode is Simulator
- Switching to Play mode hides Start/Stop button
- Switching back to Simulator mode shows Start/Stop button
- In Play mode, keyboard is interactive

## File Structure

```
flex-midi/
  src/
    web/
      App.tsx                   # MODIFY — add mode toggle, wire keyboard callbacks
      Keyboard.tsx              # MODIFY — add click handlers, interactive prop
  tests/
    web/
      Keyboard.test.ts          # MODIFY — add interaction tests
      App.test.ts               # NEW — mode toggle tests
```

## Verification Commands

`npm run build`, `npx tsc --noEmit`, `npm test` must all pass.
