import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function ProfileInfoPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [favoritesCount, commentsCount, user] = await Promise.all([
    prisma.favorite.count({ where: { userId: session.user.id } }),
    prisma.comment.count({ where: { userId: session.user.id } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { locale: true, role: true },
    }),
  ]);

  const stats = [
    { label: '收藏数', value: favoritesCount },
    { label: '评论数', value: commentsCount },
    { label: '语言偏好', value: user?.locale || 'zh-CN' },
    { label: '账户类型', value: user?.role === 'ADMIN' ? '管理员' : '普通用户' },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-star-white mb-4">基本信息</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-4 bg-space-700 rounded-lg border border-space-600"
          >
            <div className="text-xs text-star-dim">{s.label}</div>
            <div className="mt-1 text-xl font-semibold text-star-white">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
