import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import type { WidgetConfig } from '../../types.js';

interface OnOffWidgetProps {
  config: WidgetConfig;
  value: number | undefined;
}

export function OnOffWidget({ config, value }: OnOffWidgetProps): React.ReactElement {
  const threshold = config.threshold ?? 64;
  const isOn = value !== undefined && value >= threshold;
  const color = isOn ? '#4caf50' : '#616161';

  return (
    <Card elevation={2}>
      <CardContent>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: color,
            mb: 1,
          }}
        />
        <Typography variant="subtitle1" color="text.secondary">
          {config.label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Ch {config.channel} · CC {config.cc}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {value !== undefined ? value : '\u2014'}
        </Typography>
      </CardContent>
    </Card>
  );
}
