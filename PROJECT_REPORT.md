# SpaceData — 全球航天数据平台

> 个人全栈项目 | 2026年5月 | 12天独立开发

## 项目概述

SpaceData 是一个面向全球用户的综合性航天数据平台，覆盖**火箭发射、航天器/卫星、宇航员、航天产业链**四大核心领域，集成**实时数据同步、3D 太空可视化、多语言国际化、完整用户系统**等企业级功能。

**在线预览：** http://localhost:3000（开发环境）
**源码仓库：** https://github.com/Liousesixteen/Spacewebsite

### 核心数据规模

| 数据类别 | 实际数量 | 数据来源 |
|----------|---------|---------|
| 航天器/卫星 | 19,000+ | CelesTrak SATCAT（全球历史卫星目录） |
| 发射任务 | 486 | SpaceX API + Launch Library 2 + 手工整理 |
| 宇航员 | 759 | Launch Library 2（全球注册宇航员） |
| 火箭型号 | 283 | SpaceX API + Launch Library 2 + Wikipedia |
| 航天机构/企业 | 375 | Launch Library 2 + 手工补全 |
| 航天技术 | 15 | 手工整理（含技术成熟度、突破记录） |
| 航天材料 | 15 | 手工整理（含性能参数） |
| 航天设备 | 12 | 手工整理（含技术规格） |
| 发射场 | 70 | SpaceX API + Launch Library 2 |

---

## 技术架构

### 技术栈选型

| 类别 | 技术 | 选型理由 |
|------|------|---------|
| **框架** | Next.js 14 (App Router) | SSR/SSG 提升 SEO；API Routes 统一前后端 |
| **语言** | TypeScript 5.7 | 全栈类型安全 |
| **样式** | Tailwind CSS 3.4 + HUD/Sci-Fi 设计系统 | 原子化 CSS，CSS 变量实现暗/亮主题 |
| **数据库** | PostgreSQL (Neon Serverless) | 关系型数据、免费云托管 |
| **ORM** | Prisma 6.19 | 类型安全 ORM、Auto-generated Client |
| **认证** | NextAuth.js v5 (Auth.js) | JWT + OAuth（GitHub/Google）+ 邮箱密码 |
| **国际化** | next-intl 4.x | 基于路由的多语言（4种语言） |
| **状态管理** | Zustand + TanStack React Query | 轻量客户端状态 + 服务端数据缓存 |
| **图表** | ECharts 6.0 | 交互式数据可视化 |
| **3D 渲染** | React Three Fiber 8.x + Drei 9.x | React 声明式 Three.js 封装 |
| **图标** | Lucide React | 统一图标库 |
| **字体** | Orbitron + Exo 2 (Google Fonts) | 航天科技感字体配对 |
| **包管理** | pnpm | 磁盘高效的 Node.js 包管理 |

### 项目结构

```
Spacewebsite/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # 国际化路由 (/zh-CN, /en, /ru, /ja)
│   │   ├── (main)/               # 主站路由组
│   │   │   ├── page.tsx          # 首页（仪表盘布局）
│   │   │   ├── launches/         # 发射数据（列表/详情/日历/统计）
│   │   │   ├── spacecraft/       # 航天器（列表/详情）
│   │   │   ├── astronauts/       # 宇航员（列表/详情）
│   │   │   ├── industry/         # 产业链（全景/企业/技术/材料/设备）
│   │   │   ├── explore/          # 3D 探索（卫星轨道/太阳系）
│   │   │   ├── timeline/         # 航天史交互时间线
│   │   │   └── compare/          # 火箭/卫星对比工具
│   │   ├── (auth)/               # 认证路由组
│   │   │   ├── login/            # 登录页
│   │   │   ├── register/         # 注册页
│   │   │   └── profile/          # 个人中心（收藏/评论/设置）
│   │   └── (admin)/              # 管理后台路由组
│   │       └── admin/            # 数据管理 CRUD（需 ADMIN 角色）
│   ├── api/                      # RESTful API (38 个路由)
│   ├── sitemap.ts                # 动态 Sitemap（含增量条目）
│   └── robots.ts                 # SEO Robots 配置
├── components/
│   ├── ui/                       # 通用 UI 组件库 (16 个)
│   ├── layout/                   # 布局组件 (Navbar/Footer/Starfield)
│   ├── home/                     # 首页专用组件 (10 个)
│   ├── launches/                 # 发射模块组件
│   ├── spacecraft/               # 航天器模块组件
│   ├── astronauts/               # 宇航员模块组件
│   ├── industry/                 # 产业链模块组件
│   ├── compare/                  # 对比工具组件
│   ├── charts/                   # ECharts 图表组件
│   ├── 3d/                       # React Three Fiber 组件
│   ├── auth/                     # 认证表单组件
│   ├── common/                   # 共享组件（收藏/评论）
│   ├── profile/                  # 个人中心组件
│   ├── admin/                    # 管理后台组件
│   └── providers/                # Context Providers (React Query/Auth/Theme)
├── lib/
│   ├── db/                       # Prisma Client 单例 + 导出
│   ├── auth/                     # NextAuth 配置 + 鉴权中间件
│   ├── i18n/                     # 国际化配置 + 请求处理
│   ├── api/                      # 客户端 API 封装 (6 个模块)
│   ├── utils.ts                  # cn() 类名合并工具
│   └── image-fallbacks.ts        # 航天器/火箭图片回退映射
├── prisma/
│   ├── schema.prisma             # 数据库 Schema (18 Models + 12 Enums)
│   ├── seed.ts                   # 种子数据脚本
│   └── seed-industry.ts          # 产业链种子数据脚本
├── scripts/
│   ├── sync/                     # 数据同步脚本集
│   │   ├── index.ts              # 统一入口（pnpm sync）
│   │   ├── sync-satcat.ts        # CelesTrak 全球卫星目录（19,000+ 条）
│   │   ├── sync-spacex-full.ts   # SpaceX 全部历史发射（205 次）
│   │   ├── sync-historical.ts    # 历史重要发射（51 次手工整理）
│   │   ├── sync-launches.ts      # Launch Library 2 发射同步
│   │   ├── sync-rockets.ts       # LL2 火箭同步
│   │   ├── sync-astronauts.ts    # LL2 宇航员同步（759 人）
│   │   ├── sync-spacecraft.ts    # LL2 航天器同步
│   │   ├── sync-launch-sites.ts  # LL2 发射场同步
│   │   └── lib/                  # 同步工具库 (LL2/SpaceX HTTP Clients)
│   ├── make-admin.ts             # 命令行提升管理员
│   ├── db-counts.ts              # 数据库统计工具
│   └── db-stats.ts               # 按国家统计航天器
├── messages/                     # 国际化翻译文件 (4 语言 × JSON)
├── types/                        # TypeScript 类型增强 (next-auth.d.ts)
└── docs/superpowers/
    ├── specs/                    # 设计规范文档
    └── plans/                    # 实施计划文档 (9 个 Phase)
```

---

## 核心功能模块

### 1. 首页仪表盘

采用 **Real-Time Operations Dashboard** 布局模式，自上而下：
- **Hero 区域** — NASA 每日天文图背景 + Orbitron 标题 + CTA 按钮（含发射直播按钮）
- **数据仪表盘** — 4 个 KPI 指标（总发射/在轨航天器/宇航员/企业）+ 发射倒计时
- **快速导航** — 8 个分类入口（Bento Grid 布局）
- **NASA APOD** — 高清天文图每日更新
- **航天时间线/对比工具 CTA** — 引导用户至特色功能
- **最新发射** — 最近 6 次任务卡片

### 2. 发射数据模块

- **列表视图** — 支持状态/国家/年份/火箭/发射场多维筛选，分页加载
- **日历视图** — 月视图发射日历，点击日期查看当日任务
- **详情页** — 任务信息/火箭参数/载荷/机组/视频回放
- **统计图表** — ECharts 年度趋势图（面积图）+ 各国占比（饼图）
- **关联推荐** — 详情页底部自动推荐相关火箭/发射场/宇航员

### 3. 航天器/卫星模块

- **列表视图** — 19,000+ 颗真实卫星数据，按类型/状态/运营商筛选
- **详情页** — 轨道参数（高度/倾角/周期）、任务描述、图片灯箱
- **网格/表格视图切换** — localStorage 记忆用户偏好
- **关联推荐** — 同类型/同运营商航天器

### 4. 宇航员模块

- **列表视图** — 759 位全球注册宇航员，按国籍/机构/状态筛选
- **详情页** — 个人资料、任务经历、太空时间统计（格式化：X天X小时）
- **关联推荐** — 同机构/同国籍宇航员

### 5. 产业链模块

- **产业链全景图** — 交互式上游/中游/下游三层结构（点击展开细节）
- **企业库** — 375 家航天机构，含产品/成就/财务数据
- **技术库** — 15 项关键技术，含成熟度矩阵和突破时间线
- **材料库** — 15 种航天材料，含性能参数表格
- **设备库** — 12 种航天设备，含技术规格

### 6. 3D 太空探索

- **卫星轨道** — React Three Fiber 渲染 3D 地球，LEO/MEO/GEO 卫星轨道环
- **太阳系** — 八大行星公转动画 + 轨道，点击查看星体名称
- **性能优化** — `next/dynamic` 懒加载 + 低端设备自动降级

### 7. 交互时间线

- **82 个历史事件** — 从 1957 年 Sputnik 1 到 2024 年嫦娥六号
- **分类筛选器** — 载人航天/月球探测/火星探测/空间站等
- **滚动渐入动画** — IntersectionObserver 驱动

### 8. 对比工具

- **并排对比** — 选择两个火箭/航天器，规格参数直观对比
- **优劣高亮** — 更优值绿色标注
- **可分享 URL** — `?left=falcon-9&right=long-march-5&type=rockets`

### 9. 用户系统

- **认证** — 邮箱密码 + GitHub OAuth + Google OAuth（NextAuth.js JWT）
- **收藏** — 支持所有实体类型，客户端乐观更新
- **评论** — 嵌套回复 + 敏感词过滤 + 管理审核
- **个人中心** — 收藏管理/评论历史/语言偏好设置

### 10. 管理员后台

- **完整 CRUD 面板** — 发射/航天器/宇航员/企业/技术 5 个实体
- **用户管理** — 角色切换（互锁保护，禁止自降）
- **评论审核** — 管理员可删除任何评论
- **命令行工具** — `pnpm make-admin <email>` 提升管理员

### 11. 全局功能

- **全局搜索** — `Cmd/Ctrl+K` 唤起模态框，跨 6 个实体模糊搜索（300ms 防抖）
- **国际化** — 4 种语言 (zh-CN / en / ru / ja)，路由驱动 + 翻译文件
- **浅色/深色主题** — CSS 变量方案，localStorage 持久化
- **响应式设计** — 桌面/平板/手机自适应
- **骨架屏** — 列表页加载状态 Skeleton Loading
- **滚动渐入动画** — 卡片列表 IntersectionObserver 动画
- **SEO** — 动态 sitemap.xml + robots.txt + Open Graph 元数据 + hreflang
- **RSS/API 缓存** — Cache-Control + stale-while-revalidate

---

## 数据架构

### 数据模型（18 个 Prisma Model + 12 个 Enum）

```
核心模型：
  Rocket → Launch ← LaunchCrew → Astronaut
           Launch → LaunchSite
  Spacecraft

产业链模型：
  IndustrySegment ← CompanySegment → Company
  Technology, Material, Equipment

用户模型：
  User → Account, Session, VerificationToken (NextAuth)
  User → Favorite, Comment
```

### 数据同步策略

```
┌──────────────────────────────────────────────────────┐
│                    数据同步层                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  CelesTrak SATCAT ──► sync-satcat.ts ──► 19,000+ 🛰️  │
│  SpaceX API v4    ──► sync-spacex-full.ts ──► 205 🚀 │
│  Launch Library 2 ──► sync-*.ts ──► 759 👨‍🚀, 283 🚀  │
│  手工整理         ──► sync-historical.ts ──► 51 📋  │
│                                                      │
│  容错: 429 限流优雅降级, 部分数据可用                 │
│  去重: upsert 模式 (idempotent)                      │
│  性能: createMany 批量插入 (vs 逐条 upsert)            │
└──────────────────────────────────────────────────────┘
```

---

## 设计系统

### 设计演进

项目经历了三版设计迭代：

1. **V1 — 通用暗色系**：基础 Tailwind 暗色主题 + system-ui 字体
2. **V2 — 毛玻璃风格**：backdrop-blur 玻璃态卡片 + 渐变特效
3. **V3 — HUD/Sci-Fi FUI**：基于 UI Pro Max 设计数据库推荐的专业方案

### V3 设计系统规范

| 设计令牌 | 值 |
|----------|---|
| 背景色 | `#0B0B10` — Deep Space Black |
| 卡片色 | `#1E1E23` — Void Surface |
| 主强调色 | `#3B82F6` — Launch Blue (Space Tech 标准) |
| 霓虹辅助色 | `#00FFFF` — HUD Cyan |
| 标题字体 | Orbitron (几何航天字体) |
| 正文字体 | Exo 2 (现代科技感无衬线) |
| 等宽字体 | Fira Code (数据展示) |
| 卡片风格 | hud-card: 1px 细线边框 + hover 微弱蓝光 |
| 边框色 | `rgba(255,255,255,0.08)` — Subtle hairline |
| 圆角 | 16px (card/button) |

---

## 工程实践

### 性能优化
- **3D 懒加载** — `next/dynamic` + `ssr: false`，首屏不加载 Three.js (~340KB)
- **API 缓存** — `revalidate: 60s` + `Cache-Control: s-maxage=60, stale-while-revalidate=120`
- **Skeleton Loading** — 4 个列表页有骨架屏占位
- **数据库索引** — 高频查询字段 (date/status/country/type) 建索引
- **批量数据导入** — `createMany` 批量 500 条/批（vs 逐条 upsert，速度差 30x）
- **IntersectionObserver** — 滚动动画 + 统计数字 CountUp 按需触发

### 安全措施
- **API 鉴权** — Admin 路由 double-check（页面端 `requireAdmin()` + API 端 `getAdminOrNull()`）
- **角色互锁** — `toggle-role` API 禁止自我降级
- **评论管理** — 管理员可删除任何评论，普通用户仅可删除自己的
- **安全响应头** — `poweredByHeader: false`（隐藏技术栈）
- **环境变量** — `.env` gitignored，`.env.example` 模板化

### 代码质量
- **TypeScript 全栈** — 0 个 `any` 类型（除外部 API 响应）
- **模块化** — 76 个组件文件，每个职责单一
- **客户端 API 封装** — 6 个 `lib/api/*.ts` 模块，统一错误处理
- **Prisma 类型导出** — `export * from '@prisma/client'` 复用枚举类型
- **数据库单例** — `globalThis` 模式避免开发环境热重载重复创建连接

---

## 关键挑战与解决方案

### 1. React Three Fiber 9.x 与 React 18 兼容性

**问题：** R3F 9.x 需要 React 19，项目使用 React 18，导致 3D 页面构建报错。

**解决：** 降级至 `@react-three/fiber@8.18` + `@react-three/drei@9.122`（React 18 兼容版本），同时添加低端设备检测，无法运行 WebGL 时展示静态替代内容。

### 2. Prisma 7 引擎类型冲突

**问题：** Prisma 7 默认使用 `engineType: "client"` 需要 Adapter，无法在无数据库环境下构建。

**解决：** 降级至 Prisma 6.19（library 引擎），保持 schema/providers 不变。

### 3. Launch Library 2 API 限流

**问题：** 匿名用户每小时仅 15 次请求，无法一次性拉取 7,000+ 历史发射记录。

**解决：** 实现 429 优雅降级 — `fetchLL2List` 在触发限流时返回已拉取的部分数据而非抛异常；200ms 请求间延迟；利用多种数据源（SpaceX API 无限制、CelesTrak 无限制）分散负载。

### 4. CelesTrak SATCAT 大数据导入

**问题：** 68,992 条原始记录，过滤后 ~20,000 条有效负载，逐条 `upsert` 耗时 30+ 分钟。

**解决：** 重构为批量方案 — `createMany(skipDuplicates: true)` 每次 500 条并发写入，总耗时降至 ~3 分钟。

### 5. CSS 变量主题切换

**问题：** 100+ 组件文件使用 `bg-space-900` 等硬编码类名，如何实现暗/亮主题切换而不逐个修改？

**解决：** Tailwind `rgb(var(--xxx) / <alpha-value>)` 语法 + CSS 自定义属性。`.dark` / `.light` 类切换 CSS 变量值，所有组件自动适配，无需修改任何类名。

---

## 项目统计

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
| 数据库记录 | 21,000+ 条 |
| 3D 场景 | 2 (卫星轨道 + 太阳系) |
| 开发周期 | 12 天 (2026-05-12 ~ 2026-05-23) |

---

## 未来计划

- [ ] **部署上线** — Vercel 部署 + 自定义域名
- [ ] **CI/CD 管道** — GitHub Actions 自动构建 + 测试
- [ ] **数据自动同步** — GitHub Actions cron job 每日运行 `pnpm sync`
- [ ] **单元测试 + E2E** — Jest + Playwright 覆盖关键流程
- [ ] **通知系统** — 发射提醒邮件/Web Push
- [ ] **React Native App** — 复用 API 层构建移动端
- [ ] **数据可视化增强** — 更多统计维度、交互式图表

---

## 技术亮点总结

> 这个项目展示了从零到一构建一个**数据密集型、视觉精致的全栈 Web 应用**的完整能力：
>
> - **全栈架构设计** — Next.js App Router + Prisma ORM + RESTful API + 数据库设计
> - **多源数据集成** — 4 个外部 API 的数据同步管道，批量导入优化，错误降级
> - **国际化 + 无障碍** — 4 语言 i18n、暗/亮主题、响应式、SEO
> - **3D 可视化** — React Three Fiber 地球卫星轨道 + 太阳系
> - **设计系统** — 从 UI 设计数据库搜索 → 分析 → 实施的专业设计工作流
> - **工程化** — TypeScript 全栈、模块化组件、性能优化、安全措施
> - **用户系统** — NextAuth.js 多 Provider 认证、RBAC 权限模型
