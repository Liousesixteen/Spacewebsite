import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionDividerProps {
  /** Optional centered icon */
  icon?: LucideIcon;
  /** Optional centered text */
  label?: string;
  /** Spacing variant */
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SectionDivider({
  icon: Icon,
  label,
  spacing = 'md',
  className,
}: SectionDividerProps) {
  const spacingClasses = {
    sm: 'my-8',
    md: 'my-12',
    lg: 'my-16',
  };

  if (!Icon && !label) {
    // Simple gradient line
    return (
      <div className={cn(spacingClasses[spacing], className)}>
        <div className="gradient-divider" />
      </div>
    );
  }

  // With icon or label centered
  return (
    <div
      className={cn(
        spacingClasses[spacing],
        'flex items-center gap-4',
        className
      )}
    >
      <div className="flex-1 gradient-divider" />
      <div className="flex items-center gap-2 shrink-0">
        {Icon && (
          <div className="p-1.5 rounded-lg frosted-icon text-cosmic-blue">
            <Icon className="w-4 h-4" />
          </div>
        )}
        {label && (
          <span className="text-xs font-semibold text-star-dim uppercase tracking-[0.2em]">
            {label}
          </span>
        )}
      </div>
      <div className="flex-1 gradient-divider" />
    </div>
  );
}
