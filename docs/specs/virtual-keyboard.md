# Virtual Keyboard

## Overview

Add a virtual piano keyboard visualization to the existing web UI. Simulated noteOn/noteOff messages light up keys in real time. The keyboard sits above the existing message log.

## What to Build

### 1. Keyboard Component (`src/web/Keyboard.tsx`)

A piano keyboard spanning 3 octaves (C3 to B5 — notes 48 to 83). Uses MUI `Box` and `Paper` for layout, no canvas or SVG — pure CSS/HTML.

**Layout:**
- White keys: rectangular, side by side
- Black keys: smaller, overlapping on top of white keys (absolute positioning)
- Standard piano layout: C-D-E-F-G-A-B pattern, black keys on C#, D#, F#, G#, A#

**Behavior:**
- When a `noteOn` message arrives for a note in range 48-83, that key lights up:
  - White keys: background changes to a bright green (`#4caf50`)
  - Black keys: background changes to a bright green (`#4caf50`)
- When the corresponding `noteOff` arrives, the key returns to its default color
- Keys outside the 48-83 range are ignored
- Multiple keys can be lit simultaneously

**Active keys state:**
- Maintained as a `Set<number>` of currently active note numbers
- Updated by the parent `App` component and passed as a prop: `activeNotes: Set<number>`

### 2. Update App Component (`src/web/App.tsx`)

Modify the existing `App` to:
- Track active notes in state: `const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set())`
- On `noteOn`: add the note number to the set
- On `noteOff`: remove the note number from the set
- Render `<Keyboard activeNotes={activeNotes} />` above the `<MessageLog />`
- Use a MUI `Divider` between the keyboard and the message log

### 3. Update Simulator (`src/simulator.ts`)

The existing simulator generates random messages. Update it to produce more realistic note patterns:
- When generating a `noteOn`, store the note number
- After 200-600ms (random), generate a matching `noteOff` for that note
- This ensures keys visually press and release rather than just flashing

No API changes — the existing `onMessage` callback interface stays the same.

## Tests

### Keyboard Component Tests (`tests/web/Keyboard.test.ts`)

- Renders 21 white keys (3 octaves: C3-B5)
- Renders 15 black keys (3 octaves of sharps/flats)
- Highlights a white key when its note is in `activeNotes`
- Highlights a black key when its note is in `activeNotes`
- Does not highlight keys not in `activeNotes`
- Handles empty `activeNotes` set (no keys lit)

Use `@testing-library/react` + `jsdom` (already set up from spec A).

### Simulator Tests

- Existing tests must still pass
- Add: generates matching noteOff for each noteOn

## File Structure

```
flex-midi/
  src/
    simulator.ts                # MODIFY — noteOff follow-up
    web/
      App.tsx                   # MODIFY — add activeNotes state + Keyboard
      Keyboard.tsx              # NEW
  tests/
    simulator.test.ts           # MODIFY — add noteOff pairing test
    web/
      Keyboard.test.ts          # NEW
```

## Verification Commands

Same as before — `npm run build`, `npx tsc --noEmit`, `npm test` must all pass.
