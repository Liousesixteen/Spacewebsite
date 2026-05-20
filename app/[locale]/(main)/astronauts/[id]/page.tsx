import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import {
  Flag,
  Building2,
  Cake,
  Plane,
  Clock,
  User,
  Users,
  Rocket,
  Calendar,
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
  Breadcrumbs,
} from '@/components/ui';
import { FavoriteButton } from '@/components/common/favorite-button';
import { CommentSection } from '@/components/common/comment-section';
import { getAstronautImage } from '@/lib/image-fallbacks';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const astronaut = await prisma.astronaut.findUnique({
      where: { id },
      select: { name: true, bio: true, photo: true, nationality: true },
    });
    if (!astronaut) return { title: '未找到 - SpaceData' };

    const description =
      astronaut.bio?.slice(0, 160) ??
      `${astronaut.name} - ${astronaut.nationality} 宇航员`;

    return {
      title: `${astronaut.name} - SpaceData`,
      description,
      openGraph: {
        title: astronaut.name,
        description,
        images: astronaut.photo ? [astronaut.photo] : undefined,
      },
    };
  } catch (error) {
    console.error('[astronaut metadata] failed:', error);
    return { title: '宇航员详情 - SpaceData' };
  }
}

const statusLabels: Record<string, string> = {
  ACTIVE: '现役',
  RETIRED: '已退役',
  DECEASED: '已故',
};

function formatTimeInSpace(minutes: number): string {
  if (!minutes || minutes < 0) return '0 小时';
  const totalHours = Math.floor(minutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days === 0) return `${hours} 小时`;
  return `${days} 天 ${hours} 小时`;
}

interface SocialLinksMap {
  [key: string]: string;
}

export default async function AstronautDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const astronaut = await prisma.astronaut.findUnique({
    where: { id },
    include: {
      launchCrews: {
        include: {
          launch: {
            include: {
              rocket: { select: { id: true, name: true, country: true } },
              launchSite: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { launch: { date: 'desc' } },
      },
    },
  });

  if (!astronaut) notFound();

  const socialLinks =
    (astronaut.socialLinks as SocialLinksMap | null) ?? null;

  // Related: astronauts from same agency
  const sameAgencyAstronauts = await prisma.astronaut.findMany({
    where: {
      id: { not: astronaut.id },
      agency: astronaut.agency,
    },
    select: {
      id: true,
      name: true,
      status: true,
      nationality: true,
    },
    orderBy: { totalTimeInSpace: 'desc' },
    take: 3,
  });

  // Related: astronauts with same nationality
  const sameNationalityAstronauts = await prisma.astronaut.findMany({
    where: {
      id: { not: astronaut.id },
      nationality: astronaut.nationality,
    },
    select: {
      id: true,
      name: true,
      status: true,
      agency: true,
    },
    orderBy: { totalTimeInSpace: 'desc' },
    take: 3,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: '航天数据', href: `/${locale}` },
          { label: '宇航员', href: `/${locale}/astronauts` },
          { label: astronaut.name },
        ]}
      />

      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <div className="relative w-32 h-32 rounded-2xl overflow-hidden shrink-0 bg-space-700">
          <SmartImage
            src={getAstronautImage(astronaut.photo)}
            alt={astronaut.name}
            fallback="astronaut"
            fill
            priority
            sizes="128px"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h1 className="text-3xl font-bold text-white">{astronaut.name}</h1>
            <div className="flex items-center gap-3">
              <StatusBadge
                status={astronaut.status}
                label={statusLabels[astronaut.status]}
                className="text-base px-4 py-1"
              />
              <FavoriteButton
                targetType="ASTRONAUT"
                targetId={astronaut.id}
                locale={locale}
                size="sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-star-dim">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-cosmic-blue" />
              <span>{astronaut.nationality}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cosmic-blue" />
              <span>{astronaut.agency}</span>
            </div>
            <div className="flex items-center gap-2">
              <Cake className="w-4 h-4 text-cosmic-blue" />
              <span>{format(new Date(astronaut.birthDate), 'yyyy-MM-dd')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-cosmic-blue" />
              <span>{astronaut.spaceFlights} 次飞行</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Clock className="w-4 h-4 text-cosmic-blue" />
              <span>累计太空时间: {formatTimeInSpace(astronaut.totalTimeInSpace)}</span>
            </div>
          </div>
        </div>
      </div>

      {socialLinks && Object.keys(socialLinks).length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-3">社交媒体</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(socialLinks).map(([platform, url]) =>
                url ? (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-space-700 rounded-lg text-cosmic-blue hover:bg-space-600"
                  >
                    {platform}
                  </a>
                ) : null
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">个人简介</h2>
          <p className="text-star-dim leading-relaxed whitespace-pre-line">
            {astronaut.bio}
          </p>
        </CardContent>
      </Card>

      {/* Mission History */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-cosmic-blue" />
            任务履历
          </h2>
          {astronaut.launchCrews.length === 0 ? (
            <p className="text-star-dim">暂无任务记录</p>
          ) : (
            <div className="space-y-3">
              {astronaut.launchCrews.map((crew) => (
                <Link
                  key={crew.id}
                  href={`/${locale}/launches/${crew.launch.id}`}
                  className="block"
                >
                  <div className="p-4 bg-space-700 rounded-lg hover:bg-space-600 transition-colors">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div>
                        <h3 className="text-white font-medium">
                          {crew.launch.name}
                        </h3>
                        <p className="text-cosmic-blue text-sm mt-1">
                          {crew.role}
                        </p>
                      </div>
                      <StatusBadge
                        status={crew.launch.status}
                        className="text-xs"
                      />
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-star-dim">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(crew.launch.date), 'yyyy-MM-dd')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Rocket className="w-4 h-4" />
                        {crew.launch.rocket.name}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Content */}
      <div className="space-y-6 mb-8">
        {/* Same Agency Astronauts */}
        {sameAgencyAstronauts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cosmic-blue" />
                同机构宇航员
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {sameAgencyAstronauts.map((a) => (
                  <Link
                    key={a.id}
                    href={`/${locale}/astronauts/${a.id}`}
                    className="p-3 bg-space-700 rounded-lg hover:bg-space-600 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-white text-sm font-medium group-hover:text-cosmic-blue transition-colors">
                        {a.name}
                      </span>
                      <StatusBadge status={a.status} className="text-xs" />
                    </div>
                    <span className="text-xs text-star-dim">{a.nationality}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Same Nationality Astronauts */}
        {sameNationalityAstronauts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-cosmic-blue" />
                同国籍宇航员
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {sameNationalityAstronauts.map((a) => (
                  <Link
                    key={a.id}
                    href={`/${locale}/astronauts/${a.id}`}
                    className="p-3 bg-space-700 rounded-lg hover:bg-space-600 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-white text-sm font-medium group-hover:text-cosmic-blue transition-colors">
                        {a.name}
                      </span>
                      <StatusBadge status={a.status} className="text-xs" />
                    </div>
                    <span className="text-xs text-star-dim">{a.agency}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8">
        <CommentSection
          targetType="ASTRONAUT"
          targetId={astronaut.id}
          locale={locale}
        />
      </div>
    </div>
  );
}
