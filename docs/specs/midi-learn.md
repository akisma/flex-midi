# MIDI Learn Mode

## Overview

Add a "Learn" button to the Add Widget dialog. When clicked, the system listens for the next incoming MIDI message and auto-fills the channel and CC/note number. User confirms the mapping and picks a widget type.

## How It Works

### User Flow

1. User clicks "Add Widget" — dialog opens
2. User clicks "Learn" button in the dialog
3. Dialog shows a listening state: "Waiting for MIDI input..." with a pulsing indicator
4. User moves a knob/fader or presses a key on their MIDI controller (or the simulator sends a message)
5. The system captures the first CC or noteOn message
6. Dialog auto-fills: channel, CC/note number, and suggests a label based on the message type
7. User can adjust the auto-filled values, pick a widget type, and click "Add"
8. If the user wants to cancel the learn, they click "Cancel Learn" to return to manual entry

### What Gets Captured

Only these message types trigger a learn capture:
- `controlChange` → fills channel + CC number, suggests type "range"
- `noteOn` → fills channel + note number, suggests type "note"

Other message types (noteOff, pitchBend, etc.) are ignored during learn mode.

### Suggested Labels

When a CC is captured: `"CC {number}"` (e.g., "CC 7")
When a note is captured: `"{noteName}"` (e.g., "C4") using the `midiNoteName` helper

## Component Changes

### AddWidgetDialog.tsx

**New state:**
- `learning: boolean` — whether learn mode is active
- `onLearnCapture` callback prop — App passes this down, it gets called with each MIDI message while dialog is open

**New prop:**
```typescript
interface AddWidgetDialogProps {
  open: boolean;
  onAdd: (config: WidgetConfig) => void;
  onClose: () => void;
  lastMidiMessage: MidiMessage | null;  // NEW — latest message from App
}
```

**Learn mode UI:**
- "Learn" button next to the manual input fields (Tailwind styled button with `bg-purple-600`)
- When learning: replace the form fields with a centered "Waiting for MIDI input..." message and a pulsing dot (`animate-pulse`)
- "Cancel Learn" button to return to manual mode
- When a valid message is captured (CC or noteOn), exit learn mode and populate the fields

**Learn mode logic:**
- When `learning` is true, watch `lastMidiMessage` prop via `useEffect`
- When a `controlChange` arrives: set channel, cc, label="CC {controller}", type="range", exit learn mode
- When a `noteOn` arrives: set channel, cc=note, label=midiNoteName(note), type="note", exit learn mode
- Ignore other message types

### App.tsx

**Changes:**
- Track `lastMidiMessage: MidiMessage | null` in state — updated on every parsed message
- Pass `lastMidiMessage` to `AddWidgetDialog`

This is simple — the App already processes every message in `handleMidiInput`. Just add:
```typescript
setLastMidiMessage(message);
```

## Tests

### AddWidgetDialog Learn Tests (add to existing `tests/web/AddWidgetDialog.test.ts`)

- "Learn" button is visible when dialog is open
- Clicking "Learn" shows "Waiting for MIDI input..." text
- Clicking "Cancel Learn" returns to manual entry
- When learning and a CC message is provided via lastMidiMessage, auto-fills channel/cc/type
- When learning and a noteOn message is provided via lastMidiMessage, auto-fills with note data
- Non-CC/non-noteOn messages are ignored during learn mode

## File Structure

```
flex-midi/
  src/
    web/
      App.tsx                         # MODIFY — add lastMidiMessage state, pass to dialog
      AddWidgetDialog.tsx             # MODIFY — add learn mode
  tests/
    web/
      AddWidgetDialog.test.ts         # MODIFY — add learn mode tests
```

## Verification Commands

`npm run build`, `npx tsc --noEmit`, `npm test` must all pass.
