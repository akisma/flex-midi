# Code Review Fixes

## Overview

Address three issues from the fullstack code review.

## Fix 1: Simulator memory leak — clear pending timeouts on stop()

**File:** `src/simulator.ts`

The `stop()` method clears the interval but doesn't clear pending `setTimeout` callbacks for noteOff messages. These continue to fire after stop, and the `pendingTimeouts` array grows unboundedly.

**Fix:**
- In `stop()`, iterate `pendingTimeouts` and call `clearTimeout()` on each
- Reset the array to empty after clearing
- Also prune fired timeouts — when a timeout fires, remove it from the array

## Fix 2: Remove MUI callback signature remnant from handleModeChange

**File:** `src/web/App.tsx`

`handleModeChange` takes an unused `React.MouseEvent<HTMLElement>` first parameter (from the old MUI ToggleButtonGroup API). Call sites pass `null as unknown as React.MouseEvent<HTMLElement>` which is a code smell.

**Fix:**
- Change the signature to `handleModeChange(newMode: 'simulator' | 'play')` — drop the unused event parameter
- Update call sites to just pass the mode string directly: `onClick={() => handleModeChange('simulator')}`
- Remove the `null as unknown as React.MouseEvent<HTMLElement>` casts

## Fix 3: Remove dead code in Keyboard.tsx

**File:** `src/web/Keyboard.tsx`

`WHITE_KEY_SEMITONES` and `BLACK_KEY_OFFSET` constants are declared but never referenced.

**Fix:** Delete both unused constants.

## Tests

Existing tests must continue to pass. No new tests needed — these are cleanup fixes that don't change behavior.

## Verification Commands

`npm run build`, `npx tsc --noEmit`, `npm test` must all pass.
