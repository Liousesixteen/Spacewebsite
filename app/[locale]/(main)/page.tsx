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
      <ApodSection apod={apod} />
      <Suspense fallback={null}>
        <RecentLaunches locale={locale} />
      </Suspense>
    </>
  );
}
