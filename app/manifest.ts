import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SpaceData — 航天数据平台',
    short_name: 'SpaceData',
    description: '全球航天数据平台：实时追踪火箭发射、航天器、宇航员和航天产业链',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0e1a',
    theme_color: '#3b82f6',
    orientation: 'any',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
