class Capture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.samples = new Int16Array(Math.round(sampleRate / 50));
    this.length = 0;
    this.sequence = 0;
  }

  process(inputs) {
    const samples = inputs[0]?.[0];
    if (!samples) return true;
    for (const sample of samples) {
      this.samples[this.length++] = Math.max(-1, Math.min(1, sample)) * 32767;
      if (this.length !== this.samples.length) continue;
      const packet = new ArrayBuffer(8 + 2 * this.length);
      const view = new DataView(packet);
      view.setUint32(0, sampleRate, true);
      view.setUint32(4, this.sequence++, true);
      this.samples.forEach((value, index) => view.setInt16(8 + 2 * index, value, true));
      this.port.postMessage(packet, [packet]);
      this.length = 0;
    }
    return true;
  }
}

registerProcessor("capture", Capture);
