import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-cosmic-blue focus:ring-offset-2 focus:ring-offset-space-900',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-cosmic-blue text-white hover:bg-cosmic-blue/90 glow-blue': variant === 'primary',
            'bg-space-600 text-white hover:bg-space-500': variant === 'secondary',
            'bg-transparent text-star-dim hover:text-white hover:bg-space-700': variant === 'ghost',
            'border border-space-500 text-white hover:bg-space-700 hover:border-cosmic-blue': variant === 'outline',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
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
