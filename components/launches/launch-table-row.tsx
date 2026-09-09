import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Building2, ChevronRight, Rocket, MapPin, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { Launch } from '@/lib/api/launches';
import { formatLaunchDateTime } from '@/lib/launch-time';
import {
  displayAgencyName,
  displayLaunchName,
  displayMissionType,
  displayRocketName,
  displaySiteName,
} from '@/lib/display-names';

const statusColors = {
  SUCCESS: 'success',
  FAILURE: 'error',
  PLANNED: 'info',
  POSTPONED: 'warning',
  IN_FLIGHT: 'info',
} as const;

interface LaunchTableRowProps {
  launch: Launch;
  locale: string;
}

export function LaunchTableRow({ launch, locale }: LaunchTableRowProps) {
  const statusT = useTranslations('launches.status');
  const overviewT = useTranslations('launches.overview');
  const displayName = displayLaunchName(launch.name, locale, overviewT('unknownPayload'));

  return (
    <Link href={`/${locale}/launches/${launch.id}`}>
      <div className="flex items-center gap-4 px-6 py-4 bg-space-800 border border-space-600 rounded-lg hover:border-cosmic-blue/60 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-star-white truncate">
              {displayName}
            </h3>
            <Badge
              variant={
                (statusColors[launch.status as keyof typeof statusColors] as 'success' | 'error' | 'info' | 'warning' | 'default') ||
                'default'
              }
            >
              {statusT(launch.status)}
            </Badge>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-sm text-star-dim min-w-[180px]">
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {formatLaunchDateTime(launch.date, locale)}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm text-star-dim min-w-[140px]">
          <Rocket className="w-4 h-4 shrink-0" />
          <span className="truncate">{displayRocketName(launch.rocket.name, locale)}</span>
        </div>

        <div className="hidden xl:flex items-center gap-2 text-sm text-star-dim min-w-[150px]">
          <Building2 className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {launch.agency?.name
              ? displayAgencyName(launch.agency.name, locale)
              : displayMissionType(launch.missionType, locale) || '-'}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-sm text-star-dim min-w-[120px]">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {displaySiteName(launch.launchPad?.name || launch.launchSite.name, locale)}
          </span>
        </div>

        <ChevronRight className="h-5 w-5 shrink-0 text-star-dim" />
      </div>
    </Link>
  );
}
