import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ToggleWidget } from '../../../src/web/widgets/ToggleWidget.js';
import type { WidgetConfig } from '../../../src/types.js';

const baseConfig: WidgetConfig = {
  id: 'test-id',
  type: 'toggle',
  channel: 0,
  cc: 64,
  label: 'Sustain',
  threshold: 64,
};

describe('ToggleWidget', () => {
  it('shows on state when value >= threshold', () => {
    render(React.createElement(ToggleWidget, { config: baseConfig, value: 64 }));
    const toggle = screen.getByTestId('toggle');
    expect(toggle.dataset.state).toBe('on');
    expect(screen.getByText('ON')).toBeTruthy();
  });

  it('shows off state when value < threshold', () => {
    render(React.createElement(ToggleWidget, { config: baseConfig, value: 63 }));
    const toggle = screen.getByTestId('toggle');
    expect(toggle.dataset.state).toBe('off');
    expect(screen.getByText('OFF')).toBeTruthy();
  });

  it('uses default threshold of 64 when not specified', () => {
    const configNoThreshold: WidgetConfig = { ...baseConfig, threshold: undefined };
    render(React.createElement(ToggleWidget, { config: configNoThreshold, value: 64 }));
    const toggle = screen.getByTestId('toggle');
    expect(toggle.dataset.state).toBe('on');
  });

  it('shows \u2014 when no value', () => {
    render(React.createElement(ToggleWidget, { config: baseConfig, value: undefined }));
    expect(screen.getByText('\u2014')).toBeTruthy();
  });
});
