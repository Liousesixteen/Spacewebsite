import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { LaunchCard } from '@/components/launches/launch-card';
import { Button } from '@/components/ui';
import type { Launch } from '@/lib/api/launches';

interface RecentLaunchesProps {
  locale: string;
}

export async function RecentLaunches({ locale }: RecentLaunchesProps) {
  const t = await getTranslations('home.recentLaunches');

  let launches: Launch[] = [];
  try {
    const result = await prisma.launch.findMany({
      take: 6,
      orderBy: { date: 'desc' },
      include: {
        rocket: { select: { id: true, name: true, country: true } },
        launchSite: { select: { id: true, name: true } },
      },
    });
    launches = result.map((l) => ({
      id: l.id,
      name: l.name,
      date: l.date.toISOString(),
      status: l.status,
      missionDescription: l.missionDescription,
      payloads: l.payloads,
      videoUrl: l.videoUrl,
      images: l.images,
      rocket: l.rocket,
      launchSite: l.launchSite,
    }));
  } catch {
    launches = [];
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-star-white mb-3">
            {t('title')}
          </h2>
          <p className="text-star-dim text-lg">{t('subtitle')}</p>
        </div>
        <Link href={`/${locale}/launches`} className="hidden md:block">
          <Button variant="outline" size="md">
            {t('viewAll')}
          </Button>
        </Link>
      </div>

      {launches.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-space-800/60 backdrop-blur-xl border border-space-600/40">
          <p className="text-star-dim">{t('empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {launches.map((launch) => (
            <LaunchCard key={launch.id} launch={launch} locale={locale} />
          ))}
        </div>
      )}

      <div className="mt-10 text-center md:hidden">
        <Link href={`/${locale}/launches`}>
          <Button variant="outline" size="md">{t('viewAll')}</Button>
        </Link>
      </div>
    </section>
  );
}
