# Tailwind CSS Migration

## Overview

Replace Material UI (MUI) with Tailwind CSS across the entire web UI. Remove all MUI dependencies. Every component gets rewritten with Tailwind utility classes.

## Dependencies

### Remove
- `@mui/material`
- `@emotion/react`
- `@emotion/styled`

### Add
- `tailwindcss`
- `@tailwindcss/vite`

## Tailwind Setup

### tailwind.config.js (project root)

Not needed with Tailwind v4 — configuration is done via CSS.

### src/web/index.css (NEW)

```css
@import "tailwindcss";
```

### vite.config.ts (MODIFY)

Add the Tailwind Vite plugin:

```typescript
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### src/web/main.tsx (MODIFY)

Import the CSS file:

```typescript
import './index.css';
```

## Component Migration

All components must use Tailwind utility classes instead of MUI components. Use standard HTML elements (`div`, `button`, `input`, `select`, `table`) with Tailwind classes.

### Design System

Maintain the existing dark theme aesthetic:
- Background: `bg-gray-900` (page), `bg-gray-800` (cards/panels)
- Text: `text-white` (primary), `text-gray-400` (secondary)
- Accent: `text-green-500` for active states, `text-red-500` for stop/error
- Cards: `bg-gray-800 rounded-lg p-4 shadow-lg`
- Buttons: `px-4 py-2 rounded font-medium` with color variants

### App.tsx

Replace MUI `ThemeProvider`, `CssBaseline`, `Container`, `Grid`, `ToggleButtonGroup`, `ToggleButton`, `Button`, `Typography`, `Box` with Tailwind:

- Container: `<div className="max-w-6xl mx-auto px-4 py-8">`
- Header row: `<div className="flex items-center gap-3 mb-4">`
- Title: `<h1 className="text-xl font-bold text-white">`
- Toggle buttons: styled `<button>` elements with active state classes
- Start/Stop button: `<button className="px-4 py-2 rounded font-medium bg-red-600 text-white">` / `bg-green-600`
- Grid layout: CSS grid with `grid grid-cols-1 md:grid-cols-12 gap-4`
- Keyboard: `md:col-span-8`
- Status panel: `md:col-span-4`

Remove the `ThemeProvider` and `createTheme` — Tailwind handles dark mode via classes on `<html>` or hardcoded dark classes.

### Keyboard.tsx

Replace MUI `Box` and `Paper` with plain divs + Tailwind:

- Container: `<div className="bg-gray-800 rounded-lg p-4 relative">`
- White keys: `bg-white` with active state `bg-green-500`
- Black keys: `bg-gray-900` with active state `bg-green-500`
- Interactive hover: `hover:bg-gray-100` (white) / `hover:bg-gray-700` (black)
- Cursor: `cursor-pointer` when interactive

### MessageLog.tsx

Replace MUI `Table`, `TableContainer`, `TableHead`, `TableBody`, `TableRow`, `TableCell`, `Paper`, `Chip` with HTML table + Tailwind:

- Container: `<div className="bg-gray-800 rounded-lg overflow-hidden" style={{ height: '350px', overflowY: 'auto' }}>`
- Table: `<table className="w-full text-sm text-left">`
- Header: `<thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">`
- Rows: `<tr className="border-b border-gray-700">`
- Chips: replace with `<span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">` (colors per type)

Chip color mapping:
- noteOn: `bg-green-900 text-green-300`
- noteOff: `bg-red-900 text-red-300`
- controlChange: `bg-blue-900 text-blue-300`
- pitchBend: `bg-orange-900 text-orange-300`
- default: `bg-gray-700 text-gray-300`

### StatusPanel.tsx

Replace MUI `Card`, `CardContent`, `Typography`, `Divider` with Tailwind:

- Card: `<div className="bg-gray-800 rounded-lg p-4">`
- Label: `<div className="text-gray-400 text-sm">`
- Value: `<div className="text-white text-lg font-mono">`
- Dividers: `<hr className="border-gray-700 my-2">`

### AddWidgetDialog.tsx

Replace MUI `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `TextField`, `Select`, `MenuItem`, `FormControl`, `InputLabel` with a custom modal:

- Backdrop: `<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">`
- Modal: `<div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">`
- Title: `<h2 className="text-lg font-bold text-white mb-4">`
- Inputs: `<input className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none">`
- Select: `<select className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600">`
- Labels: `<label className="text-sm text-gray-400 mb-1">`
- Buttons: styled `<button>` with primary/secondary variants
- Error text: `<span className="text-red-400 text-xs mt-1">`

When `open` is false, return null (don't render anything).

### WidgetGrid.tsx

Replace MUI `Grid`, `Box`, `IconButton` with Tailwind grid:

- Grid: `<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">`
- Widget wrapper: `<div className="relative">`
- Delete button: `<button className="absolute top-2 right-2 text-gray-400 hover:text-red-400">` with an X character or SVG icon

### ValueWidget.tsx

Replace MUI `Card`, `CardContent`, `Typography`:

- Card: `<div className="bg-gray-800 rounded-lg p-4">`
- Value: `<div className="text-3xl font-bold text-white font-mono">`
- Label: `<div className="text-gray-400 text-sm mt-1">`
- Channel/CC: `<div className="text-gray-500 text-xs">`

### OnOffWidget.tsx

Replace MUI `Card`, `CardContent`, `Typography`, `Box`:

- Card: `<div className="bg-gray-800 rounded-lg p-4">`
- Indicator circle: `<div className="w-10 h-10 rounded-full mb-2" data-testid="indicator" data-state="on|off">` with `bg-green-500` or `bg-gray-600`
- Label/channel/value text: same pattern as ValueWidget

### main.tsx

Remove MUI imports. Add `import './index.css';` for Tailwind.

### index.html

Add `class="dark bg-gray-900"` to the `<html>` element so the dark background applies immediately.

## Test Updates

All tests that reference MUI components (`screen.getByRole('table')`, etc.) need updating for plain HTML elements.

Key changes:
- `getByRole('table')` still works (HTML `<table>` has implicit table role)
- `getByRole('combobox')` → `getByRole('combobox')` (HTML `<select>` has combobox role)
- `getByRole('button')` still works (HTML `<button>`)
- Remove any `@testing-library/jest-dom` matchers that depend on MUI internals
- `getByTestId('indicator')` still works (we added this ourselves)

Most tests should work with minimal changes since we're testing behavior, not MUI component implementation.

## File Structure

All files are modifications (no new files except `src/web/index.css`):

```
flex-midi/
  index.html                          # MODIFY — add dark class
  vite.config.ts                      # MODIFY — add Tailwind plugin
  package.json                        # MODIFY — swap deps
  src/
    web/
      index.css                       # NEW — Tailwind import
      main.tsx                        # MODIFY — import CSS
      App.tsx                         # MODIFY — replace MUI with Tailwind
      Keyboard.tsx                    # MODIFY
      MessageLog.tsx                  # MODIFY
      StatusPanel.tsx                 # MODIFY
      AddWidgetDialog.tsx             # MODIFY
      WidgetGrid.tsx                  # MODIFY
      widgets/
        ValueWidget.tsx               # MODIFY
        OnOffWidget.tsx               # MODIFY
  tests/
    web/
      MessageLog.test.ts              # MODIFY — update queries if needed
      Keyboard.test.ts                # MODIFY
      StatusPanel.test.ts             # MODIFY
      App.test.ts                     # MODIFY
      AddWidgetDialog.test.ts         # MODIFY
      WidgetGrid.test.ts              # MODIFY
      widgets/
        ValueWidget.test.ts           # MODIFY
        OnOffWidget.test.ts           # MODIFY
```

## Verification Commands

`npm run build`, `npx tsc --noEmit`, `npm test` must all pass.
After migration: `npm run dev` — visual check that the dark theme looks correct.
