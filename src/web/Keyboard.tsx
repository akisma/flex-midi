import React, { useRef } from 'react';

interface KeyboardProps {
  activeNotes: ReadonlySet<number>;
  interactive?: boolean;
  onNoteOn?: (data: Uint8Array) => void;
  onNoteOff?: (data: Uint8Array) => void;
}

// Notes 48-83 (C3 to B5), 3 octaves
const START_NOTE = 48;
const END_NOTE = 83;

// Within an octave, which semitones are black keys
const BLACK_KEY_SEMITONES = new Set([1, 3, 6, 8, 10]); // C#, D#, F#, G#, A#

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
    <div className="bg-gray-800 rounded-lg p-4 w-full overflow-x-auto">
      <div
        style={{ position: 'relative', width: totalWidth, height: WHITE_KEY_HEIGHT, margin: '0 auto' }}
      >
        {/* White keys */}
        {WHITE_KEYS.map((key, index) => {
          const isActive = activeNotes.has(key.note);
          return (
            <div
              key={key.note}
              data-note={key.note}
              data-key-type="white"
              style={{
                position: 'absolute',
                left: index * WHITE_KEY_WIDTH,
                top: 0,
                width: WHITE_KEY_WIDTH - 2,
                height: WHITE_KEY_HEIGHT,
                backgroundColor: isActive ? 'rgb(76, 175, 80)' : '#f5f5f5',
                border: '1px solid #555',
                borderRadius: '0 0 4px 4px',
                boxSizing: 'border-box',
                zIndex: 1,
                transition: 'background-color 0.05s',
                cursor: interactive ? 'pointer' : 'default',
              }}
              onMouseDown={interactive ? () => handleMouseDown(key.note) : undefined}
              onMouseUp={interactive ? () => handleMouseUp(key.note) : undefined}
              onMouseLeave={interactive ? () => handleMouseLeave(key.note) : undefined}
            />
          );
        })}

        {/* Black keys */}
        {BLACK_KEYS.map((key) => {
          const isActive = activeNotes.has(key.note);
          const leftPos = (key.whiteKeyIndex! + 1) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;
          return (
            <div
              key={key.note}
              data-note={key.note}
              data-key-type="black"
              style={{
                position: 'absolute',
                left: leftPos,
                top: 0,
                width: BLACK_KEY_WIDTH,
                height: BLACK_KEY_HEIGHT,
                backgroundColor: isActive ? 'rgb(76, 175, 80)' : '#111',
                border: '1px solid #000',
                borderRadius: '0 0 3px 3px',
                boxSizing: 'border-box',
                zIndex: 2,
                transition: 'background-color 0.05s',
                cursor: interactive ? 'pointer' : 'default',
              }}
              onMouseDown={interactive ? () => handleMouseDown(key.note) : undefined}
              onMouseUp={interactive ? () => handleMouseUp(key.note) : undefined}
              onMouseLeave={interactive ? () => handleMouseLeave(key.note) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
