import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full px-4 py-2 rounded-lg',
          'bg-space-700 border border-space-500',
          'text-white placeholder:text-star-dim',
          'focus:outline-none focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue',
          'transition-colors duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
