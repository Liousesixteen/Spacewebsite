import Link from 'next/link';
import { User, Flag, Building2, Plane, Clock } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import { formatTimeInSpace, type Astronaut } from '@/lib/api/astronauts';

const statusColors = {
  ACTIVE: 'success',
  RETIRED: 'default',
  DECEASED: 'warning',
} as const;

const statusLabels = {
  ACTIVE: '现役',
  RETIRED: '已退役',
  DECEASED: '已故',
} as const;

interface AstronautCardProps {
  astronaut: Astronaut;
  locale: string;
}

export function AstronautCard({ astronaut, locale }: AstronautCardProps) {
  return (
    <Link href={`/${locale}/astronauts/${astronaut.id}`}>
      <Card variant="glow" className="h-full cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-space-700 flex items-center justify-center shrink-0 overflow-hidden">
              {astronaut.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={astronaut.photo}
                  alt={astronaut.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-star-dim" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-white line-clamp-2">
                  {astronaut.name}
                </h3>
                <Badge variant={statusColors[astronaut.status]}>
                  {statusLabels[astronaut.status]}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-star-dim">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              <span>{astronaut.nationality}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{astronaut.agency}</span>
            </div>
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4" />
              <span>{astronaut.spaceFlights} 次飞行</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTimeInSpace(astronaut.totalTimeInSpace)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
