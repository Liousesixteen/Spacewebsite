import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'pulse' | 'hud';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-cosmic-blue focus:ring-offset-2 focus:ring-offset-space-900',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-[0.97]',
          {
            'bg-cosmic-blue text-white shadow-[0_8px_24px_rgba(59,130,246,0.18)] hover:bg-cosmic-blue/85':
              variant === 'primary',
            // Secondary
            'bg-space-600 text-star-white hover:bg-space-500 shadow-card':
              variant === 'secondary',
            // Ghost: transparent with hover
            'bg-transparent text-star-dim hover:text-star-white hover:bg-space-800/80':
              variant === 'ghost',
            // Outline: fine 1px border, hover glow
            'bg-transparent border border-space-600/60 text-star-white hover:text-cosmic-blue hover:border-cosmic-blue/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]':
              variant === 'outline',
            // Pulse: animated glow for CTAs
            'bg-cosmic-blue text-white shadow-glow-blue animate-pulse-glow hover:bg-cosmic-blue/85':
              variant === 'pulse',
            // HUD: transparent bg, 1px cyan border, monospace font
            'bg-transparent border border-cosmic-cyan/40 text-cosmic-cyan font-mono text-xs tracking-wider uppercase hover:border-cosmic-cyan hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:text-white':
              variant === 'hud',
          },
          {
            'px-3 py-1.5 text-sm rounded-md': size === 'sm',
            'px-5 py-2.5 text-sm': size === 'md',
            'px-8 py-4 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
