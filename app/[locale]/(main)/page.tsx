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
} from '@/components/home';

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
  rocket?: { name: string };
  launchSite?: { name: string };
}

interface HomeStats {
  launches: number;
  spacecraft: number;
  astronauts: number;
  companies: number;
}

async function loadHomeData(): Promise<{ nextLaunch: NextLaunch | null; stats: HomeStats }> {
  try {
    const [nextLaunchRaw, launchCount, spacecraftCount, astronautCount, companyCount] = await Promise.all([
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
          rocket: nextLaunchRaw.rocket ? { name: nextLaunchRaw.rocket.name } : undefined,
          launchSite: nextLaunchRaw.launchSite ? { name: nextLaunchRaw.launchSite.name } : undefined,
        }
      : null;

    return {
      nextLaunch,
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
      stats: { launches: 0, spacecraft: 0, astronauts: 0, companies: 0 },
    };
  }
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const { nextLaunch, stats } = await loadHomeData();

  return (
    <>
      <HeroSection locale={locale} />
      <LaunchCountdown nextLaunch={nextLaunch} locale={locale} />
      <StatsOverview stats={stats} />
      <QuickNav locale={locale} />
      <Suspense fallback={null}>
        <RecentLaunches locale={locale} />
      </Suspense>
    </>
  );
}
