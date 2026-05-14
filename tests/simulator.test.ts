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

    expect(listener).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(listener).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);
    expect(listener).toHaveBeenCalledTimes(4);

    simulator.stop();
  });

  it('stop() halts message generation', () => {
    const simulator = new MidiSimulator();
    const listener = vi.fn();
    simulator.onMessage(listener);
    simulator.start(100);

    vi.advanceTimersByTime(200);
    expect(listener).toHaveBeenCalledTimes(2);

    simulator.stop();

    vi.advanceTimersByTime(500);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('onMessage callback receives a Uint8Array', () => {
    const simulator = new MidiSimulator();
    let received: unknown = null;
    simulator.onMessage((data) => {
      received = data;
    });
    simulator.start(100);

    vi.advanceTimersByTime(100);
    expect(received).toBeInstanceOf(Uint8Array);

    simulator.stop();
  });

  it('generated messages parse successfully through parseMidiMessage', () => {
    const simulator = new MidiSimulator();
    const messages: Uint8Array[] = [];
    simulator.onMessage((data) => {
      messages.push(data);
    });
    simulator.start(100);

    vi.advanceTimersByTime(2000);
    simulator.stop();

    expect(messages.length).toBeGreaterThan(0);
    for (const msg of messages) {
      const parsed = parseMidiMessage(msg);
      expect(parsed.type).not.toBe('unknown');
    }
  });
});
