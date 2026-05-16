import { format } from 'date-fns';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/admin';
import { Card, CardContent } from '@/components/ui';
import { SearchBox } from '@/components/admin/search-box';
import { Pagination } from '@/components/admin/pagination';
import { ToggleRoleButton } from '@/components/admin/toggle-role-button';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 20;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function AdminUsersPage({ searchParams }: Props) {
  const admin = await requireAdmin(); // ensure admin and capture self id
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);

  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        locale: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('page', String(p));
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">用户管理</h1>
          <p className="text-sm text-star-dim mt-1">共 {total} 个用户</p>
        </div>
        <SearchBox placeholder="按姓名/邮箱..." />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-space-700 text-star-dim text-xs uppercase tracking-wider">
                  <th className="px-5 py-3">用户</th>
                  <th className="px-5 py-3">邮箱</th>
                  <th className="px-5 py-3">角色</th>
                  <th className="px-5 py-3">语言</th>
                  <th className="px-5 py-3">注册时间</th>
                  <th className="px-5 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-star-dim">
                      暂无数据
                    </td>
                  </tr>
                )}
                {items.map((u) => (
                  <tr key={u.id} className="border-b border-space-700/60 hover:bg-space-800/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {u.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.image} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-cosmic-blue/20 border border-cosmic-blue/40 flex items-center justify-center text-xs text-cosmic-blue">
                            {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-white truncate max-w-[160px]">
                          {u.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-star-dim">{u.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-cosmic-blue/20 text-cosmic-blue'
                            : 'bg-space-700 text-star-dim'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-star-dim">{u.locale}</td>
                    <td className="px-5 py-3 text-star-dim">
                      {format(new Date(u.createdAt), 'yyyy-MM-dd')}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <ToggleRoleButton
                        userId={u.id}
                        currentRole={u.role}
                        isSelf={u.id === admin.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
