import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { NoteWidget } from '../../../src/web/widgets/NoteWidget.js';
import type { WidgetConfig } from '../../../src/types.js';

const baseConfig: WidgetConfig = {
  id: 'test-id',
  type: 'note',
  channel: 0,
  cc: 60,
  label: 'Kick',
};

describe('NoteWidget', () => {
  it('shows note name C4 for note 60', () => {
    render(React.createElement(NoteWidget, { config: baseConfig, isActive: false, velocity: undefined }));
    expect(screen.getByText('C4')).toBeTruthy();
  });

  it('shows active indicator when note is active', () => {
    render(React.createElement(NoteWidget, { config: baseConfig, isActive: true, velocity: 100 }));
    const indicator = screen.getByTestId('note-indicator');
    expect(indicator.dataset.state).toBe('active');
  });

  it('shows inactive indicator when note is not active', () => {
    render(React.createElement(NoteWidget, { config: baseConfig, isActive: false, velocity: undefined }));
    const indicator = screen.getByTestId('note-indicator');
    expect(indicator.dataset.state).toBe('inactive');
  });

  it('shows velocity value when provided', () => {
    render(React.createElement(NoteWidget, { config: baseConfig, isActive: true, velocity: 92 }));
    expect(screen.getByText('vel 92')).toBeTruthy();
  });

  it('shows \u2014 when no velocity data', () => {
    render(React.createElement(NoteWidget, { config: baseConfig, isActive: false, velocity: undefined }));
    expect(screen.getByText('\u2014')).toBeTruthy();
  });
});
