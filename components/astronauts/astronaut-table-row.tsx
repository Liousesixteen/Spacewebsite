import Link from 'next/link';
import { Flag, Building2, Plane, Clock } from 'lucide-react';
import { Badge, SmartImage } from '@/components/ui';
import { formatTimeInSpace, type Astronaut } from '@/lib/api/astronauts';
import { getAstronautImage } from '@/lib/image-fallbacks';

const statusColors: Record<string, 'success' | 'default' | 'warning'> = {
  ACTIVE: 'success',
  RETIRED: 'default',
  DECEASED: 'warning',
};

const statusLabels: Record<string, string> = {
  ACTIVE: '现役',
  RETIRED: '已退役',
  DECEASED: '已故',
};

interface AstronautTableRowProps {
  astronaut: Astronaut;
  locale: string;
}

export function AstronautTableRow({ astronaut, locale }: AstronautTableRowProps) {
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
            {statusLabels[astronaut.status] || astronaut.status}
          </Badge>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm text-star-dim min-w-[100px]">
          <Flag className="w-4 h-4 shrink-0" />
          <span className="truncate">{astronaut.nationality}</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-sm text-star-dim min-w-[100px]">
          <Building2 className="w-4 h-4 shrink-0" />
          <span className="truncate">{astronaut.agency}</span>
        </div>

        <div className="hidden xl:flex items-center gap-2 text-sm text-star-dim min-w-[80px]">
          <Plane className="w-4 h-4 shrink-0" />
          <span>{astronaut.spaceFlights} 次</span>
        </div>

        <div className="hidden xl:flex items-center gap-2 text-sm text-star-dim min-w-[100px]">
          <Clock className="w-4 h-4 shrink-0" />
          <span>{formatTimeInSpace(astronaut.totalTimeInSpace)}</span>
        </div>

        <svg
          className="w-5 h-5 text-star-dim shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
