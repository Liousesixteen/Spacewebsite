# SpaceData

SpaceData 是一个面向全球航天信息的多语言数据平台，核心聚焦两件事：

- 让用户快速了解全球近期、历史和进行中的航天发射任务。
- 以国家、机构、企业、技术、材料和设备为线索，展示航天产业链的上游、中游和下游。

项目当前支持简体中文、英语、日语和俄语，并提供发射计划查询、任务详情、火箭与航天器档案、国家与机构浏览、产业链浏览、收藏、评论、通知中心以及数据健康监控。

## 核心功能

### 发射计划

- upcoming 与 previous 发射任务同步。
- 按国家、状态、时间窗口、任务类型等条件筛选。
- 列表、卡片、日历和统计视图。
- 发射倒计时、任务详情、火箭、发射场、机构、载荷和相关任务关联。
- 发射时间变化、状态变更、直播、来源链接、RSS、ICS 日历和 CSV 导出。

### 航天档案

“航天档案”是统一的实体资料目录，包含：

- 火箭与运载器
- 航天器
- 宇航员

国家、机构和实体详情页之间可以互相跳转，发射任务详情也会关联到对应档案。

### 航天产业链

- 上游：材料、电子元件、机械部件和软件。
- 中游：火箭、航天器制造、地面设备和发射服务。
- 下游：卫星通信、导航定位、遥感和科学探测。
- 企业、技术、材料和设备目录。
- 国家/地区筛选、产业覆盖统计、公司详情和数据质量信息。

### 用户与运营

- 登录、注册、个人资料和收藏。
- 发射任务关注与通知中心。
- 评论和评论管理。
- 管理后台：发射任务、机构、公司、火箭、航天器、宇航员、技术和用户管理。
- 数据源健康、服务状态、同步记录和失败告警。

## 产品取舍

产品主线是“发射情报 + 全球航天实体 + 产业链数据”。因此项目已移除与主线关系较弱的内容：

- 深空探索和太阳系/卫星轨道 3D 演示。
- NASA 每日天文图首页内容。
- 独立的航天史时间线。
- 独立对比工具入口。

对比能力未来更适合嵌入火箭和航天器详情页，而不是作为独立一级产品。

## 技术栈

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- next-intl
- Prisma 6
- PostgreSQL / Neon
- NextAuth.js
- TanStack React Query
- ECharts
- pnpm

准备使用本项目参加实习或校招面试时，可阅读 [中文项目面试讲解手册](./docs/INTERVIEW_GUIDE_CN.md)。手册包含项目介绍、完整数据流、核心难点、常见追问、STAR 模板和简历描述，并明确区分已实现能力与待生产化能力。

## 项目结构

```text
app/
  [locale]/             多语言页面、认证页、管理后台
  api/                  页面 API、健康检查和内部同步入口
components/             页面组件、布局组件和业务组件
lib/
  api/                  API 业务逻辑、数据质量和健康判断
  db/                   Prisma 客户端
  i18n/                 多语言配置
messages/               zh-CN、en、ja、ru 翻译文件
prisma/                 数据模型、迁移和种子数据
scripts/sync/           外部数据源同步任务
tests/api/              API 与纯逻辑测试
docs/operations/        数据库、同步和发布运维文档
```

## 环境要求

- Node.js 20 或更高版本
- pnpm 10/11
- 可访问的 PostgreSQL 数据库
- Launch Library 2 API 访问权限（匿名或 API key）

## 本地运行

```bash
pnpm install
cp .env.example .env
pnpm db:validate
pnpm dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。默认语言路径为 `/zh-CN`，也支持 `/en`、`/ja` 和 `/ru`。

## 环境变量

最小本地配置：

```dotenv
DATABASE_URL="postgresql://user:password@localhost:5432/spacewebsite?schema=public"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-random-secret"
AUTH_SECRET="replace-with-a-random-secret"
CRON_SECRET="replace-with-a-random-secret"
LL2_API_BASE="https://ll.thespacedevs.com/2.3.0"
LL2_API_KEY=""
LL2_DELAY_MS="200"
```

可选配置：

- `SYNC_ALERT_WEBHOOK_URL`：同步连续失败达到阈值时接收 JSON 告警。
- `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`：Google 登录。
- `GITHUB_ID`、`GITHUB_SECRET`：GitHub 登录。
- `CELESTRAK_BASE`：CelesTrak 数据源地址。

完整变量说明见 [.env.example](./.env.example)。不要提交 `.env` 或任何真实密钥。

## 数据库

常用命令：

```bash
pnpm db:validate       # 校验 Prisma schema
pnpm db:status         # 查看迁移状态
pnpm db:deploy         # 应用已审核的生产迁移
```

生产环境应用迁移前必须确认目标数据库、完成备份并检查迁移内容。不要用 `prisma db push` 代替生产迁移。当前数据库迁移和上线步骤见 [数据库迁移手册](./docs/operations/database-migrations.md)。

## 数据同步

### CLI 同步

```bash
pnpm sync                 # 按依赖顺序执行全量同步
pnpm sync:launches        # 发射任务
pnpm sync:agencies        # 航天机构和企业
pnpm sync:rockets         # 火箭
pnpm sync:launch-sites    # 发射场
pnpm sync:astronauts      # 宇航员
pnpm sync:spacecraft      # 航天器
pnpm sync:historical      # 历史任务
pnpm sync:satcat          # CelesTrak 卫星目录
pnpm sync:spacex-full     # SpaceX 补充数据
```

所有同步任务使用幂等 upsert，并在 `SyncRun` 中记录开始时间、状态、错误和处理数量。发射同步还会记录关键字段变化事件。

### 定时同步 API

应用提供受 `CRON_SECRET` 保护的单任务入口：

```text
GET /api/internal/sync?job=launches
Authorization: Bearer <CRON_SECRET>
```

可用任务：`launches`、`agencies`、`rockets`、`launch-sites`、`astronauts`、`spacecraft`。

建议频率：发射任务每 6 小时；机构和火箭每日；发射场、宇航员和航天器每周。入口会阻止同一数据域的重复运行。详细配置见 [同步调度手册](./docs/operations/sync-scheduling.md) 和 [同步说明](./scripts/sync/README.md)。

## 验证命令

```bash
pnpm exec tsc --noEmit
pnpm exec prisma validate
pnpm exec tsx --test tests/api/*.test.ts
pnpm build
```

生产构建会生成所有多语言页面和 API 路由。构建阶段如果远程数据库暂时不可达，部分页面会使用已有的降级逻辑；上线前仍应单独验证数据库和同步服务连接。

## 健康检查

- `/api/health`：应用、数据库和关键 schema 表健康状态。
- `/api/data-health`：发射、机构、火箭、发射场、宇航员和航天器的数据量、新鲜度及同步状态。
- `/{locale}/data-sources`：面向运营人员的数据源状态页面。
- `/{locale}/status`：面向用户的服务状态页面。

当同步源连续三次失败且配置了 `SYNC_ALERT_WEBHOOK_URL` 时，系统发送一次失败阈值事件；同步恢复后失败序列会重新计算。

## 部署清单

1. 配置生产 `DATABASE_URL`、认证密钥、`CRON_SECRET` 和上游 API key。
2. 执行并审核 `pnpm db:deploy`。
3. 执行 `pnpm build`，确认构建成功。
4. 配置定时任务调用内部同步 API。
5. 打开 `/api/health` 和 `/api/data-health` 验证服务与数据状态。
6. 执行一次发射任务同步，检查 `SyncRun` 和最新发射记录。
7. 验证登录、收藏、通知中心、导出和多语言页面。

## 许可与数据来源

项目聚合公开航天数据，当前主要来源包括 Launch Library 2、SpaceX API 和 CelesTrak。数据源的授权、速率限制和使用条款应以各上游官方规则为准。发射时间可能因天气、技术状态或管理安排变化，关键任务决策应以发射机构官方信息为准。

## 开发约定

- 页面文案统一放入 `messages/*.json`，不要在页面中新增单语言硬编码。
- 外部数据必须保留来源和最后同步时间。
- 新同步任务应使用公共同步记录器，并提供失败信息。
- 生产 schema 变更必须使用迁移文件并经过备份和验证。
- 变更完成后至少运行类型检查、相关测试和生产构建。
