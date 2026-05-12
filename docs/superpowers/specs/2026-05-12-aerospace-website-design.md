# 航天数据网站设计文档

## 概述

一个全面的航天数据网站，面向所有人群（航天爱好者、学生、专业人士），提供发射数据、航天器、宇航员以及完整航天产业链（上游材料/元器件、中游制造/集成、下游应用/服务）等全面的航天信息，采用沉浸式太空风格设计。

## 技术架构

### 架构方案

采用 **Next.js 14 单体应用**架构，前后端在同一项目中，便于快速开发和迭代。API 层独立设计，为后续 React Native App 预留扩展空间。

### 技术栈

| 层面 | 技术 | 理由 |
|------|------|------|
| 框架 | Next.js 14 (App Router) | SSR/SSG、API Routes、国际化支持 |
| 样式 | Tailwind CSS | 快速开发、响应式设计 |
| 数据库 | PostgreSQL + Prisma | 关系型数据、类型安全 ORM |
| 认证 | NextAuth.js | 开箱即用、多种登录方式 |
| 国际化 | next-intl | Next.js 官方推荐 |
| 图表 | ECharts | 功能全面、中文文档好 |
| 3D | React Three Fiber | React 生态、声明式 3D |
| 状态管理 | Zustand | 轻量、简单 |
| 数据请求 | React Query | 缓存、状态管理 |

### 项目结构

```
spacewebsite/
├── app/                      # Next.js App Router
│   ├── [locale]/             # 国际化路由
│   │   ├── (main)/           # 主站页面
│   │   │   ├── page.tsx      # 首页
│   │   │   ├── launches/     # 发射数据
│   │   │   ├── spacecraft/   # 航天器
│   │   │   ├── astronauts/   # 宇航员
│   │   │   ├── explore/      # 3D 探索
│   │   │   └── industry/     # 产业链
│   │   │       ├── page.tsx      # 产业全景
│   │   │       ├── companies/    # 企业库
│   │   │       ├── technologies/ # 技术库
│   │   │       ├── materials/    # 材料库
│   │   │       └── equipment/    # 设备库
│   │   ├── (auth)/           # 认证相关
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── profile/
│   │   └── layout.tsx
│   └── api/                  # API 路由
│       ├── launches/
│       ├── spacecraft/
│       ├── astronauts/
│       ├── industry/         # 产业链 API
│       ├── auth/
│       └── external/         # 外部 API 代理
├── components/
│   ├── ui/                   # 基础 UI 组件
│   ├── charts/               # 图表组件
│   ├── 3d/                   # Three.js 3D 组件
│   └── layout/               # 布局组件
├── lib/
│   ├── api/                  # API 客户端
│   ├── db/                   # 数据库操作
│   ├── auth/                 # 认证逻辑
│   └── i18n/                 # 国际化配置
├── prisma/
│   └── schema.prisma         # 数据库 schema
├── public/
│   ├── images/               # 静态图片
│   ├── models/               # 3D 模型
│   └── locales/              # 翻译文件
└── types/                    # TypeScript 类型定义
```

## 航天产业链

网站将覆盖完整的航天产业链，从上游原材料到下游应用服务。

### 产业链结构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           航天产业链全景图                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        上游：原材料与元器件                           │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  材料        │  电子元器件      │  机械部件        │  软件系统        │   │
│  │  ─────────   │  ─────────────   │  ─────────────   │  ─────────────   │   │
│  │  • 碳纤维    │  • 芯片/处理器   │  • 阀门/管路     │  • 飞控软件      │   │
│  │  • 钛合金    │  • 传感器        │  • 轴承/齿轮     │  • 仿真系统      │   │
│  │  • 高温合金  │  • 惯性导航      │  • 密封件        │  • 测控软件      │   │
│  │  • 复合材料  │  • 星载计算机    │  • 连接器        │  • 地面系统      │   │
│  │  • 隔热材料  │  • 太阳能电池    │  • 推进剂储箱    │  • 数据处理      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        中游：制造与集成                               │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  运载火箭      │  航天器制造      │  地面设备        │  发射服务       │   │
│  │  ───────────   │  ───────────     │  ───────────     │  ───────────    │   │
│  │  • 箭体结构    │  • 卫星平台      │  • 测控站        │  • 发射场       │   │
│  │  • 发动机      │  • 空间站舱段    │  • 地面终端      │  • 发射任务     │   │
│  │  • 控制系统    │  • 载人飞船      │  • 数据中心      │  • 在轨交付     │   │
│  │  • 整流罩      │  • 货运飞船      │  • 天线系统      │  • 轨道转移     │   │
│  │  • 级间段      │  • 深空探测器    │  • 模拟器        │  • 回收复用     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        下游：应用与服务                               │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  卫星通信      │  导航定位        │  遥感观测        │  科学探索       │   │
│  │  ───────────   │  ───────────     │  ───────────     │  ───────────    │   │
│  │  • 宽带互联网  │  • GPS/北斗      │  • 气象监测      │  • 空间科学     │   │
│  │  • 移动通信    │  • 精准农业      │  • 资源勘探      │  • 深空探测     │   │
│  │  • 广播电视    │  • 智慧交通      │  • 环境监测      │  • 载人航天     │   │
│  │  • 物联网      │  • 测绘制图      │  • 灾害预警      │  • 太空旅游     │   │
│  │  • 应急通信    │  • 授时服务      │  • 城市规划      │  • 在轨制造     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 产业链数据模型

#### IndustrySegment（产业环节）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| name | String | 环节名称 |
| level | Enum | 层级（上游/中游/下游） |
| category | String | 分类（材料/元器件/制造/服务等） |
| description | String | 详细介绍 |
| technologies | String[] | 关键技术 |
| marketSize | Float? | 市场规模（亿美元） |
| growthRate | Float? | 年增长率 |
| challenges | String[] | 行业挑战 |
| trends | String[] | 发展趋势 |

#### Company（企业）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| name | String | 企业名称 |
| country | String | 所属国家 |
| type | Enum | 类型（国企/民企/上市公司/初创） |
| foundedYear | Int | 成立年份 |
| headquarters | String | 总部位置 |
| employees | Int? | 员工数量 |
| revenue | Float? | 年营收（亿美元） |
| segmentIds | String[] | 所属产业环节 |
| products | String[] | 主要产品/服务 |
| achievements | String[] | 重要成就 |
| website | String? | 官网 |
| stockCode | String? | 股票代码 |
| description | String | 企业介绍 |
| logo | String? | Logo |

#### Technology（技术）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| name | String | 技术名称 |
| category | String | 技术类别 |
| maturityLevel | Enum | 成熟度（研发中/试验/应用/成熟） |
| description | String | 技术介绍 |
| applications | String[] | 应用场景 |
| keyPlayers | String[] | 主要研发机构/企业 |
| challenges | String[] | 技术难点 |
| breakthroughs | Json[] | 重要突破（时间+内容） |

#### Material（材料）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| name | String | 材料名称 |
| category | String | 类别（金属/复合材料/陶瓷/聚合物） |
| properties | Json | 性能参数 |
| applications | String[] | 应用场景 |
| manufacturers | String[] | 主要生产商 |
| description | String | 材料介绍 |

#### Equipment（设备）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| name | String | 设备名称 |
| category | String | 类别（测试/制造/发射/地面） |
| manufacturer | String | 制造商 |
| specifications | Json | 技术规格 |
| applications | String[] | 应用场景 |
| description | String | 设备介绍 |

### 产业链页面

#### 产业全景 `/industry`

- 产业链全景图（可交互，点击进入各环节）
- 市场规模统计（全球/各国）
- 产业发展时间线
- 热点趋势分析

#### 企业库 `/industry/companies`

- 企业列表（按国家、类型、产业环节筛选）
- 企业详情页：基本信息、产品、成就、财务数据
- 企业对比功能
- 产业链图谱（企业关系可视化）

#### 技术库 `/industry/technologies`

- 技术分类浏览
- 技术详情页：原理、应用、发展历程
- 技术成熟度矩阵
- 技术发展路线图

#### 材料库 `/industry/materials`

- 材料分类浏览
- 材料详情页：性能参数、应用案例
- 材料对比功能

#### 设备库 `/industry/equipment`

- 设备分类浏览
- 设备详情页：规格、应用、制造商

### 产业链数据来源

| 数据类型 | 来源 | 更新频率 |
|----------|------|----------|
| 市场数据 | 行业报告、公开财报 | 季度/年度 |
| 企业信息 | 官网、新闻、数据库 | 月度 |
| 技术动态 | 论文、专利、新闻 | 周度 |
| 政策法规 | 政府公告 | 实时 |

## 数据模型

### Launch（发射数据）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| name | String | 任务名称 |
| date | DateTime | 发射时间 |
| status | Enum | 状态（成功/失败/计划中/推迟） |
| rocketId | String | 关联火箭 |
| launchSiteId | String | 关联发射场 |
| missionDescription | String | 任务描述 |
| payloads | Json | 载荷列表 |
| crewIds | String[] | 宇航员（载人任务） |
| videoUrl | String? | 视频链接 |
| images | String[] | 图片 |
| externalId | String? | 外部 API ID |

### Rocket（火箭）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| name | String | 名称 |
| manufacturer | String | 制造商 |
| country | String | 国家 |
| height | Float | 高度（米） |
| diameter | Float | 直径（米） |
| mass | Float | 质量（吨） |
| payloadToLEO | Float | 近地轨道运载能力（吨） |
| payloadToGTO | Float | 地球同步转移轨道运载能力（吨） |
| stages | Int | 级数 |
| firstFlight | DateTime? | 首飞日期 |
| status | Enum | 状态（服役中/退役/研发中） |
| successRate | Float | 成功率 |
| description | String | 详细介绍 |
| images | String[] | 图片 |

### Spacecraft（航天器）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| name | String | 名称 |
| type | Enum | 类型（空间站/卫星/探测器/飞船） |
| operator | String | 运营方 |
| launchDate | DateTime | 发射日期 |
| status | Enum | 状态（运行中/退役/失联） |
| orbitType | String | 轨道类型 |
| orbitAltitude | Float? | 轨道高度（公里） |
| orbitInclination | Float? | 轨道倾角（度） |
| orbitPeriod | Float? | 轨道周期（分钟） |
| mass | Float | 质量（千克） |
| dimensions | String | 尺寸 |
| mission | String | 任务目标 |
| description | String | 详细介绍 |
| images | String[] | 图片 |

### Astronaut（宇航员）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| name | String | 姓名 |
| nationality | String | 国籍 |
| agency | String | 所属机构 |
| birthDate | DateTime | 出生日期 |
| status | Enum | 状态（现役/退役/已故） |
| spaceFlights | Int | 太空飞行次数 |
| totalTimeInSpace | Int | 累计太空时间（分钟） |
| bio | String | 简介 |
| photo | String? | 照片 |
| socialLinks | Json | 社交媒体链接 |

### LaunchSite（发射场）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| name | String | 名称 |
| country | String | 国家 |
| region | String | 地区 |
| latitude | Float | 纬度 |
| longitude | Float | 经度 |
| operator | String | 运营方 |
| status | Enum | 状态 |
| pads | Json | 发射台列表 |
| description | String | 介绍 |

### User（用户）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| email | String | 邮箱 |
| name | String | 昵称 |
| avatar | String? | 头像 |
| locale | String | 语言偏好 |
| createdAt | DateTime | 创建时间 |

### Favorite（收藏）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| userId | String | 用户 ID |
| targetType | Enum | 收藏类型 |
| targetId | String | 目标 ID |
| createdAt | DateTime | 创建时间 |

### Comment（评论）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| userId | String | 用户 ID |
| targetType | Enum | 评论目标类型 |
| targetId | String | 目标 ID |
| content | String | 评论内容 |
| parentId | String? | 父评论 ID（用于嵌套回复） |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

## 页面结构

### 首页 `/`

- 沉浸式太空背景（星空/星云动画）
- 即将到来的发射倒计时
- 最新发射动态
- 数据统计概览（总发射数、在轨航天器数、宇航员数等）
- 快速导航入口

### 发射数据 `/launches`

- 发射列表（支持筛选：时间、国家、火箭、状态）
- 发射详情页：任务信息、火箭参数、载荷、视频回放
- 发射日历视图
- 发射统计图表（按年份、国家、成功率）

### 航天器 `/spacecraft`

- 分类浏览：空间站、卫星、探测器、飞船
- 航天器详情页：参数、轨道信息、任务历史
- 3D 轨道可视化（地球周围的卫星分布）

### 宇航员 `/astronauts`

- 宇航员列表（按国籍、机构筛选）
- 宇航员详情页：个人资料、任务经历、太空时间统计
- 宇航员排行榜（太空时间、飞行次数）

### 3D 探索 `/explore`

- 太阳系 3D 模型
- 实时卫星轨道追踪
- 历史任务轨迹回放（如阿波罗登月、旅行者号）

### 用户中心 `/profile`

- 个人信息管理
- 收藏列表
- 评论历史
- 语言偏好设置

### 产业全景 `/industry`

- 产业链全景图（可交互，点击进入各环节）
- 市场规模统计（全球/各国）
- 产业发展时间线
- 热点趋势分析

### 企业库 `/industry/companies`

- 企业列表（按国家、类型、产业环节筛选）
- 企业详情页：基本信息、产品、成就、财务数据
- 企业对比功能
- 产业链图谱（企业关系可视化）

### 技术库 `/industry/technologies`

- 技术分类浏览
- 技术详情页：原理、应用、发展历程
- 技术成熟度矩阵
- 技术发展路线图

### 材料库 `/industry/materials`

- 材料分类浏览
- 材料详情页：性能参数、应用案例
- 材料对比功能

### 设备库 `/industry/equipment`

- 设备分类浏览
- 设备详情页：规格、应用、制造商

## 外部 API 集成

### 数据源

| API | 用途 | 认证 |
|-----|------|------|
| SpaceX API | SpaceX 发射数据、火箭信息 | 无需认证 |
| NASA APIs | 每日天文图片、火星探测器图片、图片素材 | 需要 API Key |
| N2YO API | 卫星实时位置追踪 | 免费额度 |
| Launch Library 2 | 全球发射数据汇总 | 无需认证 |

### 数据同步策略

- **静态数据**：历史发射记录、退役火箭/航天器 → 存入数据库
- **准实时数据**：即将发射的任务 → 每小时同步一次
- **实时数据**：卫星位置 → 直接代理 API 请求

### 容错机制

- 外部 API 失败时降级到缓存数据
- 请求重试机制（指数退避）
- 统一错误响应格式

## 国际化

### 支持语言

| 语言 | 代码 | 优先级 |
|------|------|--------|
| 中文（简体） | zh-CN | 主要 |
| 英文 | en | 主要 |
| 俄语 | ru | 次要 |
| 日语 | ja | 次要 |

### 实现方案

- 路由结构：`/[locale]/...`
- 翻译文件：`public/locales/{locale}/{namespace}.json`
- 数据多语言：航天器/火箭名称保留原名 + 翻译名

## 用户系统

### 认证方式

| 方式 | 优先级 |
|------|--------|
| 邮箱密码 | 主要 |
| GitHub OAuth | 主要 |
| Google OAuth | 次要 |

### 用户功能

- **收藏系统**：收藏任意内容、分类管理、导出
- **评论系统**：发表评论、回复嵌套、点赞、敏感词过滤
- **个人主页**：头像昵称设置、语言偏好、收藏统计、评论历史

### 权限控制

| 角色 | 权限 |
|------|------|
| 游客 | 浏览所有公开内容 |
| 注册用户 | 收藏、评论、个人设置 |
| 管理员 | 内容管理、用户管理、数据维护 |

## 数据可视化

### 3D 可视化（React Three Fiber）

- **地球卫星轨道**：3D 地球模型、实时卫星位置、轨道路径、点击详情
- **太阳系探索**：行星模型、轨道动画、探测器任务路径
- **发射轨迹**：火箭发射动画、入轨轨迹可视化

### 数据图表（ECharts）

- **发射统计**：年度趋势图、各国占比、成功率对比、火箭使用热力图
- **航天器分布**：轨道高度散点图、类型占比、在轨时间线
- **宇航员数据**：太空时间排行榜、各国数量对比、年度载人任务统计

### 性能优化

- 3D 场景懒加载，不影响首屏
- 图表按需渲染
- 低端设备降级为 2D 展示

## 视觉风格

### 设计方向

**沉浸式太空风**：大量星空/宇宙背景图，强调视觉冲击力

### 设计要素

- 深色主题为主，配合星空/星云背景
- 渐变色彩：深蓝、紫色、青色
- 发光效果和粒子动画
- 高质量太空图片和 3D 模型
- 响应式设计，适配桌面和移动端

## 性能优化

| 策略 | 实现 |
|------|------|
| 图片优化 | Next.js Image 组件，WebP 格式，懒加载 |
| 3D 懒加载 | 动态导入，首屏不加载 Three.js |
| 数据缓存 | React Query 缓存 API 响应 |
| 静态生成 | 历史数据页面 SSG，减少服务端压力 |
| 代码分割 | 按路由自动分割 |

## 错误处理

### API 层

- 外部 API 失败时降级到缓存数据
- 统一错误响应格式
- 请求重试机制（指数退避）

### 前端

- 全局错误边界捕获崩溃
- 加载状态和骨架屏
- 网络错误友好提示

## 测试策略

- **单元测试**：Jest + React Testing Library
- **E2E 测试**：Playwright（关键用户流程）
- **API 测试**：集成测试覆盖核心接口

## 后续扩展

- 移动端 App（React Native，复用 API 层）
- 部署方案（Vercel / 云服务商）
- 更多数据源集成
- 数据模型丰富化
- 产业链数据深化（更多企业、技术、材料数据）
- 产业链关系图谱（企业上下游关系可视化）
- 行业报告与分析功能
