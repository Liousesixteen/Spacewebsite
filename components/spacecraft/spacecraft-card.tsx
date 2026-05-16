import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Building2, Orbit } from 'lucide-react';
import { Card, CardContent, Badge, SmartImage } from '@/components/ui';
import type { Spacecraft } from '@/lib/api/spacecraft';
import { getSpacecraftImage } from '@/lib/image-fallbacks';

const statusColors = {
  OPERATIONAL: 'success',
  RETIRED: 'default',
  LOST: 'error',
} as const;

const statusLabels = {
  OPERATIONAL: '运行中',
  RETIRED: '已退役',
  LOST: '已失联',
} as const;

const typeLabels = {
  SPACE_STATION: '空间站',
  SATELLITE: '卫星',
  PROBE: '探测器',
  CREWED_SPACECRAFT: '载人飞船',
  CARGO_SPACECRAFT: '货运飞船',
} as const;

interface SpacecraftCardProps {
  spacecraft: Spacecraft;
  locale: string;
}

export function SpacecraftCard({ spacecraft, locale }: SpacecraftCardProps) {
  const image = getSpacecraftImage(
    spacecraft.id,
    spacecraft.images,
    spacecraft.name
  );

  return (
    <Link href={`/${locale}/spacecraft/${spacecraft.id}`}>
      <Card variant="glow" className="h-full cursor-pointer overflow-hidden">
        <div className="relative w-full aspect-[16/9]">
          <SmartImage
            src={image}
            alt={spacecraft.name}
            fallback="satellite"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4 gap-2">
            <h3 className="text-lg font-semibold text-white line-clamp-2">
              {spacecraft.name}
            </h3>
            <Badge variant={statusColors[spacecraft.status]}>
              {statusLabels[spacecraft.status]}
            </Badge>
          </div>

          <div className="space-y-2 text-sm text-star-dim">
            <div className="flex items-center gap-2">
              <Badge variant="info">{typeLabels[spacecraft.type]}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{spacecraft.operator}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(spacecraft.launchDate), 'yyyy-MM-dd')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Orbit className="w-4 h-4" />
              <span>
                {spacecraft.orbitType}
                {spacecraft.orbitAltitude
                  ? ` · ${spacecraft.orbitAltitude} km`
                  : ''}
              </span>
            </div>
          </div>

          <p className="mt-4 text-sm text-star-dim line-clamp-2">
            {spacecraft.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
