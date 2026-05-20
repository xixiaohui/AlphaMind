下面是可直接保存为 **`ARCHITECTURE.md`** 的最终版本。  
这份文档的目标是：**让自动编码工具能够直接理解系统分层、实现路径、模块边界和部署方式**。

---

```md
# ARCHITECTURE.md

# 混元智投（AI Financial Research Agent）系统架构文档

> 本文档用于指导自动编码工具与工程开发者实现“混元智投”的前端、Agent、MCP、数据库、权限与部署方案。  
> 目标是构建一个面向全球市场的 **AI 金融研究助手**，而不是交易执行系统或收益承诺工具。

---

## 目录

- [1. 文档目标](#1-文档目标)
- [2. 总体架构概览](#2-总体架构概览)
- [3. 前端架构](#3-前端架构)
- [4. 后端与 Agent 架构](#4-后端与-agent-架构)
- [5. Agent 工作流](#5-agent-工作流)
- [6. MCP 接入方式](#6-mcp-接入方式)
- [7. PostgreSQL 数据流设计](#7-postgresql-数据流设计)
- [8. 权限设计](#8-权限设计)
- [9. 缓存、异步任务与可观测性](#9-缓存异步任务与可观测性)
- [10. 部署方案](#10-部署方案)
- [11. 环境变量建议](#11-环境变量建议)
- [12. 自动编码实现优先级](#12-自动编码实现优先级)
- [13. 非目标与架构边界](#13-非目标与架构边界)

---

# 1. 文档目标

本架构文档服务于以下目标：

1. 明确前端、后端、Agent、MCP、数据库与部署层的职责边界。
2. 为自动编码工具提供清晰的模块拆分与实现顺序。
3. 保证项目从一开始就满足：
   - 结构化研究输出
   - 可扩展多资产类型
   - 可持续增加数据源
   - 可控权限与审计
   - 合规边界明确

---

# 2. 总体架构概览

## 2.1 系统目标

混元智投是一个 **AI 金融研究基础设施**，核心闭环为：

```text
用户搜索/提问
   ↓
前端页面触发研究任务
   ↓
后端 API / BFF 接收请求
   ↓
Intent Router 识别研究对象与意图
   ↓
Research Planner 制定分析计划
   ↓
MCP Tool Layer 拉取市场 / 财务 / 新闻 / 宏观 / 链上数据
   ↓
AI Analysis Engine 生成结构化研究报告
   ↓
结果写入 PostgreSQL
   ↓
前端渲染为图表 / 卡片 / 报告 / 风险列表
   ↓
用户继续追问 / 保存 / 加入自选 / 导出
```

## 2.2 分层结构

```text
Presentation Layer
├── Next.js Web App
├── Research Pages
├── Report Viewer
└── Watchlist UI

Application Layer
├── API Routes / BFF
├── Auth Middleware
├── Research Orchestrator
├── Report Service
└── Search Service

Agent Layer
├── Intent Router
├── Research Planner
├── Financial Agent
├── Macro Agent
├── News Agent
├── Crypto Agent
└── Report Synthesizer

Integration Layer
├── MCP Client
├── Tool Registry
├── Data Source Adapters
└── Cache / Retry / Rate Limit

Data Layer
├── PostgreSQL
├── Redis (optional)
├── Object Storage (optional)
└── Logs / Metrics / Traces

Deployment Layer
├── Web Runtime
├── Worker Runtime
├── PostgreSQL Hosting
└── CDN / Edge / Monitoring
```

---

# 3. 前端架构

前端建议使用 **Next.js App Router + TypeScript + Tailwind CSS + Shadcn UI + ECharts**。

---

## 3.1 前端职责

前端层只负责以下事情：

- 路由管理
- 页面布局
- 用户输入采集
- 展示行情与研究结果
- 展示报告与时间线
- 自选与历史报告管理
- 用户继续追问交互

前端**不直接承担**：

- 第三方金融数据源调用
- MCP Tool 编排
- 复杂权限判断
- 最终研究结论生成

这些应由后端与 Agent 层完成。

---

## 3.2 路由结构

推荐使用 App Router：

```text
src/app/
├── page.tsx                         # 首页
├── market/page.tsx                  # 市场总览
├── search/page.tsx                  # 搜索页
├── watchlist/page.tsx               # 自选页
├── reports/page.tsx                 # 报告中心
├── reports/[id]/page.tsx            # 报告详情
├── settings/page.tsx                # 设置页
├── asset/[symbol]/page.tsx          # 资产研究页
├── research/company/[symbol]/page.tsx
├── research/macro/page.tsx
├── research/crypto/[symbol]/page.tsx
├── api/
│   ├── search/route.ts
│   ├── market/route.ts
│   ├── asset/[symbol]/route.ts
│   ├── research/route.ts
│   ├── reports/route.ts
│   ├── watchlist/route.ts
│   └── chat/route.ts
└── layout.tsx
```

---

## 3.3 前端模块分层

建议采用以下分层：

```text
UI Layer
├── 页面 Page
├── 布局 Layout
├── 基础组件 UI
└── 图表与卡片组件

Feature Layer
├── Asset Feature
├── Market Feature
├── Report Feature
├── Watchlist Feature
└── Search Feature

Client Data Layer
├── Hooks
├── Query Clients
├── View Models
└── Formatters

Infra Layer
├── API Client
├── Auth Client
├── Error Boundary
└── Theme / Config
```

---

## 3.4 组件组织建议

```text
src/components/
├── layout/
│   ├── app-navbar.tsx
│   ├── app-sidebar.tsx
│   └── app-shell.tsx
├── ui/
│   ├── button.tsx
│   ├── card.tsx
│   ├── tabs.tsx
│   ├── badge.tsx
│   └── skeleton.tsx
├── cards/
│   ├── market-overview-card.tsx
│   ├── metric-card.tsx
│   ├── risk-card.tsx
│   └── news-card.tsx
├── charts/
│   ├── price-chart.tsx
│   ├── kline-chart.tsx
│   ├── comparison-chart.tsx
│   └── macro-series-chart.tsx
├── research/
│   ├── asset-header.tsx
│   ├── ai-analysis-panel.tsx
│   ├── analysis-section.tsx
│   ├── risk-tag-list.tsx
│   ├── news-timeline.tsx
│   └── report-viewer.tsx
└── search/
    ├── global-search-bar.tsx
    └── search-result-list.tsx
```

---

## 3.5 前端数据获取策略

推荐如下策略：

### 1）静态内容
适合首页说明、产品介绍、合规文案。  
可使用 Server Components 直接输出。

### 2）弱实时数据
适合市场总览、热门资产、报告列表。  
可使用 SSR / ISR / 缓存请求。

### 3）强交互数据
适合搜索、研究页继续追问、自选变更。  
建议使用客户端请求 + React Query / SWR。

---

## 3.6 页面状态管理

建议划分为三类状态：

### 本地状态
- Tabs
- 弹窗
- 筛选器
- 图表区间切换

### 服务端状态
- 资产详情
- 报告详情
- 市场概览
- 自选列表
- 搜索结果

建议使用：
- `TanStack Query` 或 `SWR`

### 跨页面全局状态
- 用户信息
- 主题模式
- 语言设置
- 当前市场偏好

建议使用：
- `Zustand` 或轻量 Context

---

## 3.7 前端渲染原则

所有 AI 输出必须经过后端结构化处理，前端只负责渲染以下类型：

- 标题与段落
- 指标卡片
- 图表
- 风险列表
- 时间线
- 标签
- 对比表格

前端不要直接渲染未经处理的大段模型原始文本。

---

# 4. 后端与 Agent 架构

建议采用 **Next.js API Routes / Route Handlers + 独立服务层 + Agent Orchestrator** 的模式。

---

## 4.1 后端职责

后端主要负责：

- 用户认证与会话识别
- 搜索与资产解析
- 调用 MCP 工具
- 编排研究工作流
- AI 报告生成
- 报告持久化
- 自选与会话管理
- 权限控制
- 审计与日志

---

## 4.2 后端模块划分

```text
src/lib/
├── api/
│   ├── client.ts
│   └── errors.ts
├── auth/
│   ├── session.ts
│   ├── permissions.ts
│   └── guards.ts
├── db/
│   ├── client.ts
│   ├── queries/
│   ├── mutations/
│   └── migrations/
├── mcp/
│   ├── client.ts
│   ├── registry.ts
│   ├── adapters/
│   └── schemas/
├── agent/
│   ├── intent-router.ts
│   ├── planner.ts
│   ├── orchestrator.ts
│   ├── analyzers/
│   ├── synthesizer.ts
│   └── report-parser.ts
├── services/
│   ├── market.service.ts
│   ├── asset.service.ts
│   ├── report.service.ts
│   ├── search.service.ts
│   ├── watchlist.service.ts
│   └── chat.service.ts
└── cache/
    ├── redis.ts
    └── keys.ts
```

---

## 4.3 API 层职责边界

### Route Handler 负责
- 参数校验
- 调用 Service
- 鉴权
- 格式化响应
- 错误处理

### Service 负责
- 业务逻辑
- 调用数据库
- 调用 Agent / MCP
- 业务规则判断

### Agent 负责
- 研究流程编排
- 任务分解
- 多源数据融合
- 报告结构生成

---

# 5. Agent 工作流

Agent 层建议采用“路由 + 规划 + 执行 + 合成”的架构。

---

## 5.1 核心 Agent 组件

```text
Intent Router
├── 识别资产类型
├── 识别研究深度
└── 识别用户问题类型

Research Planner
├── 决定调用哪些工具
├── 决定分析顺序
└── 决定是否需要缓存/历史数据

Tool Executor
├── 调用市场数据工具
├── 调用财务数据工具
├── 调用新闻工具
├── 调用宏观工具
└── 调用链上工具

Analysis Engine
├── 基本面分析
├── 技术面分析
├── 宏观分析
├── 情绪分析
└── 风险识别

Report Synthesizer
├── 结构化输出
├── Markdown 生成
├── JSON Schema 生成
└── 结论标签归一化
```

---

## 5.2 标准研究工作流

```text
用户输入 symbol 或研究问题
   ↓
Intent Router：
- 识别 symbol
- 判断是股票/ETF/基金/期货/Crypto/宏观问题
- 判断是“快照分析”还是“深度研究”
   ↓
Research Planner：
- 规划所需数据源
- 规划所需 MCP Tools
- 规划分析模块
   ↓
Tool Executor：
- 拉取价格与成交量
- 拉取财报与估值
- 拉取相关新闻
- 拉取宏观变量
- 拉取链上数据（若为 Crypto）
   ↓
Analysis Engine：
- 对数据进行解释与交叉验证
- 输出事实、分析、风险
   ↓
Report Synthesizer：
- 生成 Markdown 报告
- 生成结构化 JSON
- 给出 stance（中性/谨慎/偏乐观/偏空/高波动观察）
   ↓
写入 PostgreSQL
   ↓
返回前端展示
```

---

## 5.3 追问工作流

```text
用户在资产研究页继续提问
   ↓
读取 chat_session + asset_context + latest_report
   ↓
Planner 只补充必要数据
   ↓
AI 基于历史上下文继续分析
   ↓
生成 follow-up answer
   ↓
写入 chat_messages
   ↓
前端增量展示
```

---

## 5.4 Agent 输出双格式

每次分析建议输出两份结果：

### 1）Markdown
用于展示完整研究报告、导出和分享。

### 2）Structured JSON
用于前端模块渲染。

建议格式：

```ts
type ResearchOutput = {
  asset: {
    symbol: string
    name: string
    market: string
    assetType: string
  }
  snapshot: {
    price?: number
    changePct?: number
    volume?: number
    marketCap?: number
    pe?: number
    pb?: number
    rsi?: number
    macd?: string
    volatility?: number
  }
  sections: {
    marketOverview: string
    coreData: string
    fundamental: string
    technical: string
    macro: string
    sentiment: string
    risks: string[]
    conclusion: string
  }
  stance: '中性' | '谨慎' | '偏乐观' | '偏空' | '高波动观察'
  disclaimer: string
}
```

---

# 6. MCP 接入方式

MCP 层必须设计成 **可插拔、可替换、可回退** 的工具系统。

---

## 6.1 MCP 的职责

MCP 层只负责：

- 工具注册
- 工具发现
- 请求封装
- 参数校验
- 超时控制
- 重试与降级
- 结果标准化

MCP 层不负责页面逻辑。

---

## 6.2 MCP 接入架构

```text
Agent Orchestrator
   ↓
Tool Registry
   ↓
MCP Client
   ↓
Tool Adapters
   ├── Market Adapter
   ├── Financial Adapter
   ├── News Adapter
   ├── Macro Adapter
   └── Crypto Adapter
   ↓
External Data Providers / MCP Servers
```

---

## 6.3 工具注册表设计

建议维护统一注册表：

```ts
type ToolCategory =
  | 'market'
  | 'financial'
  | 'news'
  | 'macro'
  | 'technical'
  | 'crypto'

type MCPToolDefinition = {
  name: string
  category: ToolCategory
  description: string
  inputSchema: unknown
  outputSchema: unknown
  timeoutMs: number
  retryCount: number
  cacheTtlSec?: number
  enabled: boolean
}
```

---

## 6.4 MCP Client 设计建议

```ts
interface MCPClient {
  callTool<TInput, TOutput>(toolName: string, input: TInput): Promise<TOutput>
}
```

建议实现以下能力：

- 自动超时
- 指定重试次数
- 分类日志
- 错误码标准化
- 请求链路追踪 ID
- 缓存命中优先
- 限流保护

---

## 6.5 MCP 调用流程

```text
Planner 产出 tool plan
   ↓
Orchestrator 逐个/并行执行工具
   ↓
对每个工具返回结果进行 schema 校验
   ↓
工具结果统一映射为内部 DTO
   ↓
DTO 进入 Analysis Engine
```

---

## 6.6 工具调用策略

### 可并行的数据
- 价格
- 新闻
- 宏观变量
- ETF 资金流
- 链上指标

### 需串行的数据
- 先识别资产类型，再决定调用哪些分类工具
- 先拿到财报期，再决定调用季度财务对比

---

## 6.7 失败降级策略

如果某个 MCP 工具失败，应按以下顺序降级：

1. 使用缓存快照
2. 尝试备用工具
3. 返回部分结果
4. 明确标记数据缺失区块
5. 仍然允许报告生成，但说明覆盖范围受限

---

## 6.8 MCP 输出标准化

所有工具返回结果必须映射到内部统一结构，例如：

```ts
type PriceSnapshotDTO = {
  symbol: string
  market: string
  price: number | null
  changePct: number | null
  volume: number | null
  timestamp: string
  source: string
}
```

这样可以保证：
- 更换数据源时前端无感
- Agent 分析逻辑不依赖某个特定供应商格式

---

# 7. PostgreSQL 数据流设计

本项目数据库以 **PostgreSQL** 为核心。  
如果未来使用 Supabase、Neon、RDS，本质上仍按 PostgreSQL 思维设计。

---

## 7.1 数据层职责

PostgreSQL 负责：

- 用户与组织数据
- 资产基础信息
- 自选列表
- 报告存储
- 会话历史
- 市场快照缓存
- 新闻缓存
- 宏观序列缓存
- 任务状态与审计日志

---

## 7.2 核心表设计

推荐至少包含以下表：

```text
users
organizations
memberships

assets
asset_aliases

watchlists
watchlist_items

research_reports
report_sections

chat_sessions
chat_messages

market_snapshots
financial_snapshots
news_items
macro_series
crypto_snapshots

research_jobs
job_logs

api_audit_logs
```

---

## 7.3 关键表说明

### users
保存用户基础资料。

### organizations
为未来企业版、多团队共享预留。

### memberships
用户与组织关系、角色映射。

### assets
统一资产主表，支持股票、ETF、基金、指数、期货、Crypto。

### asset_aliases
支持代码别名、不同市场映射。

### watchlists / watchlist_items
用户自选观察列表。

### research_reports
保存完整研究报告主记录。

### report_sections
按 section 保存研究区块，便于局部更新与结构化渲染。

### chat_sessions / chat_messages
支持继续追问与上下文追踪。

### market_snapshots / financial_snapshots / news_items / macro_series / crypto_snapshots
作为外部数据的本地缓存层。

### research_jobs
记录研究任务状态，支持异步任务与失败重试。

### api_audit_logs
记录敏感调用与审计信息。

---

## 7.4 数据流：资产研究页

```text
用户访问 /asset/[symbol]
   ↓
后端先查 assets
   ↓
若不存在：
  - 执行资产识别
  - 写入 assets / asset_aliases
   ↓
读取 market_snapshots / financial_snapshots / news_items 缓存
   ↓
缓存命中：
  - 直接组合数据返回
缓存未命中：
  - 调 MCP 获取
  - 写入快照表
  - 返回前端
   ↓
若用户发起 AI 分析：
  - 创建 research_jobs
  - 执行 Agent 工作流
  - 写入 research_reports / report_sections
  - 返回结构化结果
```

---

## 7.5 数据流：报告生成

```text
用户点击“生成研究报告”
   ↓
创建 research_jobs(status='pending')
   ↓
Planner 生成 tool plan
   ↓
MCP 拉取数据
   ↓
AI 生成结构化报告
   ↓
写入 research_reports
写入 report_sections
更新 research_jobs(status='completed')
   ↓
前端显示报告详情
```

---

## 7.6 数据流：继续追问

```text
用户在资产页追问
   ↓
创建/读取 chat_sessions
   ↓
写入 chat_messages(role='user')
   ↓
读取最近 report_sections + snapshots
   ↓
Agent 继续分析
   ↓
写入 chat_messages(role='assistant')
   ↓
返回前端对话视图
```

---

## 7.7 数据流：市场总览

```text
定时任务或首次请求
   ↓
拉取全球指数 / ETF 资金 / 宏观变量 / 大宗商品
   ↓
写入 market_snapshots / macro_series / news_items
   ↓
页面请求时优先读取数据库缓存
   ↓
减少实时外部请求压力
```

---

## 7.8 索引建议

至少为以下字段建立索引：

- `assets(symbol, market)`
- `asset_aliases(alias_symbol)`
- `market_snapshots(asset_id, snapshot_time desc)`
- `financial_snapshots(asset_id, fiscal_period desc)`
- `news_items(asset_id, published_at desc)`
- `research_reports(user_id, created_at desc)`
- `research_reports(asset_id, created_at desc)`
- `chat_messages(session_id, created_at asc)`
- `research_jobs(status, created_at desc)`

---

## 7.9 PostgreSQL 读写原则

### 写路径
- 外部数据先写缓存表
- AI 报告写主报告表 + 区块表
- 所有追问写会话表
- 所有敏感操作写审计表

### 读路径
- 页面先读缓存表与报告表
- 缺失时再触发外部拉取
- 避免每次页面渲染都直接访问第三方接口

---

## 7.10 推荐的数据一致性策略

- 快照类数据采用“最终一致性”
- 用户操作类数据采用“强一致性”
- 报告生成类采用“任务状态驱动”
- 聊天记录按 append-only 模式写入，避免覆盖

---

# 8. 权限设计

权限设计必须支持：

- 游客访问公开页面
- 登录用户保存报告与自选
- 管理员管理系统配置
- Worker / 服务账号执行后台任务

---

## 8.1 角色定义

推荐角色：

```text
anonymous   # 未登录用户
user        # 普通登录用户
admin       # 系统管理员
worker       # 后台任务执行角色
```

如未来支持团队版，可增加：

```text
org_owner
org_admin
org_member
analyst
viewer
```

---

## 8.2 权限矩阵

| 资源 | anonymous | user | admin | worker |
|------|-----------|------|-------|--------|
| 查看首页/市场页 | ✅ | ✅ | ✅ | ✅ |
| 搜索资产 | ✅ | ✅ | ✅ | ✅ |
| 查看公共资产研究页 | ✅ | ✅ | ✅ | ✅ |
| 生成临时研究结果 | ✅（限流） | ✅ | ✅ | ✅ |
| 保存报告 | ❌ | ✅ | ✅ | ❌ |
| 查看自己的报告 | ❌ | ✅ | ✅ | ❌ |
| 查看他人私有报告 | ❌ | ❌ | ✅ | ❌ |
| 管理用户数据 | ❌ | ❌ | ✅ | ❌ |
| 执行后台抓取任务 | ❌ | ❌ | ❌ | ✅ |
| 写入缓存快照 | ❌ | ❌ | ❌ | ✅ |
| 访问系统级日志 | ❌ | ❌ | ✅ | ✅ |

---

## 8.3 资源归属规则

### 用户私有资源
- watchlists
- watchlist_items
- chat_sessions
- chat_messages
- private research_reports

这些资源只能由所属用户访问。

### 系统共享资源
- assets
- market_snapshots
- macro_series
- public news_items

这些资源可由所有用户读取，但写权限只给系统服务或 worker。

---

## 8.4 应用层权限建议

在应用层统一做鉴权：

- API Route 进入时解析 session / JWT
- 通过 `permissions.ts` 判断是否允许
- Service 层再次做资源归属校验
- 不允许仅在前端做权限控制

---

## 8.5 数据库层权限建议

如果使用纯 PostgreSQL + 自建后端：

- 前端不直连数据库
- 所有数据库访问只通过后端服务账号完成
- 权限在应用层控制

如果未来使用带 RLS 的托管方案，可追加：

- 对 watchlists / reports / chats 开启行级权限
- 用 `user_id = auth.uid()` 风格约束访问范围

---

## 8.6 审计设计

以下操作必须记审计日志：

- 生成报告
- 删除报告
- 修改系统配置
- 管理员查看用户私有资源
- Worker 批量刷新市场快照
- MCP 工具调用失败与重试

---

# 9. 缓存、异步任务与可观测性

---

## 9.1 缓存设计

推荐引入 Redis 作为二级缓存：

### 缓存对象
- 搜索结果
- 市场快照
- 热门资产
- 宏观数据
- 工具调用结果
- 报告摘要

### 缓存策略
- 高频市场快照：TTL 1~10 分钟
- 新闻：TTL 10~30 分钟
- 宏观数据：TTL 1~24 小时
- 资产基础信息：TTL 7 天或更长

---

## 9.2 异步任务设计

以下任务建议异步执行：

- 深度研究报告生成
- 市场日报刷新
- 宏观数据拉取
- 新闻归档
- 链上指标刷新
- 大批量回填历史数据

推荐维护 `research_jobs` 表：

```text
pending
running
completed
failed
retrying
cancelled
```

---

## 9.3 可观测性建议

至少记录：

- 请求 ID
- 用户 ID
- 资产代码
- MCP 工具名
- 调用耗时
- 缓存命中率
- 任务状态变更
- 报告生成耗时
- 错误堆栈

推荐接入：

- 应用日志
- 错误监控
- 性能监控
- 数据库慢查询监控

---

# 10. 部署方案

推荐采用 **Web 与 Worker 分离部署**。

---

## 10.1 推荐部署拓扑

```text
CDN / Edge
   ↓
Next.js Web App
   ├── 页面渲染
   ├── API Routes
   └── Auth / Session
   ↓
Application Services
   ├── Agent Orchestrator
   ├── MCP Client
   └── Report Service
   ↓
Worker / Scheduler
   ├── 深度报告任务
   ├── 市场快照刷新
   ├── 新闻抓取
   └── 宏观数据同步
   ↓
PostgreSQL / Redis / Object Storage
```

---

## 10.2 环境拆分

至少分为三套环境：

### development
- 本地开发
- Mock 数据优先
- 可关闭部分外部工具

### staging
- 联调环境
- 使用测试数据库
- 验证 Agent 与 MCP 接入

### production
- 正式环境
- 开启监控、备份、审计与限流

---

## 10.3 推荐部署组合

### 方案 A：轻量 MVP
- Web：Vercel
- PostgreSQL：Neon / Supabase Postgres / RDS
- Redis：Upstash
- Worker：Railway / Render / Fly.io
- 对象存储：S3 / Supabase Storage（可选）

### 方案 B：企业增强版
- Web：Docker + Kubernetes
- API / Worker：Kubernetes
- PostgreSQL：托管 RDS / 自建高可用集群
- Redis：托管 Redis
- 监控：Prometheus + Grafana + Loki
- 日志与告警：集中式

---

## 10.4 CI/CD 建议

### 流程
1. Pull Request
2. Lint / Type Check
3. Unit Tests
4. Build
5. Preview Deploy
6. Merge to main
7. Production Deploy

### 必做检查
- TypeScript 类型检查
- ESLint
- 数据库迁移校验
- 环境变量完整性校验

---

## 10.5 备份与恢复

PostgreSQL 必须具备：

- 自动快照备份
- Point-in-time recovery（如支持）
- 迁移脚本版本管理
- 关键报告数据定期导出

---

# 11. 环境变量建议

```text
# App
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_APP_URL=
NODE_ENV=

# Auth
AUTH_SECRET=
AUTH_URL=

# Database
DATABASE_URL=
DATABASE_POOL_URL=

# Redis
REDIS_URL=
REDIS_TOKEN=

# AI / MCP
HUNYUAN_API_KEY=
MCP_BASE_URL=
MCP_API_KEY=

# Market Data
YAHOO_FINANCE_KEY=
FINNHUB_API_KEY=
ALPHA_VANTAGE_API_KEY=
FRED_API_KEY=
COINGECKO_API_KEY=
BINANCE_API_KEY=
GLASSNODE_API_KEY=

# Storage
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

# Monitoring
SENTRY_DSN=
LOG_LEVEL=
```

---

# 12. 自动编码实现优先级

自动编码工具应严格按以下顺序实现。

---

## Phase 1：基础骨架

实现：

- Next.js 项目初始化
- App Router 路由
- 全局布局与导航
- 首页
- 市场总览页
- 搜索页
- 资产研究页骨架
- 报告中心页骨架
- 自选页骨架

---

## Phase 2：数据层与服务层

实现：

- PostgreSQL 连接
- 资产表、自选表、报告表、会话表
- 数据访问层
- 搜索服务
- 资产详情服务
- 报告服务
- 自选服务

---

## Phase 3：Agent 与 MCP 接入

实现：

- Intent Router
- Research Planner
- MCP Client
- Tool Registry
- 市场/财务/新闻/宏观/链上工具适配器
- 报告生成工作流

---

## Phase 4：研究页完整化

实现：

- 价格图表
- 指标卡片
- 新闻时间线
- AI 结构化分析
- 风险因素模块
- 继续追问能力

---

## Phase 5：异步与部署增强

实现：

- research_jobs
- Worker 执行器
- 缓存层
- 审计日志
- CI/CD
- 监控与告警

---

# 13. 非目标与架构边界

以下内容不属于本项目当前架构目标：

- 自动交易执行
- 接券商下单
- 高频交易界面
- 收益承诺型推荐系统
- 强诱导型买卖信号灯
- 未经验证的“必涨模型”
- 面向散户营销式喊单页面

本项目始终定位为：

# AI 金融研究助手

而不是：

# AI 炒股神器

---

# 合规声明

本系统仅用于：

- 金融数据整理
- 结构化研究
- 市场观察
- 风险提示
- 信息辅助决策

不构成：

- 投资建议
- 收益承诺
- 证券推荐
- 个股喊单
- 自动交易建议

# 以上内容仅供研究参考，不构成投资建议。