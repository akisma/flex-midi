import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { MessageLog, LogEntry } from './MessageLog.js';
import { MidiSimulator } from '../simulator.js';
import { parseMidiMessage } from '../parser.js';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const MAX_MESSAGES = 100;

export function App(): React.ReactElement {
  const [messages, setMessages] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(true);
  const simulatorRef = useRef<MidiSimulator | null>(null);

  const handleToggle = useCallback(() => {
    const simulator = simulatorRef.current;
    if (!simulator) return;
    if (running) {
      simulator.stop();
      setRunning(false);
    } else {
      simulator.start(500);
      setRunning(true);
    }
  }, [running]);

  useEffect(() => {
    const simulator = new MidiSimulator();
    simulatorRef.current = simulator;

    simulator.onMessage((data) => {
      const message = parseMidiMessage(data);
      const entry: LogEntry = { message, timestamp: new Date() };
      setMessages((prev) => {
        const next = [...prev, entry];
        if (next.length > MAX_MESSAGES) {
          return next.slice(next.length - MAX_MESSAGES);
        }
        return next;
      });
    });

    simulator.start(500);

    return () => {
      simulator.stop();
    };
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            MIDI Message Log
          </Typography>
          <Button
            variant="contained"
            color={running ? 'error' : 'success'}
            onClick={handleToggle}
          >
            {running ? 'Stop' : 'Start'}
          </Button>
        </Box>
        <MessageLog messages={messages} />
      </Container>
    </ThemeProvider>
  );
}
