import Link from 'next/link';
import { format } from 'date-fns';
import { Rocket, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, Badge, SmartImage, StatusBadge } from '@/components/ui';
import type { Launch } from '@/lib/api/launches';
import { getLaunchImage } from '@/lib/image-fallbacks';

interface LaunchCardProps {
  launch: Launch;
  locale: string;
}

export function LaunchCard({ launch, locale }: LaunchCardProps) {
  const image = getLaunchImage(launch.id, launch.images, launch.rocket.name);

  return (
    <Link href={`/${locale}/launches/${launch.id}`} className="block group">
      <Card variant="elevated" className="h-full cursor-pointer overflow-hidden">
        {/* Image with gradient overlay */}
        <div className="relative w-full aspect-[16/9] overflow-hidden image-overlay">
          <SmartImage
            src={image}
            alt={launch.name}
            fallback="launch"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <CardContent className="p-5">
          {/* Title and status */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <h3 className="text-base font-semibold text-star-white line-clamp-2 group-hover:text-cosmic-blue transition-colors duration-300">
              {launch.name}
            </h3>
            <div className="shrink-0">
              <StatusBadge status={launch.status} />
            </div>
          </div>

          {/* Info rows with icons */}
          <div className="space-y-2 text-sm text-star-dim">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
              <span className="truncate">{format(new Date(launch.date), 'yyyy-MM-dd HH:mm')}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Rocket className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
              <span className="truncate">{launch.rocket.name}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
              <span className="truncate">{launch.launchSite.name}</span>
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 text-sm text-star-dim/70 line-clamp-2 leading-relaxed">
            {launch.missionDescription}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
