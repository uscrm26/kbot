---
description: 当用户需要接入AI能力时使用此Skill。两大核心场景：1) 用户的代码/网站/APP/小程序需要接入AI能力（如智能客服、图片视频生成、语音合成等），帮他查询可用模型和价格并写好完整接入代码；2) 用户直接使用AI模型能力进行内容生成。支持 OpenAI/Anthropic/Gemini 格式语言模型，以及图片/视频/音频/TTS/音乐等媒体生成。
globs:
---

# 鸿蒙大模型中心 AI 能力接入指南

本文件是入口，不是接口文档。具体有哪些接口、哪些模型、什么价格，全部由你在每次新对话时现查（见下方启动步骤）。所以平台上新接口、改参数、调价格，你下一次对话就能看到，用户不需要重新下载本文件。

## 平台信息

- **平台名称**：鸿蒙大模型中心
- **官网地址**：https://harmony.lk888.ai
- **名称口径**：`GET /v1/skills` 的 `platform` 取 API Key 所属站点名称。若本文件从其他代理站下载，名称可能不同；以 Key 所属站点为准。

## 认证方式

所有接口使用 Bearer Token 认证：
```
Authorization: Bearer {API Key}
```

API Key 获取方式（按优先级）：
1. 读取项目根目录 `.env` 文件中的 `API_KEY` 变量
2. 如果 `.env` 中没有，读取本地 Skills 能力文档中记录的 Key 位置
3. 如果都找不到，提示用户提供 API Key，并引导用户前往 鸿蒙大模型中心 官网（https://harmony.lk888.ai）登录后在「API 密钥管理」中创建

Key 以 `sk-` 开头，只在创建时完整显示一次。拿到 Key 后：
- 写入项目根目录 `.env` 的 `API_KEY` 变量，`.env` 已存在就追加，不要覆盖
- **不要把真实 Key 写进本 SKILL.md 或任何会被提交、分享的文件**
- 主动提醒用户把 `.env` 加进 `.gitignore`，避免密钥进代码仓库

> 渠道策略（综合最优 / 价格优先 / 速度优先 / 成功率优先）由用户在创建密钥时选定，之后每次调用自动按该策略选线路。你在写代码时不需要、也不能指定渠道。

## 前置要求

本 Skill 需要通过 HTTP 请求调用远程 API。主流 AI 编程工具（Cursor / Claude Code / Codex / Cline / Windsurf / Trae 等）和智能体运行环境（OpenClaw 等）都自带联网能力，**通常不需要安装任何东西，直接用你自己的 HTTP 请求能力即可**。

只有当你确认自己无法发起 HTTP 请求时，才提示用户安装一个 HTTP MCP 工具：`pip install mcp-server-http-request`，并在对应工具的 MCP 配置中，command 填本机 python 路径、args 填 `["-m", "mcp_server_http_request"]`，装完可能需要用户手动打开 MCP 开关或重启工具。不要在能正常联网的情况下要求用户装它。

## API 基础地址

```
https://api.lk888.ai/api
```

> 注：此地址用于手写 HTTP 请求（完整路径形如 `https://api.lk888.ai/api/v1/...`）。若使用 OpenAI/Anthropic SDK，base_url 必须填到 `/v1`（如 `https://api.lk888.ai/v1` 或 `https://api.lk888.ai/api/v1`），不要只填 `.../api`——SDK 会自拼相对路径导致 404。详见 /v1/skills/guide 的 base_url_note。

---

## ❗❗ 启动步骤（每次新对话强制执行，不可跳过）

> **重要：本文件不包含任何接口文档。即使你已经有本地缓存的能力文档，每次新对话仍然必须执行以下步骤，因为平台能力可能已更新。**

> **所有接口调用（包括下面的步骤 1、2）都必须携带 API Key。请先按上方「认证方式」中的优先级查找 API Key（.env 文件 → 本地 Skills 文档 → 询问用户），获取到 Key 后，所有请求的 Header 中加上 `Authorization: Bearer {API Key}`。没有 Key 就不要调用任何接口。**

### 步骤 1：获取平台最新能力列表

```
GET https://api.lk888.ai/api/v1/skills
```

调用此接口获取平台所有可用的接口和能力。返回内容包括模型查询、调用说明、任务管理、余额查询等所有接口的详细信息。

### 步骤 2：获取调用指南

```
GET https://api.lk888.ai/api/v1/skills/guide
```

获取每种模型的调用方式、请求格式、代码示例、异步任务轮询规则。

### 步骤 3：写入本地能力文档（必须执行，不可跳过）

> **此步骤不是可选的。你必须在处理用户请求之前完成此步骤。**

将步骤 1 和步骤 2 获取到的全部信息写入本地文件，便于后续新对话直接读取：

**文件位置**：与本 SKILL.md 同目录下，文件名 `API_CAPABILITIES.md`

**必须包含的内容**：
- 平台所有接口列表（路径、方法、参数、用途）
- 全部可用模型列表（名称、类型、功能描述）
- 每种模型类型的调用方式和代码示例
- 计费方式说明
- API Key 存放位置（如已知）

**执行逻辑**：
- 如果 `API_CAPABILITIES.md` 不存在 → 创建并写入全部内容
- 如果已存在但与接口返回的内容有差异 → 覆盖重写
- 如果已存在且内容一致 → 跳过，直接进入步骤 4

> 这个文件是正常产物，不要删除；每次新对话都会重新拉取并覆盖更新。用户看到它被生成属于预期行为。

### 步骤 4：开始处理用户请求

确认 `API_CAPABILITIES.md` 已写入后，再根据用户的实际需求调用对应接口。

---

## 你会用到的接口（入口，以 /v1/skills 实际返回为准）

| 接口 | 用途 |
|---|---|
| `GET /v1/skills` | 每次对话先拿完整接口清单和注意事项，不要凭空猜接口 |
| `GET /v1/skills/guide` | 鉴权怎么带、参数放哪、异步任务怎么轮询 |
| `GET /v1/skills/models`、`GET /v1/skills/models/{name}` | 查有哪些模型、每个模型有哪些参数 |
| `GET /v1/skills/models/{name}/pricing` | 查实时价格，给用户比价 |
| `GET /v1/skills/balance`、`GET /v1/skills/usage` | 调付费接口前看余额，事后查消费明细 |
| `POST /v1/media/generate`、`GET /v1/skills/task-status` | 提交图片 / 视频 / 音频任务，再轮询拿结果 |
| `POST /v1/chat/completions` | OpenAI 兼容聊天（聊天模型另支持 Anthropic / Gemini 原协议，按模型自动选对端点） |
| `POST /v1/skills/feedback` | 发现文档与实际不符、缺接口时主动反馈 |

此表只列常用入口；人像形象、增值聊天等完整能力和端点以本次 `GET /v1/skills` 返回为准。`GET /v1/media/models` 必须带 `type=image|video|audio`，省略会返回 400。

---

## 文件上传说明

部分模型需要传入图片、视频、音频等文件（参数 type=upload），有两种传法：

**方式一（本地文件直接传 base64）**：图片（jpeg/png/webp/gif）和音频（mp3/wav/m4a/ogg）可把参数值直接写成 data:<mime>;base64,<数据>，服务端自动转存；限制：单文件解码后 ≤10MB、单次合计 ≤30MB、请求体总 ≤50MB；视频不支持 base64。余额不足会在转存前拦截（POST /v1/media/generate 保留 HTTP 200，JSON 业务 code=402；请读取 body.code，不能仅按 HTTP 状态判定成功）。

**方式二（URL，可跨任务复用）**：

1. 自行将文件上传至 COS、CDN 或其他对象存储服务
2. 获取可公开访问的文件 URL
3. 将 URL 作为对应参数的值传入 params 中。单个文件可传字符串，多个文件传数组，两种格式均支持

> 注意：URL 必须可公开访问，平台服务器需要能直接下载该文件。支持的格式以各模型参数描述为准。

---

## 常见错误与自纠

**HTTP 403、type=authentication_error、code=recharge_required**
从未充值过的账户调用任何开放 API 接口（含 /v1/skills、/v1/skills/balance）都会被前置闸门拦截。**这不是 API Key 无效**，不要让用户重建密钥；提示用户前往 鸿蒙大模型中心 官网（https://harmony.lk888.ai）任意充值一次即可放行。代理商账号不受此限。

**404 / 400，接口或参数不存在**
多半是你猜了一个不存在的路径或字段。重新调 `GET /v1/skills` 和 `GET /v1/skills/models/{模型名}` 确认后再试。平台对常见误猜路径会在错误信息里直接给出正确写法，读到就按它改。

**余额不足（HTTP 402，type=insufficient_balance）**
提示用户前往 鸿蒙大模型中心 官网（https://harmony.lk888.ai）充值算力。

**API Key 无效**
提示用户前往 鸿蒙大模型中心 官网（https://harmony.lk888.ai）登录，在「API 密钥管理」中确认密钥未被删除或停用，必要时重建一把并重新写入 `.env`。

**Windows PowerShell 5.1 提交中文变问号**
Invoke-RestMethod / Invoke-WebRequest 默认按 ISO-8859-1 编码请求体，中文在发出前就变成问号(?)，服务端收到的即是问号串。必须手动转 UTF-8 字节：`$bytes=[Text.Encoding]::UTF8.GetBytes($json); Invoke-RestMethod -Uri $url -Method Post -Body $bytes -ContentType "application/json; charset=utf-8"`。PowerShell 7+ 与 curl 默认 UTF-8，无此问题。

---

## 持续规则

1. **不要假设任何接口存在**，以 `/v1/skills` 返回的接口列表为准
2. **调用付费接口前**，先通过 `GET https://api.lk888.ai/api/v1/skills/balance` 检查余额
3. **不要指定渠道**：线路由用户建密钥时选的渠道策略自动决定
4. **不要把真实 API Key 写进 SKILL.md 或任何会被提交、分享的文件**，一律从 `.env` 读
5. **发现能力更新时自动重写**：如果再次调用 `/v1/skills` 后发现返回的接口或能力与本地缓存的 Skills 不同（新增接口、接口变更、模型变化等），主动重写本地 Skills 文档以保持同步
6. **需要新接口时主动提出**：如果你在帮用户开发的过程中，发现需要查询某些数据但平台目前没有提供对应的接口（比如需要批量查询任务、需要获取某种统计数据等），请通过反馈接口提交 `功能建议`，说明需要什么数据、使用场景是什么，平台开发团队会评估并尽快提供

---

## ❗ BUG 反馈与意见提交

平台提供了专门的反馈接口，你应该主动使用它：

```
POST https://api.lk888.ai/api/v1/skills/feedback
Content-Type: application/json
Authorization: Bearer {API Key}
```

```json
{
  "type": "接口报错",
  "question": "具体描述",
  "endpoint": "相关接口路径",
  "context": "当时操作背景"
}
```

type 可选：`文档疑问` | `接口报错` | `功能建议`

**以下情况必须主动提交，不要等用户要求**：
- 接口调用报错或返回非预期结果 → 提交 `接口报错`，附上请求参数和错误信息
- 文档说明与实际行为不一致 → 提交 `文档疑问`，说明哪里矛盾
- 参数格式不清楚或看不懂某个字段 → 提交 `文档疑问`
- 觉得缺少某个能力或接口不够完善 → 提交 `功能建议`
- 开发过程中发现需要查询某些数据但平台没有对应接口 → 提交 `功能建议`，描述需要的查询能力和使用场景，平台会评估开发

**不要因为“不确定是不是 BUG”就不提交，平台开发团队会判断处理。积极反馈有助于平台持续改进。**

### 反馈跟踪

提交反馈后会返回 `feedback_id`，用户可随时查询处理结果：

```
GET https://api.lk888.ai/api/v1/skills/feedback?id={feedback_id}
```

响应字段说明：
- `status`：未处理 / 已处理 / 已忽略
- `resolution`：处理结果说明（状态为“已处理”时有值）

**重要：提交反馈后必须向用户告知 feedback_id 和查询方法**，方便用户后续查看修复进度。示例：“已提交反馈（ID: 24），你可以随时让我查询处理结果。”