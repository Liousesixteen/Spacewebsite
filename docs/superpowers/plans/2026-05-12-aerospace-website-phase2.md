# Phase 2: 数据库 Schema 与核心数据模型

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建完整的 Prisma 数据库 Schema，包含所有航天数据和产业链数据模型

**Architecture:** PostgreSQL 数据库，Prisma ORM，类型安全的数据访问层

**Tech Stack:** Prisma, PostgreSQL, TypeScript

---

## Task 1: 创建核心航天数据 Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: 定义枚举类型**

在 `prisma/schema.prisma` 中添加:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 枚举类型
enum LaunchStatus {
  SUCCESS
  FAILURE
  PLANNED
  POSTPONED
  IN_FLIGHT
}

enum RocketStatus {
  ACTIVE
  RETIRED
  IN_DEVELOPMENT
}

enum SpacecraftType {
  SPACE_STATION
  SATELLITE
  PROBE
  CREWED_SPACECRAFT
  CARGO_SPACECRAFT
}

enum SpacecraftStatus {
  OPERATIONAL
  RETIRED
  LOST
}

enum AstronautStatus {
  ACTIVE
  RETIRED
  DECEASED
}

enum LaunchSiteStatus {
  ACTIVE
  INACTIVE
  UNDER_CONSTRUCTION
}
```

- [ ] **Step 2: 定义 Rocket 模型**

```prisma
model Rocket {
  id            String       @id @default(cuid())
  name          String
  manufacturer  String
  country       String
  height        Float        // 米
  diameter      Float        // 米
  mass          Float        // 吨
  payloadToLEO  Float        // 吨
  payloadToGTO  Float        // 吨
  stages        Int
  firstFlight   DateTime?
  status        RocketStatus
  successRate   Float        @default(0)
  description   String       @db.Text
  images        String[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  launches      Launch[]

  @@index([country])
  @@index([status])
}
```

- [ ] **Step 3: 定义 LaunchSite 模型**

```prisma
model LaunchSite {
  id          String           @id @default(cuid())
  name        String
  country     String
  region      String
  latitude    Float
  longitude   Float
  operator    String
  status      LaunchSiteStatus
  pads        Json             // 发射台列表
  description String           @db.Text
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  launches    Launch[]

  @@index([country])
  @@index([status])
}
```

- [ ] **Step 4: 定义 Astronaut 模型**

```prisma
model Astronaut {
  id               String          @id @default(cuid())
  name             String
  nationality      String
  agency           String
  birthDate        DateTime
  status           AstronautStatus
  spaceFlights     Int             @default(0)
  totalTimeInSpace Int             @default(0) // 分钟
  bio              String          @db.Text
  photo            String?
  socialLinks      Json?
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  launchCrews      LaunchCrew[]

  @@index([nationality])
  @@index([agency])
  @@index([status])
}
```

- [ ] **Step 5: 定义 Spacecraft 模型**

```prisma
model Spacecraft {
  id               String           @id @default(cuid())
  name             String
  type             SpacecraftType
  operator         String
  launchDate       DateTime
  status           SpacecraftStatus
  orbitType        String
  orbitAltitude    Float?           // 公里
  orbitInclination Float?           // 度
  orbitPeriod      Float?           // 分钟
  mass             Float            // 千克
  dimensions       String
  mission          String           @db.Text
  description      String           @db.Text
  images           String[]
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  @@index([type])
  @@index([status])
  @@index([operator])
}
```

- [ ] **Step 6: 定义 Launch 模型**

```prisma
model Launch {
  id                 String       @id @default(cuid())
  name               String
  date               DateTime
  status             LaunchStatus
  missionDescription String       @db.Text
  payloads           Json         // 载荷列表
  videoUrl           String?
  images             String[]
  externalId         String?      @unique
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  rocketId           String
  rocket             Rocket       @relation(fields: [rocketId], references: [id])

  launchSiteId       String
  launchSite         LaunchSite   @relation(fields: [launchSiteId], references: [id])

  crews              LaunchCrew[]

  @@index([date])
  @@index([status])
  @@index([rocketId])
  @@index([launchSiteId])
}

model LaunchCrew {
  id          String    @id @default(cuid())
  launchId    String
  launch      Launch    @relation(fields: [launchId], references: [id], onDelete: Cascade)
  astronautId String
  astronaut   Astronaut @relation(fields: [astronautId], references: [id])
  role        String    // 指令长、飞行工程师等

  @@unique([launchId, astronautId])
}
```

- [ ] **Step 7: 验证 Schema 语法**

```bash
pnpm prisma validate
```

Expected: "The schema is valid!"

- [ ] **Step 8: 提交核心数据模型**

```bash
git add prisma/schema.prisma
git commit -m "feat: add core space data models (Rocket, Launch, Spacecraft, Astronaut)"
```

---

## Task 2: 创建产业链数据 Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: 定义产业链枚举**

```prisma
enum IndustryLevel {
  UPSTREAM
  MIDSTREAM
  DOWNSTREAM
}

enum CompanyType {
  STATE_OWNED
  PRIVATE
  PUBLIC
  STARTUP
}

enum TechnologyMaturity {
  RESEARCH
  EXPERIMENTAL
  APPLIED
  MATURE
}
```

- [ ] **Step 2: 定义 IndustrySegment 模型**

```prisma
model IndustrySegment {
  id           String        @id @default(cuid())
  name         String
  level        IndustryLevel
  category     String
  description  String        @db.Text
  technologies String[]
  marketSize   Float?        // 亿美元
  growthRate   Float?        // 百分比
  challenges   String[]
  trends       String[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  companies    CompanySegment[]

  @@index([level])
  @@index([category])
}
```

- [ ] **Step 3: 定义 Company 模型**

```prisma
model Company {
  id           String         @id @default(cuid())
  name         String
  country      String
  type         CompanyType
  foundedYear  Int
  headquarters String
  employees    Int?
  revenue      Float?         // 亿美元
  products     String[]
  achievements String[]
  website      String?
  stockCode    String?
  description  String         @db.Text
  logo         String?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  segments     CompanySegment[]

  @@index([country])
  @@index([type])
}

model CompanySegment {
  id        String          @id @default(cuid())
  companyId String
  company   Company         @relation(fields: [companyId], references: [id], onDelete: Cascade)
  segmentId String
  segment   IndustrySegment @relation(fields: [segmentId], references: [id])

  @@unique([companyId, segmentId])
}
```

- [ ] **Step 4: 定义 Technology 模型**

```prisma
model Technology {
  id            String             @id @default(cuid())
  name          String
  category      String
  maturityLevel TechnologyMaturity
  description   String             @db.Text
  applications  String[]
  keyPlayers    String[]
  challenges    String[]
  breakthroughs Json               // [{date, content}]
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  @@index([category])
  @@index([maturityLevel])
}
```

- [ ] **Step 5: 定义 Material 模型**

```prisma
model Material {
  id            String   @id @default(cuid())
  name          String
  category      String   // 金属/复合材料/陶瓷/聚合物
  properties    Json     // 性能参数
  applications  String[]
  manufacturers String[]
  description   String   @db.Text
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([category])
}
```

- [ ] **Step 6: 定义 Equipment 模型**

```prisma
model Equipment {
  id             String   @id @default(cuid())
  name           String
  category       String   // 测试/制造/发射/地面
  manufacturer   String
  specifications Json     // 技术规格
  applications   String[]
  description    String   @db.Text
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([category])
  @@index([manufacturer])
}
```

- [ ] **Step 7: 验证 Schema**

```bash
pnpm prisma validate
```

- [ ] **Step 8: 提交产业链模型**

```bash
git add prisma/schema.prisma
git commit -m "feat: add industry chain models (Segment, Company, Technology, Material, Equipment)"
```

---

## Task 3: 创建用户系统 Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: 定义用户相关枚举**

```prisma
enum UserRole {
  USER
  ADMIN
}

enum FavoriteType {
  LAUNCH
  ROCKET
  SPACECRAFT
  ASTRONAUT
  COMPANY
  TECHNOLOGY
}

enum CommentTargetType {
  LAUNCH
  ROCKET
  SPACECRAFT
  ASTRONAUT
  COMPANY
  TECHNOLOGY
}
```

- [ ] **Step 2: 定义 NextAuth 所需模型**

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

- [ ] **Step 3: 定义 User 模型**

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?   // 邮箱密码登录
  role          UserRole  @default(USER)
  locale        String    @default("zh-CN")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  favorites     Favorite[]
  comments      Comment[]

  @@index([email])
}
```

- [ ] **Step 4: 定义 Favorite 模型**

```prisma
model Favorite {
  id         String       @id @default(cuid())
  userId     String
  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  targetType FavoriteType
  targetId   String
  createdAt  DateTime     @default(now())

  @@unique([userId, targetType, targetId])
  @@index([userId])
  @@index([targetType, targetId])
}
```

- [ ] **Step 5: 定义 Comment 模型**

```prisma
model Comment {
  id         String            @id @default(cuid())
  userId     String
  user       User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  targetType CommentTargetType
  targetId   String
  content    String            @db.Text
  parentId   String?
  parent     Comment?          @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies    Comment[]         @relation("CommentReplies")
  likes      Int               @default(0)
  createdAt  DateTime          @default(now())
  updatedAt  DateTime          @updatedAt

  @@index([userId])
  @@index([targetType, targetId])
  @@index([parentId])
}
```

- [ ] **Step 6: 验证完整 Schema**

```bash
pnpm prisma validate
```

- [ ] **Step 7: 生成 Prisma Client**

```bash
pnpm prisma generate
```

- [ ] **Step 8: 提交用户系统模型**

```bash
git add prisma/schema.prisma
git commit -m "feat: add user system models (User, Account, Session, Favorite, Comment)"
```

---

## Task 4: 创建数据库工具函数

**Files:**
- Create: `lib/db/prisma.ts`
- Create: `lib/db/index.ts`

- [ ] **Step 1: 创建 Prisma 客户端单例**

创建 `lib/db/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 2: 创建导出文件**

创建 `lib/db/index.ts`:
```typescript
export { prisma } from './prisma';
export * from '@prisma/client';
```

- [ ] **Step 3: 提交数据库工具**

```bash
git add lib/db/
git commit -m "feat: add Prisma client singleton and database utilities"
```

---

## Task 5: 创建种子数据脚本

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json`

- [ ] **Step 1: 安装 ts-node**

```bash
pnpm add -D ts-node
```

- [ ] **Step 2: 创建种子数据脚本**

创建 `prisma/seed.ts`:
```typescript
import { PrismaClient, RocketStatus, LaunchSiteStatus, LaunchStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 创建示例火箭
  const falcon9 = await prisma.rocket.upsert({
    where: { id: 'falcon-9' },
    update: {},
    create: {
      id: 'falcon-9',
      name: 'Falcon 9',
      manufacturer: 'SpaceX',
      country: 'USA',
      height: 70,
      diameter: 3.7,
      mass: 549,
      payloadToLEO: 22.8,
      payloadToGTO: 8.3,
      stages: 2,
      firstFlight: new Date('2010-06-04'),
      status: RocketStatus.ACTIVE,
      successRate: 98.5,
      description: 'Falcon 9 is a reusable, two-stage rocket designed and manufactured by SpaceX.',
      images: ['https://example.com/falcon9.jpg'],
    },
  });

  const longMarch5 = await prisma.rocket.upsert({
    where: { id: 'long-march-5' },
    update: {},
    create: {
      id: 'long-march-5',
      name: '长征五号',
      manufacturer: 'CASC',
      country: 'China',
      height: 56.97,
      diameter: 5,
      mass: 867,
      payloadToLEO: 25,
      payloadToGTO: 14,
      stages: 2,
      firstFlight: new Date('2016-11-03'),
      status: RocketStatus.ACTIVE,
      successRate: 85.7,
      description: '长征五号是中国研制的新一代大型运载火箭。',
      images: ['https://example.com/cz5.jpg'],
    },
  });

  // 创建示例发射场
  const ksc = await prisma.launchSite.upsert({
    where: { id: 'ksc-lc39a' },
    update: {},
    create: {
      id: 'ksc-lc39a',
      name: 'Kennedy Space Center LC-39A',
      country: 'USA',
      region: 'Florida',
      latitude: 28.6083,
      longitude: -80.6041,
      operator: 'SpaceX',
      status: LaunchSiteStatus.ACTIVE,
      pads: [{ name: 'LC-39A', status: 'active' }],
      description: 'Launch Complex 39A at Kennedy Space Center.',
    },
  });

  const wenchang = await prisma.launchSite.upsert({
    where: { id: 'wenchang' },
    update: {},
    create: {
      id: 'wenchang',
      name: '文昌航天发射场',
      country: 'China',
      region: 'Hainan',
      latitude: 19.6145,
      longitude: 110.9510,
      operator: 'CNSA',
      status: LaunchSiteStatus.ACTIVE,
      pads: [{ name: 'LC-1', status: 'active' }, { name: 'LC-2', status: 'active' }],
      description: '中国文昌航天发射场，位于海南省。',
    },
  });

  // 创建示例发射
  await prisma.launch.upsert({
    where: { id: 'starlink-mission-1' },
    update: {},
    create: {
      id: 'starlink-mission-1',
      name: 'Starlink Group 6-1',
      date: new Date('2024-01-15'),
      status: LaunchStatus.SUCCESS,
      missionDescription: 'SpaceX Starlink satellite deployment mission.',
      payloads: [{ name: 'Starlink satellites', count: 23, type: 'satellite' }],
      videoUrl: 'https://youtube.com/watch?v=example',
      images: [],
      rocketId: falcon9.id,
      launchSiteId: ksc.id,
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 3: 配置 package.json**

在 `package.json` 中添加:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

- [ ] **Step 4: 提交种子脚本**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add database seed script with sample data"
```

---

## Phase 2 完成检查

- [ ] 所有核心航天数据模型已定义
- [ ] 所有产业链数据模型已定义
- [ ] 用户系统模型已定义
- [ ] Prisma Client 生成成功
- [ ] 数据库工具函数创建完成
- [ ] 种子数据脚本创建完成
- [ ] Schema 验证通过
