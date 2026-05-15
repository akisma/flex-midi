import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AddWidgetDialog } from '../../src/web/AddWidgetDialog.js';
import type { MidiMessage } from '../../src/types.js';

describe('AddWidgetDialog', () => {
  it('renders the dialog when open', () => {
    render(React.createElement(AddWidgetDialog, { open: true, onAdd: vi.fn(), onClose: vi.fn() }));
    expect(screen.getByText('Add Widget')).toBeTruthy();
  });

  it('does not render dialog content when closed', () => {
    render(React.createElement(AddWidgetDialog, { open: false, onAdd: vi.fn(), onClose: vi.fn() }));
    expect(screen.queryByText('Add Widget')).toBeNull();
  });

  it('calls onAdd with correct WidgetConfig when form is filled and Add is clicked', () => {
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(React.createElement(AddWidgetDialog, { open: true, onAdd, onClose }));

    const labelInput = screen.getByLabelText(/label/i);
    fireEvent.change(labelInput, { target: { value: 'My Widget' } });

    const addButton = screen.getByRole('button', { name: /^add$/i });
    fireEvent.click(addButton);

    expect(onAdd).toHaveBeenCalledTimes(1);
    const config = onAdd.mock.calls[0][0];
    expect(config.label).toBe('My Widget');
    expect(config.type).toBe('value');
    expect(config.channel).toBe(0);
    expect(config.cc).toBe(0);
    expect(typeof config.id).toBe('string');
  });

  it('shows threshold field only when type is On/Off Indicator', () => {
    render(React.createElement(AddWidgetDialog, { open: true, onAdd: vi.fn(), onClose: vi.fn() }));
    expect(screen.queryByLabelText(/threshold/i)).toBeNull();

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'onoff' } });

    expect(screen.getByLabelText(/threshold/i)).toBeTruthy();
  });

  it('Add button is disabled when label is empty', () => {
    render(React.createElement(AddWidgetDialog, { open: true, onAdd: vi.fn(), onClose: vi.fn() }));
    const addButton = screen.getByRole('button', { name: /^add$/i });
    expect(addButton).toBeDisabled();
  });

  it('Learn button is visible when dialog is open', () => {
    render(React.createElement(AddWidgetDialog, { open: true, onAdd: vi.fn(), onClose: vi.fn() }));
    expect(screen.getByRole('button', { name: /^learn$/i })).toBeTruthy();
  });

  it('clicking Learn shows Waiting for MIDI input... text', () => {
    render(React.createElement(AddWidgetDialog, { open: true, onAdd: vi.fn(), onClose: vi.fn() }));
    fireEvent.click(screen.getByRole('button', { name: /^learn$/i }));
    expect(screen.getByText('Waiting for MIDI input...')).toBeTruthy();
  });

  it('clicking Cancel Learn returns to manual entry', () => {
    render(React.createElement(AddWidgetDialog, { open: true, onAdd: vi.fn(), onClose: vi.fn() }));
    fireEvent.click(screen.getByRole('button', { name: /^learn$/i }));
    expect(screen.getByText('Waiting for MIDI input...')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /cancel learn/i }));
    expect(screen.queryByText('Waiting for MIDI input...')).toBeNull();
    expect(screen.getByLabelText(/label/i)).toBeTruthy();
  });

  it('when learning and a CC message is provided via lastMidiMessage, auto-fills channel/cc/type', () => {
    const ccMessage: MidiMessage = { type: 'controlChange', channel: 2, controller: 7, value: 100 };
    const { rerender } = render(
      React.createElement(AddWidgetDialog, { open: true, onAdd: vi.fn(), onClose: vi.fn(), lastMidiMessage: null })
    );
    fireEvent.click(screen.getByRole('button', { name: /^learn$/i }));
    rerender(
      React.createElement(AddWidgetDialog, { open: true, onAdd: vi.fn(), onClose: vi.fn(), lastMidiMessage: ccMessage })
    );
    expect(screen.queryByText('Waiting for MIDI input...')).toBeNull();
    const labelInput = screen.getByLabelText(/label/i) as HTMLInputElement;
    expect(labelInput.value).toBe('CC 7');
    const channelInput = screen.getByLabelText(/channel/i) as HTMLInputElement;
    expect(channelInput.value).toBe('2');
    const ccInput = screen.getByLabelText(/cc number/i) as HTMLInputElement;
    expect(ccInput.value).toBe('7');
    const typeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    expect(typeSelect.value).toBe('range');
  });

  it('when learning and a noteOn message is provided via lastMidiMessage, auto-fills with note data', () => {
    const noteMessage: MidiMessage = { type: 'noteOn', channel: 1, note: 60, velocity: 80 };
    const { rerender } = render(
      React.createElement(AddWidgetDialog, { open: true, onAdd: vi.fn(), onClose: vi.fn(), lastMidiMessage: null })
    );
    fireEvent.click(screen.getByRole('button', { name: /^learn$/i }));
    rerender(
      React.createElement(AddWidgetDialog, { open: true, onAdd: vi.fn(), onClose: vi.fn(), lastMidiMessage: noteMessage })
    );
    expect(screen.queryByText('Waiting for MIDI input...')).toBeNull();
    const labelInput = screen.getByLabelText(/label/i) as HTMLInputElement;
    expect(labelInput.value).toBe('C4');
    const channelInput = screen.getByLabelText(/channel/i) as HTMLInputElement;
    expect(channelInput.value).toBe('1');
    const typeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    expect(typeSelect.value).toBe('note');
  });

  it('non-CC/non-noteOn messages are ignored during learn mode', () => {
    const pitchBendMessage: MidiMessage = { type: 'pitchBend', channel: 0, value: 1000 };
    const { rerender } = render(
      React.createElement(AddWidgetDialog, { open: true, onAdd: vi.fn(), onClose: vi.fn(), lastMidiMessage: null })
    );
    fireEvent.click(screen.getByRole('button', { name: /^learn$/i }));
    rerender(
      React.createElement(AddWidgetDialog, { open: true, onAdd: vi.fn(), onClose: vi.fn(), lastMidiMessage: pitchBendMessage })
    );
    expect(screen.getByText('Waiting for MIDI input...')).toBeTruthy();
  });
});
