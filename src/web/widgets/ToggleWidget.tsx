import React from 'react';
import type { WidgetConfig } from '../../types.js';

interface ToggleWidgetProps {
  config: WidgetConfig;
  value: number | undefined;
}

export function ToggleWidget({ config, value }: ToggleWidgetProps): React.ReactElement {
  const threshold = config.threshold ?? 64;
  const isOn = value !== undefined && value >= threshold;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <div
          data-testid="toggle"
          data-state={value !== undefined ? (isOn ? 'on' : 'off') : 'off'}
          className={`w-14 h-7 rounded-full flex items-center px-0.5 transition-colors ${
            isOn ? 'bg-green-500' : 'bg-gray-600'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full bg-white transition-transform ${
              isOn ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </div>
        <div className="text-white text-sm font-medium">
          {value !== undefined ? (isOn ? 'ON' : 'OFF') : '\u2014'}
        </div>
      </div>
      <div className="text-gray-400 text-sm">{config.label}</div>
      <div className="text-gray-500 text-xs">Ch {config.channel} · CC {config.cc}</div>
    </div>
  );
}
