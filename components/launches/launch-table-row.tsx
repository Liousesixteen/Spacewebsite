import Link from 'next/link';
import { format } from 'date-fns';
import { Rocket, MapPin, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { Launch } from '@/lib/api/launches';

const statusColors = {
  SUCCESS: 'success',
  FAILURE: 'error',
  PLANNED: 'info',
  POSTPONED: 'warning',
  IN_FLIGHT: 'info',
} as const;

const statusLabels: Record<string, string> = {
  SUCCESS: '成功',
  FAILURE: '失败',
  PLANNED: '计划中',
  POSTPONED: '推迟',
  IN_FLIGHT: '飞行中',
};

interface LaunchTableRowProps {
  launch: Launch;
  locale: string;
}

export function LaunchTableRow({ launch, locale }: LaunchTableRowProps) {
  return (
    <Link href={`/${locale}/launches/${launch.id}`}>
      <div className="flex items-center gap-4 px-6 py-4 bg-space-800 border border-space-600 rounded-lg hover:border-cosmic-blue/60 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-star-white truncate">
              {launch.name}
            </h3>
            <Badge
              variant={
                (statusColors[launch.status as keyof typeof statusColors] as 'success' | 'error' | 'info' | 'warning' | 'default') ||
                'default'
              }
            >
              {statusLabels[launch.status] || launch.status}
            </Badge>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-sm text-star-dim min-w-[180px]">
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {format(new Date(launch.date), 'yyyy-MM-dd HH:mm')}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm text-star-dim min-w-[140px]">
          <Rocket className="w-4 h-4 shrink-0" />
          <span className="truncate">{launch.rocket.name}</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-sm text-star-dim min-w-[120px]">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{launch.launchSite.name}</span>
        </div>

        <ChevronRightIcon />
      </div>
    </Link>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="w-5 h-5 text-star-dim shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}
