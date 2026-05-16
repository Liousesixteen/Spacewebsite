'use client';

import dynamic from 'next/dynamic';

export const LazyScene = dynamic(
  () => import('./scene-container').then((mod) => ({ default: mod.SceneContainer })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-space-800 animate-pulse rounded-xl" />
    ),
  }
);
