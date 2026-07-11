import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4 sm:items-center">
          {/* Frosted glass icon */}
          <div className="shrink-0 p-3 rounded-xl frosted-icon text-cosmic-blue shadow-glow-blue">
            <Icon className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-bold text-star-white page-header-underline pb-2">
              {title}
            </h1>
            {description && (
              <p className="text-star-dim mt-2 text-sm leading-relaxed max-w-xl">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="w-full sm:w-auto sm:shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
