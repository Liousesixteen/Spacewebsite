import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Building2, CircleDot, Rocket, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, Badge, SmartImage, StatusBadge } from '@/components/ui';
import type { Launch } from '@/lib/api/launches';
import { getLaunchImage } from '@/lib/image-fallbacks';
import { formatLaunchDateTime } from '@/lib/launch-time';
import {
  displayAgencyName,
  displayLaunchName,
  displayLocalizedDescription,
  displayMissionType,
  displayOrbitName,
  displayRocketName,
  displaySiteName,
} from '@/lib/display-names';

interface LaunchCardProps {
  launch: Launch;
  locale: string;
}

export function LaunchCard({ launch, locale }: LaunchCardProps) {
  const statusT = useTranslations('launches.status');
  const overviewT = useTranslations('launches.overview');
  const image = getLaunchImage(launch.id, launch.images, launch.rocket.name);
  const displayName = displayLaunchName(launch.name, locale, overviewT('unknownPayload'));

  return (
    <Link href={`/${locale}/launches/${launch.id}`} className="block group">
      <Card variant="elevated" className="h-full cursor-pointer overflow-hidden">
        {/* Image with gradient overlay */}
        <div className="relative w-full aspect-[16/9] overflow-hidden image-overlay">
          <SmartImage
            src={image}
            alt={displayName}
            fallback="launch"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <CardContent className="p-5">
          {/* Title and status */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <h3 className="text-base font-semibold text-star-white line-clamp-2 group-hover:text-cosmic-blue transition-colors duration-300">
              {displayName}
            </h3>
            <div className="shrink-0">
              <StatusBadge status={launch.status} label={statusT(launch.status)} />
            </div>
          </div>

          {/* Info rows with icons */}
          <div className="space-y-2 text-sm text-star-dim">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
              <span className="truncate">{formatLaunchDateTime(launch.date, locale)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Rocket className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
              <span className="truncate">{displayRocketName(launch.rocket.name, locale)}</span>
            </div>
            {launch.agency?.name && (
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
                <span className="truncate">{displayAgencyName(launch.agency.name, locale)}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
              <span className="truncate">{displaySiteName(launch.launchSite.name, locale)}</span>
            </div>
          </div>

          {(launch.missionType || launch.orbitName || launch.orbitAbbrev) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {launch.missionType && (
                <Badge variant="info" className="normal-case tracking-normal">
                  {displayMissionType(launch.missionType, locale)}
                </Badge>
              )}
              {(launch.orbitName || launch.orbitAbbrev) && (
                <Badge variant="hud" className="normal-case tracking-normal">
                  <CircleDot className="mr-1 h-3 w-3" />
                  {displayOrbitName(launch.orbitName, launch.orbitAbbrev, locale)}
                </Badge>
              )}
            </div>
          )}

          {/* Description */}
          <p className="mt-4 text-sm text-star-dim/70 line-clamp-2 leading-relaxed">
            {displayLocalizedDescription(
              launch.missionDescription,
              locale,
              overviewT('waitingDetails')
            )}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
