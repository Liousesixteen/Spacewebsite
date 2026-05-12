# Phase 9: 首页与整合

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现沉浸式首页，整合所有模块，完成最终优化

**Architecture:** Next.js App Router，沉浸式太空风格设计

**Tech Stack:** Next.js, Tailwind CSS, ECharts, React Three Fiber

---

## Task 1: 创建首页组件

**Files:**
- Create: `components/home/hero-section.tsx`
- Create: `components/home/launch-countdown.tsx`
- Create: `components/home/stats-overview.tsx`
- Create: `components/home/recent-launches.tsx`
- Create: `components/home/quick-nav.tsx`

- [ ] **Step 1: 创建 Hero 区域（沉浸式太空背景、标题动画）**

- [ ] **Step 2: 创建发射倒计时组件**

- [ ] **Step 3: 创建数据统计概览组件**

- [ ] **Step 4: 创建最新发射动态组件**

- [ ] **Step 5: 创建快速导航入口组件**

- [ ] **Step 6: 提交**

```bash
git add components/home/
git commit -m "feat: add homepage components"
```

---

## Task 2: 创建首页

**Files:**
- Modify: `app/[locale]/(main)/page.tsx`

- [ ] **Step 1: 集成所有首页组件**

- [ ] **Step 2: 添加数据获取逻辑**

- [ ] **Step 3: 提交**

```bash
git add app/[locale]/(main)/page.tsx
git commit -m "feat: implement immersive homepage"
```

---

## Task 3: 配置 React Query Provider

**Files:**
- Create: `components/providers/query-provider.tsx`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: 创建 React Query Provider**

- [ ] **Step 2: 集成到根布局**

- [ ] **Step 3: 提交**

```bash
git add components/providers/ app/[locale]/layout.tsx
git commit -m "feat: add React Query provider"
```

---

## Task 4: 添加翻译文件

**Files:**
- Modify: `public/locales/zh-CN/common.json`
- Modify: `public/locales/en/common.json`
- Create: `public/locales/ru/common.json`
- Create: `public/locales/ja/common.json`

- [ ] **Step 1: 完善中文翻译**

- [ ] **Step 2: 完善英文翻译**

- [ ] **Step 3: 添加俄语翻译**

- [ ] **Step 4: 添加日语翻译**

- [ ] **Step 5: 提交**

```bash
git add public/locales/
git commit -m "feat: add complete translations for all locales"
```

---

## Task 5: SEO 和元数据优化

**Files:**
- Create: `app/[locale]/(main)/launches/metadata.ts`
- Create: `app/[locale]/(main)/spacecraft/metadata.ts`
- Create: `app/[locale]/(main)/astronauts/metadata.ts`
- Create: `app/[locale]/(main)/industry/metadata.ts`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: 为各页面添加动态元数据**

- [ ] **Step 2: 添加 Open Graph 和 Twitter Card**

- [ ] **Step 3: 提交**

```bash
git add app/[locale]/
git commit -m "feat: add SEO metadata for all pages"
```

---

## Task 6: 最终测试和优化

**Files:**
- Various

- [ ] **Step 1: 运行开发服务器，测试所有页面**

```bash
pnpm dev
```

- [ ] **Step 2: 检查响应式设计（桌面、平板、手机）**

- [ ] **Step 3: 检查国际化切换**

- [ ] **Step 4: 检查 3D 场景性能**

- [ ] **Step 5: 修复发现的问题**

- [ ] **Step 6: 最终提交**

```bash
git add .
git commit -m "chore: final polish and bug fixes"
```

---

## Phase 9 完成检查

- [ ] 首页沉浸式设计完成
- [ ] 发射倒计时正常
- [ ] 数据统计概览正常
- [ ] 快速导航正常
- [ ] React Query Provider 配置完成
- [ ] 所有语言翻译完成
- [ ] SEO 元数据配置完成
- [ ] 响应式设计正常
- [ ] 所有页面可访问
