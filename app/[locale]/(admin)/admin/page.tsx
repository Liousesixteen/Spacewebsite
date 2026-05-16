import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { prisma } from '@/lib/db';
import {
  Rocket,
  Satellite,
  Users2,
  Building2,
  Cpu,
  UserCog,
  MessageSquare,
  Heart,
  Plus,
  ArrowRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const [
    launches,
    spacecraft,
    astronauts,
    companies,
    technologies,
    users,
    comments,
    favorites,
    recentLaunches,
    recentUsers,
  ] = await Promise.all([
    prisma.launch.count(),
    prisma.spacecraft.count(),
    prisma.astronaut.count(),
    prisma.company.count(),
    prisma.technology.count(),
    prisma.user.count(),
    prisma.comment.count(),
    prisma.favorite.count(),
    prisma.launch.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        date: true,
        status: true,
        rocket: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);
  return {
    counts: { launches, spacecraft, astronauts, companies, technologies, users, comments, favorites },
    recentLaunches,
    recentUsers,
  };
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  const { counts, recentLaunches, recentUsers } = await getDashboardData();

  const stats = [
    { label: '发射任务', value: counts.launches, href: `/${locale}/admin/launches`, icon: Rocket, color: 'text-cosmic-blue' },
    { label: '航天器', value: counts.spacecraft, href: `/${locale}/admin/spacecraft`, icon: Satellite, color: 'text-cyan-400' },
    { label: '宇航员', value: counts.astronauts, href: `/${locale}/admin/astronauts`, icon: Users2, color: 'text-purple-400' },
    { label: '企业', value: counts.companies, href: `/${locale}/admin/companies`, icon: Building2, color: 'text-amber-400' },
    { label: '技术', value: counts.technologies, href: `/${locale}/admin/technologies`, icon: Cpu, color: 'text-emerald-400' },
    { label: '用户', value: counts.users, href: `/${locale}/admin/users`, icon: UserCog, color: 'text-pink-400' },
    { label: '评论', value: counts.comments, href: `/${locale}/admin/comments`, icon: MessageSquare, color: 'text-orange-400' },
    { label: '收藏', value: counts.favorites, href: `/${locale}/admin/users`, icon: Heart, color: 'text-red-400' },
  ];

  const quickActions = [
    { label: '新建发射任务', href: `/${locale}/admin/launches/new` },
    { label: '新建航天器', href: `/${locale}/admin/spacecraft/new` },
    { label: '新建宇航员', href: `/${locale}/admin/astronauts/new` },
    { label: '新建企业', href: `/${locale}/admin/companies/new` },
    { label: '新建技术', href: `/${locale}/admin/technologies/new` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">仪表盘</h1>
          <p className="text-sm text-star-dim mt-1">数据概览和快捷操作</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card className="hover:border-cosmic-blue/40 transition-colors h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-star-dim uppercase tracking-wider">{s.label}</p>
                      <p className="text-3xl font-bold text-white mt-2">{s.value.toLocaleString()}</p>
                    </div>
                    <Icon className={`w-7 h-7 ${s.color}`} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-space-600 bg-space-800 text-sm text-white hover:border-cosmic-blue/50 hover:bg-space-700 transition-colors"
              >
                <Plus className="w-4 h-4 text-cosmic-blue" />
                {q.label}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>最近添加的发射</CardTitle>
            <Link
              href={`/${locale}/admin/launches`}
              className="text-xs text-cosmic-blue hover:underline inline-flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-space-700">
              {recentLaunches.length === 0 && (
                <li className="px-5 py-4 text-sm text-star-dim">暂无数据</li>
              )}
              {recentLaunches.map((l) => (
                <li key={l.id} className="px-5 py-3">
                  <Link
                    href={`/${locale}/admin/launches/${l.id}/edit`}
                    className="flex items-center justify-between gap-3 hover:bg-space-800/50 -mx-5 px-5 py-1 rounded"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{l.name}</p>
                      <p className="text-xs text-star-dim truncate">
                        {l.rocket?.name ?? '—'} · {format(new Date(l.date), 'yyyy-MM-dd')}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-space-700 text-star-dim">
                      {l.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>最近注册的用户</CardTitle>
            <Link
              href={`/${locale}/admin/users`}
              className="text-xs text-cosmic-blue hover:underline inline-flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-space-700">
              {recentUsers.length === 0 && (
                <li className="px-5 py-4 text-sm text-star-dim">暂无数据</li>
              )}
              {recentUsers.map((u) => (
                <li key={u.id} className="px-5 py-3 flex items-center gap-3">
                  {u.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.image} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cosmic-blue/20 border border-cosmic-blue/40 flex items-center justify-center text-xs text-cosmic-blue">
                      {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">{u.name || '—'}</p>
                    <p className="text-xs text-star-dim truncate">{u.email}</p>
                  </div>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-space-700 text-star-dim">
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
