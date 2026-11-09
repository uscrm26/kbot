# K-bot 接入平台能力文檔 API_CAPABILITIES

> 本文件由 GET /v1/skills 與 GET /v1/skills/guide 自動生成，每次新對話重新拉取覆蓋。

## 一、平台信息

- 平台名稱：Yy Ai（鴻蒙大模型中心，官网 harmony.lk888.ai）
- 能力版本：2026-11-05
- 手寫 HTTP 基礎地址：https://api.lk888.ai/api
- OpenAI SDK base_url：https://api.lk888.ai/v1
- 認證方式：Bearer {api_key}，請求頭 Authorization
- 當前餘額：20.29 算力（2026-11-09 查詢）
- API Key 存放：項目 .env.local 的 OPENAI_LIKE_API_KEY，已被 gitignore 忽略

## 二、完整接口列表

### 模型查询

#### GET /v1/skills/models

用途：获取模型列表

按类型查询平台所有可用模型。返回每个模型的名称、展示名称、类型、功能标签和简介。
- 不传 type 参数返回所有类型的模型
- type=chat 时只返回 tt / op / sn / hk / fb / gem 前缀的语言模型，并额外返回 api_format（调用格式：openai/anthropic/gemini）和 api_endpoint（对应的请求路径）
- type=image/video/audio 返回对应类型的媒体模型（type 取值仅 chat/image/video/audio 四种；不存在 tts/music 取值，TTS 语音合成、语音克隆、音乐与音效统一归入 audio，传 tts 或 music 返回 400）

语言：本接口按请求头 Accept-Language 返回对应语言的文案。带 Accept-Language: zh-CN 时 display_name、tags、params[].label 返回中文；不带该头时默认返回英文（不会报错，只是值为英文）。

响应字段说明：
- name: 模型标识名，调用接口时传此值
- display_name: 展示用名称，语言随 Accept-Language 变化
- type: 模型类型（chat/image/video/audio）
- tags: 功能标签数组，如["文生视频","图生视频"]，语言随 Accept-Language 变化
- description: 模型简介
- input_hint: 输入提示文案
- icon: 模型图标 URL，可直接用于三方客户端展示（无图标时该字段不返回）
- api_format: [仅chat] 调用格式，openai/anthropic/gemini
- api_endpoint: [仅chat] 对应请求路径，如 /v1/chat/completions

#### GET /v1/skills/models/{model_name}

用途：获取模型功能与参数

查询单个模型的功能信息和参数列表，不含价格。

响应字段说明：
- name/display_name/type/tags/description: 同模型列表接口
- input_hint: 提示用户输入什么，如"描述视频内容"
- params: 参数定义数组，每个参数包含：
  - name: 参数标识名，调用时传入 params 对象的 key
  - label: 参数中文名称
  - type: 参数类型，select=下拉选择，radio=单选，textarea=文本输入，number=数字输入，upload=文件上传，switch=开关
  - required: 是否必填
  - options: [仅 select/radio/switch 类型] 可选项数组，每项含 label(显示名)/value(传入值)
  - description: 参数说明
- channel_constraints: [仅有线路限制的模型] 各启用线路的限制数组，每项含 group_id / channel_group / unsupported（文字提示）/ supported_options（该线路对某参数只接的值，未列出的参数不限）/ capability_rules（结构化规则）；判定规则见响应里的 channel_constraints_note

调用媒体生成接口时，将此处获取的参数放入请求体的 params 对象中。平台不再返回 default/is_default 默认值字段，required=true 的参数必传，不需要的可选参数请直接省略。

#### GET /v1/skills/models/{model_name}/pricing

用途：获取模型完整价格

查询模型所有渠道分组的完整价格信息，包括参数价格变动。默认返回全量渠道分组，每个分组含 is_active 字段标识当前是否启用。注意：is_active=false 的分组并非永久关闭，平台会根据供应商状态随时启用或关闭渠道分组，因此展示价格时应包含所有分组供用户参考。传 ?status=active 可仅获取当前正在运行的分组。

### 调用说明

#### GET /v1/skills/guide

用途：通用调用说明

返回平台所有模型的通用调用指南，包含以下内容：

1. 语言模型三种调用格式：
   - OpenAI 格式：POST /v1/chat/completions，适用于 tt 前缀模型
   - Anthropic 格式：POST /v1/messages，适用于 op/sn/hk/fb 前缀模型
   - Gemini 格式：POST /v1beta/models/{model}:{action}，适用于 gem 前缀模型
   每种格式含请求示例和响应示例

2. 媒体模型异步轮询流程：
   - 第一步：POST /v1/media/generate 提交任务，获取 task_id
   - 第二步：GET /v1/skills/task-status?task_id=xxx 轮询状态
   - 轮询间隔建议5秒，is_final=true 时停止

3. 价格计算公式：
   - 按次计费：最终价格 = 基础价格 × 参数系数 + 参数加价
   - 按token计费：费用 = 输入token数 × 输入单价 + 输出token数 × 输出单价

4. 渠道策略说明：
   - 价格优先：自动选择最便宜的可用渠道
   - 速度优先：自动选择响应最快的可用渠道
   - 成功率优先：自动选择成功率最高的可用渠道
   策略在用户的 API Key 设置中配置，调用时无需指定

### 任务管理

#### GET /v1/skills/task-status

用途：查询任务状态

查询媒体生成任务的实时状态。提交生成任务后，通过此接口轮询任务进度和结果。

响应字段说明：
- task_id: 任务ID
- model: 使用的模型名称
- status: 任务状态文本，如"排队中""生成中""生成完成""生成失败"
- status_group: 状态分组，"等待中"/"处理中"/"已完成"/"失败"
- progress: 进度百分比，如"0%"、50%"、"100%"
- is_final: 是否为终态。true 表示任务已结束（成功或失败），必须停止轮询
- result_url: 生成结果的下载地址，仅成功时有值
- result_type: 结果类型，video/image/audio 等
- cost: 实际扣费的算力值
- channel_group: 实际使用的渠道分组名称
- error: 失败时的错误信息
- created_at: 任务创建时间
- completed_at: 任务完成时间，未完成时为空
- duration_seconds: 从创建到完成的耗时（秒）

### 账户信息

#### GET /v1/skills/balance

用途：查询算力余额

查询当前 API Key 对应用户的算力余额和 Key 额度使用情况。

响应字段说明：
- balance: 用户账户的算力余额（注意：单位是算力，不是人民币）
- unit: 余额单位，固定为"算力"
- api_key_quota: API Key 的额度信息
  - used: 该 Key 已使用的算力
  - limit: 该 Key 的总额度上限，0 表示不限额
  - remaining: 该 Key 剩余可用额度，仅在 limit>0 时返回

#### GET /v1/skills/usage

用途：查询消费明细

查询最近 N 天本 API Key（或跨 Key 按账户）的算力消费。默认返回按模型聚合的汇总（调用次数/成功数/失败数/实际扣费/退款金额）；detail=1 返回按任务倒序的最近消费记录。失败但已退款的任务 cost 在响应里会处理为 0，refunded_amount 会单独给出，与 /v1/skills/task-status 一致。

#### GET /v1/skills/key

用途：查看本密钥配置

查看发起调用的这把 API Key 自己的配置：名称、渠道策略、自定义白名单、排除名单、状态、限额、已用额度、IP 白名单。只返回这一把密钥，看不到同账号下的其它密钥。

响应字段说明：
- id / name: 密钥编号与名称
- api_key: 打码后的密钥（只露头尾），用来确认是哪一把
- strategy: 渠道策略，取值 综合最优 / 成功率优先 / 速度优先 / 价格优先 / 自定义
- status: 1=启用，0=停用
- limit / used: 限额（0 表示不限额）与已使用算力，只读
- ip_whitelist: IP 白名单，只读；空数组表示不限来源
- api_edit_allowed: 是否允许用 POST /v1/skills/key 修改本密钥，即控制台的「允许通过接口修改配置」开关；默认 false，只能在控制台改
- custom_groups: 自定义白名单，每条是一个模型及其线路
  - model / model_id: 模型名与模型编号；模型已下架时 model 为空串
  - group_ids: 线路编号，顺序即手动调度时的尝试顺序
  - force_group_ids: 强行调用的线路（临时下线时仍照常调用）
  - schedule_strategy: 已选线路内的调度方式，手动 / 综合最优 / 成功率优先 / 速度优先 / 价格优先
  - groups: 每条线路的名称与当前状态 status（active=在线，offline=临时下线，removed=已永久关闭或不存在）
- custom_groups_in_effect: 白名单当前是否生效（仅 strategy=自定义 时为 true）
- exclusions: 排除名单，每条是 model / model_id / group_ids / groups，含义同上
- exclusions_in_effect: 排除名单当前是否生效（strategy 不是 自定义 时为 true）
- created_at / last_used_at: 创建时间与最后使用时间，从未使用过时 last_used_at 为 null
- editable_fields: 可以通过 POST /v1/skills/key 修改的字段

#### GET /v1/skills/recharge/options

用途：查询扫码充值档次

查询当前账户可选的充值档次与可用支付方式，用于在本地工具内扫码充值。

响应字段说明：
- enabled: 本站是否开放开放API扫码充值；false 时 tiers/pay_methods 为空，请引导用户到官网充值
- currency: 金额币种（CNY，单位元）
- pay_methods: 可用支付方式，目前只有 wechat
- tiers[].amount: 档次金额（元），下单时 amount 必须取其中之一
- tiers[].bonus: 当前活动赠送算力（无活动为 0）
- tiers[].credits: 付款后预计到账算力（含赠送）

#### POST /v1/skills/recharge/orders

用途：创建扫码充值订单

按所选档次创建微信付款订单，返回 code_url。本地工具把 code_url 渲染成二维码给用户用微信扫码付款，付款成功后余额自动到账。

响应字段说明：
- order_no: 订单号，用于查询到账状态
- code_url: 微信付款链接（weixin://...），需自行渲染成二维码，不能直接在浏览器打开
- expires_in: code_url 有效期（秒），约 2 小时
- amount / bonus / credits: 支付金额（元）/ 赠送算力 / 预计到账算力

#### GET /v1/skills/recharge/orders/{order_no}

用途：查询扫码充值订单

查询扫码充值订单是否已付款到账。

响应字段说明：
- status: pending=待付款 / paid=已到账 / expired=付款码已过期 / closed=订单已关闭
- is_paid: 是否已到账
- balance: 仅 paid 时返回，到账后的算力余额
- paid_at: 付款时间（RFC3339）

#### POST /v1/skills/key

用途：修改本密钥配置

修改发起调用的这把 API Key 自己的配置。只改请求体里出现的字段，没出现的保持不变；成功后返回修改后的完整配置（结构同 GET /v1/skills/key）。保存后立即生效。

本接口默认关闭：需密钥主人先在控制台为这把密钥打开「允许通过接口修改配置」，没开时返回 403（code=api_edit_not_allowed），什么都不改。开关本身只能在控制台修改，GET /v1/skills/key 返回的 api_edit_allowed 可提前判断。

可以修改：name（名称）、strategy（渠道策略）、status（状态）、custom_groups（自定义白名单）、exclusions（排除名单）。
不能修改：limit（限额）、ip_whitelist（IP 白名单），请求体里出现这两个字段会直接返回 400。创建与删除密钥也不在本接口范围内，请到控制台操作。

名单的写入方式由 mode 决定：
- merge（默认）：按模型增量。只动本次出现的模型——带 group_ids 的新增或覆盖该模型，group_ids 传空数组则移除该模型；没出现的模型原样保留。
- replace：整份覆盖。用本次传的名单替换原有的全部条目。

custom_groups 每条：
- model 或 model_id：指明模型，二选一。model 传模型名；model_id 取自 GET /v1/skills/key 或 GET /v1/skills/key/available-groups 的返回
- group_ids：线路编号数组，取自 GET /v1/skills/key/available-groups；顺序即手动调度时的尝试顺序
- force_group_ids：可选，强行调用的线路，必须是 group_ids 的子集；临时下线时仍照常调用，不自动切到下一条
- schedule_strategy：可选，已选线路内的调度方式，手动（默认）/ 综合最优 / 成功率优先 / 速度优先 / 价格优先

exclusions 每条：model 或 model_id，加 group_ids。

#### GET /v1/skills/key/available-groups

用途：查询可选模型与线路

按模型列出这把密钥所属账号可选的全部线路（不按本密钥的白名单/排除名单过滤），用于配置自定义白名单或排除名单：返回里的 group_id 就是 POST /v1/skills/key 的 group_ids 要填的值。价格按当前账号的实际扣费口径返回。

响应字段说明：
- models: 模型数组
  - model / model_id: 模型名与模型编号
  - display_name / intro / tags / icon: 展示信息
  - model_types / primary_type: 模型类型（chat / image / video / audio）
  - groups: 该模型的可选线路
    - group_id / group_name: 线路编号与名称
    - is_active: 是否在线；false 表示临时下线，仍可以选入名单
    - billing_mode: 计费方式（按次 / 按token / 按秒）
    - base_price: 按次、按秒线路的起步价；base_price_raw 为基准档价格，base_price_full 为不含时段折扣的价格
    - input_token_price / output_token_price: 按token线路的输入、输出单价（每百万 token）
    - input_cache_hit_price / input_cache_write_5m_price / input_cache_write_1h_price: 缓存命中与缓存写入单价，0 表示没有这个计价维度
    - tier2_* / tier3_*: 阶梯计价的阈值与单价，0 表示没有阶梯
    - current_time_discount / time_discounts: 当前时段折扣与完整的时段折扣表
    - success_rate_24h / response_seconds_24h: 成功率（-1 表示暂无样本）与平均响应秒数
    - unsupported: 该线路的能力限制说明（文字提示）
    - supported_options: [仅有限制的线路] 该线路对某参数只接的值，未列出的参数不限
    - capability_rules: [仅有限制的线路] 结构化的限制规则，口径同 GET /v1/skills/models/{model_name} 的 channel_constraints
- total / page / page_size / has_more: 分页信息

### 反馈

#### POST /v1/skills/feedback

用途：意见反馈与BUG提交

AI 在使用平台接口过程中，遇到以下情况应主动提交反馈：1) 接口调用报错或返回异常，提交错误信息和调用参数便于平台定位修复；2) 文档说明不清晰或与实际行为不一致，帮助平台完善文档；3) 功能建议或缺少的能力，供平台开发团队参考。这是平台与AI之间的沟通桥梁，积极提交有助于平台持续改进。

#### GET /v1/skills/feedback

用途：查询反馈处理结果

通过反馈ID查询之前提交的反馈的处理状态和结果

### 语言模型调用

#### POST /v1/chat/completions

用途：OpenAI Chat Completions

完全兼容 OpenAI Chat Completions API。可直接使用 OpenAI 官方 SDK，只需将 base_url 指向本平台即可。

适用模型：tt 前缀的所有模型

主要参数：
- model: 模型名称（必填）
- messages: 消息数组，每条含 role(system/user/assistant) 和 content（必填）
- stream: 是否流式输出，true 为 SSE 流式，false 为一次性返回（默认false）
- temperature: 温度参数 0-2（可选）
- max_tokens: 最大输出 token 数（可选）

响应字段：
- choices[0].message.content: AI 回复内容
- usage.prompt_tokens: 输入消耗的 token 数
- usage.completion_tokens: 输出消耗的 token 数

#### POST /v1/responses

用途：OpenAI Responses

兼容 OpenAI 新版 Responses API 格式。相比 Chat Completions 更简洁，input 可直接传字符串。

适用模型：tt 前缀的所有模型

主要参数：
- model: 模型名称（必填）
- input: 输入内容，可以是字符串或消息数组（必填）
- stream: 是否流式输出（可选）

响应字段：
- output[0].content[0].text: AI 回复内容
- usage.input_tokens: 输入 token 数
- usage.output_tokens: 输出 token 数

#### POST /v1/messages

用途：Anthropic Messages

完全兼容 Anthropic Messages API。可直接使用 Anthropic 官方 SDK，只需将 base_url 指向本平台。

适用模型：op / sn / hk / fb 前缀的所有模型

主要参数：
- model: 模型名称（必填）
- messages: 消息数组，每条含 role(user/assistant) 和 content（必填）
- max_tokens: 最大输出 token 数（必填，Anthropic 格式强制要求）
- system: 系统提示词，单独字段而非放在 messages 中（可选）
- stream: 是否流式输出（可选）

响应字段：
- content[0].text: AI 回复内容
- usage.input_tokens: 输入 token 数
- usage.output_tokens: 输出 token 数
- stop_reason: 停止原因，"end_turn" 表示正常结束

#### POST /v1beta/models/{model}:{action}

用途：Gemini Generate Content

完全兼容 Gemini API 协议。可直接使用 GenAI SDK，只需将 base_url 指向本平台。

适用模型：gem 前缀的所有模型

URL 格式：/v1beta/models/{model}:{action}
- {model}: 模型名称，如 gem-3-pro
- {action}: 操作类型
  - generateContent: 非流式，一次性返回完整结果
  - streamGenerateContent: 流式输出

主要参数：
- contents: 消息数组，每条含 role(user/model) 和 parts[{text:""}]（必填）
- generationConfig: 生成配置，含 temperature/maxOutputTokens 等（可选）

响应字段：
- candidates[0].content.parts[0].text: AI 回复内容
- usageMetadata.promptTokenCount: 输入 token 数
- usageMetadata.candidatesTokenCount: 输出 token 数

#### GET /v1/models

用途：模型列表（OpenAI 兼容）

OpenAI 兼容的模型列表端点，返回标准 {object:"list", data:[{id,...}]} 结构，供 OpenAI/Anthropic SDK 及各类客户端做模型自动发现。仅返回模型 id 等基础信息；模型的能力、参数、端点与价格请用 GET /v1/skills/models 与 GET /v1/skills/models/{name} 查询。

### 媒体生成

#### GET /v1/media/models

用途：获取媒体模型列表

按类型返回可用的媒体生成模型及其参数定义。**type 为必填参数**（可选值 image / video / audio），不传返回 400 Missing required parameter: type；若需一次拿到全部模型（含 chat），请改用 GET /v1/skills/models。

每个模型包含 name、type、label、description 和 params 字段。params 定义了调用 /v1/media/generate 时可传的参数，包括名称、类型、选项、是否必填等（平台不再返回 default 默认值）。

注意：建议使用 /v1/skills/models 接口替代，信息更完整（含功能标签、展示名称、模型图标等）。

#### POST /v1/media/generate

用途：提交媒体生成任务

提交图片/视频/音频/TTS/音乐生成任务。提交后返回 task_id，通过轮询接口查询结果。

请求体参数：
- model: 模型名称（必填），从 /v1/skills/models 获取
- prompt: 提示词/文本描述（必填）
- params: 参数对象（可选），从 /v1/skills/models/{name} 获取可用参数

params 用法说明：
- 先调用 /v1/skills/models/{model_name} 获取模型的 params 定义
- 将需要的参数组装为对象，key 是参数的 name，value 是参数值
- 例如模型有 duration 参数（type=select，options含"5"和"10"），则传 {"duration": "5"}
- type=select 的参数必须从 options 中选取 value 值
- type=upload 的参数传入文件的公网直链 URL；图片/音频也可直接传 data:<mime>;base64,<数据> 内联（单文件解码后≤10MB、单次合计≤30MB、请求体总≤50MB，视频仍需 URL）
- required=false 且不需要的参数请直接省略，平台不再为未传参数填默认值

响应：
- data.task_id: 任务ID（新字段，主推），用于轮询状态
- data.任务ids / data.对话组ID / data.成功数量: 中文字段为兼容老 SDK 保留，计划 2 个月后下线，新接入一律读 data.task_id

#### GET /v1/media/status

用途：查询任务状态（原版）

查询媒体生成任务的实时状态（早期版本）。返回任务进度、结果地址、扣费等信息。

建议使用 /v1/skills/task-status 替代，增强版额外返回：
- model: 模型名称
- created_at: 创建时间
- completed_at: 完成时间
- duration_seconds: 耗时
- channel_group: 渠道分组名称

#### GET /v1/skills/voices

用途：获取可用音色列表

获取当前用户可用的 TTS 音色列表，支持按模型筛选

#### POST /v1/skills/voices/clone

用途：克隆自定义音色

上传音频文件克隆自定义音色，用于 speech-2.8 模型

### 人像形象

#### POST /v1/skills/avatars

用途：创建人像形象

上传一张人像图创建 SD2.0 人像形象（真人 real / 虚拟 virtual）。服务端会下载 image_url 并转存，后台异步素材化。真人形象返回扫码活体认证链接（120秒有效），必须由形象本人用手机打开完成人脸活体认证，无法绕过；虚拟形象无需认证。创建后轮询 GET /v1/skills/avatars/{avatar_id} 直到 status=ready，再在 /v1/media/generate 的 params.avatar_ids 里引用。

#### GET /v1/skills/avatars

用途：获取形象列表

列出当前账号的全部人像形象及其状态（awaiting_verification / processing / ready / failed），可按类型过滤。

#### GET /v1/skills/avatars/{avatar_id}

用途：查询单个形象状态

按 avatar_id 查询单个形象的状态，创建后用本接口轮询直到 status=ready。status=failed 时额外返回 failure_reason。

#### POST /v1/skills/avatars/{avatar_id}/verification

用途：刷新真人认证链接

真人形象的活体认证链接 120 秒过期，过期后调本接口重新拉起认证会话并获取新链接。

#### DELETE /v1/skills/avatars/{avatar_id}

用途：删除形象

软删除指定形象（立即不可再被生成引用，宽限 7 天后物理清理母版与渠道侧素材）。

### 增值聊天

#### POST /v1/agent/chat

用途：增值聊天（网站聊天页全功能版）

【适用场景】本接口面向自建集成：自建网站、自建 App/小程序、自研客服或业务系统——由调用方自己的代码发起请求并渲染聊天界面。Codex、Claude Code、Cursor 等现成 AI 工具只认 OpenAI/Anthropic 标准协议，无法对接本自有协议；这类工具请改用透传接口（/v1/chat/completions、/v1/messages 等）。

网站聊天页同款全功能聊天接口（平台独立协议，非 OpenAI 兼容）。在裸模型之上自动叠加平台增值能力：联网搜索（模型自主决定何时搜、搜什么）、网页正文阅读、跨对话长期记忆（服务端存储）、附件文档解析（PDF/Word/Excel/PPT 等，传公网 URL 即可）、深度思考过程展示、智能上下文优化（超长内容自动切块+按需检索）、历史回忆、AI 自主调用生图/生视频/生音频工具、Excel/Word/PDF 文档生成、思维导图/图表、深度研究模式。对话历史由服务端保存：客户端只需保存 conversation_id 续传，无需自组 messages 数组。

响应为 SSE 流（Content-Type: text/event-stream），每帧格式 data: {JSON}。解析规则三条：①行内容为 [DONE] 的哨兵行跳过；②JSON 不带 type 字段=模型输出帧（OpenAI chat.completion.chunk 结构），choices[0].delta.content 为正文增量、delta.reasoning_content（或 delta.reasoning）为思考增量（tt/qwen/deepseek/gk 等模型走此形态）；③JSON 带 type 字段=平台事件帧：type=content/thinking 也是正文/思考增量（op/sn/hk/fb、gem 系模型走此形态，如 {"type":"content","content":"你好"}）；meta（流首帧：conversation_id、memory_space、effective_settings 本次生效开关回显）；init（任务id/对话组id）；usage（{input_tokens,output_tokens,total_tokens,cost,channel_group_id}；cost 供调用方给终端用户计费，channel_group_id 为落地渠道分组id，不回传供应商名称）；done（{status:completed|interrupted|failed}，可能附带中文键忽略即可）；error（{message} 流中致命错误，随后 done status=failed，失败全额退款）；task_interrupted（中断，已产出部分照常交付）；ping（保活空帧忽略）；以及各工具过程状态帧（全部可不渲染，不影响正文交付）——web_search_status（stage:searching→searched/failed，searched 帧含 query/count/results[{title,url,snippet,source,age}]/sites[{domain,icon_url}]，可渲染成搜索来源卡片）、url_fetch_status（fetching→fetched/failed，含 url/title/chars）、memory_status（saved/updated/deleted，含 title 与记忆条目编号 memory_id）、generation_status（submitting→submitted/failed；重点：成品不在流里回传，submitted 帧的 task_ids 需用同一把 Key 轮询 GET /v1/skills/task-status?task_id={id}，5秒一次 is_final=true 停，用 result_url 按 result_type 渲染）、doc_generate_status（generating→generated/failed，generated 含 file_name/format/url/size，Excel 另有 sheets/rows，直接渲染下载卡片）、media_process_status（processing→processed/failed，processed 含 url/file_name/size/media，operation=probe 时无成品只含 info）、mindmap_status/chart_status（generated，产物为结构化数据：mindmap 有 markdown 大纲，chart 有 chart_type/chart_data/chart_options 需客户端图表库渲染）、tool_prep_status/history_recall_status/view_media_status/prompt_submit_status（轻量辅助帧可忽略）。遇到不认识的 type 一律忽略，安全向前兼容。

预检失败（余额不足/模型不可用/内容违规等）时响应为 application/json 的 {code,msg,data}（HTTP 始终 200）：按响应 Content-Type 区分成功流与错误对象。

settings 支持的键（全部可选，缺省=平台默认）：web_search(默认开) url_fetch(开) history_recall(开) memory(开) carry_history(开) carry_history_rounds(0=自动) max_search_times max_tool_rounds max_input_tokens generate_image(关) generate_video(关) generate_audio(关) image_models/video_models/audio_models(字符串数组，开启生成工具时必传，可用模型查 /v1/skills/models?type=image|video|audio) image_limit/video_limit/audio_limit document_generate(开) media_process(开) mindmap(开) chart(开) deep_research(关) smart_context(开) smart_context_threshold doc_summary(开) task_budget_tokens(单条消息总消耗封顶token，默认100万)。

#### GET /v1/agent/conversations

用途：列出对话组

分页列出当前 API Key 名下的全部增值聊天对话组（按最后更新时间倒序）。用于在你自己的管理后台盘点会话、或对账清理。

#### GET /v1/agent/conversations/history

用途：查对话组历史消息

分页拉取某个对话组的完整历史（按轮次正序）：每轮含用户消息、AI 回复、思考过程、附件URL、状态与时间。典型用法：在你自己的页面上展示用户的历史聊天记录（历史全部存在平台侧，你无需自存消息）。

#### POST /v1/agent/conversations/delete

用途：删除对话组

删除指定对话组及其全部历史消息、附件解析缓存（硬删不可恢复）。典型用法：你的终端用户删除会话或注销账号时同步清理平台侧数据。

#### POST /v1/agent/memories/clear

用途：清除长期记忆

清除长期记忆（服务端存储，按长记忆用户标识隔离）。三种用法：传 memory_id（长记忆用户标识）清除该用户的长记忆（你的某个终端用户注销时用）；传 all=true 清除本 Key 名下全部长记忆；什么都不传清除 Key 级默认长记忆。


## 三、聊天模型清單（共 81 個）

| 模型名稱 | 展示名 | 調用格式 | 端點 | 當前 Key 可用 |
|---|---|---|---|---|
| gem-3.8-flash | GEM 3.8 flash | gemini | /v1beta/models/{model}:{action} | 是 |
| tt-6-luna | TT-6 luna | openai | /v1/chat/completions | 是 |
| kimi-k3 | Kimi K3 | openai | /v1/chat/completions | 是 |
| tt-6.1-terra | TT-6.1 terra | openai | /v1/chat/completions | 是 |
| hk-5-5 | HK-5.5 | anthropic | /v1/messages | 是 |
| gem-4-argon | GEM 4 argon | gemini | /v1beta/models/{model}:{action} | 是 |
| tt-6.1-sol | TT-6.1 sol | openai | /v1/chat/completions | 是 |
| tt-6-astra | TT-6 astra | openai | /v1/chat/completions | 是 |
| gem-3.5-flash | GEM 3.5 flash | gemini | /v1beta/models/{model}:{action} | 是 |
| tt-5.6-sol | TT-5.6 sol | openai | /v1/chat/completions | 是 |
| gem-3.1-pro | GEM 3.1 Pro | gemini | /v1beta/models/{model}:{action} | 是 |
| op-5-5 | OP-5.5 | anthropic | /v1/messages | 是 |
| kimi-k3.1-pro | Kimi K3.1 Pro | openai | /v1/chat/completions | 是 |
| gem-3.7-flash | GEM 3.7 flash | gemini | /v1beta/models/{model}:{action} | 是 |
| tt-5.5 | TT-5.5 | openai | /v1/chat/completions | 是 |
| deepseek-v4.1-flash | DS-V4.1-Flash | openai | /v1/chat/completions | 是 |
| MiniMax-M3.1-Flash | MiniMax-M3.1-Flash | openai | /v1/chat/completions | 是 |
| fb-5 | FB-5 | anthropic | /v1/messages | 是 |
| tt-5.6-luna | TT-5.6 luna | openai | /v1/chat/completions | 是 |
| tt-5.4 | TT-5.4 | openai | /v1/chat/completions | 是 |
| gem-3.6-flash | GEM 3.6 flash | gemini | /v1beta/models/{model}:{action} | 是 |
| deepseek-v4-pro | DS-V4-Pro | openai | /v1/chat/completions | 是 |
| tt-6-sol | TT-6 sol | openai | /v1/chat/completions | 是 |
| doubao-seed-2-1-pro-260628 | 豆包 Seed 2.1 Pro | openai | /v1/chat/completions | 是 |
| fb-5-1 | FB-5.1 | anthropic | /v1/messages | 是 |
| op-5 | OP-5 | anthropic | /v1/messages | 是 |
| qwen3.8-max | 千问 3.8 Max | openai | /v1/chat/completions | 是 |
| tt-5.6-terra | TT-5.6 terra | openai | /v1/chat/completions | 是 |
| op-4-8 | OP-4.8 | anthropic | /v1/messages | 是 |
| glm-5.3 | GLM-5.3 | openai | /v1/chat/completions | 是 |
| gem-3-pro | GEM 3 Pro | gemini | /v1beta/models/{model}:{action} | 是 |
| op-4-6 | OP-4.6 | anthropic | /v1/messages | 是 |
| sn-5-5 | SN-5.5 | anthropic | /v1/messages | 是 |
| doubao-seed-2-0-pro-260215 | 豆包 Seed 2.0 Pro | openai | /v1/chat/completions | 是 |
| deepseek-v4-flash | DS-V4-Flash | openai | /v1/chat/completions | 是 |
| glm-5.3-flash | GLM-5.3 Flash | openai | /v1/chat/completions | 是 |
| gk-4.6 | GK-4.6 | openai | /v1/chat/completions | 是 |
| sn-5 | SN-5 | anthropic | /v1/messages | 是 |
| deepseek-v4-flash-vision-exp | DS-V4-Flash-Vision-Exp | openai | /v1/chat/completions | 是 |
| qwen3.8-max-0902 | 千问 3.8 Max 0902 | openai | /v1/chat/completions | 是 |
| op-4-7 | OP-4.7 | anthropic | /v1/messages | 是 |
| deepseek-v4-pro-0813 | DS-V4-Pro-0813 | openai | /v1/chat/completions | 是 |
| gk-4.7 | GK-4.7 | openai | /v1/chat/completions | 是 |
| tt-5.4-mini | TT-5.4 mini | openai | /v1/chat/completions | 是 |
| doubao-seed-2-1-turbo-260628 | 豆包 Seed 2.1 Turbo | openai | /v1/chat/completions | 是 |
| qwen3.8-flash | 千问 3.8 Flash | openai | /v1/chat/completions | 是 |
| kimi-k2.6 | Kimi K2.6 | openai | /v1/chat/completions | 是 |
| glm-5.3-flashx | GLM-5.3 FlashX | openai | /v1/chat/completions | 是 |
| tt-4o | TT-4o | openai | /v1/chat/completions | 是 |
| glm-5.2 | GLM-5.2 | openai | /v1/chat/completions | 是 |
| tt-5.2 | TT-5.2 Codex | openai | /v1/chat/completions | 是 |
| hk-4.5 | HK-4.5 | anthropic | /v1/messages | 是 |
| sn-4-6 | SN-4.6 | anthropic | /v1/messages | 是 |
| MiniMax-M3 | MiniMax-M3 | openai | /v1/chat/completions | 是 |
| gk-4.5 | GK-4.5 | openai | /v1/chat/completions | 是 |
| qwen3.7-max | 千问 3.7 Max | openai | /v1/chat/completions | 是 |
| gem-3.1-flash | GEM 3.1 flash | gemini | /v1beta/models/{model}:{action} | 是 |
| kimi/kimi-k2.7-code-highspeed | Kimi K2.7 Code 高速版 | openai | /v1/chat/completions | 是 |
| deepseek-v4-flash-0731 | DS-V4-Flash-0731 | openai | /v1/chat/completions | 是 |
| op-4-5 | OP-4.5 | anthropic | /v1/messages | 是 |
| kimi/kimi-k2.7-code | Kimi K2.7 Code | openai | /v1/chat/completions | 是 |
| deepseek-v3.2 | DS-V3.2 | openai | /v1/chat/completions | 否 |
| doubao-seed-evolving | 豆包 Seed Evolving | openai | /v1/chat/completions | 是 |
| gk-4-20 | GK-4-20 | openai | /v1/chat/completions | 是 |
| stepfun/step-3.7-flash | Step 3.7 Flash | openai | /v1/chat/completions | 是 |
| mimo-v2.5-pro | mimo-v2.5-pro | openai | /v1/chat/completions | 是 |
| mimo-v2.6-pro | mimo-v2.6-pro | openai | /v1/chat/completions | 是 |
| gem-3.5-flash-lite | GEM 3.5 flash lite | gemini | /v1beta/models/{model}:{action} | 是 |
| qwen3.5-plus | 千问 3.5 Plus | openai | /v1/chat/completions | 是 |
| gem-3-flash | GEM 3 flash | gemini | /v1beta/models/{model}:{action} | 是 |
| qwen3.5-flash | 千问 3.5 Flash | openai | /v1/chat/completions | 是 |
| qwen3.6-plus | 千问 3.6 Plus | openai | /v1/chat/completions | 是 |
| tt-5.4-nano | TT-5.4 nano | openai | /v1/chat/completions | 是 |
| qwen3.8-flash-next | 千问 3.8 Flash Next | openai | /v1/chat/completions | 否 |
| qwen3.7-plus | 千问 3.7 Plus | openai | /v1/chat/completions | 是 |
| MiniMax-M2.7 | MiniMax-M2.7 | openai | /v1/chat/completions | 是 |
| doubao-seed-character-260628 | 豆包·虚拟陪伴 | openai | /v1/chat/completions | 是 |
| gk-4.3 | GK-4.3 | openai | /v1/chat/completions | 是 |
| doubao-seed-1-8-251228 | 豆包 Seed 1.8 | openai | /v1/chat/completions | 否 |
| qwen3.6-flash | 千问 3.6 Flash | openai | /v1/chat/completions | 是 |
| gk-build-0.1 | GK-build-0.1 | openai | /v1/chat/completions | 是 |

## 四、調用方式與計費要點

### 渠道策略

{
  "balance_precheck_note": "提交媒体任务时的余额预检与预扣只按本次自动路由排在首位的那条线路计价（含所选分辨率档位、时长、参考视频秒数与参考图费用）；余额不够直接返回 402 insufficient_balance，不会自动改用当前余额付得起的其它线路。综合最优按权重抽选线路，每次首选可能不同，价格页上某条线路便宜不代表本次一定按它计价；需要稳定按最低价线路预扣，请把 API Key 渠道策略改为「价格优先」，或用「自定义」只勾便宜线路。另外部分模型会按请求形态排除不接该形态的线路（如 MiniMax H3 带参考视频/音频时排除 DMC、容启等线路），这类请求可用的最低价可能高于价格页最低价。平台暂不提供按参数试算预扣金额的接口。",
  "description": "渠道策略说明，用户在 API Key 设置中选择，调用时自动路由。",
  "is_active_note": "渠道分组的 is_active 字段会随上游可用性实时变化。某次请求实际命中的是任务创建瞬间 is_active=1 且按策略排序靠前的分组；事后再查 /v1/skills/models/{name}/pricing 可能会看到那个分组已经 is_active=false。billed 金额匹配任务命中分组的价格，属正常现象，不代表扣错费。",
  "note": "策略在 API Key 管理页面设置，调用失败时自动切换到下一个渠道重试。",
  "per_request_override": "本平台不支持按单次请求切换渠道分组：请求体里的 channel_group 字段、请求头里的 X-Channel-Group 均不被识别，分组选择完全由 API Key 绑定的策略决定。如果需要在同一个应用里对同一模型做分组 fallback（例如 官方 → 官转 → 直连），建议为每条 fallback 链路各创建一把 API Key、各自配置不同策略，然后在客户端按顺序重试切换，不要期望通过请求参数覆盖路由。是否值得切换看失败的 error_code：channel_unavailable / upstream_error / server_error 才值得本 Key 重试或换下一把 Key；content_policy_violation、invalid_request 等换哪把 Key 结果都一样，应直接终止（见 error_format.task_failure_error_codes）。注意智能策略（综合最优等）下平台在单次任务内已自动逐个尝试候选分组，最终仍失败说明候选分组都试过了。",
  "self_manage": "密钥也可以用接口管理自己的渠道配置：GET /v1/skills/key 查看本密钥的策略与名单，POST /v1/skills/key 修改（渠道策略、自定义白名单、排除名单、名称、状态；限额与 IP 白名单只读），可选模型与线路的 id 见 GET /v1/skills/key/available-groups（它列的是账号可选的全部线路、不按本密钥过滤，本密钥当前能否调用看返回里每个模型的 available_for_this_key 与各线路 in_key_whitelist / excluded_for_this_key，与 /pricing 同口径）。只能改发起调用的这把密钥自己。修改默认关闭：需密钥主人先在控制台为这把密钥打开「允许通过接口修改配置」，没开时 POST 返回 403（code=api_edit_not_allowed），GET 返回的 api_edit_allowed 可提前判断。修改会改变这把密钥之后的选路与扣费，请只在用户明确要求时调用，不要为了让某次调用通过而自行修改。",
  "strategies": [
    {
      "description": "综合价格、成功率、速度与实时拥堵四个维度智能分流，并自动避开拥堵渠道（推荐）",
      "name": "综合最优"
    },
    {
      "description": "自动选择价格最低的可用渠道",
      "name": "价格优先"
    },
    {
      "description": "自动选择响应最快的可用渠道",
      "name": "速度优先"
    },
    {
      "description": "自动选择成功率最高的可用渠道",
      "name": "成功率优先"
    },
    {
      "description": "仅在用户为该模型预先勾选的渠道分组中按用户设定的顺序逐个 fallback；若该模型未配置任何分组，将直接返回 403（不会自动切换到价格优先等其它策略）。配置入口：API Key 管理 → 创建/编辑密钥 → 渠道策略=自定义 → 配置渠道。",
      "name": "自定义"
    }
  ]
}

### 錯誤格式

{
  "description": "所有 /v1/skills/* 和 /v1/media/models 接口失败时返回统一结构，AI 请优先按 error.type 判断错误类别，而不要依赖 error.message 文本",
  "example": {
    "error": {
      "message": "task_id 参数无效",
      "type": "invalid_request_error"
    }
  },
  "result_url_download_note": "task-status 返回的 result_url 正常情况下是平台对象存储（COS）稳定直链，不会过期失效。下载时如遇 TLS/SSL 连接失败、传输中断（unexpected EOF、0 bytes）等，属于客户端到存储节点的网络瞬断，直接重试下载该 URL 即可（建议最多 3 次、间隔数秒）；若下载返回 HTTP 403，多为存储节点/CDN 对无 User-Agent 或脚本默认 UA（如 Python-urllib）的防护拦截，带上常规浏览器 User-Agent 与 Referer=平台官网再请求即可；切勿因下载失败重新提交生成任务——任务已成功并已扣费，重新生成会重复扣费。",
  "schema": {
    "error": {
      "message": "人类可读的错误描述（可能为中文或英文）",
      "type": "错误类别稳定枚举，参见 types 字段"
    }
  },
  "special_note": "注意：/v1/media/generate 接口因历史兼容原因使用 {code,msg,data} 格式，msg 字段直接给出中文描述，AI 请判断 code=200 为成功。聊天透传接口（/v1/chat/completions /v1/messages /v1beta/models/:action /v1/responses）错误格式完全保持上游原始结构不变。",
  "task_failure_error_codes": [
    {
      "ai_action": "不要原样重试，修改提示词/参考图后再提交",
      "error_code": "content_policy_violation",
      "meaning": "提示词、参考图或生成结果未通过内容审核（平台审核或上游模型审核）",
      "retry": false
    },
    {
      "ai_action": "按 error 文案修正参数或素材后再提交",
      "error_code": "invalid_request",
      "meaning": "参数错误、参数组合不被支持，或参考素材不可用（如链接 404、尺寸/时长/格式不符）",
      "retry": false
    },
    {
      "ai_action": "充值（可先 GET /v1/skills/recharge/options：enabled=true 时用 POST /v1/skills/recharge/orders 拿微信付款码 code_url 给用户扫码，再轮询 GET /v1/skills/recharge/orders/{order_no} 至 is_paid=true；enabled=false 则请用户到官网充值）后再提交；若余额够付价格页最低价却仍报 402，是因为预检按本次自动路由首选线路计价，可改用价格优先策略后重试（见 channel_strategy.balance_precheck_note）",
      "error_code": "insufficient_balance",
      "meaning": "账户余额不足",
      "retry": false
    },
    {
      "ai_action": "到控制台调高该 Key 的限额后再提交",
      "error_code": "quota_exceeded",
      "meaning": "该 API Key 的限额不足",
      "retry": false
    },
    {
      "ai_action": "到控制台调整这把密钥的渠道配置后再提交",
      "error_code": "key_config_error",
      "meaning": "这把密钥没有开通该模型，或该模型的线路被全部排除（自定义策略未勾选 / 渠道管理全部取消勾选）",
      "retry": false
    },
    {
      "ai_action": "稍后重试，或换用其他分组 / 其他 Key",
      "error_code": "channel_unavailable",
      "meaning": "可选线路当前全部下线或繁忙",
      "retry": true
    },
    {
      "ai_action": "间隔 5-30 秒重试，建议最多 3 次",
      "error_code": "upstream_error",
      "meaning": "上游临时故障（网络中断、超时、服务暂不可用、交付失败等）",
      "retry": true
    },
    {
      "ai_action": "稍后重试；反复出现请提交 /v1/skills/feedback",
      "error_code": "server_error",
      "meaning": "平台内部错误",
      "retry": true
    }
  ],
  "task_failure_retry_note": "任务失败时一律带机读失败分类码 error_code，请按它决定是否重试，不要匹配 error 文案（error 是脱敏后的人类可读文本，措辞会调整、也会随语言变化）。出现位置：GET /v1/skills/task-status 与 notify_url 回调（state=failed 时顶层 error_code）、GET /v1/media/status（同上）、POST /v1/media/generate 提交失败（code!=200 时顶层 error_code）、同步生图 /v1/images/generations 与 /v1/images/edits（error.code，仅 retry=false 的分类才出现，没有 code 即可重试）。取值与处理方式见 task_failure_error_codes：retry=false 的几类换线路、换 Key 结果都一样，应终止任务并提示终端用户修改；retry=true 的可间隔 5-30 秒重试（建议最多 3 次），失败任务的余额均已自动退回（refunded=true）。未列出的取值按可重试处理；已有取值的含义不会改变，后续只会新增。",
  "types": [
    {
      "ai_action": "修正参数后重试，直接重试无效",
      "http_status": "400",
      "meaning": "请求参数或入参错误",
      "type": "invalid_request_error"
    },
    {
      "ai_action": "检查 Authorization 头；若 code=recharge_required 则需先充值算力（或算力余额大于 5）（可先 GET /v1/skills/recharge/options：enabled=true 时用 POST /v1/skills/recharge/orders 拿微信付款码 code_url 给用户扫码，再轮询 GET /v1/skills/recharge/orders/{order_no} 至 is_paid=true；enabled=false 则请用户到官网充值），重试无用",
      "http_status": "401/403",
      "meaning": "API Key 无效、越权或已禁用；也可能是账户从未充值过且算力余额不足 5（403 + code=recharge_required，被前置闸门拦在所有接口之前，与余额花光的 402 insufficient_balance 是两回事）",
      "type": "authentication_error"
    },
    {
      "ai_action": "充值（可先 GET /v1/skills/recharge/options：enabled=true 时用 POST /v1/skills/recharge/orders 拿微信付款码 code_url 给用户扫码，再轮询 GET /v1/skills/recharge/orders/{order_no} 至 is_paid=true；enabled=false 则请用户到官网充值）或取消调用",
      "http_status": "402",
      "meaning": "账户余额或 API Key 额度不足",
      "type": "insufficient_balance"
    },
    {
      "ai_action": "检查 URL 参数、模型名是否拼错",
      "http_status": "404",
      "meaning": "模型、任务、记录不存在",
      "type": "not_found"
    },
    {
      "ai_action": "退避重试",
      "http_status": "429",
      "meaning": "频率限制",
      "type": "rate_limit_exceeded"
    },
    {
      "ai_action": "error 没有 code：可 5-30 秒后重试；有 code：原参数重试无效，请按 code 调整提示词/参考图/参数/密钥配置。用户余额已自动退回",
      "http_status": "5xx",
      "meaning": "上游供应商临时故障；同步生图端点（/v1/images/generations、/v1/images/edits）任务终态失败也以 502 + upstream_error 返回，error 带 task_id；只有分类为重试无用（content_policy_violation / invalid_request / insufficient_balance / quota_exceeded / key_config_error）时才带 code，瞬时故障不带 code",
      "type": "upstream_error"
    },
    {
      "ai_action": "稍后重试；反复出现请提交 /v1/skills/feedback",
      "http_status": "500",
      "meaning": "平台内部错误",
      "type": "server_error"
    }
  ]
}

### 計費指南

{
  "billing_methods": [
    {
      "formula": "最终价格 = 基础价格 × 所有选项系数的乘积 + 所有选项加成的总和",
      "method": "按次"
    },
    {
      "formula": "最终价格 = (输入token数 × 输入token价格 + 输出token数 × 输出token价格) ÷ 1000000",
      "method": "按token"
    },
    {
      "formula": "最终价格 = 时长秒数 × 每秒价格",
      "method": "按秒"
    }
  ],
  "description": "价格计算说明，每个模型的价格通过 GET /v1/skills/models/{name}/pricing 获取",
  "per_second_prepay_note": "⚠️ 按秒计费模型的【提交瞬间预扣】≠【最终扣费】，余额预估请按预扣口径来：①最终扣费 = 实际成片秒数 × 每秒价格，任务成功后按上游返回时长多退少补、多预扣部分自动原路退还；②但提交瞬间，若请求参数里没有平台可识别的时长字段（duration），平台按【默认 10 秒】整单预扣（预扣 = 10 × 每秒价格）——数字人/对口型类模型（如 kling-avatar-image2video）通过音频文件驱动、请求体中不含时长参数，因此一律按 10 秒预扣，与你音频的实际长度无关；②-2 若显式传了 duration=auto（或传了平台识别不出秒数的时长值），平台无法预知成片长度，按该模型家族的【最大时长】整单预扣——Seedance 2.0 家族按 15 秒、Seedance 2.5 家族按 30 秒，因此常见「预扣 20.25 实扣 3.36」这类大落差，多预扣部分在成片结算时原路退还，平台不多收一分；想降低提交瞬间的冻结额，请显式传具体秒数而不是 auto；③渠道 fallback 会补差额：首选渠道不可用时任务自动切到下一分组并按新分组单价整单重算预扣、只补差额（差额 = 预扣秒数 ×（新分组每秒价 − 原分组每秒价）），此时若余额不足会返回「余额不足，需要额外扣除：⚡X」并整单退款、任务置 error。因此提交前建议保证余额 ≥ 10 秒 × 该模型所有候选渠道分组中最高的 final_price（可从 /v1/skills/models/{name}/pricing 的分组列表取 max），而不是只按 音频秒数 × 单一分组价 估算，否则余额临界时会提交失败。",
  "unit_note": "余额与价格的单位「算力」是平台计价单位：充值时按所在站点充值页显示的比例换算入账（国内站 1 元 = 1 算力），换算比例不随充值档位变化，部分档位或活动额外赠送的算力会直接计入余额；扣费一律按算力计，不区分来自充值还是赠送。任务失败退款会自动原路加回算力余额（非账目冲抵），task-status 显示 cost=0、refunded=true、refunded_amount=退回算力，API Key 已用额度同步回退。"
}

