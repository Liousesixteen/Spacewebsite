import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import {
  HeroSection,
  LaunchCountdown,
  StatsOverview,
  QuickNav,
  RecentLaunches,
  ApodSection,
  getApodData,
} from '@/components/home';
import type { ApodData } from '@/components/home';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

interface NextLaunch {
  id: string;
  name: string;
  date: string;
  videoUrl?: string | null;
  rocket?: { name: string };
  launchSite?: { name: string };
}

interface HomeStats {
  launches: number;
  spacecraft: number;
  astronauts: number;
  companies: number;
}

async function loadHomeData(): Promise<{
  nextLaunch: NextLaunch | null;
  stats: HomeStats;
  liveLaunchUrl: string | null;
}> {
  try {
    const [nextLaunchRaw, launchCount, spacecraftCount, astronautCount, companyCount] =
      await Promise.all([
        prisma.launch.findFirst({
          where: { status: 'PLANNED', date: { gt: new Date() } },
          orderBy: { date: 'asc' },
          include: {
            rocket: { select: { name: true } },
            launchSite: { select: { name: true } },
          },
        }),
        prisma.launch.count(),
        prisma.spacecraft.count(),
        prisma.astronaut.count(),
        prisma.company.count(),
      ]);

    const nextLaunch: NextLaunch | null = nextLaunchRaw
      ? {
          id: nextLaunchRaw.id,
          name: nextLaunchRaw.name,
          date: nextLaunchRaw.date.toISOString(),
          videoUrl: nextLaunchRaw.videoUrl,
          rocket: nextLaunchRaw.rocket ? { name: nextLaunchRaw.rocket.name } : undefined,
          launchSite: nextLaunchRaw.launchSite
            ? { name: nextLaunchRaw.launchSite.name }
            : undefined,
        }
      : null;

    // Find a launch with a video URL for the "watch live" button
    const launchWithVideo = await prisma.launch.findFirst({
      where: {
        videoUrl: { not: null },
        status: 'PLANNED',
        date: { gt: new Date() },
      },
      orderBy: { date: 'asc' },
      select: { videoUrl: true },
    });

    return {
      nextLaunch,
      liveLaunchUrl: launchWithVideo?.videoUrl || null,
      stats: {
        launches: launchCount,
        spacecraft: spacecraftCount,
        astronauts: astronautCount,
        companies: companyCount,
      },
    };
  } catch {
    return {
      nextLaunch: null,
      liveLaunchUrl: null,
      stats: { launches: 0, spacecraft: 0, astronauts: 0, companies: 0 },
    };
  }
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const [homeData, apod] = await Promise.all([
    loadHomeData(),
    getApodData(),
  ]);

  return (
    <>
      <HeroSection
        locale={locale}
        apod={apod}
        liveLaunchUrl={homeData.liveLaunchUrl}
      />
      <LaunchCountdown nextLaunch={homeData.nextLaunch} locale={locale} />
      <StatsOverview stats={homeData.stats} />
      <QuickNav locale={locale} />

      {/* Timeline & Compare CTA banner */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href={`/${locale}/timeline`}
            className="group relative overflow-hidden rounded-xl border border-space-600 bg-gradient-to-br from-cosmic-purple/20 to-cosmic-blue/10 bg-space-800 p-6 transition-all duration-300 hover:border-cosmic-blue hover:-translate-y-1 hover:shadow-lg hover:shadow-cosmic-blue/20"
          >
            <div className="absolute inset-0 bg-cosmic-glow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative">
              <h3 className="text-xl font-bold text-star-white mb-2">
                {locale === 'zh-CN' ? '航天史时间线' : 'Space History Timeline'}
              </h3>
              <p className="text-sm text-star-dim leading-relaxed">
                {locale === 'zh-CN'
                  ? '从1957年斯普特尼克一号至今，探索人类航天史上的每一个关键时刻'
                  : 'Explore every key moment in space exploration from Sputnik 1 to today'}
              </p>
              <span className="inline-block mt-3 text-sm text-cosmic-blue group-hover:underline">
                {locale === 'zh-CN' ? '查看时间线' : 'View Timeline'} &rarr;
              </span>
            </div>
          </Link>

          <Link
            href={`/${locale}/compare`}
            className="group relative overflow-hidden rounded-xl border border-space-600 bg-gradient-to-br from-cosmic-cyan/20 to-cosmic-purple/10 bg-space-800 p-6 transition-all duration-300 hover:border-cosmic-blue hover:-translate-y-1 hover:shadow-lg hover:shadow-cosmic-blue/20"
          >
            <div className="absolute inset-0 bg-cosmic-glow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative">
              <h3 className="text-xl font-bold text-star-white mb-2">
                {locale === 'zh-CN' ? '对比工具' : 'Comparison Tool'}
              </h3>
              <p className="text-sm text-star-dim leading-relaxed">
                {locale === 'zh-CN'
                  ? '并排对比火箭与航天器规格参数，一目了然的性能差异'
                  : 'Compare rockets and spacecraft side-by-side — performance differences at a glance'}
              </p>
              <span className="inline-block mt-3 text-sm text-cosmic-blue group-hover:underline">
                {locale === 'zh-CN' ? '开始对比' : 'Start Comparing'} &rarr;
              </span>
            </div>
          </Link>
        </div>
      </section>

      <ApodSection apod={apod} />
      <Suspense fallback={null}>
        <RecentLaunches locale={locale} />
      </Suspense>
    </>
  );
}
