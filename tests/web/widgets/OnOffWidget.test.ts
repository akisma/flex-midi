import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { OnOffWidget } from '../../../src/web/widgets/OnOffWidget.js';
import type { WidgetConfig } from '../../../src/types.js';

const baseConfig: WidgetConfig = {
  id: 'test-id',
  type: 'onoff',
  channel: 0,
  cc: 64,
  label: 'Sustain',
  threshold: 64,
};

describe('OnOffWidget', () => {
  it('shows on state when value >= threshold', () => {
    render(React.createElement(OnOffWidget, { config: baseConfig, value: 64 }));
    const indicator = screen.getByTestId('indicator');
    expect(indicator.dataset.state).toBe('on');
  });

  it('shows off state when value < threshold', () => {
    render(React.createElement(OnOffWidget, { config: baseConfig, value: 63 }));
    const indicator = screen.getByTestId('indicator');
    expect(indicator.dataset.state).toBe('off');
  });

  it('uses default threshold of 64 when not specified', () => {
    const configNoThreshold: WidgetConfig = { ...baseConfig, threshold: undefined };
    render(React.createElement(OnOffWidget, { config: configNoThreshold, value: 64 }));
    const indicator = screen.getByTestId('indicator');
    expect(indicator.dataset.state).toBe('on');
  });

  it('shows — when no value received', () => {
    render(React.createElement(OnOffWidget, { config: baseConfig, value: undefined }));
    expect(screen.getByText('\u2014')).toBeTruthy();
  });
});
