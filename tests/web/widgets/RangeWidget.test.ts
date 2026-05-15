import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { RangeWidget } from '../../../src/web/widgets/RangeWidget.js';
import type { WidgetConfig } from '../../../src/types.js';

const baseConfig: WidgetConfig = {
  id: 'test-id',
  type: 'range',
  channel: 0,
  cc: 7,
  label: 'Volume',
};

describe('RangeWidget', () => {
  it('renders label and value', () => {
    render(React.createElement(RangeWidget, { config: baseConfig, value: 100 }));
    expect(screen.getByText('Volume')).toBeTruthy();
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('shows \u2014 when value is undefined', () => {
    render(React.createElement(RangeWidget, { config: baseConfig, value: undefined }));
    expect(screen.getByText('\u2014')).toBeTruthy();
  });

  it('bar data-value attribute reflects the value', () => {
    const { container } = render(React.createElement(RangeWidget, { config: baseConfig, value: 100 }));
    const bar = container.querySelector('[data-value]') as HTMLElement;
    expect(bar).not.toBeNull();
    expect(bar.dataset.value).toBe('100');
  });
});
