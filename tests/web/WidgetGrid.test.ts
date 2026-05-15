import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WidgetGrid } from '../../src/web/WidgetGrid.js';
import type { WidgetConfig } from '../../src/types.js';

const widgets: WidgetConfig[] = [
  { id: 'w1', type: 'value', channel: 0, cc: 7, label: 'Volume' },
  { id: 'w2', type: 'onoff', channel: 0, cc: 64, label: 'Sustain', threshold: 64 },
  { id: 'w3', type: 'value', channel: 1, cc: 11, label: 'Expression' },
];

describe('WidgetGrid', () => {
  it('renders correct number of widget cards', () => {
    const ccValues = new Map<string, number>();
    render(React.createElement(WidgetGrid, { widgets, ccValues, onRemove: vi.fn() }));
    expect(screen.getByText('Volume')).toBeTruthy();
    expect(screen.getByText('Sustain')).toBeTruthy();
    expect(screen.getByText('Expression')).toBeTruthy();
  });

  it('renders ValueWidget for type value', () => {
    const ccValues = new Map([['0:7', 100]]);
    render(React.createElement(WidgetGrid, { widgets, ccValues, onRemove: vi.fn() }));
    expect(screen.getByText('Volume')).toBeTruthy();
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('renders OnOffWidget for type onoff', () => {
    const ccValues = new Map([['0:64', 127]]);
    render(
      React.createElement(WidgetGrid, { widgets, ccValues, onRemove: vi.fn() })
    );
    expect(screen.getByText('Sustain')).toBeTruthy();
    expect(screen.getByTestId('indicator')).toBeTruthy();
  });

  it('calls onRemove with correct id when delete button is clicked', () => {
    const onRemove = vi.fn();
    const ccValues = new Map<string, number>();
    render(React.createElement(WidgetGrid, { widgets, ccValues, onRemove }));
    const deleteButtons = screen.getAllByRole('button', { name: /delete widget/i });
    expect(deleteButtons.length).toBe(3);
    fireEvent.click(deleteButtons[1]);
    expect(onRemove).toHaveBeenCalledWith('w2');
  });
});
