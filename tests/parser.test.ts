import { describe, it, expect } from 'vitest';
import { parseMidiMessage } from '../src/parser.js';

describe('parseMidiMessage', () => {
  // --- Note Off ---
  describe('noteOff (0x80)', () => {
    it('parses a note off message on channel 0', () => {
      const result = parseMidiMessage(new Uint8Array([0x80, 60, 64]));
      expect(result).toEqual({ type: 'noteOff', channel: 0, note: 60, velocity: 64 });
    });

    it('parses a note off message on channel 15', () => {
      const result = parseMidiMessage(new Uint8Array([0x8f, 72, 100]));
      expect(result).toEqual({ type: 'noteOff', channel: 15, note: 72, velocity: 100 });
    });
  });

  // --- Note On ---
  describe('noteOn (0x90)', () => {
    it('parses a note on message on channel 0', () => {
      const result = parseMidiMessage(new Uint8Array([0x90, 60, 127]));
      expect(result).toEqual({ type: 'noteOn', channel: 0, note: 60, velocity: 127 });
    });

    it('parses a note on message on channel 15', () => {
      const result = parseMidiMessage(new Uint8Array([0x9f, 48, 80]));
      expect(result).toEqual({ type: 'noteOn', channel: 15, note: 48, velocity: 80 });
    });

    it('converts noteOn with velocity 0 to noteOff', () => {
      const result = parseMidiMessage(new Uint8Array([0x90, 60, 0]));
      expect(result).toEqual({ type: 'noteOff', channel: 0, note: 60, velocity: 0 });
    });
  });

  // --- Aftertouch ---
  describe('aftertouch (0xA0)', () => {
    it('parses an aftertouch message', () => {
      const result = parseMidiMessage(new Uint8Array([0xa0, 60, 90]));
      expect(result).toEqual({ type: 'aftertouch', channel: 0, note: 60, pressure: 90 });
    });

    it('parses aftertouch on channel 15', () => {
      const result = parseMidiMessage(new Uint8Array([0xaf, 36, 45]));
      expect(result).toEqual({ type: 'aftertouch', channel: 15, note: 36, pressure: 45 });
    });
  });

  // --- Control Change ---
  describe('controlChange (0xB0)', () => {
    it('parses a control change message', () => {
      const result = parseMidiMessage(new Uint8Array([0xb0, 7, 100]));
      expect(result).toEqual({ type: 'controlChange', channel: 0, controller: 7, value: 100 });
    });

    it('parses control change on channel 15', () => {
      const result = parseMidiMessage(new Uint8Array([0xbf, 11, 64]));
      expect(result).toEqual({ type: 'controlChange', channel: 15, controller: 11, value: 64 });
    });
  });

  // --- Program Change ---
  describe('programChange (0xC0)', () => {
    it('parses a program change message', () => {
      const result = parseMidiMessage(new Uint8Array([0xc0, 5]));
      expect(result).toEqual({ type: 'programChange', channel: 0, program: 5 });
    });

    it('parses program change on channel 15', () => {
      const result = parseMidiMessage(new Uint8Array([0xcf, 127]));
      expect(result).toEqual({ type: 'programChange', channel: 15, program: 127 });
    });
  });

  // --- Channel Pressure ---
  describe('channelPressure (0xD0)', () => {
    it('parses a channel pressure message', () => {
      const result = parseMidiMessage(new Uint8Array([0xd0, 75]));
      expect(result).toEqual({ type: 'channelPressure', channel: 0, pressure: 75 });
    });

    it('parses channel pressure on channel 15', () => {
      const result = parseMidiMessage(new Uint8Array([0xdf, 0]));
      expect(result).toEqual({ type: 'channelPressure', channel: 15, pressure: 0 });
    });
  });

  // --- Pitch Bend ---
  describe('pitchBend (0xE0)', () => {
    it('parses pitch bend at center (no bend)', () => {
      // lsb=0, msb=64 → raw = 0 | (64 << 7) = 8192 → value = 8192 - 8192 = 0
      const result = parseMidiMessage(new Uint8Array([0xe0, 0, 64]));
      expect(result).toEqual({ type: 'pitchBend', channel: 0, value: 0 });
    });

    it('parses pitch bend at maximum positive value', () => {
      // lsb=127, msb=127 → raw = 127 | (127 << 7) = 127 + 16256 = 16383 → value = 16383 - 8192 = 8191
      const result = parseMidiMessage(new Uint8Array([0xe0, 127, 127]));
      expect(result).toEqual({ type: 'pitchBend', channel: 0, value: 8191 });
    });

    it('parses pitch bend at minimum (most negative) value', () => {
      // lsb=0, msb=0 → raw = 0 → value = 0 - 8192 = -8192
      const result = parseMidiMessage(new Uint8Array([0xe0, 0, 0]));
      expect(result).toEqual({ type: 'pitchBend', channel: 0, value: -8192 });
    });

    it('parses pitch bend on channel 15', () => {
      // lsb=0, msb=64 → value = 0
      const result = parseMidiMessage(new Uint8Array([0xef, 0, 64]));
      expect(result).toEqual({ type: 'pitchBend', channel: 15, value: 0 });
    });

    it('computes a mid-range pitch bend value correctly', () => {
      // lsb=0, msb=32 → raw = 0 | (32 << 7) = 4096 → value = 4096 - 8192 = -4096
      const result = parseMidiMessage(new Uint8Array([0xe0, 0, 32]));
      expect(result).toEqual({ type: 'pitchBend', channel: 0, value: -4096 });
    });
  });

  // --- Channel extraction ---
  describe('channel extraction', () => {
    it('correctly extracts channel 0', () => {
      const result = parseMidiMessage(new Uint8Array([0x90, 60, 100]));
      expect(result).toMatchObject({ channel: 0 });
    });

    it('correctly extracts channel 15', () => {
      const result = parseMidiMessage(new Uint8Array([0x9f, 60, 100]));
      expect(result).toMatchObject({ channel: 15 });
    });

    it('correctly extracts channel 7', () => {
      const result = parseMidiMessage(new Uint8Array([0x97, 60, 100]));
      expect(result).toMatchObject({ channel: 7 });
    });
  });

  // --- Edge cases ---
  describe('edge cases', () => {
    it('returns unknown for empty input', () => {
      const result = parseMidiMessage(new Uint8Array([]));
      expect(result).toEqual({ type: 'unknown', data: [] });
    });

    it('returns unknown for a single byte (incomplete message)', () => {
      const result = parseMidiMessage(new Uint8Array([0x90]));
      expect(result).toEqual({ type: 'unknown', data: [0x90] });
    });

    it('returns unknown for an invalid (non-status) first byte', () => {
      const result = parseMidiMessage(new Uint8Array([0x40, 60, 100]));
      expect(result).toEqual({ type: 'unknown', data: [0x40, 60, 100] });
    });

    it('returns unknown for an unrecognized status byte (e.g. SysEx 0xF0)', () => {
      const result = parseMidiMessage(new Uint8Array([0xf0, 0x7e, 0xf7]));
      expect(result).toEqual({ type: 'unknown', data: [0xf0, 0x7e, 0xf7] });
    });

    it('returns unknown when note off is missing data bytes', () => {
      const result = parseMidiMessage(new Uint8Array([0x80, 60]));
      expect(result).toEqual({ type: 'unknown', data: [0x80, 60] });
    });

    it('returns unknown when program change is missing its data byte', () => {
      const result = parseMidiMessage(new Uint8Array([0xc0]));
      expect(result).toEqual({ type: 'unknown', data: [0xc0] });
    });
  });
});
