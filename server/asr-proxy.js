// 豆包 ASR WebSocket 代理
// 掛載在主服務器同端口，處理 /asr-async 與 /asr-nostream
// 無火山引擎憑證時自動進入 Mock 模式，確保鏈路可跑通
import { WebSocketServer, WebSocket } from 'ws';
import crypto from 'node:crypto';

const UPSTREAM_URL = process.env.VOLC_ASR_UPSTREAM_URL || 'wss://openspeech.bytedance.com/api/v3/sauc/bigmodel';
const APP_ID = process.env.VOLC_ASR_APP_ID || '';
const ACCESS_KEY = process.env.VOLC_ASR_ACCESS_KEY || '';
const RESOURCE_ID = process.env.VOLC_ASR_RESOURCE_ID || 'volc.bigasr.sauc.duration';

const MOCK_SENTENCES = [
  '你好，這是語音識別測試',
  'K-bot 可以幫你快速建立網站',
  '語音輸入功能已經可以正常使用',
];

function hasCredentials() {
  return Boolean(APP_ID && ACCESS_KEY);
}

// 構造服務端 full server response，message type 0x9 + JSON
function buildServerPayload(json, { error = false } = {}) {
  const payload = Buffer.from(JSON.stringify(json), 'utf8');
  const header = Buffer.from([0x11, error ? 0xf0 : 0x90, 0x10, 0x00]);
  const size = Buffer.alloc(4);
  size.writeUInt32BE(payload.length, 0);
  return Buffer.concat([header, size, payload]);
}

function messageType(byte1) {
  return (byte1 >> 4) & 0x0f;
}

function parsePayload(buffer) {
  // 跳過 4 字節頭，flags 決定是否有 sequence id
  let offset = 4;
  const flags = buffer[1] & 0x0f;
  if (flags === 1 || flags === 3) offset += 4;
  const size = buffer.readUInt32BE(offset);
  offset += 4;
  return buffer.subarray(offset, offset + size);
}

function attachMock(client, path) {
  let audioChunks = 0;
  let sentenceIndex = 0;
  let cumulative = '';
  let closed = false;

  client.on('message', (data, isBinary) => {
    if (closed || !isBinary) return;
    const buf = Buffer.from(data);
    if (buf.length < 4) return;
    const type = messageType(buf[1]);

    if (type === 0x1) {
      // full client request，回覆就緒
      let requestPayload = {};
      try {
        requestPayload = JSON.parse(parsePayload(buf).toString('utf8'));
      } catch {
        // 忽略解析
      }
      client.send(
        buildServerPayload({
          result: { text: '', utterances: [] },
          audio_info: requestPayload.audio || {},
          addition: { log_id: crypto.randomBytes(16).toString('hex'), mode: 'mock' },
        }),
      );
    } else if (type === 0x2) {
      const flags = buf[1] & 0x0f;
      if (flags === 0x2) {
        // last packet，返回最終結果
        const finalText = cumulative || MOCK_SENTENCES[0];
        client.send(
          buildServerPayload({
            result: { text: finalText, utterances: [{ text: finalText, definite: true }] },
            addition: { log_id: crypto.randomBytes(16).toString('hex'), mode: 'mock', final: true },
          }),
        );
        return;
      }

      audioChunks += 1;
      // 每 20 個音頻包推送一段模擬識別，模擬流式
      if (audioChunks % 20 === 0 && sentenceIndex < MOCK_SENTENCES.length) {
        const piece = MOCK_SENTENCES[sentenceIndex];
        sentenceIndex += 1;
        cumulative = path === '/asr-nostream' ? piece : `${cumulative}${piece}`;
        client.send(
          buildServerPayload({
            result: { text: cumulative, utterances: [{ text: piece, definite: false }] },
            addition: { log_id: crypto.randomBytes(16).toString('hex'), mode: 'mock' },
          }),
        );
      }
    }
  });

  client.on('close', () => {
    closed = true;
  });
}

function attachUpstream(client) {
  const upstream = new WebSocket(UPSTREAM_URL, {
    headers: {
      Authorization: `Bearer;${ACCESS_KEY}`,
      'X-Api-App-Key': APP_ID,
      'X-Api-Resource-Id': RESOURCE_ID,
      'X-Api-Connect-Id': crypto.randomBytes(16).toString('hex'),
    },
  });

  upstream.on('open', () => {
    // 上游就緒後開始雙向轉發
  });

  client.on('message', (data, isBinary) => {
    if (upstream.readyState === WebSocket.OPEN && isBinary) {
      upstream.send(data);
    }
  });

  upstream.on('message', (data, isBinary) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data, { binary: isBinary });
    }
  });

  const shutdown = () => {
    if (upstream.readyState === WebSocket.OPEN || upstream.readyState === WebSocket.CONNECTING) {
      upstream.close();
    }
  };

  client.on('close', shutdown);
  upstream.on('close', () => {
    if (client.readyState === WebSocket.OPEN) client.close();
  });
  upstream.on('error', () => {
    client.send(
      buildServerPayload({ code: 5000, message: 'upstream connection error' }, { error: true }),
    );
    shutdown();
  });
}

export function attachASRProxy(server) {
  const wss = new WebSocketServer({ noServer: true });

  function isASRPath(reqUrl) {
    const pathname = new URL(reqUrl, 'http://localhost').pathname;
    return pathname === '/asr-async' || pathname === '/asr-nostream';
  }

  function handleUpgrade(req, socket, head) {
    if (!isASRPath(req.url)) {
      return false;
    }
    wss.handleUpgrade(req, socket, head, (client) => {
      wss.emit('connection', client, req);
    });
    return true;
  }

  server.on('upgrade', (req, socket, head) => {
    handleUpgrade(req, socket, head);
  });

  wss.on('connection', (client, req) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (hasCredentials()) {
      attachUpstream(client);
    } else {
      attachMock(client, pathname);
    }
  });

  return {
    mode: hasCredentials() ? 'upstream' : 'mock',
    handleUpgrade,
    isASRPath,
  };
}
