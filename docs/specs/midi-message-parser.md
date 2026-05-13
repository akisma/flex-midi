# MIDI Message Parser

## Overview

Scaffold the flex-midi project and implement a MIDI message parser that decodes raw MIDI byte arrays into typed JavaScript objects. Pure logic — no hardware, no I/O.

## Project Setup

Initialize a TypeScript/ESM/Node.js project:

- `package.json` with `"type": "module"`
- `tsconfig.json` with strict mode, ES2022 target, Node16 module resolution
- vitest for testing
- Output to `dist/`

## Parser Requirements

### Input

A `Uint8Array` of raw MIDI bytes.

### Output

A typed `MidiMessage` object. The parser must handle these message types:

| Status Byte | Type | Fields |
|------------|------|--------|
| `0x80-0x8F` | `noteOff` | `channel` (0-15), `note` (0-127), `velocity` (0-127) |
| `0x90-0x9F` | `noteOn` | `channel` (0-15), `note` (0-127), `velocity` (0-127). Note: velocity 0 = noteOff |
| `0xA0-0xAF` | `aftertouch` | `channel`, `note`, `pressure` (0-127) |
| `0xB0-0xBF` | `controlChange` | `channel`, `controller` (0-127), `value` (0-127) |
| `0xC0-0xCF` | `programChange` | `channel`, `program` (0-127) |
| `0xD0-0xDF` | `channelPressure` | `channel`, `pressure` (0-127) |
| `0xE0-0xEF` | `pitchBend` | `channel`, `value` (-8192 to 8191, computed from two 7-bit bytes) |

Unknown or malformed messages return `{ type: 'unknown', data: <original bytes> }`.

### API

```typescript
// src/parser.ts
export function parseMidiMessage(data: Uint8Array): MidiMessage;
```

### Types

```typescript
// src/types.ts
export type MidiMessage =
  | { type: 'noteOn'; channel: number; note: number; velocity: number }
  | { type: 'noteOff'; channel: number; note: number; velocity: number }
  | { type: 'aftertouch'; channel: number; note: number; pressure: number }
  | { type: 'controlChange'; channel: number; controller: number; value: number }
  | { type: 'programChange'; channel: number; program: number }
  | { type: 'channelPressure'; channel: number; pressure: number }
  | { type: 'pitchBend'; channel: number; value: number }
  | { type: 'unknown'; data: number[] };
```

### Edge Cases

- Empty input → `unknown`
- Single byte (incomplete message) → `unknown`
- `noteOn` with velocity 0 → treat as `noteOff`
- Bytes outside valid MIDI range → `unknown`

## Tests

Tests must cover:
- Each of the 7 message types with known byte values
- Channel extraction (verify channel 0 and channel 15 both work)
- Pitch bend value computation (two 7-bit bytes → signed 14-bit value)
- noteOn with velocity 0 → noteOff conversion
- Edge cases: empty input, single byte, invalid status byte

## File Structure

```
flex-midi/
  package.json
  tsconfig.json
  vitest.config.ts
  src/
    types.ts
    parser.ts
  tests/
    parser.test.ts
```

## Verification Commands

```yaml
commands:
  build: npm run build
  typecheck: npx tsc --noEmit
  test: npm test
```

All three must pass.
