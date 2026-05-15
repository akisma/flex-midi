import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import type { WidgetConfig } from '../../types.js';

interface ValueWidgetProps {
  config: WidgetConfig;
  value: number | undefined;
}

export function ValueWidget({ config, value }: ValueWidgetProps): React.ReactElement {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h3" component="div">
          {value !== undefined ? value : '\u2014'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {config.label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Ch {config.channel} · CC {config.cc}
        </Typography>
      </CardContent>
    </Card>
  );
}
