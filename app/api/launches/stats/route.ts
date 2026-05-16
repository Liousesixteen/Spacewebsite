import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const revalidate = 60;

interface YearStat {
  year: number;
  count: number;
}

interface CountryStat {
  country: string;
  count: number;
}

export async function GET() {
  const [byYearRaw, byCountryRaw, byStatus, total] = await Promise.all([
    prisma.$queryRaw<{ year: number; count: bigint }[]>`
      SELECT EXTRACT(YEAR FROM date)::int as year, COUNT(*)::int as count
      FROM "Launch"
      GROUP BY EXTRACT(YEAR FROM date)
      ORDER BY year
    `,
    prisma.$queryRaw<{ country: string; count: bigint }[]>`
      SELECT r.country, COUNT(*)::int as count
      FROM "Launch" l
      JOIN "Rocket" r ON l."rocketId" = r.id
      GROUP BY r.country
      ORDER BY count DESC
    `,
    prisma.launch.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.launch.count(),
  ]);

  const byYear: YearStat[] = byYearRaw.map((d) => ({
    year: d.year,
    count: Number(d.count),
  }));
  const byCountry: CountryStat[] = byCountryRaw.map((d) => ({
    country: d.country,
    count: Number(d.count),
  }));

  return NextResponse.json(
    {
      byYear,
      byCountry,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      total,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    }
  );
}
