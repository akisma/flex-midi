import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ValueWidget } from '../../../src/web/widgets/ValueWidget.js';
import type { WidgetConfig } from '../../../src/types.js';

const baseConfig: WidgetConfig = {
  id: 'test-id',
  type: 'value',
  channel: 2,
  cc: 7,
  label: 'Master Volume',
};

describe('ValueWidget', () => {
  it('renders label and value', () => {
    render(React.createElement(ValueWidget, { config: baseConfig, value: 100 }));
    expect(screen.getByText('Master Volume')).toBeTruthy();
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('shows \u2014 when value is undefined', () => {
    render(React.createElement(ValueWidget, { config: baseConfig, value: undefined }));
    expect(screen.getByText('\u2014')).toBeTruthy();
  });

  it('shows channel and CC number', () => {
    render(React.createElement(ValueWidget, { config: baseConfig, value: 64 }));
    expect(screen.getByText('Ch 2 \u00b7 CC 7')).toBeTruthy();
  });
});
