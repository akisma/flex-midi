import React, { useEffect, useRef } from 'react';
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

const badgeClasses: Record<MidiMessage['type'], string> = {
  noteOn: 'bg-green-900 text-green-300',
  noteOff: 'bg-red-900 text-red-300',
  controlChange: 'bg-blue-900 text-blue-300',
  pitchBend: 'bg-yellow-900 text-yellow-300',
  aftertouch: 'bg-gray-700 text-gray-300',
  programChange: 'bg-gray-700 text-gray-300',
  channelPressure: 'bg-gray-700 text-gray-300',
  unknown: 'bg-gray-700 text-gray-300',
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
    <div ref={containerRef} style={{ height: '350px', overflowY: 'auto' }}>
      <table role="table" className="w-full text-sm text-left">
        <thead>
          <tr>
            <th className="px-2 py-1 text-gray-400 font-medium">Time</th>
            <th className="px-2 py-1 text-gray-400 font-medium">Type</th>
            <th className="px-2 py-1 text-gray-400 font-medium">Channel</th>
            <th className="px-2 py-1 text-gray-400 font-medium">Details</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map((entry, index) => (
            <tr key={index}>
              <td className="px-2 py-1 font-mono whitespace-nowrap text-gray-300">
                {formatTime(entry.timestamp)}
              </td>
              <td className="px-2 py-1">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${badgeClasses[entry.message.type]}`}>
                  {entry.message.type}
                </span>
              </td>
              <td className="px-2 py-1 text-gray-300">
                {'channel' in entry.message ? entry.message.channel : '—'}
              </td>
              <td className="px-2 py-1 font-mono text-gray-300">
                {formatDetails(entry.message)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
