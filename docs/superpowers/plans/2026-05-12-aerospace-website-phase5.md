# Phase 5: 航天器与宇航员模块

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现航天器和宇航员的完整功能：列表、详情、筛选

**Architecture:** Next.js App Router 页面，Prisma 数据访问

**Tech Stack:** Next.js, Prisma, React Query

---

## Task 1: 创建航天器 API

**Files:**
- Create: `app/api/spacecraft/route.ts`
- Create: `app/api/spacecraft/[id]/route.ts`
- Create: `lib/api/spacecraft.ts`

- [ ] **Step 1: 创建列表和详情 API**

- [ ] **Step 2: 创建客户端 API 函数**

- [ ] **Step 3: 提交**

```bash
git add app/api/spacecraft/ lib/api/spacecraft.ts
git commit -m "feat: add spacecraft API endpoints"
```

---

## Task 2: 创建航天器页面

**Files:**
- Create: `app/[locale]/(main)/spacecraft/page.tsx`
- Create: `app/[locale]/(main)/spacecraft/[id]/page.tsx`
- Create: `components/spacecraft/spacecraft-card.tsx`

- [ ] **Step 1: 创建航天器卡片组件**

- [ ] **Step 2: 创建列表页面（含筛选：类型、状态、运营方）**

- [ ] **Step 3: 创建详情页面**

- [ ] **Step 4: 提交**

```bash
git add app/[locale]/(main)/spacecraft/ components/spacecraft/
git commit -m "feat: add spacecraft list and detail pages"
```

---

## Task 3: 创建宇航员 API

**Files:**
- Create: `app/api/astronauts/route.ts`
- Create: `app/api/astronauts/[id]/route.ts`
- Create: `lib/api/astronauts.ts`

- [ ] **Step 1: 创建列表和详情 API**

- [ ] **Step 2: 创建客户端 API 函数**

- [ ] **Step 3: 提交**

```bash
git add app/api/astronauts/ lib/api/astronauts.ts
git commit -m "feat: add astronauts API endpoints"
```

---

## Task 4: 创建宇航员页面

**Files:**
- Create: `app/[locale]/(main)/astronauts/page.tsx`
- Create: `app/[locale]/(main)/astronauts/[id]/page.tsx`
- Create: `components/astronauts/astronaut-card.tsx`

- [ ] **Step 1: 创建宇航员卡片组件**

- [ ] **Step 2: 创建列表页面（含筛选：国籍、机构、状态）**

- [ ] **Step 3: 创建详情页面（含任务经历、太空时间统计）**

- [ ] **Step 4: 提交**

```bash
git add app/[locale]/(main)/astronauts/ components/astronauts/
git commit -m "feat: add astronauts list and detail pages"
```

---

## Phase 5 完成检查

- [ ] 航天器 API 创建完成
- [ ] 航天器列表页面创建完成
- [ ] 航天器详情页面创建完成
- [ ] 宇航员 API 创建完成
- [ ] 宇航员列表页面创建完成
- [ ] 宇航员详情页面创建完成
- [ ] 筛选功能正常
