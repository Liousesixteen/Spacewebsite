import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import {
  buildCountryStats,
  type CountryCapabilityLaunchInput,
  type CountryCapabilityStats,
} from './country-stats';
import {
  buildCountryIndustryStats,
  buildCountryValueChainMap,
  type CountryIndustryCompanyInput,
  type CountryIndustryStats,
  type CountryValueChainLane,
} from './country-industry';

export type CountryProfileLaunchInput = CountryCapabilityLaunchInput;
export type CountryProfileCompanyInput = CountryIndustryCompanyInput;

export interface CountryProfile {
  country: CountryCapabilityStats;
  industry: CountryIndustryStats;
  valueChainLanes: CountryValueChainLane[];
}

export function buildCountryProfile(
  slug: string,
  launches: CountryProfileLaunchInput[],
  companies: CountryProfileCompanyInput[],
  now: Date = new Date()
): CountryProfile | null {
  const country = buildCountryStats(launches, now).find(
    (item) => item.slug === slug
  );
  if (!country) return null;

  const industry = buildCountryIndustryStats(slug, companies);

  return {
    country,
    industry,
    valueChainLanes: buildCountryValueChainMap(industry.featuredCompanies),
  };
}

async function loadCountryProfile(slug: string): Promise<CountryProfile | null> {
  const [launches, companies] = await Promise.all([
    prisma.launch.findMany({
      include: {
        agency: { select: { id: true, name: true, country: true } },
        rocket: { select: { id: true, name: true, country: true } },
        launchSite: { select: { id: true, name: true, country: true, region: true } },
        launchPad: { select: { id: true, name: true, country: true } },
      },
      orderBy: { date: 'desc' },
      take: 2000,
    }),
    prisma.company.findMany({
      include: {
        segments: {
          include: {
            segment: {
              select: {
                id: true,
                name: true,
                level: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { revenue: 'desc' },
      take: 1000,
    }),
  ]);

  return buildCountryProfile(slug, launches, companies);
}

export const getCountryProfile = unstable_cache(
  loadCountryProfile,
  ['country-profile-v1'],
  {
    revalidate: 60 * 60,
    tags: ['country-profile'],
  }
);
