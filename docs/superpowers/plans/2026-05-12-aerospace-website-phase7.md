# Phase 7: 用户系统

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现完整的用户系统：认证、收藏、评论、个人主页

**Architecture:** NextAuth.js 认证，Prisma 数据访问

**Tech Stack:** NextAuth.js, Prisma, bcrypt

---

## Task 1: 配置 NextAuth.js

**Files:**
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `lib/auth/config.ts`
- Create: `lib/auth/index.ts`
- Modify: `.env`

- [ ] **Step 1: 创建 NextAuth 配置**

- [ ] **Step 2: 配置 GitHub 和 Google OAuth**

- [ ] **Step 3: 配置邮箱密码认证**

- [ ] **Step 4: 提交**

```bash
git add app/api/auth/ lib/auth/
git commit -m "feat: configure NextAuth.js with OAuth and credentials"
```

---

## Task 2: 创建认证页面

**Files:**
- Create: `app/[locale]/(auth)/login/page.tsx`
- Create: `app/[locale]/(auth)/register/page.tsx`
- Create: `components/auth/login-form.tsx`
- Create: `components/auth/register-form.tsx`

- [ ] **Step 1: 创建登录表单组件**

- [ ] **Step 2: 创建注册表单组件**

- [ ] **Step 3: 创建登录和注册页面**

- [ ] **Step 4: 提交**

```bash
git add app/[locale]/(auth)/ components/auth/
git commit -m "feat: add login and register pages"
```

---

## Task 3: 创建收藏功能

**Files:**
- Create: `app/api/favorites/route.ts`
- Create: `app/api/favorites/[id]/route.ts`
- Create: `components/common/favorite-button.tsx`
- Create: `lib/api/favorites.ts`

- [ ] **Step 1: 创建收藏 API（添加、删除、列表）**

- [ ] **Step 2: 创建收藏按钮组件**

- [ ] **Step 3: 集成到各详情页面**

- [ ] **Step 4: 提交**

```bash
git add app/api/favorites/ components/common/favorite-button.tsx lib/api/favorites.ts
git commit -m "feat: add favorite functionality"
```

---

## Task 4: 创建评论功能

**Files:**
- Create: `app/api/comments/route.ts`
- Create: `app/api/comments/[id]/route.ts`
- Create: `components/common/comment-section.tsx`
- Create: `components/common/comment-form.tsx`
- Create: `lib/api/comments.ts`

- [ ] **Step 1: 创建评论 API（发表、删除、列表、回复）**

- [ ] **Step 2: 创建评论区组件（含嵌套回复）**

- [ ] **Step 3: 集成到各详情页面**

- [ ] **Step 4: 提交**

```bash
git add app/api/comments/ components/common/comment-*.tsx lib/api/comments.ts
git commit -m "feat: add comment functionality with nested replies"
```

---

## Task 5: 创建个人主页

**Files:**
- Create: `app/[locale]/(auth)/profile/page.tsx`
- Create: `app/[locale]/(auth)/profile/favorites/page.tsx`
- Create: `app/[locale]/(auth)/profile/comments/page.tsx`
- Create: `app/[locale]/(auth)/profile/settings/page.tsx`
- Create: `components/profile/profile-header.tsx`
- Create: `components/profile/profile-nav.tsx`

- [ ] **Step 1: 创建个人主页布局**

- [ ] **Step 2: 创建收藏列表页面**

- [ ] **Step 3: 创建评论历史页面**

- [ ] **Step 4: 创建设置页面（头像、昵称、语言偏好）**

- [ ] **Step 5: 提交**

```bash
git add app/[locale]/(auth)/profile/ components/profile/
git commit -m "feat: add user profile pages"
```

---

## Phase 7 完成检查

- [ ] NextAuth.js 配置完成
- [ ] 登录/注册页面创建完成
- [ ] OAuth 登录正常
- [ ] 邮箱密码登录正常
- [ ] 收藏功能正常
- [ ] 评论功能正常
- [ ] 个人主页创建完成
