// 豆包流式語音識別客戶端
// 經本地代理連接火山引擎，採集麥克風 PCM，即時返回識別文字
import { getLanguage } from './i18n';

export interface ASRCallbacks {
  onText: (text: string) => void;
  onError?: (message: string) => void;
  onStateChange?: (listening: boolean) => void;
}

// 根據系統語言決定接口路徑與輸出配置
function getConfigForLanguage(lang: string): {
  path: string;
  outputZhVariant?: string;
  autoLang: boolean;
} {
  switch (lang) {
    case 'zh-Hant':
      return { path: '/asr-async', outputZhVariant: 'hk', autoLang: false };
    case 'zh-Hans':
      return { path: '/asr-async', autoLang: false };
    case 'en':
    case 'en-GB':
      return { path: '/asr-async', autoLang: false };
    case 'ja':
    case 'ko':
      return { path: '/asr-nostream', autoLang: true };
    default:
      return { path: '/asr-async', autoLang: false };
  }
}

// 線性降採樣並轉為 16bit PCM
function downsampleToPcm16(float32: Float32Array, inputRate: number): Int16Array {
  const outputRate = 16000;
  if (inputRate === outputRate) {
    const out = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  }

  const ratio = inputRate / outputRate;
  const outputLength = Math.round(float32.length / ratio);
  const out = new Int16Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const pos = i * ratio;
    const index = Math.floor(pos);
    const fraction = pos - index;
    const a = float32[index] || 0;
    const b = float32[index + 1] || a;
    let sample = a + (b - a) * fraction;
    sample = Math.max(-1, Math.min(1, sample));
    out[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return out;
}

export class DoubaoASRClient {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private node: AudioWorkletNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private callbacks: ASRCallbacks;
  private ready = false;
  private stopped = false;
  private inputRate = 48000;

  constructor(callbacks: ASRCallbacks) {
    this.callbacks = callbacks;
  }

  async start(): Promise<void> {
    try {
      const lang = getLanguage();
      const config = getConfigForLanguage(lang);

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      const proxyPort = host === 'localhost' || host === '127.0.0.1' ? ':8787' : '';
      const url = `${protocol}//${host}${proxyPort}${config.path}`;

      this.ws = new WebSocket(url);
      this.ws.binaryType = 'arraybuffer';

      await new Promise<void>((resolve, reject) => {
        if (!this.ws) return reject(new Error('no ws'));
        this.ws.onopen = () => resolve();
        this.ws.onerror = () => reject(new Error('proxy connection failed'));
      });

      // 組 full client request
      const requestPayload: Record<string, unknown> = {
        user: { uid: 'bolt-diy-browser', platform: 'web' },
        audio: { format: 'pcm', rate: 16000, bits: 16, channel: 1 },
        request: {
          model_name: 'bigmodel',
          enable_itn: true,
          enable_punc: true,
          show_utterances: true,
          result_type: 'full',
        },
      };

      if (config.outputZhVariant) {
        (requestPayload.request as Record<string, unknown>).output_zh_variant = config.outputZhVariant;
      }
      if (config.autoLang) {
        (requestPayload.request as Record<string, unknown>).enable_auto_lang = true;
      }

      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onclose = () => this.handleClose();
      this.ws.onerror = () => {
        if (!this.ready) this.callbacks.onError?.('connection error');
      };

      this.sendFullClient(requestPayload);

      // 初始化麥克風
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.audioContext = new AudioContext();
      this.inputRate = this.audioContext.sampleRate;
      await this.audioContext.audioWorklet.addModule('/pcm-capture-worklet.js');

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.node = new AudioWorkletNode(this.audioContext, 'pcm-capture');
      this.node.port.onmessage = (e) => this.handleAudioChunk(e.data as Float32Array);
      this.sourceNode.connect(this.node);

      this.callbacks.onStateChange?.(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'start failed';
      this.callbacks.onError?.(message);
      await this.cleanup();
      throw err;
    }
  }

  private sendFullClient(payload: Record<string, unknown>): void {
    const json = new TextEncoder().encode(JSON.stringify(payload));
    // 0x11 header, 0x10 full client no flags, 0x10 JSON no compression
    const header = bytes(0x11, 0x10, 0x10, 0x00);
    const frame = concat(header, uint32(json.length), json);
    this.ws?.send(frame);
  }

  private handleAudioChunk(float32: Float32Array): void {
    if (this.stopped || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const pcm = downsampleToPcm16(float32, this.inputRate);
    const bytesBuf = new Uint8Array(pcm.buffer);
    // audio only request, type 0010 flags 0000 => byte1 0x20
    const header = bytes(0x11, 0x20, 0x10, 0x00);
    const frame = concat(header, uint32(bytesBuf.length), bytesBuf);
    this.ws.send(frame);
  }

  private handleMessage(event: MessageEvent): void {
    if (typeof event.data === 'string') {
      // 代理內部消息，忽略
      return;
    }

    const view = new Uint8Array(event.data as ArrayBuffer);
    if (view.length < 8) return;

    const b1 = view[1];
    const msgType = (b1 >> 4) & 0x0f;
    const flags = b1 & 0x0f;

    let offset = 4;
    if (flags === 1 || flags === 3) {
      offset += 4;
    }

    const payloadSize = readUint32(view, offset);
    offset += 4;
    const payloadBytes = view.slice(offset, offset + payloadSize);
    const payloadText = new TextDecoder().decode(payloadBytes);

    if (msgType === 0x0f) {
      this.callbacks.onError?.(`server error: ${payloadText}`);
      return;
    }

    try {
      const payload = JSON.parse(payloadText);
      if (payload.result) {
        this.ready = true;
        const text = this.extractText(payload.result);
        if (text !== null) this.callbacks.onText(text);
      }
    } catch {
      // 忽略解析失敗
    }
  }

  // result_type=full 時 result.text 為從開頭到當前的累計文字
  private extractText(result: {
    text?: string;
    utterances?: Array<{ text: string }>;
  }): string | null {
    if (typeof result.text === 'string') return result.text;
    if (result.utterances && result.utterances.length > 0) {
      return result.utterances.map((u) => u.text).join('');
    }
    return null;
  }

  private sendLastPacket(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const header = bytes(0x11, 0x22, 0x10, 0x00);
    const frame = concat(header, uint32(0));
    this.ws.send(frame);
  }

  private handleClose(): void {
    this.callbacks.onStateChange?.(false);
  }

  async stop(): Promise<void> {
    this.stopped = true;
    try {
      this.sendLastPacket();
    } catch {
      // 忽略
    }
    // 給伺服器一點時間返回尾部結果
    setTimeout(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.close();
    }, 500);
    await this.cleanup();
  }

  private async cleanup(): Promise<void> {
    this.node?.disconnect();
    this.sourceNode?.disconnect();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        await this.audioContext.close();
      } catch {
        // 忽略
      }
    }
    this.node = null;
    this.sourceNode = null;
    this.mediaStream = null;
    this.audioContext = null;
    this.callbacks.onStateChange?.(false);
  }
}

function bytes(...values: number[]): Uint8Array {
  return new Uint8Array(values);
}

function uint32(value: number): Uint8Array {
  const buf = new Uint8Array(4);
  const view = new DataView(buf.buffer);
  view.setUint32(0, value, false);
  return buf;
}

function readUint32(view: Uint8Array, offset: number): number {
  const dataView = new DataView(view.buffer, view.byteOffset, view.byteLength);
  return dataView.getUint32(offset, false);
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
