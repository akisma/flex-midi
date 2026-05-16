# App State Management Fixes

## Overview

Fix three state management issues in App.tsx identified during code review.

## Fix 1: Stabilize handleMidiInput with useCallback

**Problem:** `handleMidiInput` is a plain function captured once in the `useEffect([], [])` that sets up the simulator. It only calls state setters (which are stable), so it works today — but if it ever reads state directly, it will silently break due to stale closures.

**Fix:** Wrap `handleMidiInput` in `useCallback` with an empty dependency array (since it only uses state setter functions, which are stable). This makes the intent explicit and future-proof.

```typescript
const handleMidiInput = useCallback((data: Uint8Array) => {
  const message = parseMidiMessage(data);
  // ... rest of the function
}, []);
```

## Fix 2: Track activeNotes per channel

**Problem:** `activeNotes` is `Set<number>` keyed by note number only. If note 60 is played on channel 0 and channel 1 simultaneously, a noteOff on channel 0 removes 60 from the set, dimming the keyboard key even though channel 1 still holds it. The simulator uses channels 0-2, so this is a real scenario.

**Fix:** Change `activeNotes` from `Set<number>` to `Map<number, Set<number>>` — a map from note number to a set of channels holding that note. Or simpler: use a reference count approach with `Map<number, number>` where the value is the count of channels holding that note.

Simpler approach (reference count):
- `activeNotes: Map<number, number>` — key is note number, value is how many channels hold it
- On noteOn: increment the count (or set to 1 if not present)
- On noteOff: decrement the count; remove the entry if count reaches 0
- The Keyboard component checks `activeNotes.has(note)` which still works since we remove entries at 0

**Keyboard.tsx impact:** The Keyboard currently receives `activeNotes: Set<number>` and checks `.has(note)`. Change the prop type to `Map<number, number>` and check `.has(note)` — the Map API supports the same `.has()` method so the check is identical. Update the prop type definition.

**StatusPanel impact:** `activeNoteCount` currently uses `activeNotes.size`. With the Map, `.size` still gives the count of unique active notes. No change needed to the StatusPanel.

## Fix 3: Clear noteVelocities on noteOff

**Problem:** `noteVelocities` (`Map<string, number>`) is populated on noteOn but never cleared on noteOff. The map grows indefinitely and NoteWidget shows stale velocity data for notes that are no longer active.

**Fix:** In `handleMidiInput`, when a noteOff arrives, delete the entry from `noteVelocities`:

```typescript
if (message.type === 'noteOff') {
  setNoteVelocities(prev => {
    const next = new Map(prev);
    next.delete(`${message.channel}:${message.note}`);
    return next;
  });
}
```

NoteWidget already handles `undefined` velocity (shows "—"), so this is safe.

## Tests

### App.test.ts updates

The existing App.test.ts tests may need updates if they check `activeNotes` type or behavior. Verify existing tests still pass.

No new test files needed — these are internal state fixes. The existing tests validate the external behavior (components render correctly).

### Manual verification

After the fix, run the simulator and watch:
- Multiple channels playing the same note: key should stay lit until ALL channels release it
- NoteWidget velocity should clear to "—" when the note is released

## File Structure

```
flex-midi/
  src/
    web/
      App.tsx                         # MODIFY — useCallback, Map<number,number> for activeNotes, clear noteVelocities
      Keyboard.tsx                    # MODIFY — accept Map<number,number> instead of Set<number>
  tests/
    web/
      Keyboard.test.ts                # MODIFY — update activeNotes prop type in tests
      App.test.ts                     # MODIFY — update if needed for new activeNotes type
```

## Verification Commands

`npm run build`, `npx tsc --noEmit`, `npm test` must all pass.
