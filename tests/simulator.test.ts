import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MidiSimulator } from '../src/simulator.js';
import { parseMidiMessage } from '../src/parser.js';

describe('MidiSimulator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('start() begins generating messages at the specified interval', () => {
    const simulator = new MidiSimulator();
    const listener = vi.fn();
    simulator.onMessage(listener);
    simulator.start(100);

    vi.advanceTimersByTime(350);
    expect(listener).toHaveBeenCalledTimes(3);

    simulator.stop();
  });

  it('stop() halts message generation', () => {
    const simulator = new MidiSimulator();
    const listener = vi.fn();
    simulator.onMessage(listener);
    simulator.start(100);

    vi.advanceTimersByTime(250);
    expect(listener).toHaveBeenCalledTimes(2);

    simulator.stop();
    vi.advanceTimersByTime(300);
    // Should still be 2 — no new calls after stop
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('onMessage callback receives valid Uint8Array data', () => {
    const simulator = new MidiSimulator();
    let received: Uint8Array | null = null;

    simulator.onMessage((data) => {
      received = data;
    });
    simulator.start(100);
    vi.advanceTimersByTime(100);
    simulator.stop();

    expect(received).not.toBeNull();
    expect(received).toBeInstanceOf(Uint8Array);
    expect((received as unknown as Uint8Array).length).toBeGreaterThanOrEqual(2);
  });

  it('generated messages parse successfully through parseMidiMessage', () => {
    const simulator = new MidiSimulator();
    const messages: Uint8Array[] = [];

    simulator.onMessage((data) => {
      messages.push(data);
    });
    simulator.start(100);
    vi.advanceTimersByTime(1000);
    simulator.stop();

    expect(messages.length).toBeGreaterThan(0);
    for (const msg of messages) {
      const parsed = parseMidiMessage(msg);
      expect(parsed.type).not.toBe('unknown');
    }
  });

  it('generates a matching noteOff for each noteOn after a delay', () => {
    const simulator = new MidiSimulator();
    const messages: Uint8Array[] = [];

    simulator.onMessage((data) => {
      messages.push(new Uint8Array(data));
    });

    // Trigger messages until we get a noteOn
    simulator.start(100);

    // Keep advancing until we find a noteOn
    let noteOnMsg: Uint8Array | null = null;
    let attempts = 0;
    while (!noteOnMsg && attempts < 50) {
      vi.advanceTimersByTime(100);
      attempts++;
      const latest = messages[messages.length - 1];
      if (latest && (latest[0] & 0xf0) === 0x90 && latest[2] > 0) {
        noteOnMsg = latest;
      }
    }

    expect(noteOnMsg).not.toBeNull();

    const noteOnNote = noteOnMsg![1];
    const noteOnChannel = noteOnMsg![0] & 0x0f;

    const countBefore = messages.length;

    // Advance time past the maximum noteOff delay (600ms) BEFORE stopping
    // stop() clears pending timeouts, so we need the noteOff to fire first
    vi.advanceTimersByTime(600);

    simulator.stop();

    // Find a noteOff matching the noteOn
    const matchingNoteOff = messages
      .slice(countBefore)
      .find(
        (msg) =>
          (msg[0] & 0xf0) === 0x80 &&
          (msg[0] & 0x0f) === noteOnChannel &&
          msg[1] === noteOnNote
      );

    expect(matchingNoteOff).toBeDefined();
  });
});
