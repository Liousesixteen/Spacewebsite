import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import {
  Satellite,
  Calendar,
  Building2,
  Orbit,
  Ruler,
  Weight,
} from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  StatusBadge,
  SmartImage,
  ImageLightbox,
  Breadcrumbs,
} from '@/components/ui';
import { FavoriteButton } from '@/components/common/favorite-button';
import { CommentSection } from '@/components/common/comment-section';
import { getSpacecraftImage } from '@/lib/image-fallbacks';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const spacecraft = await prisma.spacecraft.findUnique({
      where: { id },
      select: { name: true, description: true, images: true },
    });
    if (!spacecraft) return { title: '未找到 - SpaceData' };

    const description = spacecraft.description?.slice(0, 160) ?? '航天器详情';
    const image =
      spacecraft.images && spacecraft.images.length > 0
        ? spacecraft.images[0]
        : undefined;

    return {
      title: `${spacecraft.name} - SpaceData`,
      description,
      openGraph: {
        title: spacecraft.name,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch (error) {
    console.error('[spacecraft metadata] failed:', error);
    return { title: '航天器详情 - SpaceData' };
  }
}

const typeLabels: Record<string, string> = {
  SPACE_STATION: '空间站',
  SATELLITE: '卫星',
  PROBE: '探测器',
  CREWED_SPACECRAFT: '载人飞船',
  CARGO_SPACECRAFT: '货运飞船',
};

export default async function SpacecraftDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const spacecraft = await prisma.spacecraft.findUnique({
    where: { id },
  });

  if (!spacecraft) notFound();

  const validImages = spacecraft.images.filter(
    (img) => img && !img.includes('example.com') && !img.startsWith('http://')
  );
  const heroImage =
    getSpacecraftImage(spacecraft.id, spacecraft.images, spacecraft.name) ??
    validImages[0];
  const seenImages = new Set<string>();
  if (heroImage) seenImages.add(heroImage);
  validImages.forEach((img) => seenImages.add(img));
  const allImages = Array.from(seenImages);

  // Related: spacecraft of same type
  const sameTypeSpacecraft = await prisma.spacecraft.findMany({
    where: {
      id: { not: spacecraft.id },
      type: spacecraft.type,
    },
    select: {
      id: true,
      name: true,
      status: true,
      operator: true,
    },
    orderBy: { launchDate: 'desc' },
    take: 3,
  });

  // Related: spacecraft by same operator
  const sameOperatorSpacecraft = await prisma.spacecraft.findMany({
    where: {
      id: { not: spacecraft.id },
      operator: spacecraft.operator,
    },
    select: {
      id: true,
      name: true,
      status: true,
      type: true,
    },
    orderBy: { launchDate: 'desc' },
    take: 3,
  });

  // Related: launches that deployed this spacecraft (find by name in payloads)
  // Since payloads is JSON, we search for launches where the spacecraft name appears in any payload name
  const spacecraftNameLower = spacecraft.name.toLowerCase();
  const allLaunches = await prisma.launch.findMany({
    where: {
      missionDescription: { not: '' },
    },
    select: {
      id: true,
      name: true,
      date: true,
      status: true,
      payloads: true,
    },
    orderBy: { date: 'desc' },
    take: 50, // reasonable limit to search through
  });

  const relatedLaunches = allLaunches.filter((l) => {
    const payloads = l.payloads as unknown as Array<{ name: string }> | null;
    if (!payloads || !Array.isArray(payloads)) return false;
    return payloads.some((p) =>
      p.name?.toLowerCase().includes(spacecraftNameLower)
    );
  }).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: '航天数据', href: `/${locale}` },
          { label: '航天器', href: `/${locale}/spacecraft` },
          { label: spacecraft.name },
        ]}
      />

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <Satellite className="w-8 h-8 text-cosmic-blue mt-1" />
          <div>
            <h1 className="text-3xl font-bold text-star-white">{spacecraft.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="info">{typeLabels[spacecraft.type]}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge
            status={spacecraft.status}
            className="text-base px-4 py-1"
          />
          <FavoriteButton
            targetType="SPACECRAFT"
            targetId={spacecraft.id}
            locale={locale}
            size="sm"
          />
        </div>
      </div>

      {/* Image lightbox */}
      <Card className="mb-8 overflow-hidden">
        <ImageLightbox images={allImages} alt={spacecraft.name} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-4">基本信息</h2>
            <div className="space-y-3 text-star-dim">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-cosmic-blue" />
                <span>运营方: {spacecraft.operator}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-cosmic-blue" />
                <span>
                  发射日期: {format(new Date(spacecraft.launchDate), 'yyyy-MM-dd')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Weight className="w-5 h-5 text-cosmic-blue" />
                <span>质量: {spacecraft.mass} kg</span>
              </div>
              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-cosmic-blue" />
                <span>尺寸: {spacecraft.dimensions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-4 flex items-center gap-2">
              <Orbit className="w-5 h-5 text-cosmic-blue" />
              轨道参数
            </h2>
            <div className="space-y-2 text-sm text-star-dim">
              <div className="flex justify-between">
                <span>轨道类型</span>
                <span className="text-star-white">{spacecraft.orbitType}</span>
              </div>
              {spacecraft.orbitAltitude !== null && (
                <div className="flex justify-between">
                  <span>轨道高度</span>
                  <span className="text-star-white">
                    {spacecraft.orbitAltitude} km
                  </span>
                </div>
              )}
              {spacecraft.orbitInclination !== null && (
                <div className="flex justify-between">
                  <span>轨道倾角</span>
                  <span className="text-star-white">
                    {spacecraft.orbitInclination}°
                  </span>
                </div>
              )}
              {spacecraft.orbitPeriod !== null && (
                <div className="flex justify-between">
                  <span>轨道周期</span>
                  <span className="text-star-white">
                    {spacecraft.orbitPeriod} 分钟
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-star-white mb-4">任务</h2>
          <p className="text-star-dim leading-relaxed whitespace-pre-line">
            {spacecraft.mission}
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-star-white mb-4">详细描述</h2>
          <p className="text-star-dim leading-relaxed whitespace-pre-line">
            {spacecraft.description}
          </p>
        </CardContent>
      </Card>

      {/* Related Content */}
      <div className="space-y-6 mb-8">
        {/* Related Launches */}
        {relatedLaunches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-cosmic-blue" />
                发射任务
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {relatedLaunches.map((rl) => (
                  <Link
                    key={rl.id}
                    href={`/${locale}/launches/${rl.id}`}
                    className="p-3 bg-space-700 rounded-lg hover:bg-space-600 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-star-white text-sm font-medium group-hover:text-cosmic-blue transition-colors">
                        {rl.name}
                      </span>
                      <StatusBadge status={rl.status} className="text-xs" />
                    </div>
                    <span className="text-xs text-star-dim">
                      {format(new Date(rl.date), 'yyyy-MM-dd')}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Same Type Spacecraft */}
        {sameTypeSpacecraft.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Satellite className="w-5 h-5 text-cosmic-blue" />
                同类型航天器
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {sameTypeSpacecraft.map((sc) => (
                  <Link
                    key={sc.id}
                    href={`/${locale}/spacecraft/${sc.id}`}
                    className="p-3 bg-space-700 rounded-lg hover:bg-space-600 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-star-white text-sm font-medium group-hover:text-cosmic-blue transition-colors">
                        {sc.name}
                      </span>
                      <StatusBadge status={sc.status} className="text-xs" />
                    </div>
                    <span className="text-xs text-star-dim">{sc.operator}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Same Operator Spacecraft */}
        {sameOperatorSpacecraft.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cosmic-blue" />
                同运营商航天器
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {sameOperatorSpacecraft.map((sc) => (
                  <Link
                    key={sc.id}
                    href={`/${locale}/spacecraft/${sc.id}`}
                    className="p-3 bg-space-700 rounded-lg hover:bg-space-600 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-star-white text-sm font-medium group-hover:text-cosmic-blue transition-colors">
                        {sc.name}
                      </span>
                      <Badge variant="info">{sc.type}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8">
        <CommentSection
          targetType="SPACECRAFT"
          targetId={spacecraft.id}
          locale={locale}
        />
      </div>
    </div>
  );
}
