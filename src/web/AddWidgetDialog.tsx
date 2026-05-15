import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import type { WidgetConfig } from '../types.js';

interface AddWidgetDialogProps {
  open: boolean;
  onAdd: (config: WidgetConfig) => void;
  onClose: () => void;
}

export function AddWidgetDialog({ open, onAdd, onClose }: AddWidgetDialogProps): React.ReactElement {
  const [label, setLabel] = useState('');
  const [channel, setChannel] = useState(0);
  const [cc, setCc] = useState(0);
  const [type, setType] = useState<'value' | 'onoff'>('value');
  const [threshold, setThreshold] = useState(64);

  const labelError = label.trim() === '';
  const channelError = channel < 0 || channel > 15;
  const ccError = cc < 0 || cc > 127;
  const thresholdError = threshold < 0 || threshold > 127;

  const isValid = !labelError && !channelError && !ccError && (type !== 'onoff' || !thresholdError);

  const handleAdd = () => {
    if (!isValid) return;
    const config: WidgetConfig = {
      id: crypto.randomUUID(),
      type,
      channel,
      cc,
      label: label.trim(),
      ...(type === 'onoff' ? { threshold } : {}),
    };
    onAdd(config);
    handleClose();
  };

  const handleClose = () => {
    setLabel('');
    setChannel(0);
    setCc(0);
    setType('value');
    setThreshold(64);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Widget</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            error={labelError && label !== ''}
            required
            fullWidth
          />
          <TextField
            label="Channel"
            type="number"
            value={channel}
            onChange={(e) => setChannel(Number(e.target.value))}
            error={channelError}
            helperText={channelError ? 'Must be 0-15' : undefined}
            inputProps={{ min: 0, max: 15 }}
            fullWidth
          />
          <TextField
            label="CC Number"
            type="number"
            value={cc}
            onChange={(e) => setCc(Number(e.target.value))}
            error={ccError}
            helperText={ccError ? 'Must be 0-127' : undefined}
            inputProps={{ min: 0, max: 127 }}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              label="Type"
              onChange={(e) => setType(e.target.value as 'value' | 'onoff')}
            >
              <MenuItem value="value">Value Display</MenuItem>
              <MenuItem value="onoff">On/Off Indicator</MenuItem>
            </Select>
          </FormControl>
          {type === 'onoff' && (
            <TextField
              label="Threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              error={thresholdError}
              helperText={thresholdError ? 'Must be 0-127' : undefined}
              inputProps={{ min: 0, max: 127 }}
              fullWidth
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!isValid}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
