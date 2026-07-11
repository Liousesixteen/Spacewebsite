import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  BarChart3,
  Calendar,
  Factory,
  Flag,
  Gauge,
  Layers,
  Package,
  Rocket,
  Ruler,
  Scale,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import {
  Badge,
  Breadcrumbs,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ImageLightbox,
  StatusBadge,
} from '@/components/ui';
import { FavoriteButton } from '@/components/common/favorite-button';
import { CommentSection } from '@/components/common/comment-section';
import { JsonLd, buildOrganizationSchema } from '@/components/seo/json-ld';
import { SourceBadge } from '@/components/ui/source-badge';
import { computeQualityScore, inferSourceTier } from '@/lib/api/data-quality';
import { getRocketImage } from '@/lib/image-fallbacks';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const rocket = await prisma.rocket.findUnique({
      where: { id },
      select: { name: true, description: true, images: true },
    });
    if (!rocket) return { title: 'Not Found - SpaceData' };

    const image = rocket.images?.find((img) => img && !img.includes('example.com'));

    return {
      title: `${rocket.name} - SpaceData`,
      description: rocket.description?.slice(0, 160) ?? 'Rocket details',
      openGraph: {
        title: rocket.name,
        description: rocket.description?.slice(0, 160) ?? 'Rocket details',
        images: image ? [image] : undefined,
      },
    };
  } catch (error) {
    console.error('[rocket metadata] failed:', error);
    return { title: 'Rocket Detail - SpaceData' };
  }
}

function formatNumber(value: number, unit: string): string {
  return `${new Intl.NumberFormat('en-US').format(value)} ${unit}`;
}

export default async function RocketDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  let rocket: Awaited<ReturnType<typeof prisma.rocket.findUnique>> = null;
  let dbUnavailable = false;

  try {
    rocket = await prisma.rocket.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('[rocket detail] Failed to load rocket:', error);
    dbUnavailable = true;
  }

  if (dbUnavailable) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
          <Rocket className="h-8 w-8 text-amber-400/70" />
        </div>
        <h1 className="mb-2 text-xl font-semibold text-star-white">数据库暂时不可用</h1>
        <p className="text-sm text-star-dim">火箭数据服务正在恢复中，请稍后再试。</p>
        <Link href={`/${locale}/rockets`} className="mt-6 inline-block text-sm text-cosmic-blue hover:underline">
          ← 返回火箭列表
        </Link>
      </div>
    );
  }

  if (!rocket) notFound();

  const heroImage = getRocketImage(rocket.id, rocket.images, rocket.name);
  const validImages = rocket.images.filter(
    (img) => img && !img.includes('example.com') && !img.startsWith('http://')
  );
  const images = Array.from(new Set([heroImage, ...validImages].filter(Boolean))) as string[];

  let relatedLaunches: any[] = [];
  let sameManufacturerRockets: any[] = [];
  let sameCountryRockets: any[] = [];
  try {
    [relatedLaunches, sameManufacturerRockets, sameCountryRockets] = await Promise.all([
    prisma.launch.findMany({
      where: { rocketId: rocket.id },
      select: {
        id: true,
        name: true,
        date: true,
        status: true,
        launchSite: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
      take: 6,
    }),
    prisma.rocket.findMany({
      where: {
        id: { not: rocket.id },
        manufacturer: rocket.manufacturer,
      },
      select: {
        id: true,
        name: true,
        status: true,
        successRate: true,
      },
      orderBy: { firstFlight: 'desc' },
      take: 3,
    }),
    prisma.rocket.findMany({
      where: {
        id: { not: rocket.id },
        country: rocket.country,
        manufacturer: { not: rocket.manufacturer },
      },
      select: {
        id: true,
        name: true,
        manufacturer: true,
        status: true,
      },
      orderBy: { firstFlight: 'desc' },
      take: 3,
    }),
  ]);
  } catch (error) {
    console.error('[rocket detail] Failed to load related data:', error);
  }

  const specs = [
    {
      icon: Ruler,
      label: '高度',
      value: formatNumber(rocket.height, 'm'),
    },
    {
      icon: Gauge,
      label: '直径',
      value: formatNumber(rocket.diameter, 'm'),
    },
    {
      icon: Scale,
      label: '质量',
      value: formatNumber(rocket.mass, 'kg'),
    },
    {
      icon: Layers,
      label: '级数',
      value: `${rocket.stages}`,
    },
    {
      icon: Package,
      label: 'LEO 运力',
      value: formatNumber(rocket.payloadToLEO, 'kg'),
    },
    {
      icon: Package,
      label: 'GTO 运力',
      value: formatNumber(rocket.payloadToGTO, 'kg'),
    },
  ];

  const rocketUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${locale}/rockets/${rocket.id}`;
  const sourceTier = inferSourceTier('Launch Library 2');
  const quality = computeQualityScore({
    sourceTier,
    lastSyncedAt: rocket.updatedAt,
    coreFieldsTotal: 7,
    coreFieldsPopulated: [
      rocket.name, rocket.manufacturer, rocket.country,
      rocket.description, String(rocket.height), String(rocket.diameter),
      String(rocket.mass),
    ].filter(Boolean).length,
    distinctSources: 1,
    maxSources: 3,
    hasEditorialReview: false,
    hasVerifiedRelationships: (rocket as any).launches?.length > 0,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <JsonLd
        data={buildOrganizationSchema({
          name: rocket.name,
          description: rocket.description,
          url: rocketUrl,
          country: rocket.country,
        })}
      />

      <Breadcrumbs
        className="mb-6"
        items={[
          { label: 'SpaceData', href: `/${locale}` },
          { label: 'Rockets', href: `/${locale}/rockets` },
          { label: rocket.name },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-3">
          <Rocket className="w-8 h-8 text-cosmic-blue mt-1" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-star-white mb-2 page-header-underline pb-2 inline-block">
              {rocket.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-star-dim">
              <span className="inline-flex items-center gap-1.5">
                <Factory className="w-4 h-4 text-cosmic-blue" />
                {rocket.manufacturer}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-cosmic-blue" />
                {rocket.country}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={rocket.status} className="text-sm px-4 py-1.5" />
          <FavoriteButton
            targetType="ROCKET"
            targetId={rocket.id}
            locale={locale}
            size="sm"
          />
        </div>
      </div>

      {images.length > 0 && (
        <Card variant="elevated" className="mb-8 overflow-hidden">
          <ImageLightbox images={images} alt={rocket.name} />
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Card variant="elevated" className="md:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-5 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-cosmic-blue" />
              火箭概览
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {specs.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 p-3 bg-space-700/50 rounded-xl border border-space-600/30"
                >
                  <span className="inline-flex items-center gap-2 text-star-dim text-sm">
                    <Icon className="w-4 h-4 text-cosmic-blue/70" />
                    {label}
                  </span>
                  <span className="text-star-white font-medium text-sm">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-5 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cosmic-blue" />
              可靠性
            </h2>
            <div className="text-center py-3">
              <div className="text-4xl font-bold text-emerald-400">
                {rocket.successRate}%
              </div>
              <div className="mt-2 text-sm text-star-dim">任务成功率</div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-star-dim">
              <Calendar className="w-4 h-4 text-cosmic-blue/70" />
              首飞 {rocket.firstFlight ? format(new Date(rocket.firstFlight), 'yyyy-MM-dd') : '未知'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated" className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-star-white mb-4">详细描述</h2>
          <div className="gradient-divider mb-4" />
          <p className="text-star-dim leading-relaxed whitespace-pre-line">
            {rocket.description || '暂无描述。'}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-5 mb-8">
        {relatedLaunches.length > 0 && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-cosmic-blue" />
                相关发射
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {relatedLaunches.map((launch) => (
                  <Link
                    key={launch.id}
                    href={`/${locale}/launches/${launch.id}`}
                    className="p-3.5 bg-space-700/50 rounded-xl border border-space-600/30 hover:bg-space-700 hover:border-cosmic-blue/30 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-star-white text-sm font-medium group-hover:text-cosmic-blue transition-colors">
                        {launch.name}
                      </span>
                      <StatusBadge status={launch.status} className="text-xs" />
                    </div>
                    <div className="text-xs text-star-dim">
                      {format(new Date(launch.date), 'yyyy-MM-dd')} / {launch.launchSite.name}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {(sameManufacturerRockets.length > 0 || sameCountryRockets.length > 0) && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-cosmic-blue" />
                相关火箭
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {sameManufacturerRockets.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${locale}/rockets/${item.id}`}
                    className="p-3.5 bg-space-700/50 rounded-xl border border-space-600/30 hover:bg-space-700 hover:border-cosmic-blue/30 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-star-white text-sm font-medium group-hover:text-cosmic-blue transition-colors">
                        {item.name}
                      </span>
                      <StatusBadge status={item.status} className="text-xs" />
                    </div>
                    <Badge variant="info">{item.successRate}% 成功率</Badge>
                  </Link>
                ))}
                {sameCountryRockets.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${locale}/rockets/${item.id}`}
                    className="p-3.5 bg-space-700/50 rounded-xl border border-space-600/30 hover:bg-space-700 hover:border-cosmic-blue/30 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-star-white text-sm font-medium group-hover:text-cosmic-blue transition-colors">
                        {item.name}
                      </span>
                      <StatusBadge status={item.status} className="text-xs" />
                    </div>
                    <span className="text-xs text-star-dim">{item.manufacturer}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Data Quality Score */}
      <div className="mt-8">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg text-star-white">数据质量</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-star-dim">综合评分</span>
                  <span className="text-2xl font-bold text-cosmic-blue">{quality.total}/{quality.maxTotal}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-space-700/50">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cosmic-blue to-cosmic-purple transition-all"
                    style={{ width: `${(quality.total / quality.maxTotal) * 100}%` }} />
                </div>
              </div>
              <SourceBadge tier={sourceTier} factType="OBSERVED" lastSyncedAt={rocket.updatedAt} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quality.dimensions.map((dim: any) => (
                <div key={dim.label} className="rounded-lg border border-space-600/30 bg-space-700/30 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-star-dim">{dim.label}</span>
                    <span className="text-xs font-mono font-semibold text-star-white">{dim.score}/{dim.maxScore}</span>
                  </div>
                  <div className="mb-2 h-1.5 w-full rounded-full bg-space-600/30">
                    <div className="h-1.5 rounded-full bg-cosmic-blue/60"
                      style={{ width: `${(dim.score / dim.maxScore) * 100}%` }} />
                  </div>
                  <div className="text-xs text-star-dim/70">{dim.detail}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <CommentSection targetType="ROCKET" targetId={rocket.id} locale={locale} />
      </div>
    </div>
  );
}
