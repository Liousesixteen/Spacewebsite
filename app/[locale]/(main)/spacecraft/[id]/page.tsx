import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import {
  Satellite,
  Calendar,
  Building2,
  Orbit,
  Ruler,
  Weight,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent, Badge, Button, SmartImage } from '@/components/ui';
import type { BadgeProps } from '@/components/ui';
import { FavoriteButton } from '@/components/common/favorite-button';
import { CommentSection } from '@/components/common/comment-section';
import { getSpacecraftImage } from '@/lib/image-fallbacks';

const statusColors: Record<string, BadgeProps['variant']> = {
  OPERATIONAL: 'success',
  RETIRED: 'default',
  LOST: 'error',
};

const statusLabels: Record<string, string> = {
  OPERATIONAL: '运行中',
  RETIRED: '已退役',
  LOST: '已失联',
};

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
  const extraImages = validImages.filter((img) => img !== heroImage);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href={`/${locale}/spacecraft`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </Button>
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <Satellite className="w-8 h-8 text-cosmic-blue mt-1" />
          <div>
            <h1 className="text-3xl font-bold text-white">{spacecraft.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="info">{typeLabels[spacecraft.type]}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={statusColors[spacecraft.status] || 'default'}
            className="text-base px-4 py-1"
          >
            {statusLabels[spacecraft.status] || spacecraft.status}
          </Badge>
          <FavoriteButton
            targetType="SPACECRAFT"
            targetId={spacecraft.id}
            locale={locale}
            size="sm"
          />
        </div>
      </div>

      <Card className="mb-8 overflow-hidden">
        <div className="relative w-full aspect-[16/9]">
          <SmartImage
            src={heroImage}
            alt={spacecraft.name}
            fallback="satellite"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>
      </Card>

      {extraImages.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {extraImages.map((image, index) => (
                <div
                  key={index}
                  className="relative w-full h-64 overflow-hidden rounded"
                >
                  <SmartImage
                    src={image}
                    alt={`${spacecraft.name} ${index + 1}`}
                    fallback="satellite"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">基本信息</h2>
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
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Orbit className="w-5 h-5 text-cosmic-blue" />
              轨道参数
            </h2>
            <div className="space-y-2 text-sm text-star-dim">
              <div className="flex justify-between">
                <span>轨道类型</span>
                <span className="text-white">{spacecraft.orbitType}</span>
              </div>
              {spacecraft.orbitAltitude !== null && (
                <div className="flex justify-between">
                  <span>轨道高度</span>
                  <span className="text-white">
                    {spacecraft.orbitAltitude} km
                  </span>
                </div>
              )}
              {spacecraft.orbitInclination !== null && (
                <div className="flex justify-between">
                  <span>轨道倾角</span>
                  <span className="text-white">
                    {spacecraft.orbitInclination}°
                  </span>
                </div>
              )}
              {spacecraft.orbitPeriod !== null && (
                <div className="flex justify-between">
                  <span>轨道周期</span>
                  <span className="text-white">
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
          <h2 className="text-lg font-semibold text-white mb-4">任务</h2>
          <p className="text-star-dim leading-relaxed whitespace-pre-line">
            {spacecraft.mission}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">详细描述</h2>
          <p className="text-star-dim leading-relaxed whitespace-pre-line">
            {spacecraft.description}
          </p>
        </CardContent>
      </Card>

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
