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
import { SectionDivider } from '@/components/ui';

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

      <SectionDivider spacing="sm" />

      <StatsOverview stats={homeData.stats} />

      <SectionDivider spacing="sm" />

      <QuickNav locale={locale} />

      <SectionDivider spacing="sm" />

      {/* Timeline & Compare CTA banner */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href={`/${locale}/timeline`}
            className="group relative overflow-hidden rounded-2xl border border-space-600/40 bg-gradient-to-br from-cosmic-purple/10 to-cosmic-blue/5 bg-space-800/60 backdrop-blur-xl p-8 transition-all duration-500 hover:border-cosmic-blue/30 hover:-translate-y-1 hover:shadow-card-hover"
          >
            <div className="absolute inset-0 bg-cosmic-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-star-white mb-3 group-hover:text-cosmic-blue transition-colors">
                Space History Timeline
              </h3>
              <p className="text-sm text-star-dim leading-relaxed max-w-md">
                From Sputnik 1 in 1957 to today&apos;s commercial spaceflight era -- explore every key moment in space exploration history.
              </p>
              <span className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-cosmic-blue group-hover:gap-3 transition-all">
                View Timeline
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </span>
            </div>
          </Link>

          <Link
            href={`/${locale}/compare`}
            className="group relative overflow-hidden rounded-2xl border border-space-600/40 bg-gradient-to-br from-cosmic-cyan/10 to-cosmic-purple/5 bg-space-800/60 backdrop-blur-xl p-8 transition-all duration-500 hover:border-cosmic-blue/30 hover:-translate-y-1 hover:shadow-card-hover"
          >
            <div className="absolute inset-0 bg-cosmic-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-star-white mb-3 group-hover:text-cosmic-cyan transition-colors">
                Comparison Tool
              </h3>
              <p className="text-sm text-star-dim leading-relaxed max-w-md">
                Compare rockets and spacecraft side-by-side -- performance differences at a glance with detailed spec sheets.
              </p>
              <span className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-cosmic-cyan group-hover:gap-3 transition-all">
                Start Comparing
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </span>
            </div>
          </Link>
        </div>
      </section>

      <SectionDivider spacing="sm" />

      <ApodSection apod={apod} />

      <SectionDivider spacing="sm" />

      <Suspense fallback={null}>
        <RecentLaunches locale={locale} />
      </Suspense>
    </>
  );
}
