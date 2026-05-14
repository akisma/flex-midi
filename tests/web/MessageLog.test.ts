import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MessageLog, LogEntry } from '../../src/web/MessageLog.js';
import type { MidiMessage } from '../../src/types.js';

function makeEntry(message: MidiMessage, timestamp?: Date): LogEntry {
  return { message, timestamp: timestamp ?? new Date('2024-01-01T12:00:00.000Z') };
}

describe('MessageLog', () => {
  it('renders an empty table when no messages', () => {
    render(React.createElement(MessageLog, { messages: [] }));
    expect(screen.getByRole('table')).toBeInTheDocument();
    const rows = screen.queryAllByRole('row');
    // Only the header row
    expect(rows).toHaveLength(1);
  });

  it('displays a message row with correct type, channel, and details', () => {
    const entry = makeEntry({
      type: 'noteOn',
      channel: 2,
      note: 60,
      velocity: 100,
    });
    render(React.createElement(MessageLog, { messages: [entry] }));

    expect(screen.getByText('noteOn')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Note: 60 Vel: 100')).toBeInTheDocument();
  });

  it('color-codes noteOn messages with a success (green) chip', () => {
    const entry = makeEntry({
      type: 'noteOn',
      channel: 0,
      note: 60,
      velocity: 80,
    });
    render(React.createElement(MessageLog, { messages: [entry] }));

    const chip = screen.getByText('noteOn').closest('.MuiChip-root');
    expect(chip).toBeInTheDocument();
    expect(chip?.className).toMatch(/MuiChip-colorSuccess/);
  });

  it('limits display to 100 messages', () => {
    const entries: LogEntry[] = Array.from({ length: 101 }, (_, i) =>
      makeEntry({
        type: 'noteOn',
        channel: 0,
        note: 60,
        velocity: 80 + (i % 48),
      })
    );
    render(React.createElement(MessageLog, { messages: entries }));

    // 100 data rows + 1 header row
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(101);
  });
});
