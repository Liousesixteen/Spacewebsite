import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const LOCALES = ['zh-CN', 'en', 'ru', 'ja'] as const;

type EntityRow = { id: string; updatedAt: Date };

async function safeFindMany(
  fn: () => Promise<EntityRow[]>
): Promise<EntityRow[]> {
  try {
    return await fn();
  } catch (error) {
    console.error('[sitemap] failed to fetch entity rows:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    '',
    '/launches',
    '/spacecraft',
    '/astronauts',
    '/explore',
    '/explore/satellites',
    '/explore/solar-system',
    '/industry',
    '/industry/companies',
    '/industry/technologies',
    '/industry/materials',
    '/industry/equipment',
    '/about',
    '/privacy',
    '/terms',
    '/data-sources',
    '/contact',
  ];

  const staticEntries = LOCALES.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1.0 : 0.8,
    }))
  );

  // Dynamic entries from DB - graceful fallback if database is unavailable
  const [launches, spacecraft, astronauts, companies, technologies] =
    await Promise.all([
      safeFindMany(() =>
        prisma.launch.findMany({
          select: { id: true, updatedAt: true },
          take: 500,
        })
      ),
      safeFindMany(() =>
        prisma.spacecraft.findMany({
          select: { id: true, updatedAt: true },
          take: 500,
        })
      ),
      safeFindMany(() =>
        prisma.astronaut.findMany({
          select: { id: true, updatedAt: true },
          take: 500,
        })
      ),
      safeFindMany(() =>
        prisma.company.findMany({
          select: { id: true, updatedAt: true },
          take: 500,
        })
      ),
      safeFindMany(() =>
        prisma.technology.findMany({
          select: { id: true, updatedAt: true },
          take: 500,
        })
      ),
    ]);

  const dynamicEntries = LOCALES.flatMap((locale) => [
    ...launches.map((l) => ({
      url: `${SITE_URL}/${locale}/launches/${l.id}`,
      lastModified: l.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...spacecraft.map((s) => ({
      url: `${SITE_URL}/${locale}/spacecraft/${s.id}`,
      lastModified: s.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...astronauts.map((a) => ({
      url: `${SITE_URL}/${locale}/astronauts/${a.id}`,
      lastModified: a.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...companies.map((c) => ({
      url: `${SITE_URL}/${locale}/industry/companies/${c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...technologies.map((t) => ({
      url: `${SITE_URL}/${locale}/industry/technologies/${t.id}`,
      lastModified: t.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]);

  return [...staticEntries, ...dynamicEntries];
}
