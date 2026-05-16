import Link from 'next/link';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/db';
import { Card, CardContent, Button } from '@/components/ui';
import { SearchBox } from '@/components/admin/search-box';
import { Pagination } from '@/components/admin/pagination';
import { DeleteButton } from '@/components/admin/delete-button';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 20;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function AdminAstronautsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);

  const where: Prisma.AstronautWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { nationality: { contains: q, mode: 'insensitive' } },
          { agency: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.astronaut.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.astronaut.count({ where }),
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
          <h1 className="text-2xl font-bold text-white">宇航员</h1>
          <p className="text-sm text-star-dim mt-1">共 {total} 条记录</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBox placeholder="按姓名/国籍/机构..." />
          <Link href={`/${locale}/admin/astronauts/new`}>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              新建
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-space-700 text-star-dim text-xs uppercase tracking-wider">
                  <th className="px-5 py-3">姓名</th>
                  <th className="px-5 py-3">国籍</th>
                  <th className="px-5 py-3">机构</th>
                  <th className="px-5 py-3">出生日期</th>
                  <th className="px-5 py-3">状态</th>
                  <th className="px-5 py-3">飞行次数</th>
                  <th className="px-5 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-star-dim">
                      暂无数据
                    </td>
                  </tr>
                )}
                {items.map((a) => (
                  <tr key={a.id} className="border-b border-space-700/60 hover:bg-space-800/40">
                    <td className="px-5 py-3 text-white">{a.name}</td>
                    <td className="px-5 py-3 text-star-dim">{a.nationality}</td>
                    <td className="px-5 py-3 text-star-dim">{a.agency}</td>
                    <td className="px-5 py-3 text-star-dim">
                      {format(new Date(a.birthDate), 'yyyy-MM-dd')}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase bg-space-700 text-star-dim">
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-star-dim">{a.spaceFlights}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/${locale}/admin/astronauts/${a.id}/edit`}
                          className="px-3 py-1.5 text-xs rounded-md border border-space-600 text-white hover:border-cosmic-blue/40"
                        >
                          编辑
                        </Link>
                        <DeleteButton url={`/api/admin/astronauts/${a.id}`} small />
                      </div>
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
