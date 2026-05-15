export type MidiMessage =
  | { type: 'noteOn'; channel: number; note: number; velocity: number }
  | { type: 'noteOff'; channel: number; note: number; velocity: number }
  | { type: 'aftertouch'; channel: number; note: number; pressure: number }
  | { type: 'controlChange'; channel: number; controller: number; value: number }
  | { type: 'programChange'; channel: number; program: number }
  | { type: 'channelPressure'; channel: number; pressure: number }
  | { type: 'pitchBend'; channel: number; value: number }
  | { type: 'unknown'; data: number[] };

export interface WidgetConfig {
  id: string;
  type: 'value' | 'onoff';
  channel: number;
  cc: number;
  label: string;
  threshold?: number;
}
