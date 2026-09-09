import Link from 'next/link';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { Calendar, Building2, Orbit } from 'lucide-react';
import { Card, CardContent, Badge, SmartImage, StatusBadge } from '@/components/ui';
import type { Spacecraft } from '@/lib/api/spacecraft';
import { getSpacecraftImage } from '@/lib/image-fallbacks';
import { displayAgencyName, displayLocalizedDescription } from '@/lib/display-names';

interface SpacecraftCardProps {
  spacecraft: Spacecraft;
  locale: string;
}

export function SpacecraftCard({ spacecraft, locale }: SpacecraftCardProps) {
  const t = useTranslations('spacecraft');
  const image = getSpacecraftImage(
    spacecraft.id,
    spacecraft.images,
    spacecraft.name
  );

  return (
    <Link href={`/${locale}/spacecraft/${spacecraft.id}`} className="block group">
      <Card variant="elevated" className="h-full cursor-pointer overflow-hidden">
        {/* Image with gradient overlay */}
        <div className="relative w-full aspect-[16/9] overflow-hidden image-overlay">
          <SmartImage
            src={image}
            alt={spacecraft.name}
            fallback="satellite"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <CardContent className="p-5">
          {/* Title and status */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <h3 className="text-base font-semibold text-star-white line-clamp-2 group-hover:text-cosmic-blue transition-colors duration-300">
              {spacecraft.name}
            </h3>
            <div className="shrink-0">
              <StatusBadge
                status={spacecraft.status}
                label={t(`statuses.${spacecraft.status}`)}
              />
            </div>
          </div>

          {/* Type badge */}
          <div className="mb-3">
            <Badge variant="info">
              {t(`types.${spacecraft.type}`)}
            </Badge>
          </div>

          {/* Info rows */}
          <div className="space-y-2 text-sm text-star-dim">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
              <span className="truncate">
                {displayAgencyName(spacecraft.operator, locale)}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
              <span className="truncate">
                {format(new Date(spacecraft.launchDate), 'yyyy-MM-dd')}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Orbit className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
              <span className="truncate">
                {t.has(`orbits.${spacecraft.orbitType}`)
                  ? t(`orbits.${spacecraft.orbitType}`)
                  : spacecraft.orbitType}
                {spacecraft.orbitAltitude
                  ? ` · ${spacecraft.orbitAltitude} km`
                  : ''}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 text-sm text-star-dim/70 line-clamp-2 leading-relaxed">
            {displayLocalizedDescription(
              spacecraft.description,
              locale,
              t('noDescription')
            )}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
