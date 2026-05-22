import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'hud';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider transition-colors duration-200',
        {
          'bg-space-600/80 text-star-dim border border-space-500/30': variant === 'default',
          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30': variant === 'success',
          'bg-amber-500/15 text-amber-400 border border-amber-500/30': variant === 'warning',
          'bg-red-500/15 text-red-400 border border-red-500/30': variant === 'error',
          'bg-cosmic-blue/15 text-cosmic-blue border border-cosmic-blue/30': variant === 'info',
          'bg-transparent border border-cosmic-cyan/30 text-cosmic-cyan font-mono text-[10px] tracking-[0.15em]': variant === 'hud',
        },
        className
      )}
      {...props}
    />
  );
}
