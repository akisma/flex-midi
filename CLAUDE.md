# flex-midi — Agent Guide

## Project Info

- **Project:** flex-midi — a flexible, customizable MIDI monitoring system
- **Stack:** TypeScript / ESM / React / MUI (Material UI) / Vite
- **Build:** `npm run build` (tsc)
- **Dev Server:** `npm run dev` (vite)
- **Test:** `npm test` (vitest)
- **Typecheck:** `npx tsc --noEmit`

---

## Architecture

Two layers: a pure-logic MIDI library and a browser UI.

### Core Library (`src/`)

Pure TypeScript, no browser dependencies. Can be used standalone.

- `src/types.ts` — `MidiMessage` discriminated union (noteOn, noteOff, controlChange, pitchBend, etc.)
- `src/parser.ts` — `parseMidiMessage(Uint8Array): MidiMessage` — decodes raw MIDI bytes into typed objects
- `src/simulator.ts` — `MidiSimulator` class that generates random MIDI messages at configurable intervals. Produces matching noteOff for each noteOn after a short delay.

### Web UI (`src/web/`)

React + MUI, bundled with Vite.

- `src/web/main.tsx` — React entry point, renders into `#root`
- `src/web/App.tsx` — Main app. Creates `MidiSimulator`, passes parsed messages to child components. Dark MUI theme. Start/Stop button.
- `src/web/MessageLog.tsx` — Scrolling table of parsed MIDI messages. Color-coded chips by type. Max 100 messages.
- `src/web/Keyboard.tsx` — Piano keyboard visualization (C3-B5). Keys light up on noteOn, dim on noteOff.

### Entry Points

- `index.html` — Vite HTML entry (loads `src/web/main.tsx`)
- `dist/` — TypeScript compilation output (library only, not web)

---

## Conventions

### TypeScript

- ESM (`"type": "module"` in package.json)
- Strict mode enabled
- Use `.js` extensions in imports (ESM resolution)
- Types go in `src/types.ts` — keep the `MidiMessage` union as the single source of truth
- No `any` unless absolutely necessary

### React / MUI

- Functional components only
- MUI dark theme (`createTheme({ palette: { mode: 'dark' } })`)
- MUI components for all UI elements — no raw HTML for controls, tables, chips, etc.
- Component files in `src/web/`

### Testing

- vitest with `globals: true` and jsdom environment for component tests
- `@testing-library/react` for component testing — query by role/text, not test IDs
- `@testing-library/jest-dom` matchers loaded via `tests/setup.ts`
- Pure logic tests (parser, simulator) don't need jsdom
- Test files mirror source: `tests/parser.test.ts`, `tests/web/MessageLog.test.ts`

### File Organization

- Core logic: `src/*.ts` (no React, no browser APIs)
- Web UI: `src/web/*.tsx`
- Tests: `tests/` mirroring `src/` structure
- Specs: `docs/specs/`

---

## Key Patterns

### MIDI Message Flow

```
MidiSimulator → raw Uint8Array → parseMidiMessage() → MidiMessage → React state → UI components
```

The simulator produces raw bytes. The parser converts them to typed objects. React components consume typed objects — they never see raw bytes.

### Adding New Message Types

1. Add the variant to `MidiMessage` union in `src/types.ts`
2. Add the parsing case in `src/parser.ts`
3. Add display logic in `src/web/MessageLog.tsx` (details column + chip color)
4. Add tests for the new type

### Adding New UI Components

1. Create `src/web/ComponentName.tsx`
2. Wire into `App.tsx` — simulator messages flow through App state
3. Create `tests/web/ComponentName.test.ts`
4. Component receives parsed `MidiMessage` data as props — never raw bytes

---

## Verification

All three must pass before shipping:

```bash
npm run build      # TypeScript compiles
npx tsc --noEmit   # No type errors
npm test           # All tests green
```

---

## Size Limits

| Element | Limit |
|---------|-------|
| Component | max 150 lines |
| Function | max 40 lines |
| Nesting depth | max 2 levels |

---

## Do Not

- Import browser APIs in core library files (`src/parser.ts`, `src/types.ts`, `src/simulator.ts`)
- Use `any` in type definitions
- Leave TODO comments
- Add dependencies without a clear need
- Mix raw MIDI bytes into React components — always parse first
