import Link from 'next/link';
import { format } from 'date-fns';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Heart } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { FavoriteType } from '@prisma/client';

const TYPE_LABELS: Record<FavoriteType, string> = {
  LAUNCH: '发射任务',
  ROCKET: '火箭',
  SPACECRAFT: '航天器',
  ASTRONAUT: '宇航员',
  COMPANY: '公司',
  TECHNOLOGY: '技术',
};

const TYPE_PATHS: Record<FavoriteType, (locale: string, id: string) => string> = {
  LAUNCH: (l, id) => `/${l}/launches/${id}`,
  ROCKET: (l, id) => `/${l}/rockets/${id}`,
  SPACECRAFT: (l, id) => `/${l}/spacecraft/${id}`,
  ASTRONAUT: (l, id) => `/${l}/astronauts/${id}`,
  COMPANY: (l, id) => `/${l}/industry/companies/${id}`,
  TECHNOLOGY: (l, id) => `/${l}/industry/technologies/${id}`,
};

async function resolveTitle(
  type: FavoriteType,
  id: string
): Promise<string | null> {
  switch (type) {
    case 'LAUNCH':
      return (await prisma.launch.findUnique({ where: { id }, select: { name: true } }))?.name ?? null;
    case 'ROCKET':
      return (await prisma.rocket.findUnique({ where: { id }, select: { name: true } }))?.name ?? null;
    case 'SPACECRAFT':
      return (await prisma.spacecraft.findUnique({ where: { id }, select: { name: true } }))?.name ?? null;
    case 'ASTRONAUT':
      return (await prisma.astronaut.findUnique({ where: { id }, select: { name: true } }))?.name ?? null;
    case 'COMPANY':
      return (await prisma.company.findUnique({ where: { id }, select: { name: true } }))?.name ?? null;
    case 'TECHNOLOGY':
      return (await prisma.technology.findUnique({ where: { id }, select: { name: true } }))?.name ?? null;
    default:
      return null;
  }
}

export default async function ProfileFavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  const enriched = await Promise.all(
    favorites.map(async (f) => ({
      ...f,
      title: await resolveTitle(f.targetType, f.targetId),
    }))
  );

  const grouped = enriched.reduce<Record<FavoriteType, typeof enriched>>(
    (acc, fav) => {
      (acc[fav.targetType] = acc[fav.targetType] || []).push(fav);
      return acc;
    },
    {} as Record<FavoriteType, typeof enriched>
  );

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 mx-auto text-star-dim mb-3" />
        <p className="text-star-dim">还没有收藏任何内容</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {(Object.keys(grouped) as FavoriteType[]).map((type) => (
        <section key={type}>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-lg font-semibold text-white">
              {TYPE_LABELS[type]}
            </h2>
            <Badge variant="default">{grouped[type].length}</Badge>
          </div>
          <ul className="space-y-2">
            {grouped[type].map((fav) => (
              <li key={fav.id}>
                {fav.title ? (
                  <Link
                    href={TYPE_PATHS[type](locale, fav.targetId)}
                    className="flex items-center justify-between p-3 bg-space-700 rounded-lg hover:bg-space-600 transition-colors"
                  >
                    <span className="text-white">{fav.title}</span>
                    <span className="text-xs text-star-dim">
                      {format(new Date(fav.createdAt), 'yyyy-MM-dd')}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-space-700/50 rounded-lg text-star-dim">
                    <span>已删除的内容</span>
                    <span className="text-xs">
                      {format(new Date(fav.createdAt), 'yyyy-MM-dd')}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
