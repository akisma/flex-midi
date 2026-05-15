import React from 'react';
import type { WidgetConfig } from '../../types.js';

interface OnOffWidgetProps {
  config: WidgetConfig;
  value: number | undefined;
}

export function OnOffWidget({ config, value }: OnOffWidgetProps): React.ReactElement {
  const threshold = config.threshold ?? 64;
  const isOn = value !== undefined && value >= threshold;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div
        data-testid="indicator"
        data-state={isOn ? 'on' : 'off'}
        className={`w-10 h-10 rounded-full mb-2 ${isOn ? 'bg-green-500' : 'bg-gray-600'}`}
      />
      <div className="text-gray-400 text-sm mt-1">{config.label}</div>
      <div className="text-gray-500 text-xs">Ch {config.channel} · CC {config.cc}</div>
      <div className="text-white text-sm mt-1">
        {value !== undefined ? value : '\u2014'}
      </div>
    </div>
  );
}
