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
  TimelineCompareBanner,
  getApodData,
} from '@/components/home';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });
  return { title: t('title'), description: t('description') };
}

interface HomeStats {
  launches: number;
  spacecraft: number;
  astronauts: number;
  companies: number;
}

async function loadHomeData(): Promise<{
  nextLaunch: { id: string; name: string; date: string; videoUrl?: string | null; rocket?: { name: string }; launchSite?: { name: string } } | null;
  stats: HomeStats;
  liveLaunchUrl: string | null;
}> {
  try {
    const [nextLaunchRaw, launchCount, spacecraftCount, astronautCount, companyCount, launchWithVideo] =
      await Promise.all([
        prisma.launch.findFirst({
          where: { status: 'PLANNED', date: { gt: new Date() } },
          orderBy: { date: 'asc' },
          include: { rocket: { select: { name: true } }, launchSite: { select: { name: true } } },
        }),
        prisma.launch.count(),
        prisma.spacecraft.count({ where: { status: 'OPERATIONAL' } }),
        prisma.astronaut.count(),
        prisma.company.count(),
        prisma.launch.findFirst({
          where: { videoUrl: { not: null }, status: 'PLANNED', date: { gt: new Date() } },
          orderBy: { date: 'asc' },
          select: { videoUrl: true },
        }),
      ]);

    return {
      nextLaunch: nextLaunchRaw ? {
        id: nextLaunchRaw.id, name: nextLaunchRaw.name,
        date: nextLaunchRaw.date.toISOString(),
        videoUrl: nextLaunchRaw.videoUrl,
        rocket: nextLaunchRaw.rocket ? { name: nextLaunchRaw.rocket.name } : undefined,
        launchSite: nextLaunchRaw.launchSite ? { name: nextLaunchRaw.launchSite.name } : undefined,
      } : null,
      liveLaunchUrl: launchWithVideo?.videoUrl || null,
      stats: { launches: launchCount, spacecraft: spacecraftCount, astronauts: astronautCount, companies: companyCount },
    };
  } catch {
    return { nextLaunch: null, liveLaunchUrl: null, stats: { launches: 0, spacecraft: 0, astronauts: 0, companies: 0 } };
  }
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const [homeData, apod] = await Promise.all([loadHomeData(), getApodData()]);

  return (
    <>
      {/* 1. Hero */}
      <HeroSection locale={locale} apod={apod} liveLaunchUrl={homeData.liveLaunchUrl} />

      {/* 2. Dashboard strip: Stats + Countdown side by side */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <StatsOverview stats={homeData.stats} />
          <LaunchCountdown nextLaunch={homeData.nextLaunch} locale={locale} />
        </div>
      </section>

      <section className="container mx-auto px-4"><div className="hud-divider" /></section>

      {/* 3. QuickNav */}
      <QuickNav locale={locale} />

      <section className="container mx-auto px-4"><div className="hud-divider" /></section>

      {/* 4. APOD — full clean image */}
      <ApodSection apod={apod} />

      <section className="container mx-auto px-4"><div className="hud-divider" /></section>

      {/* 5. Timeline & Compare */}
      <section className="container mx-auto px-4 py-12">
        <TimelineCompareBanner locale={locale} />
      </section>

      <section className="container mx-auto px-4"><div className="hud-divider" /></section>

      {/* 6. Recent Launches */}
      <Suspense fallback={null}>
        <RecentLaunches locale={locale} />
      </Suspense>

      {/* Bottom breathing space */}
      <div className="pb-8" />
    </>
  );
}
