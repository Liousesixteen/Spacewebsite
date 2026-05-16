'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type SmartImageFallback =
  | 'rocket'
  | 'satellite'
  | 'astronaut'
  | 'launch'
  | 'company'
  | 'generic';

export interface SmartImageProps {
  src?: string | null;
  alt: string;
  fallback?: SmartImageFallback;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

const fallbackGradients: Record<SmartImageFallback, string> = {
  rocket: 'from-orange-500/20 via-red-500/10 to-purple-500/20',
  satellite: 'from-cyan-500/20 via-blue-500/10 to-purple-500/20',
  astronaut: 'from-blue-500/20 via-purple-500/10 to-pink-500/20',
  launch: 'from-orange-600/20 via-yellow-500/10 to-red-500/20',
  company: 'from-slate-500/20 via-gray-500/10 to-slate-500/20',
  generic: 'from-cosmic-blue/20 via-cosmic-purple/10 to-cosmic-cyan/20',
};

const fallbackIcons: Record<SmartImageFallback, string> = {
  rocket: '🚀',
  satellite: '🛰️',
  astronaut: '👨‍🚀',
  launch: '🔥',
  company: '🏢',
  generic: '⭐',
};

function isValidUrl(url?: string | null): boolean {
  if (!url) return false;
  if (url.includes('example.com')) return false;
  if (url.startsWith('http://')) return false; // require https
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function SmartImage({
  src,
  alt,
  fallback = 'generic',
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: SmartImageProps) {
  const [error, setError] = useState(false);
  const valid = isValidUrl(src) && !error;

  if (!valid) {
    return (
      <div
        className={cn(
          'relative flex items-center justify-center',
          'bg-gradient-to-br',
          fallbackGradients[fallback],
          'border border-space-600/50',
          className
        )}
      >
        <span className="text-6xl opacity-40">{fallbackIcons[fallback]}</span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src!}
        alt={alt}
        fill
        sizes={sizes ?? '(max-width: 768px) 100vw, 50vw'}
        className={cn('object-cover', className)}
        priority={priority}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <Image
      src={src!}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      className={cn('object-cover', className)}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
