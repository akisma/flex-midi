import React from 'react';
import { Card, CardContent, Typography, Divider, Box } from '@mui/material';
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
    <Box sx={{ py: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
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
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Status
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <StatRow label="Last Note" value={lastNoteDisplay} />
        <Divider />
        <StatRow label="Channel" value={channelDisplay} />
        <Divider />
        <StatRow label="Active Notes" value={String(activeNoteCount)} />
        <Divider />
        <StatRow label="Messages/sec" value={messagesPerSecond.toFixed(1)} />
      </CardContent>
    </Card>
  );
}
