import React from 'react';
import { Grid, Box, IconButton } from '@mui/material';
const DeleteIcon = ({ fontSize }: { fontSize?: string }) => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', width: fontSize === 'small' ? 18 : 24, height: fontSize === 'small' ? 18 : 24, viewBox: '0 0 24 24', fill: 'currentColor' }, React.createElement('path', { d: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' }));
import type { WidgetConfig } from '../types.js';
import { ValueWidget } from './widgets/ValueWidget.js';
import { OnOffWidget } from './widgets/OnOffWidget.js';

interface WidgetGridProps {
  widgets: WidgetConfig[];
  ccValues: Map<string, number>;
  onRemove: (id: string) => void;
}

export function WidgetGrid({ widgets, ccValues, onRemove }: WidgetGridProps): React.ReactElement {
  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {widgets.map((widget) => {
        const value = ccValues.get(`${widget.channel}:${widget.cc}`);
        return (
          <Grid item key={widget.id} xs={12} sm={6} md={3}>
            <Box sx={{ position: 'relative' }}>
              <IconButton
                size="small"
                onClick={() => onRemove(widget.id)}
                aria-label="delete widget"
                sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              {widget.type === 'value' ? (
                <ValueWidget config={widget} value={value} />
              ) : (
                <OnOffWidget config={widget} value={value} />
              )}
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}
