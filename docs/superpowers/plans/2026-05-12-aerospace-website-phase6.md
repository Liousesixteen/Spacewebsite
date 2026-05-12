# Phase 6: 产业链模块

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现航天产业链的完整功能：产业全景、企业库、技术库、材料库、设备库

**Architecture:** Next.js App Router 页面，Prisma 数据访问，交互式产业链图

**Tech Stack:** Next.js, Prisma, React Query

---

## Task 1: 创建产业链 API

**Files:**
- Create: `app/api/industry/segments/route.ts`
- Create: `app/api/industry/companies/route.ts`
- Create: `app/api/industry/companies/[id]/route.ts`
- Create: `app/api/industry/technologies/route.ts`
- Create: `app/api/industry/materials/route.ts`
- Create: `app/api/industry/equipment/route.ts`
- Create: `lib/api/industry.ts`

- [ ] **Step 1: 创建产业环节 API**

- [ ] **Step 2: 创建企业 API（列表、详情、筛选）**

- [ ] **Step 3: 创建技术、材料、设备 API**

- [ ] **Step 4: 创建客户端 API 函数**

- [ ] **Step 5: 提交**

```bash
git add app/api/industry/ lib/api/industry.ts
git commit -m "feat: add industry chain API endpoints"
```

---

## Task 2: 创建产业全景页面

**Files:**
- Create: `app/[locale]/(main)/industry/page.tsx`
- Create: `components/industry/industry-chain-diagram.tsx`
- Create: `components/industry/market-stats.tsx`

- [ ] **Step 1: 创建产业链图组件（可交互，点击进入各环节）**

- [ ] **Step 2: 创建市场统计组件**

- [ ] **Step 3: 创建产业全景页面**

- [ ] **Step 4: 提交**

```bash
git add app/[locale]/(main)/industry/page.tsx components/industry/
git commit -m "feat: add industry overview page with interactive diagram"
```

---

## Task 3: 创建企业库页面

**Files:**
- Create: `app/[locale]/(main)/industry/companies/page.tsx`
- Create: `app/[locale]/(main)/industry/companies/[id]/page.tsx`
- Create: `components/industry/company-card.tsx`

- [ ] **Step 1: 创建企业卡片组件**

- [ ] **Step 2: 创建企业列表页面（筛选：国家、类型、产业环节）**

- [ ] **Step 3: 创建企业详情页面（基本信息、产品、成就、财务数据）**

- [ ] **Step 4: 提交**

```bash
git add app/[locale]/(main)/industry/companies/ components/industry/company-card.tsx
git commit -m "feat: add company list and detail pages"
```

---

## Task 4: 创建技术库页面

**Files:**
- Create: `app/[locale]/(main)/industry/technologies/page.tsx`
- Create: `app/[locale]/(main)/industry/technologies/[id]/page.tsx`
- Create: `components/industry/technology-card.tsx`

- [ ] **Step 1: 创建技术卡片组件**

- [ ] **Step 2: 创建技术列表页面（分类浏览、成熟度筛选）**

- [ ] **Step 3: 创建技术详情页面（原理、应用、发展历程）**

- [ ] **Step 4: 提交**

```bash
git add app/[locale]/(main)/industry/technologies/ components/industry/technology-card.tsx
git commit -m "feat: add technology list and detail pages"
```

---

## Task 5: 创建材料库和设备库页面

**Files:**
- Create: `app/[locale]/(main)/industry/materials/page.tsx`
- Create: `app/[locale]/(main)/industry/materials/[id]/page.tsx`
- Create: `app/[locale]/(main)/industry/equipment/page.tsx`
- Create: `app/[locale]/(main)/industry/equipment/[id]/page.tsx`

- [ ] **Step 1: 创建材料列表和详情页面**

- [ ] **Step 2: 创建设备列表和详情页面**

- [ ] **Step 3: 提交**

```bash
git add app/[locale]/(main)/industry/materials/ app/[locale]/(main)/industry/equipment/
git commit -m "feat: add materials and equipment pages"
```

---

## Phase 6 完成检查

- [ ] 产业链 API 创建完成
- [ ] 产业全景页面创建完成
- [ ] 产业链图可交互
- [ ] 企业库页面创建完成
- [ ] 技术库页面创建完成
- [ ] 材料库页面创建完成
- [ ] 设备库页面创建完成
