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
  it('shows green indicator when value >= threshold', () => {
    const { container } = render(
      React.createElement(OnOffWidget, { config: baseConfig, value: 64 })
    );
    const circle = container.querySelector('[style*="border-radius"]') as HTMLElement;
    expect(circle).not.toBeNull();
    expect(circle.style.backgroundColor).toBe('rgb(76, 175, 80)');
  });

  it('shows grey indicator when value < threshold', () => {
    const { container } = render(
      React.createElement(OnOffWidget, { config: baseConfig, value: 63 })
    );
    const circle = container.querySelector('[style*="border-radius"]') as HTMLElement;
    expect(circle).not.toBeNull();
    expect(circle.style.backgroundColor).toBe('rgb(97, 97, 97)');
  });

  it('uses default threshold of 64 when not specified', () => {
    const configNoThreshold: WidgetConfig = { ...baseConfig, threshold: undefined };
    const { container } = render(
      React.createElement(OnOffWidget, { config: configNoThreshold, value: 64 })
    );
    const circle = container.querySelector('[style*="border-radius"]') as HTMLElement;
    expect(circle.style.backgroundColor).toBe('rgb(76, 175, 80)');
  });

  it('shows \u2014 when no value received', () => {
    render(React.createElement(OnOffWidget, { config: baseConfig, value: undefined }));
    expect(screen.getByText('\u2014')).toBeTruthy();
  });
});
