import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MessageLog } from '../../src/web/MessageLog.js';
import type { MessageEntry } from '../../src/web/MessageLog.js';

describe('MessageLog', () => {
  it('renders an empty table when no messages are passed', () => {
    render(React.createElement(MessageLog, { messages: [] }));
    expect(screen.getByRole('table')).toBeTruthy();
    const rows = screen.getAllByRole('row');
    // Only the header row + the sentinel bottom row
    expect(rows.length).toBe(2);
  });

  it('displays a message row with correct type, channel, and details', () => {
    const messages: MessageEntry[] = [
      {
        message: { type: 'noteOn', channel: 3, note: 60, velocity: 100 },
        timestamp: new Date('2024-01-01T12:00:00.000Z'),
      },
    ];
    render(React.createElement(MessageLog, { messages }));
    expect(screen.getByText('noteOn')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('Note: 60 Vel: 100')).toBeTruthy();
  });

  it('color-codes noteOn messages with a green (success) chip', () => {
    const messages: MessageEntry[] = [
      {
        message: { type: 'noteOn', channel: 0, note: 60, velocity: 80 },
        timestamp: new Date(),
      },
    ];
    const { container } = render(React.createElement(MessageLog, { messages }));
    // MUI Chip with color="success" gets the class MuiChip-colorSuccess
    const chip = container.querySelector('.MuiChip-colorSuccess');
    expect(chip).not.toBeNull();
    expect(chip?.textContent).toBe('noteOn');
  });

  it('limits display to 100 messages when given 105 messages', () => {
    const messages: MessageEntry[] = Array.from({ length: 105 }, (_, i) => ({
      message: { type: 'noteOn' as const, channel: 0, note: 60, velocity: 80 },
      timestamp: new Date(Date.now() + i),
    }));
    render(React.createElement(MessageLog, { messages }));
    const rows = screen.getAllByRole('row');
    // 1 header row + 100 data rows
    expect(rows.length).toBe(101);
  });

  it('renders a scrollable container with fixed height and overflow-y auto', () => {
    const { container } = render(React.createElement(MessageLog, { messages: [] }));
    // The TableContainer renders as a Paper div wrapping the table
    const tableContainer = container.firstChild as HTMLElement;
    expect(tableContainer).not.toBeNull();
    expect(tableContainer.style.height).toBe('350px');
    expect(tableContainer.style.overflowY).toBe('auto');
  });
});
