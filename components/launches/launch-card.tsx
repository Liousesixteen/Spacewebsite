import Link from 'next/link';
import { format } from 'date-fns';
import { Rocket, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import type { Launch } from '@/lib/api/launches';

const statusColors = {
  SUCCESS: 'success',
  FAILURE: 'error',
  PLANNED: 'info',
  POSTPONED: 'warning',
  IN_FLIGHT: 'info',
} as const;

const statusLabels = {
  SUCCESS: '成功',
  FAILURE: '失败',
  PLANNED: '计划中',
  POSTPONED: '推迟',
  IN_FLIGHT: '飞行中',
} as const;

interface LaunchCardProps {
  launch: Launch;
  locale: string;
}

export function LaunchCard({ launch, locale }: LaunchCardProps) {
  return (
    <Link href={`/${locale}/launches/${launch.id}`}>
      <Card variant="glow" className="h-full cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-white line-clamp-2">
              {launch.name}
            </h3>
            <Badge
              variant={
                statusColors[launch.status as keyof typeof statusColors] ||
                'default'
              }
            >
              {statusLabels[launch.status as keyof typeof statusLabels] ||
                launch.status}
            </Badge>
          </div>

          <div className="space-y-2 text-sm text-star-dim">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(launch.date), 'yyyy-MM-dd HH:mm')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              <span>{launch.rocket.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{launch.launchSite.name}</span>
            </div>
          </div>

          <p className="mt-4 text-sm text-star-dim line-clamp-2">
            {launch.missionDescription}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
