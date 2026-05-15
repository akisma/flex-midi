import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WidgetGrid } from '../../src/web/WidgetGrid.js';
import type { WidgetConfig } from '../../src/types.js';

vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  Droppable: ({ children }: { children: (provided: object) => React.ReactNode }) =>
    children({
      innerRef: () => {},
      droppableProps: {},
      placeholder: null,
    }),
  Draggable: ({ children }: { children: (provided: object, snapshot: object) => React.ReactNode }) =>
    children(
      {
        innerRef: () => {},
        draggableProps: {},
        dragHandleProps: {},
      },
      { isDragging: false }
    ),
}));

const widgets: WidgetConfig[] = [
  { id: 'w1', type: 'value', channel: 0, cc: 7, label: 'Volume' },
  { id: 'w2', type: 'onoff', channel: 0, cc: 64, label: 'Sustain', threshold: 64 },
  { id: 'w3', type: 'value', channel: 1, cc: 11, label: 'Expression' },
];

describe('WidgetGrid', () => {
  it('renders correct number of widget cards', () => {
    const ccValues = new Map<string, number>();
    render(React.createElement(WidgetGrid, { widgets, ccValues, onRemove: vi.fn(), onReorder: vi.fn(), activeNotes: new Set<number>(), noteVelocities: new Map<string, number>() }));
    expect(screen.getByText('Volume')).toBeTruthy();
    expect(screen.getByText('Sustain')).toBeTruthy();
    expect(screen.getByText('Expression')).toBeTruthy();
  });

  it('renders ValueWidget for type value', () => {
    const ccValues = new Map([['0:7', 100]]);
    render(React.createElement(WidgetGrid, { widgets, ccValues, onRemove: vi.fn(), onReorder: vi.fn(), activeNotes: new Set<number>(), noteVelocities: new Map<string, number>() }));
    expect(screen.getByText('Volume')).toBeTruthy();
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('renders OnOffWidget for type onoff', () => {
    const ccValues = new Map([['0:64', 127]]);
    render(
      React.createElement(WidgetGrid, { widgets, ccValues, onRemove: vi.fn(), onReorder: vi.fn(), activeNotes: new Set<number>(), noteVelocities: new Map<string, number>() })
    );
    expect(screen.getByText('Sustain')).toBeTruthy();
    expect(screen.getByTestId('indicator')).toBeTruthy();
  });

  it('calls onRemove with correct id when delete button is clicked', () => {
    const onRemove = vi.fn();
    const ccValues = new Map<string, number>();
    render(React.createElement(WidgetGrid, { widgets, ccValues, onRemove, onReorder: vi.fn(), activeNotes: new Set<number>(), noteVelocities: new Map<string, number>() }));
    const deleteButtons = screen.getAllByRole('button', { name: /delete widget/i });
    expect(deleteButtons.length).toBe(3);
    fireEvent.click(deleteButtons[1]);
    expect(onRemove).toHaveBeenCalledWith('w2');
  });

  it('renders a drag handle for each widget', () => {
    const ccValues = new Map<string, number>();
    render(React.createElement(WidgetGrid, { widgets, ccValues, onRemove: vi.fn(), onReorder: vi.fn(), activeNotes: new Set<number>(), noteVelocities: new Map<string, number>() }));
    const handles = screen.getAllByTestId('drag-handle');
    expect(handles.length).toBe(widgets.length);
  });

  it('onReorder prop is callable without errors', () => {
    const onReorder = vi.fn();
    const ccValues = new Map<string, number>();
    render(React.createElement(WidgetGrid, { widgets, ccValues, onRemove: vi.fn(), onReorder, activeNotes: new Set<number>(), noteVelocities: new Map<string, number>() }));
    expect(() => onReorder(widgets)).not.toThrow();
  });

  it('widgets render in the correct order', () => {
    const ccValues = new Map<string, number>();
    render(React.createElement(WidgetGrid, { widgets, ccValues, onRemove: vi.fn(), onReorder: vi.fn(), activeNotes: new Set<number>(), noteVelocities: new Map<string, number>() }));
    const labels = screen.getAllByText(/Volume|Sustain|Expression/);
    expect(labels[0].textContent).toBe('Volume');
    expect(labels[1].textContent).toBe('Sustain');
    expect(labels[2].textContent).toBe('Expression');
  });
});
