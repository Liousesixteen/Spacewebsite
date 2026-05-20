import Link from 'next/link';
import { Cpu, Tag } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import type { BadgeProps } from '@/components/ui';
import type { Technology } from '@/lib/api/industry';

const maturityColors: Record<string, BadgeProps['variant']> = {
  RESEARCH: 'info',
  EXPERIMENTAL: 'warning',
  APPLIED: 'success',
  MATURE: 'success',
};

const maturityLabels: Record<string, string> = {
  RESEARCH: '研究阶段',
  EXPERIMENTAL: '试验阶段',
  APPLIED: '应用阶段',
  MATURE: '成熟阶段',
};

interface TechnologyCardProps {
  technology: Technology;
  locale: string;
}

export function TechnologyCard({ technology, locale }: TechnologyCardProps) {
  return (
    <Link href={`/${locale}/industry/technologies/${technology.id}`}>
      <Card variant="glow" className="h-full cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-2">
              <Cpu className="w-5 h-5 text-cosmic-blue mt-1 shrink-0" />
              <h3 className="text-lg font-semibold text-star-white line-clamp-2">
                {technology.name}
              </h3>
            </div>
            <Badge
              variant={maturityColors[technology.maturityLevel] || 'default'}
            >
              {maturityLabels[technology.maturityLevel] ||
                technology.maturityLevel}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-star-dim" />
            <Badge variant="default">{technology.category}</Badge>
          </div>

          <p className="text-sm text-star-dim line-clamp-3">
            {technology.description}
          </p>

          {technology.applications.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {technology.applications.slice(0, 3).map((app, index) => (
                <Badge key={index} variant="info" className="text-xs">
                  {app}
                </Badge>
              ))}
              {technology.applications.length > 3 && (
                <Badge variant="default" className="text-xs">
                  +{technology.applications.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
