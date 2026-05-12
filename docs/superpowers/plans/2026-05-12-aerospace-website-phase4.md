# Phase 4: 发射数据模块

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现发射数据的完整功能：列表、详情、筛选、统计图表

**Architecture:** Next.js App Router 页面，Prisma 数据访问，ECharts 图表

**Tech Stack:** Next.js, Prisma, ECharts, React Query

---

## Task 1: 创建发射数据 API

**Files:**
- Create: `app/api/launches/route.ts`
- Create: `app/api/launches/[id]/route.ts`
- Create: `app/api/launches/stats/route.ts`
- Create: `lib/api/launches.ts`

- [ ] **Step 1: 创建列表 API**

创建 `app/api/launches/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  const country = searchParams.get('country');
  const year = searchParams.get('year');

  const where: any = {};
  if (status) where.status = status;
  if (country) where.rocket = { country };
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${parseInt(year) + 1}-01-01`);
    where.date = { gte: startDate, lt: endDate };
  }

  const [launches, total] = await Promise.all([
    prisma.launch.findMany({
      where,
      include: {
        rocket: { select: { id: true, name: true, country: true } },
        launchSite: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.launch.count({ where }),
  ]);

  return NextResponse.json({
    data: launches,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

- [ ] **Step 2: 创建详情 API**

创建 `app/api/launches/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const launch = await prisma.launch.findUnique({
    where: { id: params.id },
    include: {
      rocket: true,
      launchSite: true,
      crews: {
        include: { astronaut: true },
      },
    },
  });

  if (!launch) {
    return NextResponse.json({ error: 'Launch not found' }, { status: 404 });
  }

  return NextResponse.json(launch);
}
```

- [ ] **Step 3: 创建统计 API**

创建 `app/api/launches/stats/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const [byYear, byCountry, byStatus, total] = await Promise.all([
    prisma.$queryRaw`
      SELECT EXTRACT(YEAR FROM date) as year, COUNT(*) as count
      FROM "Launch"
      GROUP BY EXTRACT(YEAR FROM date)
      ORDER BY year
    `,
    prisma.$queryRaw`
      SELECT r.country, COUNT(*) as count
      FROM "Launch" l
      JOIN "Rocket" r ON l."rocketId" = r.id
      GROUP BY r.country
      ORDER BY count DESC
    `,
    prisma.launch.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.launch.count(),
  ]);

  return NextResponse.json({
    byYear,
    byCountry,
    byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
    total,
  });
}
```

- [ ] **Step 4: 创建客户端 API 函数**

创建 `lib/api/launches.ts`:
```typescript
export interface Launch {
  id: string;
  name: string;
  date: string;
  status: string;
  missionDescription: string;
  payloads: any;
  videoUrl?: string;
  images: string[];
  rocket: { id: string; name: string; country: string };
  launchSite: { id: string; name: string };
}

export interface LaunchListResponse {
  data: Launch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getLaunches(params?: {
  page?: number;
  limit?: number;
  status?: string;
  country?: string;
  year?: string;
}): Promise<LaunchListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.status) searchParams.set('status', params.status);
  if (params?.country) searchParams.set('country', params.country);
  if (params?.year) searchParams.set('year', params.year);

  const res = await fetch(`/api/launches?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch launches');
  return res.json();
}

export async function getLaunch(id: string): Promise<Launch> {
  const res = await fetch(`/api/launches/${id}`);
  if (!res.ok) throw new Error('Failed to fetch launch');
  return res.json();
}

export async function getLaunchStats() {
  const res = await fetch('/api/launches/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}
```

- [ ] **Step 5: 提交 API**

```bash
git add app/api/launches/ lib/api/launches.ts
git commit -m "feat: add launches API endpoints and client functions"
```

---

## Task 2: 创建发射列表页面

**Files:**
- Create: `app/[locale]/(main)/launches/page.tsx`
- Create: `components/launches/launch-card.tsx`
- Create: `components/launches/launch-filters.tsx`

- [ ] **Step 1: 创建发射卡片组件**

创建 `components/launches/launch-card.tsx`:
```typescript
import Link from 'next/link';
import { format } from 'date-fns';
import { Rocket, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Launch } from '@/lib/api/launches';

const statusColors = {
  SUCCESS: 'success',
  FAILURE: 'error',
  PLANNED: 'info',
  POSTPONED: 'warning',
  IN_FLIGHT: 'info',
} as const;

const statusLabels = {
  SUCCESS: '成功',
  FAILURE: '失败',
  PLANNED: '计划中',
  POSTPONED: '推迟',
  IN_FLIGHT: '飞行中',
} as const;

interface LaunchCardProps {
  launch: Launch;
  locale: string;
}

export function LaunchCard({ launch, locale }: LaunchCardProps) {
  return (
    <Link href={`/${locale}/launches/${launch.id}`}>
      <Card variant="glow" className="h-full cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-white line-clamp-2">
              {launch.name}
            </h3>
            <Badge variant={statusColors[launch.status as keyof typeof statusColors] || 'default'}>
              {statusLabels[launch.status as keyof typeof statusLabels] || launch.status}
            </Badge>
          </div>

          <div className="space-y-2 text-sm text-star-dim">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(launch.date), 'yyyy-MM-dd HH:mm')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              <span>{launch.rocket.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{launch.launchSite.name}</span>
            </div>
          </div>

          <p className="mt-4 text-sm text-star-dim line-clamp-2">
            {launch.missionDescription}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 2: 创建筛选组件**

创建 `components/launches/launch-filters.tsx`:
```typescript
'use client';

import { Input, Button } from '@/components/ui';

interface LaunchFiltersProps {
  filters: {
    status?: string;
    country?: string;
    year?: string;
  };
  onFilterChange: (filters: any) => void;
}

export function LaunchFilters({ filters, onFilterChange }: LaunchFiltersProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-space-800 rounded-xl border border-space-600">
      <select
        value={filters.status || ''}
        onChange={(e) => onFilterChange({ ...filters, status: e.target.value || undefined })}
        className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-white"
      >
        <option value="">全部状态</option>
        <option value="SUCCESS">成功</option>
        <option value="FAILURE">失败</option>
        <option value="PLANNED">计划中</option>
        <option value="POSTPONED">推迟</option>
      </select>

      <select
        value={filters.country || ''}
        onChange={(e) => onFilterChange({ ...filters, country: e.target.value || undefined })}
        className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-white"
      >
        <option value="">全部国家</option>
        <option value="USA">美国</option>
        <option value="China">中国</option>
        <option value="Russia">俄罗斯</option>
        <option value="Europe">欧洲</option>
        <option value="Japan">日本</option>
        <option value="India">印度</option>
      </select>

      <select
        value={filters.year || ''}
        onChange={(e) => onFilterChange({ ...filters, year: e.target.value || undefined })}
        className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-white"
      >
        <option value="">全部年份</option>
        {years.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>

      <Button
        variant="ghost"
        onClick={() => onFilterChange({})}
      >
        重置
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: 创建发射列表页面**

创建 `app/[locale]/(main)/launches/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Rocket } from 'lucide-react';
import { getLaunches } from '@/lib/api/launches';
import { LaunchCard } from '@/components/launches/launch-card';
import { LaunchFilters } from '@/components/launches/launch-filters';
import { Button } from '@/components/ui';

export default function LaunchesPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    status?: string;
    country?: string;
    year?: string;
  }>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['launches', page, filters],
    queryFn: () => getLaunches({ page, limit: 12, ...filters }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Rocket className="w-8 h-8 text-cosmic-blue" />
        <h1 className="text-3xl font-bold text-white">发射数据</h1>
      </div>

      <LaunchFilters filters={filters} onFilterChange={setFilters} />

      {isLoading && (
        <div className="text-center py-12 text-star-dim">加载中...</div>
      )}

      {error && (
        <div className="text-center py-12 text-red-400">加载失败</div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {data.data.map((launch) => (
              <LaunchCard key={launch.id} launch={launch} locale={locale} />
            ))}
          </div>

          {data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                上一页
              </Button>
              <span className="px-4 py-2 text-star-dim">
                {page} / {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === data.pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 提交列表页面**

```bash
git add app/[locale]/(main)/launches/ components/launches/
git commit -m "feat: add launches list page with filters and pagination"
```

---

## Task 3: 创建发射详情页面

**Files:**
- Create: `app/[locale]/(main)/launches/[id]/page.tsx`

- [ ] **Step 1: 创建详情页面**

创建 `app/[locale]/(main)/launches/[id]/page.tsx`:
```typescript
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Rocket, MapPin, Calendar, Users, Video, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent, Badge, Button } from '@/components/ui';

const statusColors = {
  SUCCESS: 'success',
  FAILURE: 'error',
  PLANNED: 'info',
  POSTPONED: 'warning',
  IN_FLIGHT: 'info',
} as const;

export default async function LaunchDetailPage({
  params: { locale, id }
}: {
  params: { locale: string; id: string }
}) {
  const launch = await prisma.launch.findUnique({
    where: { id },
    include: {
      rocket: true,
      launchSite: true,
      crews: { include: { astronaut: true } },
    },
  });

  if (!launch) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href={`/${locale}/launches`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </Button>
      </Link>

      <div className="flex items-start justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">{launch.name}</h1>
        <Badge variant={statusColors[launch.status as keyof typeof statusColors] || 'default'} className="text-base px-4 py-1">
          {launch.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">发射信息</h2>
            <div className="space-y-3 text-star-dim">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-cosmic-blue" />
                <span>{format(new Date(launch.date), 'yyyy-MM-dd HH:mm:ss')}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-cosmic-blue" />
                <span>{launch.launchSite.name}</span>
              </div>
              {launch.videoUrl && (
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-cosmic-blue" />
                  <a href={launch.videoUrl} target="_blank" rel="noopener noreferrer" className="text-cosmic-blue hover:underline">
                    观看视频
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">火箭信息</h2>
            <Link href={`/${locale}/rockets/${launch.rocket.id}`} className="block">
              <div className="flex items-center gap-3 mb-3">
                <Rocket className="w-5 h-5 text-cosmic-blue" />
                <span className="text-white hover:text-cosmic-blue">{launch.rocket.name}</span>
              </div>
            </Link>
            <div className="text-sm text-star-dim space-y-1">
              <p>制造商: {launch.rocket.manufacturer}</p>
              <p>国家: {launch.rocket.country}</p>
              <p>成功率: {launch.rocket.successRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">任务描述</h2>
          <p className="text-star-dim leading-relaxed">{launch.missionDescription}</p>
        </CardContent>
      </Card>

      {launch.crews.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cosmic-blue" />
              机组成员
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {launch.crews.map((crew) => (
                <Link key={crew.id} href={`/${locale}/astronauts/${crew.astronaut.id}`}>
                  <div className="text-center p-4 bg-space-700 rounded-lg hover:bg-space-600 transition-colors">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-space-600 flex items-center justify-center">
                      {crew.astronaut.photo ? (
                        <img src={crew.astronaut.photo} alt={crew.astronaut.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Users className="w-8 h-8 text-star-dim" />
                      )}
                    </div>
                    <p className="text-white text-sm">{crew.astronaut.name}</p>
                    <p className="text-star-dim text-xs">{crew.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {Array.isArray(launch.payloads) && launch.payloads.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">载荷信息</h2>
            <div className="space-y-2">
              {(launch.payloads as any[]).map((payload, index) => (
                <div key={index} className="flex justify-between p-3 bg-space-700 rounded-lg">
                  <span className="text-white">{payload.name}</span>
                  <span className="text-star-dim">{payload.type}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 提交详情页面**

```bash
git add app/[locale]/(main)/launches/[id]/
git commit -m "feat: add launch detail page"
```

---

## Task 4: 创建发射统计图表

**Files:**
- Create: `components/charts/launch-stats-chart.tsx`
- Create: `app/[locale]/(main)/launches/stats/page.tsx`

- [ ] **Step 1: 创建统计图表组件**

创建 `components/charts/launch-stats-chart.tsx`:
```typescript
'use client';

import ReactECharts from 'echarts-for-react';

interface LaunchStatsChartProps {
  data: {
    byYear: { year: number; count: number }[];
    byCountry: { country: string; count: number }[];
    byStatus: { status: string; count: number }[];
    total: number;
  };
}

export function LaunchStatsChart({ data }: LaunchStatsChartProps) {
  const yearOption = {
    backgroundColor: 'transparent',
    title: { text: '年度发射趋势', textStyle: { color: '#fff' } },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.byYear.map(d => d.year),
      axisLine: { lineStyle: { color: '#353550' } },
      axisLabel: { color: '#a1a1aa' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#353550' } },
      axisLabel: { color: '#a1a1aa' },
      splitLine: { lineStyle: { color: '#252535' } },
    },
    series: [{
      data: data.byYear.map(d => d.count),
      type: 'line',
      smooth: true,
      lineStyle: { color: '#4f8fff', width: 3 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(79, 143, 255, 0.4)' },
            { offset: 1, color: 'rgba(79, 143, 255, 0)' },
          ],
        },
      },
    }],
  };

  const countryOption = {
    backgroundColor: 'transparent',
    title: { text: '各国发射占比', textStyle: { color: '#fff' } },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: data.byCountry.map(d => ({ name: d.country, value: d.count })),
      label: { color: '#a1a1aa' },
      itemStyle: {
        borderColor: '#0a0a0f',
        borderWidth: 2,
      },
    }],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-space-800 rounded-xl p-6 border border-space-600">
        <ReactECharts option={yearOption} style={{ height: 300 }} />
      </div>
      <div className="bg-space-800 rounded-xl p-6 border border-space-600">
        <ReactECharts option={countryOption} style={{ height: 300 }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建统计页面**

创建 `app/[locale]/(main)/launches/stats/page.tsx`:
```typescript
import { BarChart3 } from 'lucide-react';
import { prisma } from '@/lib/db';
import { LaunchStatsChart } from '@/components/charts/launch-stats-chart';
import { Card, CardContent } from '@/components/ui';

export default async function LaunchStatsPage() {
  const [byYear, byCountry, byStatus, total] = await Promise.all([
    prisma.$queryRaw<{ year: number; count: bigint }[]>`
      SELECT EXTRACT(YEAR FROM date)::int as year, COUNT(*)::int as count
      FROM "Launch"
      GROUP BY EXTRACT(YEAR FROM date)
      ORDER BY year
    `,
    prisma.$queryRaw<{ country: string; count: bigint }[]>`
      SELECT r.country, COUNT(*)::int as count
      FROM "Launch" l
      JOIN "Rocket" r ON l."rocketId" = r.id
      GROUP BY r.country
      ORDER BY count DESC
      LIMIT 10
    `,
    prisma.launch.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.launch.count(),
  ]);

  const statsData = {
    byYear: byYear.map(d => ({ year: d.year, count: Number(d.count) })),
    byCountry: byCountry.map(d => ({ country: d.country, count: Number(d.count) })),
    byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
    total,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="w-8 h-8 text-cosmic-blue" />
        <h1 className="text-3xl font-bold text-white">发射统计</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-cosmic-blue">{total}</p>
            <p className="text-star-dim mt-2">总发射数</p>
          </CardContent>
        </Card>
        {statsData.byStatus.slice(0, 3).map((s) => (
          <Card key={s.status}>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-white">{s.count}</p>
              <p className="text-star-dim mt-2">{s.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <LaunchStatsChart data={statsData} />
    </div>
  );
}
```

- [ ] **Step 3: 提交统计页面**

```bash
git add components/charts/ app/[locale]/(main)/launches/stats/
git commit -m "feat: add launch statistics page with ECharts"
```

---

## Phase 4 完成检查

- [ ] 发射列表 API 创建完成
- [ ] 发射详情 API 创建完成
- [ ] 发射统计 API 创建完成
- [ ] 发射列表页面创建完成
- [ ] 发射筛选功能正常
- [ ] 发射详情页面创建完成
- [ ] 发射统计图表创建完成
- [ ] 分页功能正常
