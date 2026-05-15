import React from 'react';
import type { WidgetConfig } from '../../types.js';

interface RangeWidgetProps {
  config: WidgetConfig;
  value: number | undefined;
}

export function RangeWidget({ config, value }: RangeWidgetProps): React.ReactElement {
  const percent = value !== undefined ? (value / 127) * 100 : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 bg-gray-700 h-3 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-3 rounded-full"
            style={{ width: `${percent}%` }}
            data-value={value}
          />
        </div>
        <div className="text-white text-sm font-mono w-8 text-right">
          {value !== undefined ? value : '\u2014'}
        </div>
      </div>
      <div className="text-gray-400 text-sm">{config.label}</div>
      <div className="text-gray-500 text-xs">Ch {config.channel} · CC {config.cc}</div>
    </div>
  );
}
