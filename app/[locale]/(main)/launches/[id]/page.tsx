import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Building2, CalendarDays, CircleDot, Database, ExternalLink, Factory, Rocket, MapPin, Calendar, Users, Video, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
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
import { SourceBadge } from '@/components/ui/source-badge';
import { FavoriteButton } from '@/components/common/favorite-button';
import { CommentSection } from '@/components/common/comment-section';
import { JsonLd, buildLaunchSchema } from '@/components/seo/json-ld';
import {
  getAstronautImage,
  getLaunchImage,
} from '@/lib/image-fallbacks';
import { matchLaunchIndustry } from '@/lib/api/launch-industry';

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
  orbit?: string;
}

export default async function LaunchDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'launches.detail' });

  const launch = await prisma.launch.findUnique({
    where: { id },
    include: {
      rocket: true,
      launchSite: true,
      agency: true,
      launchPad: true,
      payloadRecords: true,
      crews: { include: { astronaut: true } },
    },
  });

  if (!launch) notFound();

  // Fetch change history for this launch
  let changeEvents: Array<{
    id: string;
    field: string;
    oldValue: string | null;
    newValue: string | null;
    detectedAt: Date;
    source: string;
  }> = [];
  try {
    changeEvents = await prisma.changeEvent.findMany({
      where: { entityType: 'Launch', entityId: launch.id },
      select: {
        id: true,
        field: true,
        oldValue: true,
        newValue: true,
        detectedAt: true,
        source: true,
      },
      orderBy: { detectedAt: 'desc' },
      take: 20,
    });
  } catch {
    // best-effort: change history is non-critical
  }

  const payloads = Array.isArray(launch.payloads)
    ? (launch.payloads as unknown as PayloadItem[])
    : [];
  const displayPayloads =
    launch.payloadRecords.length > 0
      ? launch.payloadRecords.map((payload) => ({
          name: payload.name,
          type: payload.type || t('unknown'),
          orbit: payload.orbit || undefined,
        }))
      : payloads;

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

  const industryCompanies = launch.agency
    ? await prisma.company.findMany({
        select: {
          id: true,
          name: true,
          country: true,
          segments: {
            select: {
              segment: {
                select: { id: true, name: true, level: true },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      })
    : [];
  const industryContext = matchLaunchIndustry(
    {
      agencyName: launch.agency?.name,
      agencyAbbrev: launch.agency?.abbrev,
      country: launch.agency?.country,
    },
    industryCompanies
  );

  const launchUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${locale}/launches/${launch.id}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* JSON-LD structured data */}
      <JsonLd
        data={buildLaunchSchema({
          name: launch.name,
          description: launch.missionDescription,
          startDate: (launch.windowStart ?? launch.date).toISOString(),
          endDate: launch.windowEnd?.toISOString(),
          location: launch.launchSite?.name,
          status: launch.status,
          url: launchUrl,
          image: launch.images?.[0] ?? null,
          organizer: launch.agency ? { name: launch.agency.name } : null,
        })}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: 'SpaceData', href: `/${locale}` },
          { label: t('breadcrumb'), href: `/${locale}/launches` },
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
              {t('launchInfo')}
            </h2>
            <div className="space-y-4 text-star-dim">
              <div className="flex items-center gap-3 p-3 bg-space-700/50 rounded-lg">
                <Calendar className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
                <span>{format(new Date(launch.date), 'yyyy-MM-dd HH:mm:ss')}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-space-700/50 rounded-lg">
                <MapPin className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
                <span>{launch.launchPad?.name || launch.launchSite.name}</span>
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
                    {t('watchVideo')}
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
              {t('rocketInfo')}
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
                <span>{t('manufacturer')}</span>
                <span className="text-star-white">{launch.rocket.manufacturer}</span>
              </div>
              <div className="flex justify-between p-2">
                <span>{t('country')}</span>
                <span className="text-star-white">{launch.rocket.country}</span>
              </div>
              <div className="flex justify-between p-2">
                <span>{t('successRate')}</span>
                <span className="text-emerald-400 font-semibold">{launch.rocket.successRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mission Metadata */}
      <Card variant="elevated" className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-star-white mb-5 flex items-center gap-2">
            <CircleDot className="w-5 h-5 text-cosmic-blue" />
            {t('missionMetadata')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <InfoLine
              icon={Building2}
              label={t('provider')}
              value={
                launch.agency ? (
                  <Link
                    href={`/${locale}/agencies/${launch.agency.id}`}
                    className="truncate text-cosmic-blue transition-colors hover:text-cosmic-cyan"
                  >
                    {launch.agency.name}
                  </Link>
                ) : (
                  t('unknown')
                )
              }
            />
            <InfoLine icon={MapPin} label={t('launchPad')} value={launch.launchPad?.name || t('unknown')} />
            <InfoLine icon={CircleDot} label={t('missionType')} value={launch.missionType || t('unknown')} />
            <InfoLine icon={CircleDot} label={t('orbit')} value={launch.orbitName || launch.orbitAbbrev || t('unknown')} />
            <InfoLine icon={Database} label={t('source')} value={launch.source || t('unknown')} />
            <InfoLine
              icon={Calendar}
              label={t('lastSynced')}
              value={launch.lastSyncedAt ? format(new Date(launch.lastSyncedAt), 'yyyy-MM-dd HH:mm') : t('unknown')}
            />
          </div>
          {(launch.webcastUrl || launch.articleUrl || launch.wikiUrl || launch.sourceUrl) && (
            <div className="mt-5 flex flex-wrap gap-3">
              <ExternalButton href={launch.webcastUrl || launch.videoUrl} label={t('webcast')} />
              <ExternalButton href={launch.articleUrl} label={t('article')} />
              <ExternalButton href={launch.wikiUrl} label={t('wiki')} />
              <ExternalButton href={launch.sourceUrl} label={t('source')} />
              <a
                href={`/api/launches/${launch.id}/ics`}
                className="inline-flex items-center gap-2 rounded-lg border border-space-600/40 bg-space-800/60 px-3 py-2 text-xs font-medium text-star-dim hover:text-star-white hover:border-cosmic-blue/50 transition-colors"
                download
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {t('addToCalendar')}
              </a>
            </div>
          )}
          {/* Source credibility */}
          <div className="mt-4">
            <SourceBadge
              tier={launch.source === 'Launch Library 2' ? 'B' : 'C'}
              factType="OBSERVED"
              lastSyncedAt={launch.lastSyncedAt}
              locale={locale}
            />
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated" className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-star-white">
                <Factory className="h-5 w-5 text-cosmic-blue" />
                {t('industryContext')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-star-dim">
                {t('industryContextDescription')}
              </p>
            </div>
            <Link
              href={`/${locale}/industry${launch.agency?.country ? `?country=${encodeURIComponent(launch.agency.country)}` : ''}`}
              className="inline-flex h-9 shrink-0 items-center rounded border border-space-500 px-3 text-sm text-star-white transition-colors hover:border-cosmic-blue hover:text-cosmic-cyan"
            >
              {t('viewIndustryChain')}
            </Link>
          </div>

          {industryContext.companies.length > 0 ? (
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                {industryContext.companies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/${locale}/industry/companies/${company.id}`}
                    className="inline-flex items-center gap-2 rounded border border-space-600 bg-space-800/55 px-3 py-2 text-sm text-star-white transition-colors hover:border-cosmic-blue hover:text-cosmic-cyan"
                  >
                    <Building2 className="h-4 w-4" />
                    {company.name}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {industryContext.segments.map((segment) => (
                  <Link
                    key={segment.id}
                    href={`/${locale}/industry/companies?segmentId=${segment.id}`}
                  >
                    <Badge variant="default">
                      {t(`industryLevels.${segment.level}`)} · {segment.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-md border border-space-600/70 bg-space-800/35 px-4 py-4 text-sm text-star-dim">
              {t('noVerifiedIndustryLink')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mission Description */}
      <Card variant="elevated" className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-star-white mb-4">
            {t('missionDescription')}
          </h2>
          <div className="gradient-divider mb-4" />
          <p className="text-star-dim leading-relaxed text-base">
            {launch.missionDescription || t('noDescription')}
          </p>
        </CardContent>
      </Card>

      {/* Crew */}
      {launch.crews.length > 0 && (
        <Card variant="elevated" className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-5 flex items-center gap-2">
              <Users className="w-5 h-5 text-cosmic-blue" />
              {t('crewMembers')}
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
      {displayPayloads.length > 0 && (
        <Card variant="elevated" className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-4">
              {t('payloadInfo')}
            </h2>
            <div className="space-y-2">
              {displayPayloads.map((payload, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3.5 bg-space-700/50 rounded-xl border border-space-600/30"
                >
                  <span className="text-star-white font-medium">{payload.name}</span>
                  <div className="flex gap-2">
                    <Badge variant="default">{payload.type}</Badge>
                    {payload.orbit && <Badge variant="hud">{payload.orbit}</Badge>}
                  </div>
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
              {t('relatedRocket')}
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
              {t('relatedLaunchSite')}
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
                {t('relatedSpacecraft')}
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
                {t('similarLaunches')}
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

      {/* Change History */}
      {changeEvents.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-star-white mb-4">
            {t('changeHistory')}
          </h2>
          <Card variant="elevated">
            <CardContent className="p-5">
              <div className="space-y-3">
                {changeEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 rounded-lg border border-space-600/30 bg-space-700/30 p-3"
                  >
                    <div className="mt-0.5 shrink-0">
                      <CircleDot className="h-4 w-4 text-cosmic-blue/70" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium text-star-white">
                          {event.field === 'status'
                            ? t('fieldStatus')
                            : event.field === 'date'
                              ? t('fieldDate')
                              : event.field}
                        </span>
                        <span className="text-star-dim">
                          {event.oldValue || '—'} → {event.newValue || '—'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-star-dim/70">
                        <span>
                          {new Intl.DateTimeFormat(locale, {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(new Date(event.detectedAt))}
                        </span>
                        <span>·</span>
                        <span>{event.source}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comments */}
      <div className="mt-8">
        <CommentSection targetType="LAUNCH" targetId={launch.id} locale={locale} />
      </div>
    </div>
  );
}

function InfoLine({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-space-600/50 bg-space-700/40 p-3 text-star-dim">
      <Icon className="h-4 w-4 shrink-0 text-cosmic-blue/70" />
      <span className="shrink-0">{label}</span>
      <span className="min-w-0 truncate text-star-white">{value}</span>
    </div>
  );
}

function ExternalButton({ href, label }: { href?: string | null; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-cosmic-blue/30 bg-cosmic-blue/10 px-3 py-2 text-sm font-medium text-cosmic-blue transition-colors hover:border-cosmic-cyan/50 hover:text-cosmic-cyan"
    >
      <ExternalLink className="h-4 w-4" />
      {label}
    </a>
  );
}
