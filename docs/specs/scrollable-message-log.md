# Scrollable Message Log

## Overview

Constrain the message log to a fixed-height scrollable container so it doesn't push the keyboard off screen as messages accumulate.

## Change

In `MessageLog.tsx`, wrap the MUI `Table` in a MUI `TableContainer` (or `Box`) with:

- Fixed height showing approximately 7 rows (~350px, adjust based on actual row height)
- `overflow-y: auto` for vertical scrolling
- Auto-scroll to the bottom when new messages arrive (existing behavior, but now within the container)

## What NOT to Change

- No changes to the table columns, chip colors, or message format
- No changes to App.tsx, Keyboard.tsx, or StatusPanel.tsx
- No changes to the 100-message limit

## File Structure

```
flex-midi/
  src/
    web/
      MessageLog.tsx            # MODIFY — add fixed-height scrollable container
  tests/
    web/
      MessageLog.test.ts        # MODIFY — add test for container overflow style
```

## Verification Commands

`npm run build`, `npx tsc --noEmit`, `npm test` must all pass.
