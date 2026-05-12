# Phase 8: 3D 可视化

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现 3D 可视化功能：地球卫星轨道、太阳系探索

**Architecture:** React Three Fiber 3D 渲染，懒加载优化

**Tech Stack:** Three.js, React Three Fiber, @react-three/drei

---

## Task 1: 创建 3D 基础组件

**Files:**
- Create: `components/3d/scene-container.tsx`
- Create: `components/3d/earth.tsx`
- Create: `components/3d/stars-background.tsx`

- [ ] **Step 1: 创建场景容器（含 Canvas、灯光、控制器）**

- [ ] **Step 2: 创建地球模型组件**

- [ ] **Step 3: 创建 3D 星空背景**

- [ ] **Step 4: 提交**

```bash
git add components/3d/
git commit -m "feat: add 3D base components (Scene, Earth, Stars)"
```

---

## Task 2: 创建卫星轨道可视化

**Files:**
- Create: `components/3d/satellite-orbit.tsx`
- Create: `components/3d/orbit-line.tsx`
- Create: `app/[locale]/(main)/explore/satellites/page.tsx`

- [ ] **Step 1: 创建轨道线组件**

- [ ] **Step 2: 创建卫星标记组件（可点击显示详情）**

- [ ] **Step 3: 创建卫星轨道页面**

- [ ] **Step 4: 提交**

```bash
git add components/3d/satellite-*.tsx components/3d/orbit-line.tsx app/[locale]/(main)/explore/satellites/
git commit -m "feat: add satellite orbit visualization"
```

---

## Task 3: 创建太阳系探索

**Files:**
- Create: `components/3d/solar-system.tsx`
- Create: `components/3d/planet.tsx`
- Create: `app/[locale]/(main)/explore/page.tsx`
- Create: `app/[locale]/(main)/explore/solar-system/page.tsx`

- [ ] **Step 1: 创建行星组件（含轨道动画）**

- [ ] **Step 2: 创建太阳系组件**

- [ ] **Step 3: 创建探索首页和太阳系页面**

- [ ] **Step 4: 提交**

```bash
git add components/3d/solar-system.tsx components/3d/planet.tsx app/[locale]/(main)/explore/
git commit -m "feat: add solar system 3D exploration"
```

---

## Task 4: 性能优化

**Files:**
- Modify: `components/3d/scene-container.tsx`
- Create: `components/3d/lazy-3d-scene.tsx`

- [ ] **Step 1: 实现 3D 场景懒加载**

- [ ] **Step 2: 添加低端设备检测和降级**

- [ ] **Step 3: 提交**

```bash
git add components/3d/
git commit -m "perf: add lazy loading and device detection for 3D scenes"
```

---

## Phase 8 完成检查

- [ ] 3D 基础组件创建完成
- [ ] 地球模型正常显示
- [ ] 卫星轨道可视化正常
- [ ] 太阳系探索正常
- [ ] 3D 场景懒加载正常
- [ ] 低端设备降级正常
