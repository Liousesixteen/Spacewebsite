import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Rocket, MapPin, Calendar, Users, Video } from 'lucide-react';
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
import {
  getAstronautImage,
  getLaunchImage,
} from '@/lib/image-fallbacks';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const launch = await prisma.launch.findUnique({
      where: { id },
      select: { name: true, missionDescription: true, images: true },
    });
    if (!launch) return { title: '未找到 - SpaceData' };

    const description =
      launch.missionDescription?.slice(0, 160) ?? '航天发射详情';
    const image =
      launch.images && launch.images.length > 0 ? launch.images[0] : undefined;

    return {
      title: `${launch.name} - SpaceData`,
      description,
      openGraph: {
        title: launch.name,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch (error) {
    console.error('[launch metadata] failed:', error);
    return { title: '航天发射详情 - SpaceData' };
  }
}

interface PayloadItem {
  name: string;
  type: string;
}

export default async function LaunchDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const launch = await prisma.launch.findUnique({
    where: { id },
    include: {
      rocket: true,
      launchSite: true,
      crews: { include: { astronaut: true } },
    },
  });

  if (!launch) notFound();

  const payloads = Array.isArray(launch.payloads)
    ? (launch.payloads as unknown as PayloadItem[])
    : [];

  const heroImage = getLaunchImage(
    launch.id,
    launch.images,
    launch.rocket.name
  );

  // Collect all valid images for the lightbox
  const validImages = launch.images.filter(
    (img) => img && !img.includes('example.com') && !img.startsWith('http://')
  );
  const seen = new Set<string>();
  if (heroImage) seen.add(heroImage);
  validImages.forEach((img) => seen.add(img));
  const allImages = Array.from(seen);

  // Related: similar launches (same rocket or same launch site)
  const relatedLaunches = await prisma.launch.findMany({
    where: {
      id: { not: launch.id },
      OR: [
        { rocketId: launch.rocketId },
        { launchSiteId: launch.launchSiteId },
      ],
    },
    select: {
      id: true,
      name: true,
      date: true,
      status: true,
    },
    orderBy: { date: 'desc' },
    take: 3,
  });

  // Related spacecraft: find spacecraft whose names appear in payload names
  const payloadNames = payloads.map((p) => p.name).filter(Boolean);
  let relatedSpacecraft: { id: string; name: string; type: string }[] = [];
  if (payloadNames.length > 0) {
    relatedSpacecraft = await prisma.spacecraft.findMany({
      where: {
        name: { in: payloadNames },
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
      take: 4,
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: '航天数据', href: `/${locale}` },
          { label: '发射数据', href: `/${locale}/launches` },
          { label: launch.name },
        ]}
      />

      <div className="flex items-start justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">{launch.name}</h1>
        <div className="flex items-center gap-3">
          <StatusBadge status={launch.status} className="text-base px-4 py-1" />
          <FavoriteButton
            targetType="LAUNCH"
            targetId={launch.id}
            locale={locale}
            size="sm"
          />
        </div>
      </div>

      {/* Hero image with lightbox */}
      <Card className="mb-8 overflow-hidden">
        <ImageLightbox images={allImages} alt={launch.name} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">发射信息</h2>
            <div className="space-y-3 text-star-dim">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-cosmic-blue" />
                <span>{format(new Date(launch.date), 'yyyy-MM-dd HH:mm:ss')}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-cosmic-blue" />
                <span>{launch.launchSite.name}</span>
              </div>
              {launch.videoUrl && (
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-cosmic-blue" />
                  <a
                    href={launch.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cosmic-blue hover:underline"
                  >
                    观看视频
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">火箭信息</h2>
            <Link href={`/${locale}/rockets/${launch.rocket.id}`} className="block">
              <div className="flex items-center gap-3 mb-3">
                <Rocket className="w-5 h-5 text-cosmic-blue" />
                <span className="text-white hover:text-cosmic-blue">
                  {launch.rocket.name}
                </span>
              </div>
            </Link>
            <div className="text-sm text-star-dim space-y-1">
              <p>制造商: {launch.rocket.manufacturer}</p>
              <p>国家: {launch.rocket.country}</p>
              <p>成功率: {launch.rocket.successRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">任务描述</h2>
          <p className="text-star-dim leading-relaxed">{launch.missionDescription}</p>
        </CardContent>
      </Card>

      {launch.crews.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cosmic-blue" />
              机组成员
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {launch.crews.map((crew) => (
                <Link
                  key={crew.id}
                  href={`/${locale}/astronauts/${crew.astronaut.id}`}
                >
                  <div className="text-center p-4 bg-space-700 rounded-lg hover:bg-space-600 transition-colors">
                    <div className="relative w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden bg-space-600">
                      <SmartImage
                        src={getAstronautImage(crew.astronaut.photo)}
                        alt={crew.astronaut.name}
                        fallback="astronaut"
                        fill
                        sizes="64px"
                        className="rounded-full"
                      />
                    </div>
                    <p className="text-white text-sm">{crew.astronaut.name}</p>
                    <p className="text-star-dim text-xs">{crew.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {payloads.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">载荷信息</h2>
            <div className="space-y-2">
              {payloads.map((payload, index) => (
                <div
                  key={index}
                  className="flex justify-between p-3 bg-space-700 rounded-lg"
                >
                  <span className="text-white">{payload.name}</span>
                  <span className="text-star-dim">{payload.type}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Content */}
      <div className="space-y-6 mb-8">
        {/* Related Rocket */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-cosmic-blue" />
              相关火箭
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-space-700 rounded-lg">
              <span className="text-white">{launch.rocket.name}</span>
              <span className="text-star-dim text-sm">
                {launch.rocket.manufacturer} · {launch.rocket.country}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Related Launch Site */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cosmic-blue" />
              相关发射场
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-space-700 rounded-lg">
              <span className="text-white">{launch.launchSite.name}</span>
              <span className="text-star-dim text-sm">
                {launch.launchSite.country} · {launch.launchSite.region}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Related Spacecraft */}
        {relatedSpacecraft.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-cosmic-blue" />
                相关航天器
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {relatedSpacecraft.map((sc) => (
                  <Link
                    key={sc.id}
                    href={`/${locale}/spacecraft/${sc.id}`}
                    className="flex items-center gap-3 p-3 bg-space-700 rounded-lg hover:bg-space-600 transition-colors group"
                  >
                    <span className="text-white group-hover:text-cosmic-blue transition-colors">
                      {sc.name}
                    </span>
                    <Badge variant="default">{sc.type}</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Similar Launches */}
        {relatedLaunches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-cosmic-blue" />
                更多发射
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
                      <span className="text-white text-sm font-medium group-hover:text-cosmic-blue transition-colors">
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
      </div>

      <div className="mt-8">
        <CommentSection targetType="LAUNCH" targetId={launch.id} locale={locale} />
      </div>
    </div>
  );
}
