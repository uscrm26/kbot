// 麥克風音頻採集 AudioWorklet
// 累積原始 Float32 單聲道數據，按約 200ms 節點發送給主線程
class PCMCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.bufferLength = 0;
    this.targetSamples = Math.floor(sampleRate * 0.2);
  }

  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      const channel = input[0];
      // 複製一份，底層緩衝會被重用
      this.buffer.push(new Float32Array(channel));
      this.bufferLength += channel.length;

      if (this.bufferLength >= this.targetSamples) {
        const merged = new Float32Array(this.bufferLength);
        let offset = 0;
        for (const chunk of this.buffer) {
          merged.set(chunk, offset);
          offset += chunk.length;
        }
        this.port.postMessage(merged);
        this.buffer = [];
        this.bufferLength = 0;
      }
    }
    return true;
  }
}

registerProcessor('pcm-capture', PCMCaptureProcessor);
