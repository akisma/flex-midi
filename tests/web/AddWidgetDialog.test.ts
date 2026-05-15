import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AddWidgetDialog } from '../../src/web/AddWidgetDialog.js';

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
});
