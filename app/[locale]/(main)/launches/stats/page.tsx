import { BarChart3 } from 'lucide-react';
import { prisma } from '@/lib/db';
import { LaunchStatsChart } from '@/components/charts/launch-stats-chart';
import { Card, CardContent } from '@/components/ui';

export default async function LaunchStatsPage() {
  const [byYearRaw, byCountryRaw, byStatus, total] = await Promise.all([
    prisma.$queryRaw<{ year: number; count: bigint | number }[]>`
      SELECT EXTRACT(YEAR FROM date)::int as year, COUNT(*)::int as count
      FROM "Launch"
      GROUP BY EXTRACT(YEAR FROM date)
      ORDER BY year
    `,
    prisma.$queryRaw<{ country: string; count: bigint | number }[]>`
      SELECT r.country, COUNT(*)::int as count
      FROM "Launch" l
      JOIN "Rocket" r ON l."rocketId" = r.id
      GROUP BY r.country
      ORDER BY count DESC
      LIMIT 10
    `,
    prisma.launch.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.launch.count(),
  ]);

  const statsData = {
    byYear: byYearRaw.map((d) => ({ year: d.year, count: Number(d.count) })),
    byCountry: byCountryRaw.map((d) => ({
      country: d.country,
      count: Number(d.count),
    })),
    byStatus: byStatus.map((s) => ({
      status: s.status,
      count: typeof s._count === 'number' ? s._count : 0,
    })),
    total,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="w-8 h-8 text-cosmic-blue" />
        <h1 className="text-3xl font-bold text-star-white">发射统计</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-cosmic-blue">{total}</p>
            <p className="text-star-dim mt-2">总发射数</p>
          </CardContent>
        </Card>
        {statsData.byStatus.slice(0, 3).map((s) => (
          <Card key={s.status}>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-star-white">{s.count}</p>
              <p className="text-star-dim mt-2">{s.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <LaunchStatsChart data={statsData} />
    </div>
  );
}
