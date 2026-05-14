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

export interface LogEntry {
  message: MidiMessage;
  timestamp: Date;
}

function formatTime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  const mmm = String(date.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${mmm}`;
}

function formatDetails(message: MidiMessage): string {
  switch (message.type) {
    case 'noteOn':
      return `Note: ${message.note} Vel: ${message.velocity}`;
    case 'noteOff':
      return `Note: ${message.note} Vel: ${message.velocity}`;
    case 'aftertouch':
      return `Note: ${message.note} Pressure: ${message.pressure}`;
    case 'controlChange':
      return `CC: ${message.controller} Val: ${message.value}`;
    case 'programChange':
      return `Program: ${message.program}`;
    case 'channelPressure':
      return `Pressure: ${message.pressure}`;
    case 'pitchBend':
      return `Value: ${message.value}`;
    case 'unknown':
      return `Data: [${message.data.join(', ')}]`;
  }
}

type ChipColor = 'success' | 'error' | 'primary' | 'warning' | 'default';

function getChipColor(type: MidiMessage['type']): ChipColor {
  switch (type) {
    case 'noteOn':
      return 'success';
    case 'noteOff':
      return 'error';
    case 'controlChange':
      return 'primary';
    case 'pitchBend':
      return 'warning';
    default:
      return 'default';
  }
}

interface MessageLogProps {
  messages: LogEntry[];
}

export function MessageLog({ messages }: MessageLogProps): React.ReactElement {
  const bottomRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const displayed = messages.slice(-100);

  return (
    <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
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
            <TableRow
              key={index}
              ref={index === displayed.length - 1 ? bottomRef : null}
            >
              <TableCell sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {formatTime(entry.timestamp)}
              </TableCell>
              <TableCell>
                <Chip
                  label={entry.message.type}
                  color={getChipColor(entry.message.type)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {'channel' in entry.message ? entry.message.channel : '-'}
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
