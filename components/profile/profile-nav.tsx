'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ProfileNavProps {
  locale: string;
}

export function ProfileNav({ locale }: ProfileNavProps) {
  const pathname = usePathname();

  const items = [
    { href: `/${locale}/profile`, label: '个人信息', exact: true },
    { href: `/${locale}/profile/favorites`, label: '我的收藏' },
    { href: `/${locale}/profile/comments`, label: '我的评论' },
    { href: `/${locale}/profile/settings`, label: '设置' },
  ];

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <nav className="flex flex-wrap gap-2 mb-6 border-b border-space-700 pb-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive(item.href, item.exact)
              ? 'bg-cosmic-blue/20 text-cosmic-blue'
              : 'text-star-dim hover:text-white hover:bg-space-700'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
