import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Flag, Building2, ChevronRight, Plane, Clock } from 'lucide-react';
import { Badge, SmartImage } from '@/components/ui';
import { formatTimeInSpace, type Astronaut } from '@/lib/api/astronauts';
import { getAstronautImage } from '@/lib/image-fallbacks';
import { displayAgencyName, displayCountryName } from '@/lib/display-names';

const statusColors: Record<string, 'success' | 'default' | 'warning'> = {
  ACTIVE: 'success',
  RETIRED: 'default',
  DECEASED: 'warning',
};

interface AstronautTableRowProps {
  astronaut: Astronaut;
  locale: string;
}

export function AstronautTableRow({ astronaut, locale }: AstronautTableRowProps) {
  const t = useTranslations('astronauts');
  return (
    <Link href={`/${locale}/astronauts/${astronaut.id}`}>
      <div className="flex items-center gap-4 px-6 py-4 bg-space-800 border border-space-600 rounded-lg hover:border-cosmic-blue/60 transition-colors">
        <div className="relative w-10 h-10 rounded-full bg-space-700 shrink-0 overflow-hidden">
          <SmartImage
            src={getAstronautImage(astronaut.photo)}
            alt={astronaut.name}
            fallback="astronaut"
            fill
            sizes="40px"
            className="rounded-full"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-star-white truncate">
            {astronaut.name}
          </h3>
        </div>

        <div className="hidden sm:block min-w-[70px]">
          <Badge variant={statusColors[astronaut.status] || 'default'}>
            {t(`statuses.${astronaut.status}`)}
          </Badge>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm text-star-dim min-w-[100px]">
          <Flag className="w-4 h-4 shrink-0" />
          <span className="truncate">{displayCountryName(astronaut.nationality, locale)}</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-sm text-star-dim min-w-[100px]">
          <Building2 className="w-4 h-4 shrink-0" />
          <span className="truncate">{displayAgencyName(astronaut.agency, locale)}</span>
        </div>

        <div className="hidden xl:flex items-center gap-2 text-sm text-star-dim min-w-[80px]">
          <Plane className="w-4 h-4 shrink-0" />
          <span>{t('flightCount', { count: astronaut.spaceFlights })}</span>
        </div>

        <div className="hidden xl:flex items-center gap-2 text-sm text-star-dim min-w-[100px]">
          <Clock className="w-4 h-4 shrink-0" />
          <span>{formatTimeInSpace(astronaut.totalTimeInSpace, locale)}</span>
        </div>

        <ChevronRight className="h-5 w-5 shrink-0 text-star-dim" />
      </div>
    </Link>
  );
}
