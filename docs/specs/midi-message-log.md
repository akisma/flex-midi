# MIDI Message Log — Web UI

## Overview

Add a browser-based message log that displays simulated MIDI messages parsed by the existing `parseMidiMessage` function. Uses React + Material UI (MUI) for the UI and Vite for bundling.

## Dependencies to Add

- `react`, `react-dom`
- `@mui/material`, `@emotion/react`, `@emotion/styled`
- `vite`, `@vitejs/plugin-react`
- `@types/react`, `@types/react-dom`

## What to Build

### 1. MIDI Simulator (`src/simulator.ts`)

A class that generates random MIDI messages at a configurable interval.

```typescript
export class MidiSimulator {
  private interval: ReturnType<typeof setInterval> | null = null;
  private listener: ((data: Uint8Array) => void) | null = null;

  onMessage(listener: (data: Uint8Array) => void): void;
  start(intervalMs?: number): void;  // default: 500ms
  stop(): void;
}
```

It should generate a mix of message types — noteOn, noteOff, controlChange, pitchBend — with realistic random values. Channel should vary between 0-2. Notes should be in the range 48-84 (C3 to C6). Velocity 40-127.

### 2. Web UI (`src/web/`)

A single-page React app with Material UI:

**`src/web/App.tsx`** — Main app component. Uses MUI `CssBaseline`, `ThemeProvider` with a dark theme, and `Container`.

**`src/web/MessageLog.tsx`** — The message log component:
- MUI `Table` showing columns: Time, Type, Channel, Details
- Time: formatted as `HH:MM:SS.mmm`
- Type: the message type, color-coded using MUI `Chip` components:
  - `noteOn` = green
  - `noteOff` = red
  - `controlChange` = blue
  - `pitchBend` = orange
  - everything else = default/grey
- Channel: the MIDI channel number
- Details: formatted string with the message-specific values (e.g., "Note: 60 Vel: 127")
- Auto-scrolls to bottom as new messages arrive
- Shows the most recent 100 messages (older ones drop off)

**`src/web/main.tsx`** — Entry point. Renders `<App />` into `#root`.

**`index.html`** — Vite entry HTML at project root. Minimal: just a `<div id="root">` and a `<script type="module" src="/src/web/main.tsx">`.

### 3. Vite Config (`vite.config.ts`)

Standard Vite + React config. The dev server should work with `npm run dev`.

### 4. Wiring

The `App` component:
1. Creates a `MidiSimulator` instance on mount
2. On each simulated message, calls `parseMidiMessage` from `src/parser.ts`
3. Passes the parsed `MidiMessage` + timestamp to `MessageLog`
4. Starts the simulator automatically
5. Provides a Start/Stop toggle button (MUI `Button`) at the top

## Package.json Changes

Add to scripts:
```json
{
  "dev": "vite",
  "build:web": "vite build"
}
```

Keep the existing `build`, `test`, and `typecheck` scripts unchanged.

## Tests

### Simulator Tests (`tests/simulator.test.ts`)

- `start()` begins generating messages at the specified interval
- `stop()` stops message generation
- `onMessage` callback receives valid `Uint8Array` data
- Generated messages parse successfully through `parseMidiMessage`

### MessageLog Tests (`tests/web/MessageLog.test.ts`)

- Renders an empty table when no messages
- Displays a message with correct type, channel, and details
- Color-codes message types correctly (noteOn = green chip)
- Limits display to 100 messages

Use `vitest` + `@testing-library/react` + `jsdom` for component tests.

Add `@testing-library/react` and `@testing-library/jest-dom` as dev dependencies.

## File Structure

```
flex-midi/
  index.html                    # NEW — Vite entry
  vite.config.ts                # NEW — Vite + React
  src/
    types.ts                    # existing
    parser.ts                   # existing
    simulator.ts                # NEW
    web/
      main.tsx                  # NEW — React entry
      App.tsx                   # NEW — main app
      MessageLog.tsx            # NEW — log component
  tests/
    parser.test.ts              # existing
    simulator.test.ts           # NEW
    web/
      MessageLog.test.ts        # NEW
```

## Verification Commands

The existing `build` (tsc), `typecheck`, and `test` commands must still pass. The Vite build (`build:web`) is separate and not required to pass for this spec — the dev server (`npm run dev`) is the primary way to view the UI.
