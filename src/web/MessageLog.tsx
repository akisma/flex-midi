import React, { useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
} from '@mui/material';
import type { MidiMessage } from '../types.js';

export interface MessageEntry {
  message: MidiMessage;
  timestamp: Date;
}

interface MessageLogProps {
  messages: MessageEntry[];
}

function formatTime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const detailsFormatters: Record<MidiMessage['type'], (msg: any) => string> = {
  noteOn:          (m) => `Note: ${m.note} Vel: ${m.velocity}`,
  noteOff:         (m) => `Note: ${m.note} Vel: ${m.velocity}`,
  aftertouch:      (m) => `Note: ${m.note} Pressure: ${m.pressure}`,
  controlChange:   (m) => `CC: ${m.controller} Val: ${m.value}`,
  programChange:   (m) => `Program: ${m.program}`,
  channelPressure: (m) => `Pressure: ${m.pressure}`,
  pitchBend:       (m) => `Value: ${m.value}`,
  unknown:         (m) => `Data: [${m.data.join(', ')}]`,
};

function formatDetails(message: MidiMessage): string {
  return detailsFormatters[message.type](message);
}

type ChipColor = 'success' | 'error' | 'primary' | 'warning' | 'default';

const chipColors: Record<MidiMessage['type'], ChipColor> = {
  noteOn: 'success',
  noteOff: 'error',
  controlChange: 'primary',
  pitchBend: 'warning',
  aftertouch: 'default',
  programChange: 'default',
  channelPressure: 'default',
  unknown: 'default',
};

const MAX_MESSAGES = 100;

export function MessageLog({ messages }: MessageLogProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const displayed = messages.slice(-MAX_MESSAGES);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <TableContainer ref={containerRef} component={Paper} style={{ height: '350px', overflowY: 'auto' }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Channel</TableCell>
            <TableCell>Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayed.map((entry, index) => (
            <TableRow key={index}>
              <TableCell sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {formatTime(entry.timestamp)}
              </TableCell>
              <TableCell>
                <Chip
                  label={entry.message.type}
                  color={chipColors[entry.message.type]}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {'channel' in entry.message ? entry.message.channel : '—'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace' }}>
                {formatDetails(entry.message)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
