import Link from 'next/link';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { Calendar, Building2, ChevronRight, Orbit } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { Spacecraft } from '@/lib/api/spacecraft';
import { displayAgencyName } from '@/lib/display-names';

const statusColors: Record<string, 'success' | 'default' | 'error'> = {
  OPERATIONAL: 'success',
  RETIRED: 'default',
  LOST: 'error',
};

interface SpacecraftTableRowProps {
  spacecraft: Spacecraft;
  locale: string;
}

export function SpacecraftTableRow({ spacecraft, locale }: SpacecraftTableRowProps) {
  const t = useTranslations('spacecraft');
  return (
    <Link href={`/${locale}/spacecraft/${spacecraft.id}`}>
      <div className="flex items-center gap-4 px-6 py-4 bg-space-800 border border-space-600 rounded-lg hover:border-cosmic-blue/60 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-star-white truncate">
              {spacecraft.name}
            </h3>
            <Badge variant="info">
              {t(`types.${spacecraft.type}`)}
            </Badge>
          </div>
        </div>

        <div className="hidden sm:block min-w-[80px]">
          <Badge variant={statusColors[spacecraft.status] || 'default'}>
            {t(`statuses.${spacecraft.status}`)}
          </Badge>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm text-star-dim min-w-[120px]">
          <Building2 className="w-4 h-4 shrink-0" />
          <span className="truncate">{displayAgencyName(spacecraft.operator, locale)}</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-sm text-star-dim min-w-[160px]">
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {format(new Date(spacecraft.launchDate), 'yyyy-MM-dd')}
          </span>
        </div>

        <div className="hidden xl:flex items-center gap-2 text-sm text-star-dim min-w-[100px]">
          <Orbit className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {t.has(`orbits.${spacecraft.orbitType}`)
              ? t(`orbits.${spacecraft.orbitType}`)
              : spacecraft.orbitType}
          </span>
        </div>

        <ChevronRight className="h-5 w-5 shrink-0 text-star-dim" />
      </div>
    </Link>
  );
}
