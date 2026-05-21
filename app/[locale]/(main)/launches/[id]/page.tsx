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
    if (!launch) return { title: 'Not Found - SpaceData' };

    const description =
      launch.missionDescription?.slice(0, 160) ?? 'Space launch details';
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
    return { title: 'Launch Detail - SpaceData' };
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

  const validImages = launch.images.filter(
    (img) => img && !img.includes('example.com') && !img.startsWith('http://')
  );
  const seen = new Set<string>();
  if (heroImage) seen.add(heroImage);
  validImages.forEach((img) => seen.add(img));
  const allImages = Array.from(seen);

  // Related launches
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

  // Related spacecraft
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
          { label: 'SpaceData', href: `/${locale}` },
          { label: 'Launches', href: `/${locale}/launches` },
          { label: launch.name },
        ]}
      />

      {/* Title + Status + Favorite */}
      <div className="flex flex-wrap items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-star-white mb-2 page-header-underline pb-2 inline-block">
            {launch.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={launch.status} className="text-sm px-4 py-1.5" />
          <FavoriteButton
            targetType="LAUNCH"
            targetId={launch.id}
            locale={locale}
            size="sm"
          />
        </div>
      </div>

      {/* Hero image */}
      <Card variant="elevated" className="mb-8 overflow-hidden">
        <ImageLightbox images={allImages} alt={launch.name} />
      </Card>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <Card variant="elevated">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-5 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cosmic-blue" />
              Launch Info
            </h2>
            <div className="space-y-4 text-star-dim">
              <div className="flex items-center gap-3 p-3 bg-space-700/50 rounded-lg">
                <Calendar className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
                <span>{format(new Date(launch.date), 'yyyy-MM-dd HH:mm:ss')}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-space-700/50 rounded-lg">
                <MapPin className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
                <span>{launch.launchSite.name}</span>
              </div>
              {launch.videoUrl && (
                <div className="flex items-center gap-3 p-3 bg-space-700/50 rounded-lg">
                  <Video className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
                  <a
                    href={launch.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cosmic-blue hover:text-cosmic-cyan transition-colors"
                  >
                    Watch Video
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-5 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-cosmic-blue" />
              Rocket Info
            </h2>
            <Link href={`/${locale}/rockets/${launch.rocket.id}`} className="block group">
              <div className="p-3 bg-space-700/50 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <Rocket className="w-4 h-4 text-cosmic-blue/70" />
                  <span className="text-star-white group-hover:text-cosmic-blue transition-colors font-medium">
                    {launch.rocket.name}
                  </span>
                </div>
              </div>
            </Link>
            <div className="text-sm text-star-dim space-y-2">
              <div className="flex justify-between p-2">
                <span>Manufacturer</span>
                <span className="text-star-white">{launch.rocket.manufacturer}</span>
              </div>
              <div className="flex justify-between p-2">
                <span>Country</span>
                <span className="text-star-white">{launch.rocket.country}</span>
              </div>
              <div className="flex justify-between p-2">
                <span>Success Rate</span>
                <span className="text-emerald-400 font-semibold">{launch.rocket.successRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mission Description */}
      <Card variant="elevated" className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-star-white mb-4">
            Mission Description
          </h2>
          <div className="gradient-divider mb-4" />
          <p className="text-star-dim leading-relaxed text-base">
            {launch.missionDescription || 'No description available.'}
          </p>
        </CardContent>
      </Card>

      {/* Crew */}
      {launch.crews.length > 0 && (
        <Card variant="elevated" className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-5 flex items-center gap-2">
              <Users className="w-5 h-5 text-cosmic-blue" />
              Crew Members
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {launch.crews.map((crew) => (
                <Link
                  key={crew.id}
                  href={`/${locale}/astronauts/${crew.astronaut.id}`}
                  className="group"
                >
                  <div className="text-center p-4 bg-space-700/50 rounded-xl hover:bg-space-700 transition-all duration-300 hover:shadow-card border border-transparent hover:border-cosmic-blue/20">
                    <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-space-600 ring-2 ring-space-600/50 group-hover:ring-cosmic-blue/40 transition-all duration-300">
                      <SmartImage
                        src={getAstronautImage(crew.astronaut.photo)}
                        alt={crew.astronaut.name}
                        fallback="astronaut"
                        fill
                        sizes="64px"
                        className="rounded-full transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <p className="text-star-white text-sm font-medium group-hover:text-cosmic-blue transition-colors">
                      {crew.astronaut.name}
                    </p>
                    <p className="text-star-dim text-xs">{crew.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payloads */}
      {payloads.length > 0 && (
        <Card variant="elevated" className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-4">
              Payload Information
            </h2>
            <div className="space-y-2">
              {payloads.map((payload, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3.5 bg-space-700/50 rounded-xl border border-space-600/30"
                >
                  <span className="text-star-white font-medium">{payload.name}</span>
                  <Badge variant="default">{payload.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Content */}
      <div className="space-y-5 mb-8">
        {/* Related Rocket */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-cosmic-blue" />
              Related Rocket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3.5 bg-space-700/50 rounded-xl border border-space-600/30">
              <span className="text-star-white font-medium">
                {launch.rocket.name}
              </span>
              <span className="text-star-dim text-sm">
                {launch.rocket.manufacturer} / {launch.rocket.country}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Related Launch Site */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cosmic-blue" />
              Related Launch Site
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3.5 bg-space-700/50 rounded-xl border border-space-600/30">
              <span className="text-star-white font-medium">
                {launch.launchSite.name}
              </span>
              <span className="text-star-dim text-sm">
                {launch.launchSite.country} / {launch.launchSite.region}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Related Spacecraft */}
        {relatedSpacecraft.length > 0 && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-cosmic-blue" />
                Related Spacecraft
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {relatedSpacecraft.map((sc) => (
                  <Link
                    key={sc.id}
                    href={`/${locale}/spacecraft/${sc.id}`}
                    className="flex items-center gap-3 p-3.5 bg-space-700/50 rounded-xl border border-space-600/30 hover:bg-space-700 hover:border-cosmic-blue/30 transition-all duration-300 group"
                  >
                    <span className="text-star-white group-hover:text-cosmic-blue transition-colors font-medium">
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
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-cosmic-blue" />
                Similar Launches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {relatedLaunches.map((rl) => (
                  <Link
                    key={rl.id}
                    href={`/${locale}/launches/${rl.id}`}
                    className="p-3.5 bg-space-700/50 rounded-xl border border-space-600/30 hover:bg-space-700 hover:border-cosmic-blue/30 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
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
      </div>

      {/* Comments */}
      <div className="mt-8">
        <CommentSection targetType="LAUNCH" targetId={launch.id} locale={locale} />
      </div>
    </div>
  );
}
