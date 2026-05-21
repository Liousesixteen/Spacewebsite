import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200',
        {
          'bg-space-600/80 text-star-dim ring-1 ring-space-500/40': variant === 'default',
          'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30': variant === 'success',
          'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30': variant === 'warning',
          'bg-red-500/15 text-red-400 ring-1 ring-red-500/30': variant === 'error',
          'bg-cosmic-blue/15 text-cosmic-blue ring-1 ring-cosmic-blue/30': variant === 'info',
        },
        className
      )}
      {...props}
    />
  );
}
