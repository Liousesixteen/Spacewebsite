'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-white">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-star-dim">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const baseFieldClass =
  'w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue';

export function TextField(
  props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
) {
  const { className, invalid, ...rest } = props;
  return (
    <input
      {...rest}
      className={cn(baseFieldClass, invalid && 'border-red-500/60', className)}
    />
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
) {
  const { className, invalid, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={cn(baseFieldClass, 'min-h-[120px]', invalid && 'border-red-500/60', className)}
    />
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
) {
  const { className, invalid, ...rest } = props;
  return (
    <select
      {...rest}
      className={cn(baseFieldClass, invalid && 'border-red-500/60', className)}
    />
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {message}
    </div>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-3 pt-4">{children}</div>;
}
