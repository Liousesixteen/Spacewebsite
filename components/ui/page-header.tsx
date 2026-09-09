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
    <div className={cn('mb-7 border-b border-space-600/35 pb-6', className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 shrink-0 rounded-md border border-cosmic-blue/25 bg-cosmic-blue/10 p-2.5 text-cosmic-blue">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-semibold text-star-white sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-star-dim">
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
