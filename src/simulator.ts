export class MidiSimulator {
  private interval: ReturnType<typeof setInterval> | null = null;
  private listener: ((data: Uint8Array) => void) | null = null;

  onMessage(listener: (data: Uint8Array) => void): void {
    this.listener = listener;
  }

  start(intervalMs: number = 500): void {
    if (this.interval !== null) {
      return;
    }
    this.interval = setInterval(() => {
      if (this.listener) {
        this.listener(this.generateMessage());
      }
    }, intervalMs);
  }

  stop(): void {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private generateMessage(): Uint8Array {
    const channel = Math.floor(Math.random() * 3); // 0-2
    const note = 48 + Math.floor(Math.random() * 37); // 48-84
    const velocity = 40 + Math.floor(Math.random() * 88); // 40-127
    const controller = Math.floor(Math.random() * 128); // 0-127
    const ccValue = Math.floor(Math.random() * 128); // 0-127
    // Pitch bend: random 14-bit value
    const pbRaw = Math.floor(Math.random() * 16384); // 0-16383
    const pbLsb = pbRaw & 0x7f;
    const pbMsb = (pbRaw >> 7) & 0x7f;

    const messageType = Math.floor(Math.random() * 4);

    switch (messageType) {
      case 0:
        // noteOn
        return new Uint8Array([0x90 | channel, note, velocity]);
      case 1:
        // noteOff
        return new Uint8Array([0x80 | channel, note, velocity]);
      case 2:
        // controlChange
        return new Uint8Array([0xb0 | channel, controller, ccValue]);
      case 3:
        // pitchBend
        return new Uint8Array([0xe0 | channel, pbLsb, pbMsb]);
      default:
        return new Uint8Array([0x90 | channel, note, velocity]);
    }
  }
}
