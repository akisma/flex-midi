import React, { useRef } from 'react';
import { Box, Paper } from '@mui/material';

interface KeyboardProps {
  activeNotes: Set<number>;
  interactive?: boolean;
  onNoteOn?: (data: Uint8Array) => void;
  onNoteOff?: (data: Uint8Array) => void;
}

// Notes 48-83 (C3 to B5), 3 octaves
const START_NOTE = 48;
const END_NOTE = 83;

// Within an octave, which semitones are black keys
const BLACK_KEY_SEMITONES = new Set([1, 3, 6, 8, 10]); // C#, D#, F#, G#, A#

// White key semitones in order: C, D, E, F, G, A, B
const WHITE_KEY_SEMITONES = [0, 2, 4, 5, 7, 9, 11];

interface KeyInfo {
  note: number;
  isBlack: boolean;
  // For black keys: which white key index (within the full keyboard) they sit after
  whiteKeyIndex?: number;
}

function buildKeys(): KeyInfo[] {
  const keys: KeyInfo[] = [];
  let whiteKeyIndex = 0;

  for (let note = START_NOTE; note <= END_NOTE; note++) {
    const semitone = note % 12;
    const isBlack = BLACK_KEY_SEMITONES.has(semitone);
    if (isBlack) {
      // Black key sits between the previous white key and the next
      keys.push({ note, isBlack: true, whiteKeyIndex: whiteKeyIndex - 1 });
    } else {
      keys.push({ note, isBlack: false });
      whiteKeyIndex++;
    }
  }

  return keys;
}

const ALL_KEYS = buildKeys();
const WHITE_KEYS = ALL_KEYS.filter((k) => !k.isBlack);
const BLACK_KEYS = ALL_KEYS.filter((k) => k.isBlack);

const WHITE_KEY_WIDTH = 36; // px
const WHITE_KEY_HEIGHT = 120; // px
const BLACK_KEY_WIDTH = 22; // px
const BLACK_KEY_HEIGHT = 72; // px

// Offset of black key center relative to the left edge of the white key it follows
// Black key is centered between two white keys, so offset = WHITE_KEY_WIDTH - BLACK_KEY_WIDTH/2
const BLACK_KEY_OFFSET = WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;

export function Keyboard({ activeNotes, interactive = false, onNoteOn, onNoteOff }: KeyboardProps): React.ReactElement {
  const pressedKeys = useRef<Set<number>>(new Set());
  const totalWidth = WHITE_KEYS.length * WHITE_KEY_WIDTH;

  const handleMouseDown = (note: number) => {
    if (!interactive || !onNoteOn) return;
    pressedKeys.current.add(note);
    onNoteOn(new Uint8Array([0x90, note, 100]));
  };

  const handleMouseUp = (note: number) => {
    if (!interactive || !onNoteOff) return;
    pressedKeys.current.delete(note);
    onNoteOff(new Uint8Array([0x80, note, 0]));
  };

  const handleMouseLeave = (note: number) => {
    if (!interactive || !onNoteOff) return;
    if (pressedKeys.current.has(note)) {
      pressedKeys.current.delete(note);
      onNoteOff(new Uint8Array([0x80, note, 0]));
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        display: 'inline-block',
        p: 2,
        backgroundColor: '#1a1a2e',
        borderRadius: 2,
        width: '100%',
        overflowX: 'auto',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: totalWidth,
          height: WHITE_KEY_HEIGHT,
          mx: 'auto',
        }}
      >
        {/* White keys */}
        {WHITE_KEYS.map((key, index) => {
          const isActive = activeNotes.has(key.note);
          return (
            <Box
              key={key.note}
              data-note={key.note}
              data-key-type="white"
              style={{ backgroundColor: isActive ? 'rgb(76, 175, 80)' : '#f5f5f5' }}
              onMouseDown={interactive ? () => handleMouseDown(key.note) : undefined}
              onMouseUp={interactive ? () => handleMouseUp(key.note) : undefined}
              onMouseLeave={interactive ? () => handleMouseLeave(key.note) : undefined}
              sx={{
                position: 'absolute',
                left: index * WHITE_KEY_WIDTH,
                top: 0,
                width: WHITE_KEY_WIDTH - 2,
                height: WHITE_KEY_HEIGHT,
                border: '1px solid #555',
                borderRadius: '0 0 4px 4px',
                boxSizing: 'border-box',
                zIndex: 1,
                transition: 'background-color 0.05s',
                cursor: interactive ? 'pointer' : 'default',
                '&:hover': interactive ? { filter: 'brightness(1.1)' } : {},
              }}
            />
          );
        })}

        {/* Black keys */}
        {BLACK_KEYS.map((key) => {
          const isActive = activeNotes.has(key.note);
          const leftPos = (key.whiteKeyIndex! + 1) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;
          return (
            <Box
              key={key.note}
              data-note={key.note}
              data-key-type="black"
              style={{ backgroundColor: isActive ? 'rgb(76, 175, 80)' : '#111' }}
              onMouseDown={interactive ? () => handleMouseDown(key.note) : undefined}
              onMouseUp={interactive ? () => handleMouseUp(key.note) : undefined}
              onMouseLeave={interactive ? () => handleMouseLeave(key.note) : undefined}
              sx={{
                position: 'absolute',
                left: leftPos,
                top: 0,
                width: BLACK_KEY_WIDTH,
                height: BLACK_KEY_HEIGHT,
                border: '1px solid #000',
                borderRadius: '0 0 3px 3px',
                boxSizing: 'border-box',
                zIndex: 2,
                transition: 'background-color 0.05s',
                cursor: interactive ? 'pointer' : 'default',
                '&:hover': interactive ? { filter: 'brightness(1.3)' } : {},
              }}
            />
          );
        })}
      </Box>
    </Paper>
  );
}
