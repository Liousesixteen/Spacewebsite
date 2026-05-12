# Phase 3: 基础 UI 组件与布局

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 创建沉浸式太空风格的基础 UI 组件和全站布局

**Architecture:** Tailwind CSS 组件，深色太空主题，响应式设计

**Tech Stack:** Tailwind CSS, Lucide React, clsx, tailwind-merge

---

## Task 1: 创建工具函数

**Files:**
- Create: `lib/utils.ts`

- [ ] **Step 1: 创建 cn 工具函数**

创建 `lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: 提交**

```bash
git add lib/utils.ts
git commit -m "feat: add cn utility for className merging"
```

---

## Task 2: 配置太空主题

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: 更新 Tailwind 配置**

添加太空主题颜色和动画到 `tailwind.config.ts`

- [ ] **Step 2: 更新全局样式**

添加自定义滚动条、选中样式、工具类到 `app/globals.css`

- [ ] **Step 3: 提交**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: add space theme colors, animations, and global styles"
```

---

## Task 3: 创建基础 UI 组件

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/badge.tsx`
- Create: `components/ui/index.ts`

- [ ] **Step 1-4: 创建 Button, Card, Input, Badge 组件**

- [ ] **Step 5: 提交**

```bash
git add components/ui/
git commit -m "feat: add base UI components (Button, Card, Input, Badge)"
```

---

## Task 4: 创建星空背景组件

**Files:**
- Create: `components/layout/starfield.tsx`

- [ ] **Step 1: 创建 Canvas 星空动画**

- [ ] **Step 2: 提交**

```bash
git add components/layout/starfield.tsx
git commit -m "feat: add animated starfield background component"
```

---

## Task 5: 创建导航组件

**Files:**
- Create: `components/layout/navbar.tsx`
- Create: `components/layout/mobile-nav.tsx`
- Create: `components/layout/index.ts`

- [ ] **Step 1-3: 创建 Navbar 和 MobileNav**

- [ ] **Step 4: 提交**

```bash
git add components/layout/
git commit -m "feat: add Navbar and MobileNav components"
```

---

## Task 6: 更新根布局

**Files:**
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: 集成 Starfield 和 Navbar**

- [ ] **Step 2: 验证**

```bash
pnpm dev
```

- [ ] **Step 3: 提交**

```bash
git add app/[locale]/layout.tsx
git commit -m "feat: integrate Navbar and Starfield into root layout"
```

---

## Phase 3 完成检查

- [ ] 工具函数创建完成
- [ ] 太空主题配置完成
- [ ] UI 组件创建完成
- [ ] 星空背景组件创建完成
- [ ] 导航栏组件创建完成
- [ ] 根布局集成完成
