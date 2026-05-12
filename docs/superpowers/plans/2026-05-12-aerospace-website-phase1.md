# Phase 1: 项目初始化与基础架构

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 Next.js 14 项目基础架构，包含 Tailwind CSS、Prisma、国际化配置

**Architecture:** Next.js 14 App Router 单体应用，PostgreSQL 数据库，next-intl 国际化

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma, next-intl, pnpm

---

## Task 1: 初始化 Next.js 项目

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`

- [ ] **Step 1: 创建 Next.js 项目**

```bash
cd /Users/ccdemac/DevProjs/Spacewebsite
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-pnpm
```

- [ ] **Step 2: 验证项目创建成功**

```bash
ls -la
cat package.json
```

Expected: 看到 package.json 包含 next, react, tailwindcss 依赖

- [ ] **Step 3: 启动开发服务器验证**

```bash
pnpm dev
```

Expected: 服务器在 http://localhost:3000 启动

- [ ] **Step 4: 提交初始化**

```bash
git add .
git commit -m "chore: initialize Next.js 14 project with TypeScript and Tailwind"
```

---

## Task 2: 配置 Prisma 数据库

**Files:**
- Create: `prisma/schema.prisma`
- Modify: `package.json`
- Create: `.env`
- Create: `.env.example`

- [ ] **Step 1: 安装 Prisma**

```bash
pnpm add prisma @prisma/client
pnpm add -D prisma
```

- [ ] **Step 2: 初始化 Prisma**

```bash
pnpm prisma init --datasource-provider postgresql
```

- [ ] **Step 3: 配置环境变量**

创建 `.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/spacewebsite?schema=public"
```

创建 `.env.example`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/spacewebsite?schema=public"
```

- [ ] **Step 4: 添加 .env 到 .gitignore**

确保 `.gitignore` 包含:
```
.env
.env.local
```

- [ ] **Step 5: 提交 Prisma 配置**

```bash
git add prisma/ .env.example .gitignore package.json pnpm-lock.yaml
git commit -m "chore: add Prisma ORM with PostgreSQL configuration"
```

---

## Task 3: 配置国际化 (next-intl)

**Files:**
- Create: `lib/i18n/config.ts`
- Create: `lib/i18n/request.ts`
- Create: `middleware.ts`
- Create: `public/locales/zh-CN/common.json`
- Create: `public/locales/en/common.json`
- Modify: `next.config.ts`

- [ ] **Step 1: 安装 next-intl**

```bash
pnpm add next-intl
```

- [ ] **Step 2: 创建国际化配置**

创建 `lib/i18n/config.ts`:
```typescript
export const locales = ['zh-CN', 'en', 'ru', 'ja'] as const;
export const defaultLocale = 'zh-CN' as const;

export type Locale = (typeof locales)[number];
```

- [ ] **Step 3: 创建请求配置**

创建 `lib/i18n/request.ts`:
```typescript
import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locales.includes(locale as any) ? locale : defaultLocale;
  
  return {
    messages: (await import(`../../public/locales/${resolvedLocale}/common.json`)).default
  };
});
```

- [ ] **Step 4: 创建中间件**

创建 `middleware.ts`:
```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export const config = {
  matcher: ['/', '/(zh-CN|en|ru|ja)/:path*']
};
```

- [ ] **Step 5: 创建翻译文件**

创建 `public/locales/zh-CN/common.json`:
```json
{
  "site": {
    "title": "航天数据网站",
    "description": "全面的航天数据平台"
  },
  "nav": {
    "home": "首页",
    "launches": "发射数据",
    "spacecraft": "航天器",
    "astronauts": "宇航员",
    "explore": "3D探索",
    "industry": "产业链"
  }
}
```

创建 `public/locales/en/common.json`:
```json
{
  "site": {
    "title": "Space Data Website",
    "description": "Comprehensive space data platform"
  },
  "nav": {
    "home": "Home",
    "launches": "Launches",
    "spacecraft": "Spacecraft",
    "astronauts": "Astronauts",
    "explore": "3D Explore",
    "industry": "Industry"
  }
}
```

- [ ] **Step 6: 更新 next.config.ts**

```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
```

- [ ] **Step 7: 提交国际化配置**

```bash
git add .
git commit -m "feat: add next-intl internationalization with zh-CN and en locales"
```

---

## Task 4: 创建基础布局结构

**Files:**
- Create: `app/[locale]/layout.tsx`
- Create: `app/[locale]/page.tsx`
- Create: `app/globals.css`
- Delete: `app/layout.tsx` (移动到 [locale])
- Delete: `app/page.tsx` (移动到 [locale])

- [ ] **Step 1: 更新全局样式**

更新 `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #0a0a0f;
  --foreground: #ffffff;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: system-ui, -apple-system, sans-serif;
}
```

- [ ] **Step 2: 创建根布局**

创建 `app/[locale]/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n/config';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Space Data Website',
  description: 'Comprehensive space data platform',
};

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: 创建首页占位**

创建 `app/[locale]/page.tsx`:
```typescript
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('site');

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-gray-400">{t('description')}</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: 删除旧文件**

```bash
rm -f app/layout.tsx app/page.tsx
```

- [ ] **Step 5: 验证应用运行**

```bash
pnpm dev
```

访问 http://localhost:3000/zh-CN 和 http://localhost:3000/en 验证国际化工作

- [ ] **Step 6: 提交布局结构**

```bash
git add .
git commit -m "feat: add locale-based routing and basic layout structure"
```

---

## Task 5: 安装核心依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装状态管理和数据请求**

```bash
pnpm add zustand @tanstack/react-query
```

- [ ] **Step 2: 安装图表和3D库**

```bash
pnpm add echarts echarts-for-react
pnpm add three @react-three/fiber @react-three/drei
pnpm add -D @types/three
```

- [ ] **Step 3: 安装认证库**

```bash
pnpm add next-auth@beta @auth/prisma-adapter
```

- [ ] **Step 4: 安装工具库**

```bash
pnpm add clsx tailwind-merge lucide-react
pnpm add date-fns
```

- [ ] **Step 5: 验证依赖安装**

```bash
pnpm list --depth=0
```

- [ ] **Step 6: 提交依赖更新**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add core dependencies (zustand, react-query, echarts, three.js, next-auth)"
```

---

## Phase 1 完成检查

- [ ] Next.js 14 项目初始化完成
- [ ] Tailwind CSS 配置完成
- [ ] Prisma 配置完成
- [ ] next-intl 国际化配置完成
- [ ] 基础布局结构创建完成
- [ ] 核心依赖安装完成
- [ ] 开发服务器可以正常启动
- [ ] 中英文切换正常工作
