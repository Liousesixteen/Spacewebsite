# SpaceData — AI Agent 驱动的全栈航天数据平台

> AI Agent 实习项目 | 2026年5月 | 12天 | 1人 + Claude Code Agent 协作

## 一句话总结

使用 **Claude Code Agent SDK** 作为核心开发工具，通过 **Subagent-Driven Development** 方法论，在 12 天内独立完成了一个覆盖 21,000+ 条真实航天数据、55 个页面、38 个 API 路由的全栈 Web 应用。整个开发过程由 30+ 次子代理派发驱动，采用 **Brainstorming → Spec → Plan → Subagent Dispatch → Two-Stage Review** 的结构化 Agent 工作流。

**在线预览：** http://localhost:3000（开发环境）
**源码仓库：** https://github.com/Liousesixteen/Spacewebsite

---

## 为什么这个项目适合投递 AI Agent 岗位

> 这个项目的独特之处不在于"写了多少代码"，而在于**如何组织 AI Agent 完成一个超出单人 12 天产能上限的复杂工程**。
>
> 如果纯手写，233 个文件 + 24,591 行代码至少需要 40-60 天。通过 Agent 工具链，实际花费 12 天，**效率提升 3-5x**。关键能力包括：
>
> - **任务分解** — 将一个模糊的"航天网站"需求分解为 9 个 Phase、40+ 个 Task
> - **Prompt 工程** — 为每个子代理编写精确上下文（场景 + 约束 + 验收标准 + 错误处理策略）
> - **Agent 编排** — 独立任务并行派发、依赖任务串行执行、Agent 状态监控与异常处理
> - **质量门控** — 两阶段审查流水线（Spec 合规审查 → 代码质量审查），Agent 输出回炉修正
> - **工具集成** — 在 Agent 工作流中集成外部设计数据库（UI Pro Max）作为决策辅助

---

## 开发方法论：Subagent-Driven Development

### 核心工作流

```
用户需求 (模糊)
    │
    ▼
┌──────────────────────────────────────────────────────┐
│ Brainstorming Skill ←── 与用户对话，澄清需求          │
│  ├─ 探索项目上下文                                    │
│  ├─ 逐轮提问，收敛需求边界                             │
│  ├─ 提出 2-3 种技术方案 + 推荐                         │
│  └─ 输出：16 页设计规范文档                            │
└──────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────┐
│ Writing-Plans Skill ←── 将 Spec 转化为可执行计划       │
│  ├─ 文件级分解（每个 Task 指定具体文件路径）            │
│  ├─ Bite-sized 粒度（每步 2-5 分钟）                   │
│  ├─ 完整代码示例（无占位符）                           │
│  └─ 输出：9 个 Phase Plan (Phase 1-9)                  │
└──────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────┐
│ Subagent-Driven Development ←── 执行引擎              │
│                                                      │
│  对每个 Task：                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 1. 派发 Implementer Subagent                  │    │
│  │    ├─ 提供：完整 Task 规格 + 架构上下文        │    │
│  │    ├─ 子代理提问 → 我回答 → 子代理执行          │    │
│  │    └─ 子代理自审后报告状态                      │    │
│  │                                               │    │
│  │ 2. Spec Compliance Review ←── 独立审查子代理    │    │
│  │    ├─ 检查：遗漏/多余/不符合规格                │    │
│  │    ├─ 发现问题 → 子代理修复 → 重新审查          │    │
│  │    └─ 通过后进入下一步                          │    │
│  │                                               │    │
│  │ 3. Code Quality Review ←── 独立审查子代理       │    │
│  │    ├─ 检查：命名/结构/重复/YAGNI                │    │
│  │    ├─ 发现问题 → 子代理修复 → 重新审查          │    │
│  │    └─ 通过后标记 Task 完成                      │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  并行优化：独立 Task 同时派发多个子代理                │
└──────────────────────────────────────────────────────┘
```

### Agent 派发统计

| 指标 | 数值 |
|------|------|
| 总子代理派发次数 | 30+ 次 |
| 并行派发（同一轮多个 Agent） | 8 次 |
| 子代理升级次数（BLOCKED/NEEDS_CONTEXT） | 6 次 |
| 审查回炉修正次数 | 4 次 |
| 平均每个子代理产出 | 5-8 个文件 / 1 次 commit |
| 最大子代理产出 | 120 次 tool use（Phase 7 用户系统） |

### 子代理状态处理策略

根据子代理返回的状态码，我制定了对应的处理策略：

| 状态 | 含义 | 我的处理 |
|------|------|---------|
| `DONE` | 任务完成 | 进入 Spec 审查 |
| `DONE_WITH_CONCERNS` | 完成但有疑虑 | 先读疑虑内容 → 判断是否影响正确性 → 决定是否进入审查 |
| `NEEDS_CONTEXT` | 缺少信息 | 补充上下文 → 重新派发 |
| `BLOCKED` | 无法完成 | 诊断原因 → 换模型/拆任务/修改 Plan |

**实际案例**：Phase 4 Task 1 的子代理报告 `DONE_WITH_CONCERNS`——Prisma 7 与项目配置不兼容导致构建失败。我分析日志后发现是 Prisma 版本问题，派发独立修复子代理降级至 Prisma 6，3 分钟内解决。

### 并行派发策略

独立任务在同一轮中并行派发多个子代理，显著缩短总耗时：

```
Phase 4-6 并行:
  ┌─ Agent A: 发射数据 API ──────────┐
  ├─ Agent B: 产业链 API ─────────────┤── 同时执行
  └─ Agent C: 宇航员 API ─────────────┘

Phase 8-9 并行:
  ┌─ Agent A: 3D 可视化 ─────────────┐
  ├─ Agent B: 首页重构 ───────────────┤── 同时执行
  └─ Agent C: 主题切换 + UX 优化 ─────┘
```

### 审查流水线的价值

两阶段审查捕获了多类问题：

- **Spec 审查发现**：遗漏功能（如发射日历缺少月切换）、多余实现（Agent 自行添加了未要求的 `--json` 标志）
- **代码审查发现**：硬编码魔法数字、变量命名不一致、冗余的 `as any` 类型断言
- **回炉修正**：4 次审查不通过 → Agent 修复 → 重新审查通过

---

## Prompt 工程实践

### 场景化 Context 注入

每个子代理 Prompt 包含 4 层信息：

```
┌─────────────────────────────────────────────┐
│ 1. Task Description (WHAT)                  │
│    具体文件路径、完整代码示例、验收标准        │
├─────────────────────────────────────────────┤
│ 2. Scene-Setting Context (WHERE)            │
│    项目当前状态、已完成的前置 Task、          │
│    依赖关系、文件结构约定                     │
├─────────────────────────────────────────────┤
│ 3. Guardrails (HOW NOT)                     │
│    不要连接数据库、不要修改已有类型、          │
│    遵循现有代码模式、禁止操作列表              │
├─────────────────────────────────────────────┤
│ 4. Escalation Path (WHEN STUCK)             │
│    何时报告 BLOCKED、何时请求更多上下文、     │
│    如何描述遇到的问题                         │
└─────────────────────────────────────────────┘
```

### 实际 Prompt 示例（Phase 2 Task 1：核心数据 Schema）

```
Context 层：
- "数据库未连接，不需要运行迁移"
- "Prisma Client 可用在 @/lib/db"
- "Launch 模型关联 Rocket/LaunchSite/LaunchCrew"

Guardrails 层：
- "不要运行 prisma migrate 或 prisma db push"
- "用 prisma-client-js（非 prisma-client）"
- "遵循计划文件中的精确字段定义"

Escalation 层：
- "如果 Prisma 版本不兼容，报告 BLOCKED 并提供错误日志"
```

### 大任务的子代理分解策略

对于 Phase 7（用户系统），这是一个超大型 Phase，涉及 120 次 tool use。分解策略：
- 按功能域拆分：Task 1(认证配置) → Task 2(登录注册页) → Task 3(收藏) → Task 4(评论) → Task 5(个人中心)
- 每个 Task 独立审查，而非等全部完成再审查
- 跨 Task 共享类型定义通过读取已有文件获取

---

## 技术架构

### 技术栈选型

| 类别 | 技术 | 选型理由 |
|------|------|---------|
| **框架** | Next.js 14 (App Router) | SSR/SSG 提升 SEO；API Routes 统一前后端 |
| **语言** | TypeScript 5.7 | 全栈类型安全 |
| **样式** | Tailwind CSS 3.4 + HUD/Sci-Fi 设计系统 | 原子化 CSS，CSS 变量实现暗/亮主题 |
| **数据库** | PostgreSQL (Neon Serverless) | 关系型数据、免费云托管、无本地依赖 |
| **ORM** | Prisma 6.19 | 类型安全 ORM、Auto-generated Client |
| **认证** | NextAuth.js v5 (Auth.js) | JWT + OAuth（GitHub/Google）+ 邮箱密码 |
| **国际化** | next-intl 4.x | 基于路由的多语言（4种语言） |
| **状态管理** | Zustand + TanStack React Query | 轻量客户端状态 + 服务端数据缓存 |
| **图表** | ECharts 6.0 | 交互式数据可视化 |
| **3D 渲染** | React Three Fiber 8.x + Drei 9.x | React 声明式 Three.js 封装 |
| **字体** | Orbitron + Exo 2 (Google Fonts) | 航天科技感字体配对 |
| **包管理** | pnpm | 磁盘高效的 Node.js 包管理 |

### 项目规模

| 指标 | 数值 |
|------|------|
| 总提交数 | 72 commits |
| 源代码文件 | 233 files |
| 总代码行数 | 24,591 lines |
| 页面路由 | 55 pages |
| API 路由 | 38 endpoints |
| React 组件 | 76 components |
| Prisma 模型 | 18 models + 12 enums |
| 支持语言 | 4 (zh-CN/en/ru/ja) |
| 数据库记录 | 21,000+ 条真实航天数据 |

---

## 数据集成：多源 Agent 同步管道

整个数据层通过多个专用同步脚本（每个由独立子代理实现）构建：

```
CelesTrak SATCAT ──► sync-satcat.ts ──► 19,000+ 🛰️
SpaceX API v4    ──► sync-spacex-full.ts ──► 205 🚀
Launch Library 2 ──► sync-*.ts ──► 759 👨‍🚀, 283 🚀
手工整理         ──► sync-historical.ts ──► 51 📋

容错: 429 限流 → 优雅降级返回部分数据（不抛异常）
去重: upsert 模式（idempotent，可反复运行）
性能: createMany 批量 500 条/批（vs 逐条 upsert，速度差 30x）
```

**Agent 相关亮点**：同步脚本的「429 限流优雅降级」是由一个修复子代理实现的——原始实现遇到 429 直接崩溃，修复后返回已拉取的部分数据并记录 warning。这是审查流水线发现并修正的问题。

---

## 设计系统演进：Agent 辅助设计决策

### 三版迭代

1. **V1 — 通用暗色系**：系统默认字体 + 基础 Tailwind 暗色类
2. **V2 — 毛玻璃风格**：backdrop-blur 玻璃态卡片 + 渐变特效（用户反馈"模糊不清"）
3. **V3 — HUD/Sci-Fi FUI**：使用 `ui-ux-pro-max-skill` 设计数据库辅助搜索决策

### Agent + 设计数据库协作

设计决策流程使用了集成的 UI Pro Max 设计智能工具：

```bash
# 搜索适合 "space aerospace data" 的 UI 风格
python3 search.py "space data aerospace dark futuristic" --domain style

# 结果: HUD / Sci-Fi FUI
#   - Neon Cyan #00FFFF, Holographic Blue #0080FF
#   - 1px fine lines, glow effects, monospaced fonts
#
# 搜索配色方案
python3 search.py "space cosmic celestial" --domain color

# 结果: Space Tech/Aerospace palette
#   - bg: #0B0B10, card: #1E1E23, accent: #3B82F6
#
# 搜索字体配对
python3 search.py "futuristic tech sci-fi data" --domain typography

# 结果: Orbitron (headings) + Exo 2 (body)
```

基于设计数据库的推荐，我做出架构决策并派发重构子代理：
- 配色改为 `#0B0B10` 深空黑 + `#3B82F6` Launch Blue
- 引入 Orbitron (几何科技) + Exo 2 (现代无衬线) Google Fonts
- 卡片从毛玻璃改为 `hud-card`（1px 细线 + hover 微发光）
- 首页重组为 Real-Time Operations Dashboard 布局

---

## Agent 协作中的关键问题与解决

### 1. 子代理输出质量问题

**问题**：某个子代理在重构组件时自行添加了 `text-white` → `text-star-white` 的全局替换，导致 65+ 个文件被意外修改。

**检测**：代码审查子代理发现了异常大范围的修改。

**解决**：派发修复子代理回滚非目标文件的修改，并在后续 Prompt 中增加更精确的约束（"不要全局查找替换，只修改指定文件"）。

### 2. 子代理陷入循环

**问题**：某个子代理因 Edit 工具 whitespace 匹配失败反复重试，陷入无效循环。

**检测**：我通过监控子代理的 tool use 计数和用时发现。

**解决**：将策略从 Edit 切换为 Write（完整重写文件），一次性绕过匹配问题。此后在 Prompt 中增加了备用策略指令。

### 3. 跨 Agent 一致性

**问题**：两个并行子代理同时修改了组件样式系统，产生了相互冲突的 Tailwind 类名。

**解决**：按"基础设施 → 组件 → 页面"的顺序串行化 Agent 派发，确保全局样式（globals.css、tailwind.config）先完成再做组件级修改。

### 4. 数据库连接缺失环境下的 Agent 工作

**问题**：项目没有本地数据库，多个涉及数据库操作的 Agent 需要规避此限制。

**解决**：在所有 Agent Prompt 中明确标注"数据库未连接，仅验证 TypeScript 编译，不验证运行时连接"，并指示 Prisma 命令的安全子集（`validate`、`generate` 可运行，`migrate`、`db push` 不可运行）。

---

## 总结：这个项目展示了什么

### AI Agent 工程能力

> - **Agent 工作流设计** — 设计并执行了 Brainstorming → Plan → Dispatch → Review 的完整 Agent 协作流水线
> - **Prompt 工程** — 30+ 次子代理派发，每次 Prompt 精心构建 4 层 Context（任务规格 + 场景上下文 + 约束边界 + 升级路径）
> - **Agent 编排** — 识别依赖关系（基础设施 → 组件 → 页面），独立任务并行派发，依赖任务串行
> - **质量门控** — 两阶段审查机制（Spec 合规 + 代码质量），捕获并修正了 10+ 个 Agent 输出问题
> - **异常处理** — 分类处理 4 种子代理状态码（DONE/CONCERNS/NEEDS_CONTEXT/BLOCKED），制定对应策略
> - **工具集成** — 将外部设计数据库（UI Pro Max）作为 Agent 决策辅助工具纳入工作流

### 工程能力

> - **全栈架构** — Next.js 14 + TypeScript + Prisma + PostgreSQL + RESTful API
> - **数据工程** — 4 个外部 API 的 ETL 同步管道，批量导入优化，错误降级
> - **前端工程** — 76 个模块化组件、响应式设计、骨架屏、骨架动画
> - **国际化** — 4 语言 i18n、CSS 变量暗/亮主题、SEO（动态 sitemap + OG 元数据）
> - **产品意识** — 从用户反馈出发完成了 3 版设计迭代

### 一句话

> 这个项目验证了「单人 + AI Agent 协作」模式可以在实质缩短的开发周期内，产出工程质量和功能完整度均达到生产级水准的全栈应用。
