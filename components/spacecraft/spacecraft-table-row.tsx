import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Building2, Orbit } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { Spacecraft } from '@/lib/api/spacecraft';

const statusColors: Record<string, 'success' | 'default' | 'error'> = {
  OPERATIONAL: 'success',
  RETIRED: 'default',
  LOST: 'error',
};

const statusLabels: Record<string, string> = {
  OPERATIONAL: '运行中',
  RETIRED: '已退役',
  LOST: '已失联',
};

const typeLabels: Record<string, string> = {
  SPACE_STATION: '空间站',
  SATELLITE: '卫星',
  PROBE: '探测器',
  CREWED_SPACECRAFT: '载人飞船',
  CARGO_SPACECRAFT: '货运飞船',
};

interface SpacecraftTableRowProps {
  spacecraft: Spacecraft;
  locale: string;
}

export function SpacecraftTableRow({ spacecraft, locale }: SpacecraftTableRowProps) {
  return (
    <Link href={`/${locale}/spacecraft/${spacecraft.id}`}>
      <div className="flex items-center gap-4 px-6 py-4 bg-space-800 border border-space-600 rounded-lg hover:border-cosmic-blue/60 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-star-white truncate">
              {spacecraft.name}
            </h3>
            <Badge variant={typeLabels[spacecraft.type] ? 'info' : 'default'}>
              {typeLabels[spacecraft.type] || spacecraft.type}
            </Badge>
          </div>
        </div>

        <div className="hidden sm:block min-w-[80px]">
          <Badge variant={statusColors[spacecraft.status] || 'default'}>
            {statusLabels[spacecraft.status] || spacecraft.status}
          </Badge>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm text-star-dim min-w-[120px]">
          <Building2 className="w-4 h-4 shrink-0" />
          <span className="truncate">{spacecraft.operator}</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-sm text-star-dim min-w-[160px]">
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {format(new Date(spacecraft.launchDate), 'yyyy-MM-dd')}
          </span>
        </div>

        <div className="hidden xl:flex items-center gap-2 text-sm text-star-dim min-w-[100px]">
          <Orbit className="w-4 h-4 shrink-0" />
          <span className="truncate">{spacecraft.orbitType}</span>
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
