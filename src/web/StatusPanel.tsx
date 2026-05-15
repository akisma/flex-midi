import React from 'react';
import type { MidiMessage } from '../types.js';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiNoteName(note: number): string {
  const octave = Math.floor(note / 12) - 1;
  const name = NOTE_NAMES[note % 12];
  return `${name}${octave}`;
}

interface StatusPanelProps {
  lastNote: (MidiMessage & { type: 'noteOn' }) | null;
  lastChannel: number | null;
  activeNoteCount: number;
  messagesPerSecond: number;
}

function StatRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div>
      <div className="text-gray-400 text-sm">{label}</div>
      <div className="text-white text-lg font-mono">{value}</div>
    </div>
  );
}

export function StatusPanel({
  lastNote,
  lastChannel,
  activeNoteCount,
  messagesPerSecond,
}: StatusPanelProps): React.ReactElement {
  const lastNoteDisplay =
    lastNote !== null
      ? `${midiNoteName(lastNote.note)} (vel ${lastNote.velocity})`
      : '\u2014';

  const channelDisplay = lastChannel !== null ? String(lastChannel) : '\u2014';

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full">
      <div className="text-white font-semibold mb-2">Status</div>
      <hr className="border-gray-700 my-2" />
      <StatRow label="Last Note" value={lastNoteDisplay} />
      <hr className="border-gray-700 my-2" />
      <StatRow label="Channel" value={channelDisplay} />
      <hr className="border-gray-700 my-2" />
      <StatRow label="Active Notes" value={String(activeNoteCount)} />
      <hr className="border-gray-700 my-2" />
      <StatRow label="Messages/sec" value={messagesPerSecond.toFixed(1)} />
    </div>
  );
}
