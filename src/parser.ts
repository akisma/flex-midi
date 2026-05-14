import type { MidiMessage } from './types.js';

function isValidDataByte(byte: number): boolean {
  return byte >= 0 && byte <= 127;
}

function unknown(data: Uint8Array): MidiMessage {
  return { type: 'unknown', data: Array.from(data) };
}

export function parseMidiMessage(data: Uint8Array): MidiMessage {
  if (data.length === 0) {
    return unknown(data);
  }

  const statusByte = data[0];

  // Status bytes must have the high bit set (>= 0x80)
  if (statusByte < 0x80) {
    return unknown(data);
  }

  const statusNibble = statusByte & 0xf0;
  const channel = statusByte & 0x0f;

  switch (statusNibble) {
    case 0x80: {
      // Note Off — requires 2 data bytes
      if (data.length < 3) return unknown(data);
      const note = data[1];
      const velocity = data[2];
      if (!isValidDataByte(note) || !isValidDataByte(velocity)) return unknown(data);
      return { type: 'noteOff', channel, note, velocity };
    }

    case 0x90: {
      // Note On — requires 2 data bytes; velocity 0 means Note Off
      if (data.length < 3) return unknown(data);
      const note = data[1];
      const velocity = data[2];
      if (!isValidDataByte(note) || !isValidDataByte(velocity)) return unknown(data);
      if (velocity === 0) {
        return { type: 'noteOff', channel, note, velocity };
      }
      return { type: 'noteOn', channel, note, velocity };
    }

    case 0xa0: {
      // Aftertouch (Polyphonic Key Pressure) — requires 2 data bytes
      if (data.length < 3) return unknown(data);
      const note = data[1];
      const pressure = data[2];
      if (!isValidDataByte(note) || !isValidDataByte(pressure)) return unknown(data);
      return { type: 'aftertouch', channel, note, pressure };
    }

    case 0xb0: {
      // Control Change — requires 2 data bytes
      if (data.length < 3) return unknown(data);
      const controller = data[1];
      const value = data[2];
      if (!isValidDataByte(controller) || !isValidDataByte(value)) return unknown(data);
      return { type: 'controlChange', channel, controller, value };
    }

    case 0xc0: {
      // Program Change — requires 1 data byte
      if (data.length < 2) return unknown(data);
      const program = data[1];
      if (!isValidDataByte(program)) return unknown(data);
      return { type: 'programChange', channel, program };
    }

    case 0xd0: {
      // Channel Pressure — requires 1 data byte
      if (data.length < 2) return unknown(data);
      const pressure = data[1];
      if (!isValidDataByte(pressure)) return unknown(data);
      return { type: 'channelPressure', channel, pressure };
    }

    case 0xe0: {
      // Pitch Bend — requires 2 data bytes (LSB, MSB), both 7-bit
      // Combined 14-bit value, centered at 8192 (0x2000), range 0–16383
      // Signed range: -8192 to 8191
      if (data.length < 3) return unknown(data);
      const lsb = data[1];
      const msb = data[2];
      if (!isValidDataByte(lsb) || !isValidDataByte(msb)) return unknown(data);
      const raw = lsb | (msb << 7);
      const value = raw - 8192;
      return { type: 'pitchBend', channel, value };
    }

    default:
      return unknown(data);
  }
}
