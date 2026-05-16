import { format } from 'date-fns';
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui';
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

export default async function AdminCommentsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);

  const where: Prisma.CommentWhereInput = q
    ? {
        OR: [
          { content: { contains: q, mode: 'insensitive' } },
          { user: { name: { contains: q, mode: 'insensitive' } } },
          { user: { email: { contains: q, mode: 'insensitive' } } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    }),
    prisma.comment.count({ where }),
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
          <h1 className="text-2xl font-bold text-white">评论审核</h1>
          <p className="text-sm text-star-dim mt-1">共 {total} 条评论</p>
        </div>
        <SearchBox placeholder="按内容/用户..." />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-space-700 text-star-dim text-xs uppercase tracking-wider">
                  <th className="px-5 py-3">用户</th>
                  <th className="px-5 py-3">内容</th>
                  <th className="px-5 py-3">目标</th>
                  <th className="px-5 py-3">时间</th>
                  <th className="px-5 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-star-dim">
                      暂无数据
                    </td>
                  </tr>
                )}
                {items.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-space-700/60 hover:bg-space-800/40 align-top"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {c.user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.user.image} alt="" className="w-7 h-7 rounded-full" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-cosmic-blue/20 border border-cosmic-blue/40 flex items-center justify-center text-xs text-cosmic-blue">
                            {(c.user.name || c.user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white text-xs truncate max-w-[120px]">
                            {c.user.name || '—'}
                          </p>
                          <p className="text-star-dim text-[10px] truncate max-w-[140px]">
                            {c.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-star-dim max-w-md">
                      <div className="line-clamp-3 whitespace-pre-wrap">{c.content}</div>
                    </td>
                    <td className="px-5 py-3 text-star-dim text-xs">
                      <span className="inline-block px-2 py-0.5 rounded bg-space-700">
                        {c.targetType}
                      </span>
                      <p className="mt-1 truncate max-w-[140px]">{c.targetId}</p>
                    </td>
                    <td className="px-5 py-3 text-star-dim text-xs">
                      {format(new Date(c.createdAt), 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DeleteButton url={`/api/comments/${c.id}`} small />
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
