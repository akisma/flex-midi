# MIDI Dashboard

## Overview

Combine the existing message log and virtual keyboard into a dashboard layout with live status widgets. The dashboard shows real-time MIDI activity at a glance.

## Layout

Reorganize `App.tsx` into a dashboard with three sections using MUI `Grid`:

```
┌─────────────────────────────────────────────────┐
│  MIDI Dashboard              [Start] [Stop]     │
├──────────────────────┬──────────────────────────┤
│                      │  Last Note: C4 (vel 92)  │
│     Keyboard         │  Channel: 0              │
│     (existing)       │  Active Notes: 3         │
│                      │  Messages/sec: 4.2       │
├──────────────────────┴──────────────────────────┤
│                                                  │
│              Message Log (existing)              │
│                                                  │
└─────────────────────────────────────────────────┘
```

## What to Build

### 1. Status Panel (`src/web/StatusPanel.tsx`)

A sidebar widget showing live stats. Uses MUI `Card`, `CardContent`, `Typography`, and `Divider`.

**Fields:**
- **Last Note:** Display name (e.g., "C4", "F#3") and velocity of the most recent noteOn. Show "—" if no notes received yet.
- **Channel:** The MIDI channel of the most recent message (any type).
- **Active Notes:** Count of currently held notes (noteOn without matching noteOff).
- **Messages/sec:** Rolling average of messages per second over the last 5 seconds. Update every 500ms.

**Note name helper:** Convert MIDI note number to name. Note 60 = C4. Use standard naming: C, C#, D, D#, E, F, F#, G, G#, A, A#, B. Octave = floor(noteNumber / 12) - 1.

Export the helper as `midiNoteName(note: number): string` from `src/web/StatusPanel.tsx` so it can be tested.

### 2. Update App Layout (`src/web/App.tsx`)

- Change the title from "MIDI Message Log" to "MIDI Dashboard"
- Use MUI `Grid` container to arrange: keyboard + status panel (top row), message log (bottom row)
- Keyboard takes 8 columns, status panel takes 4 columns on md+ screens. Full width on mobile.
- Message log spans full width below.
- Pass the required data to StatusPanel:
  - `lastNote`: most recent noteOn message (or null)
  - `lastChannel`: channel from most recent message of any type
  - `activeNoteCount`: size of the activeNotes set
  - `messagesPerSecond`: computed rolling average

### 3. Messages Per Second Calculation

In `App.tsx`, track message timestamps in a ref (array of `Date`). Every 500ms, count how many timestamps are within the last 5 seconds and divide by 5. Store the result in state. Clean up timestamps older than 5 seconds to prevent memory growth.

## Tests

### StatusPanel Tests (`tests/web/StatusPanel.test.ts`)

- Renders "—" when no last note
- Displays note name and velocity when lastNote is provided
- Displays channel number
- Displays active note count
- Displays messages per second with one decimal

### midiNoteName Tests (in same file)

- Note 60 = "C4"
- Note 61 = "C#4"
- Note 69 = "A4"
- Note 48 = "C3"
- Note 83 = "B5"
- Note 0 = "C-1"
- Note 127 = "G9"

## File Structure

```
flex-midi/
  src/
    web/
      App.tsx                   # MODIFY — dashboard layout with Grid
      StatusPanel.tsx            # NEW
      Keyboard.tsx              # existing, no changes
      MessageLog.tsx            # existing, no changes
  tests/
    web/
      StatusPanel.test.ts       # NEW
```

## Verification Commands

`npm run build`, `npx tsc --noEmit`, `npm test` must all pass.
