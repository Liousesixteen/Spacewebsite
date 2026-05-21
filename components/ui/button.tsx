import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-cosmic-blue focus:ring-offset-2 focus:ring-offset-space-900',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-[0.97]',
          {
            // Primary: gradient background with glow
            'bg-gradient-to-r from-cosmic-blue to-cosmic-purple text-white shadow-glow-blue hover:shadow-glow-purple hover:brightness-110':
              variant === 'primary',
            // Secondary: glass style
            'bg-space-600 text-star-white hover:bg-space-500 shadow-card':
              variant === 'secondary',
            // Ghost: transparent with hover
            'bg-transparent text-star-dim hover:text-star-white hover:bg-space-800/80':
              variant === 'ghost',
            // Outline: glass border with gradient border on hover
            'glass border border-space-600/60 text-star-white hover:text-cosmic-blue hover:border-cosmic-blue/50 hover:shadow-glow-blue':
              variant === 'outline',
            // Pulse: animated glow for CTAs
            'bg-gradient-to-r from-cosmic-blue to-cosmic-purple text-white shadow-glow-blue animate-pulse-glow hover:brightness-110':
              variant === 'pulse',
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
