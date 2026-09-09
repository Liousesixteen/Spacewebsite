import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Flag, Building2, Plane, Clock } from 'lucide-react';
import { Card, CardContent, Badge, SmartImage, StatusBadge } from '@/components/ui';
import { formatTimeInSpace, type Astronaut } from '@/lib/api/astronauts';
import { getAstronautImage } from '@/lib/image-fallbacks';
import { displayAgencyName, displayCountryName } from '@/lib/display-names';

interface AstronautCardProps {
  astronaut: Astronaut;
  locale: string;
}

export function AstronautCard({ astronaut, locale }: AstronautCardProps) {
  const t = useTranslations('astronauts');
  return (
    <Link href={`/${locale}/astronauts/${astronaut.id}`} className="block group">
      <Card variant="elevated" className="h-full cursor-pointer">
        <CardContent className="p-5">
          {/* Avatar + Name + Status */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative w-16 h-16 rounded-full bg-space-700 shrink-0 overflow-hidden ring-2 ring-space-600/50 group-hover:ring-cosmic-blue/40 transition-all duration-300">
              <SmartImage
                src={getAstronautImage(astronaut.photo)}
                alt={astronaut.name}
                fallback="astronaut"
                fill
                sizes="64px"
                className="rounded-full transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-star-white line-clamp-2 group-hover:text-cosmic-blue transition-colors duration-300">
                  {astronaut.name}
                </h3>
                <div className="shrink-0">
                  <StatusBadge
                    status={astronaut.status}
                    label={t(`statuses.${astronaut.status}`)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-2.5 text-sm text-star-dim">
            <div className="flex items-center gap-2.5">
              <Flag className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
              <span>{displayCountryName(astronaut.nationality, locale)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
              <span className="truncate">{displayAgencyName(astronaut.agency, locale)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Plane className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
              <span>{t('flightCount', { count: astronaut.spaceFlights })}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
              <span>{formatTimeInSpace(astronaut.totalTimeInSpace, locale)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
