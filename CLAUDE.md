# flex-midi — Agent Guide

## Project Info

- **Project:** flex-midi — a flexible, customizable MIDI monitoring system
- **Stack:** TypeScript / ESM / React / Tailwind CSS / Vite
- **Build:** `npm run build` (tsc)
- **Dev Server:** `npm run dev` (vite)
- **Test:** `npm test` (vitest)
- **Typecheck:** `npx tsc --noEmit`

---

## Architecture

Two layers: a pure-logic MIDI library and a browser UI.

### Core Library (`src/`)

Pure TypeScript, no browser dependencies. Can be used standalone.

- `src/types.ts` — `MidiMessage` discriminated union (noteOn, noteOff, controlChange, pitchBend, etc.) + `WidgetConfig` type
- `src/parser.ts` — `parseMidiMessage(Uint8Array): MidiMessage` — decodes raw MIDI bytes into typed objects
- `src/simulator.ts` — `MidiSimulator` class that generates random MIDI messages at configurable intervals. Produces matching noteOff for each noteOn after a short delay.

### Web UI (`src/web/`)

React + Tailwind CSS, bundled with Vite.

- `src/web/index.css` — Tailwind CSS import
- `src/web/main.tsx` — React entry point, renders into `#root`
- `src/web/App.tsx` — Main app. Creates `MidiSimulator`, passes parsed messages to child components. Dark theme. Simulator/Play mode toggle. Add Widget button.
- `src/web/MessageLog.tsx` — Scrollable table of parsed MIDI messages. Color-coded badges by type. Max 100 messages, fixed height container.
- `src/web/Keyboard.tsx` — Piano keyboard visualization (C3-B5). Keys light up on noteOn, dim on noteOff. Interactive in Play mode.
- `src/web/StatusPanel.tsx` — Live stats: last note, channel, active notes, messages/sec.
- `src/web/AddWidgetDialog.tsx` — Modal dialog for adding monitoring widgets.
- `src/web/WidgetGrid.tsx` — Grid layout for monitoring widgets.
- `src/web/widgets/ValueWidget.tsx` — Displays current CC value (0-127).
- `src/web/widgets/OnOffWidget.tsx` — Shows on/off state based on CC value vs threshold.

### Entry Points

- `index.html` — Vite HTML entry (loads `src/web/main.tsx`)
- `dist/` — TypeScript compilation output (library only, not web)

---

## Conventions

### TypeScript

- ESM (`"type": "module"` in package.json)
- Strict mode enabled
- Use `.js` extensions in imports (ESM resolution)
- Types go in `src/types.ts` — keep the `MidiMessage` union and `WidgetConfig` as the single source of truth
- No `any` unless absolutely necessary

### React / Tailwind CSS

- Functional components only
- **Tailwind CSS for all styling** — no MUI, no CSS-in-JS, no inline styles (except where dynamic values require them, like keyboard key positioning)
- Dark theme via utility classes: `bg-gray-900` (page), `bg-gray-800` (cards), `text-white`, `text-gray-400`
- Cards: `bg-gray-800 rounded-lg p-4 shadow-lg`
- Buttons: `px-4 py-2 rounded font-medium` with color variants (`bg-green-600`, `bg-red-600`, etc.)
- Component files in `src/web/`
- Do NOT use MUI or `@mui/*` packages — the project has migrated to Tailwind

### Testing

- vitest with `globals: true` and jsdom environment for component tests
- `@testing-library/react` for component testing — query by role/text, not test IDs (except where necessary)
- Pure logic tests (parser, simulator) don't need jsdom
- Test files mirror source: `tests/parser.test.ts`, `tests/web/MessageLog.test.ts`

**IMPORTANT — Testing styled components:**
- Do NOT query by inline CSS styles (`querySelector('[style*="..."]')`). Tailwind generates utility classes, not inline styles.
- Use `data-testid` and `data-state` attributes for testing visual states (e.g., `data-testid="indicator" data-state="on"`)
- Use `screen.getByRole()`, `screen.getByText()`, `screen.getByTestId()` — these work with plain HTML elements
- Prefer testing behavior and content, not visual appearance

### File Organization

- Core logic: `src/*.ts` (no React, no browser APIs)
- Web UI: `src/web/*.tsx`
- Widget components: `src/web/widgets/*.tsx`
- Tests: `tests/` mirroring `src/` structure
- Specs: `docs/specs/`

---

## Key Patterns

### MIDI Message Flow

```
MidiSimulator → raw Uint8Array → parseMidiMessage() → MidiMessage → React state → UI components
```

The simulator produces raw bytes. The parser converts them to typed objects. React components consume typed objects — they never see raw bytes.

### Widget System

Widgets monitor specific MIDI CC channels. The flow:
1. User adds widget via AddWidgetDialog (specifies channel, CC number, type)
2. App tracks CC values in a `Map<string, number>` keyed by `"${channel}:${cc}"`
3. WidgetGrid renders widgets, passing current values from the map
4. Widgets display the value in their specific format (number, on/off indicator, etc.)

### Adding New Message Types

1. Add the variant to `MidiMessage` union in `src/types.ts`
2. Add the parsing case in `src/parser.ts`
3. Add display logic in `src/web/MessageLog.tsx` (details column + badge color)
4. Add tests for the new type

### Adding New Widget Types

1. Add the type value to `WidgetConfig.type` in `src/types.ts`
2. Create `src/web/widgets/NewWidget.tsx` with Tailwind styling
3. Add the case to `WidgetGrid.tsx` component rendering
4. Add the option to `AddWidgetDialog.tsx` type select
5. Create `tests/web/widgets/NewWidget.test.ts`

### Adding New UI Components

1. Create `src/web/ComponentName.tsx`
2. Wire into `App.tsx` — simulator messages flow through App state
3. Create `tests/web/ComponentName.test.ts`
4. Component receives parsed `MidiMessage` data as props — never raw bytes
5. Style with Tailwind utility classes — no MUI

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
- Use MUI or `@mui/*` — we use Tailwind CSS
- Query for inline CSS styles in tests — use `data-testid` attributes instead
- Use `querySelector('[style*="..."]')` in tests — Tailwind doesn't generate inline styles
