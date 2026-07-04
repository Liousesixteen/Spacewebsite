# 全球航天数据平台设计文档

## 目标

SpaceData 要从“航天数据展示网站”升级成“全球航天信息平台”。第一阶段的核心不是继续堆页面，而是把发射任务作为主入口，建立一套标准化的数据层，让用户能清楚知道：

- 最近要发射什么
- 哪些任务正在发射或处于关键状态
- 哪些任务已经完成、失败、推迟或待确认
- 每次发射由哪个国家、机构、企业执行
- 使用什么火箭、哪个发射场和发射台
- 载荷是什么、进入什么轨道、服务什么任务
- 这次任务和航天器、宇航员、机构、企业、产业链有什么关系

当前项目已经有很好的基础：发射、火箭、发射场、航天器、宇航员、企业、技术、材料、设备、同步脚本、国际化路由和视觉系统。下一步重点是把这些数据变成互相关联的航天知识网络。

## 对标项目与数据源

这次升级主要借鉴以下方向：

- [Next Spaceflight](https://nextspaceflight.com/)：适合借鉴“下一次发射”、任务流、直播/回放入口、发射服务商和移动端任务卡片。
- [Space Launch Schedule](https://www.spacelaunchschedule.com/)：适合借鉴按国家、地点、机构、火箭、年份筛选，以及任务详情页里的地图、载荷、火箭、视频和发射场信息。
- [TheSpaceDevs Launch Library 2](https://thespacedevs.com/llapi)：适合作为主要发射数据源，覆盖发射、机构、发射台、宇航员、航天器、事件、远征、对接和任务状态。
- [CelesTrak SATCAT](https://celestrak.org/satcat/satcat-format.php)：适合补齐发射后的在轨物体、载荷、所有者、发射日期、发射场和轨道参数。
- [NASA Events](https://www.nasa.gov/events/)：适合借鉴航天事件呈现方式、直播事件和时区意识。
- [ESA Space Economy](https://space-economy.esa.int/article/34/measuring-the-space-economy)、Space Foundation、BryceTech 等空间经济资料：适合校准上游、中游、下游产业链分类。

## 产品范围

### 第一阶段：全球发射任务中心

`/launches` 应成为用户每天查看全球航天动态的主屏幕。

必须展示：

- 下一次发射：倒计时、状态、机构、火箭、发射场、发射台、任务类型、轨道、直播链接
- 正在发射或关键中的任务
- 未来 7 天发射
- 未来 30 天发射
- 最近已完成发射
- 推迟、暂停、待确认、失败等需要关注的任务
- 按状态、国家、机构、火箭、发射场、发射台、轨道、任务类型、年份筛选
- 列表、表格、日历三种视图
- 数据源状态、最后更新时间、离线或过期数据提示
- 简体中文和英文完整本地化，不再出现 UI 文案混杂

这个页面应该像任务控制中心：信息密度高、可扫描、稳定、适合反复打开。

### 第二阶段：全球航天实体图谱

增加统一实体模型，让不同页面之间能互相跳转，而不是孤立的数据列表。

核心实体：

- 国家或地区
- 航天机构 / 发射服务商 / 运营商
- 火箭系列和火箭型号
- 发射场和具体发射台
- 发射任务
- 载荷 / 航天器 / 在轨物体
- 宇航员和乘组关系
- 企业
- 产业链环节
- 数据源记录

每个实体都要有内部 ID、外部数据源 ID、最后同步时间、来源信息；重要实体后续提供详情页。

### 第三阶段：航天全产业链图谱

产业链页从静态概览升级成航天经济地图。

结构分为：

- 上游：航天材料、电子元器件、推进零部件、精密机械、地面软件、测试设备
- 中游：运载火箭、航天器制造、卫星平台、发射服务、任务运营、地面系统
- 下游：卫星通信、导航定位、遥感观测、空间科学、载人航天、在轨服务、太空旅游

需要支持：

- 企业与产业环节关联
- 企业与产品/服务关联
- 技术与产业环节关联
- 发射服务商、火箭制造商和企业/机构关联
- 从一次发射反查对应的企业、机构、技术和产业链位置

## 数据架构

### 数据源分工

- Launch Library 2：发射计划、发射状态、机构、发射台、宇航员、航天器、事件和对接数据。
- SpaceX API：补充 SpaceX 火箭、发射、发射台、视频和历史链接。
- CelesTrak SATCAT：补充卫星、载荷、国际编号、所有者、发射日期、轨道参数。
- 项目内置数据：补充产业链分类、重点企业、材料、技术、设备、历史里程碑。

前端页面不直接依赖外部 API 原始结构。同步脚本负责把外部数据标准化写入本地数据库；前端 API 只读取本地数据库，并提供来源和更新时间。

### 数据质量规则

- 外部记录必须保存来源名称、外部 ID、最后同步时间。
- 缺失值要明确显示为“未知”或“待确认”，不能静默消失。
- 发射状态、企业类型、产业链层级、技术成熟度等枚举必须走翻译映射。
- 同步脚本必须幂等，重复运行不能制造重复数据。
- 发射时间统一保存 UTC，展示时按用户语言和时区格式化。
- 即将发射的数据刷新频率高于历史数据。
- 外部源失败不能导致页面崩溃，只能显示离线或数据过期状态。

## 推荐数据模型调整

这些调整聚焦第一阶段，不做大重构。

### Agency

表示国家航天局、发射服务商、运营商和重要航天机构。

字段：

- `id`
- `name`
- `abbrev`
- `type`
- `country`
- `description`
- `administrator`
- `foundingYear`
- `logo`
- `website`
- `externalId`
- `source`
- `lastSyncedAt`

关系：

- 作为发射服务商关联到 `Launch`
- 作为制造商或运营商关联到 `Rocket`
- 作为运营商关联到 `Spacecraft`
- 后续和 `Astronaut` 建立机构关系

### LaunchPad

当前 `LaunchSite.pads` 是 JSON，适合展示但不适合筛选和链接。需要增加一等模型。

字段：

- `id`
- `name`
- `country`
- `region`
- `latitude`
- `longitude`
- `status`
- `mapUrl`
- `launchSiteId`
- `externalId`
- `source`
- `lastSyncedAt`

关系：

- 属于一个 `LaunchSite`
- 被多个 `Launch` 使用

### Launch 扩展字段

在不破坏现有页面的前提下扩展 `Launch`。

字段：

- `agencyId`
- `launchPadId`
- `windowStart`
- `windowEnd`
- `missionName`
- `missionType`
- `orbitName`
- `orbitAbbrev`
- `slug`
- `webcastUrl`
- `articleUrl`
- `wikiUrl`
- `source`
- `sourceUrl`
- `lastSyncedAt`
- `rawStatus`

现有字段 `date`、`status`、`missionDescription`、`payloads`、`videoUrl`、`rocketId`、`launchSiteId` 继续保留。

### Payload

载荷需要从 `Launch.payloads` JSON 升级为可查询模型。

字段：

- `id`
- `name`
- `type`
- `orbit`
- `owner`
- `operator`
- `noradId`
- `internationalDesignator`
- `massKg`
- `launchId`
- `spacecraftId`
- `externalId`
- `source`
- `lastSyncedAt`

### DataSourceRecord

记录数据源健康状态和同步可见性。

字段：

- `id`
- `source`
- `entityType`
- `externalId`
- `internalId`
- `lastSyncedAt`
- `status`
- `message`

## API 设计

保留现有接口：

- `GET /api/launches`
- `GET /api/launches/[id]`
- `GET /api/launches/overview`
- `GET /api/launches/stats`

扩展或新增接口：

- `GET /api/launches?provider=&missionType=&orbit=&launchSite=&pad=&from=&to=`
- `GET /api/launches/overview`
- `GET /api/agencies`
- `GET /api/agencies/[id]`
- `GET /api/countries`
- `GET /api/countries/[code]/space`
- `GET /api/industry/overview`
- `GET /api/data-sources/health`

`/api/launches/overview` 返回：

- 下一次发射
- 正在发射
- 未来 7 天
- 未来 30 天
- 最近完成
- 需要关注的异常任务
- 状态统计
- 国家统计
- 机构统计
- 任务类型统计
- 数据源新鲜度

所有列表接口都应复用统一的筛选参数解析工具。

## 前端设计

### 发射页

页面分四个区域：

1. 任务控制摘要：下一次发射、倒计时、状态、直播入口、数据源状态。
2. 任务通道：正在发射、未来 7 天、未来 30 天、最近完成、异常关注。
3. 可筛选数据库：列表、表格、日历视图。
4. 覆盖统计：国家、机构、任务类型、发射场 Top 数据。

第一屏优先解决“最近全球航天发射情况是什么”，不放无关装饰。

### 发射详情页

每个任务详情页展示：

- 任务标题、状态、倒计时或结果
- 火箭、机构、发射场、发射台
- 坐标地图或地图链接
- 任务类型、轨道、载荷
- 直播、回放、文章、百科链接
- 同火箭、同机构、同发射场、同任务类型的相关发射
- 数据源和最后更新时间

### 产业链页

产业链页展示：

- 产业环节、企业、技术、材料、设备总览
- 上游 / 中游 / 下游三条产业带
- 每个环节显示企业数量、技术数量、趋势、挑战
- 快速进入企业、技术、材料、设备子库
- 子页面支持国家和环节筛选

### 导航

主导航保持聚焦：

- 首页
- 发射数据
- 航天器
- 宇航员
- 产业链

次级功能放入更多菜单：

- 时间线
- 对比
- 深空探索

## 国际化

第一阶段优先保证简体中文和英文完整。

规则：

- 共享组件中不能出现硬编码 UI 文案。
- 状态、企业类型、产业链层级、技术成熟度、航天器类型都使用翻译 key。
- 外部原始名称默认保留官方名称，除非项目维护了本地化别名。
- 加载、空状态、错误、离线、数据过期提示全部本地化。
- 俄语和日语可以先保持兜底，但不能影响中文和英文质量。

## 错误处理

- 数据库可用但外部源过期：继续展示旧数据，并显示最后同步时间。
- 某个外部源不可用：继续展示本地数据，并标记该源不可用。
- 可选字段缺失：显示本地化“未知”。
- 发射时间变化：按外部 ID 更新同一条发射记录，不创建重复任务。

## 测试

需要增加或保留测试：

- 发射筛选解析
- 发射总览分组
- Launch Library 2 状态映射
- 机构 / 服务商标准化
- 数据源健康兜底
- `/api/launches/overview` 响应结构
- 中文和英文发射流程翻译 key 完整性

完成前运行：

- `pnpm exec tsx --test tests/api/filter-params.test.ts tests/api/launch-overview.test.ts`
- `pnpm lint`
- `pnpm build`

## 实施顺序

1. 增加 Agency、LaunchPad、Payload、DataSourceRecord 以及 Launch 扩展字段。
2. 扩展 LL2 同步脚本：机构、发射台、任务元数据、载荷。
3. 扩展 `/api/launches` 和 `/api/launches/overview`：机构、轨道、任务类型、来源状态、异常任务。
4. 把发射页升级为任务控制中心布局。
5. 升级发射详情页：机构、发射台、载荷、媒体链接、来源、相关任务。
6. 补齐发射核心流程的中英文翻译。
7. 把产业链首页升级为上中下游三段式图谱。
8. 验证数据同步、API、响应式布局、中文、英文、lint、测试和构建。

## 第一里程碑验收标准

第一里程碑完成时必须满足：

- `/zh-CN/launches` 清楚展示下一次发射、正在发射、即将发射、最近完成和异常关注任务。
- 发射筛选支持状态、国家、机构、任务类型、轨道、火箭、发射场、年份。
- 发射详情页能展示机构、发射台、任务类型、轨道、载荷、媒体链接和来源更新时间。
- 外部 API 不可用时页面仍能显示本地数据和来源状态。
- 简体中文和英文发射页面不再混杂 UI 语言。
- 现有测试、lint 和生产构建通过。

