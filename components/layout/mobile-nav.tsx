'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { href: string; label: string }[];
  locale: string;
  pathname: string;
}

export function MobileNav({ isOpen, onClose, navItems, locale, pathname }: MobileNavProps) {
  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-50 bg-space-900/95 border-b border-space-600/20">
        <div className="px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200',
                isActive(item.href)
                  ? 'text-star-white bg-cosmic-blue/10 border border-cosmic-blue/20'
                  : 'text-star-dim hover:text-star-white hover:bg-space-800/60'
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4 mt-2 border-t border-space-700/50 flex items-center justify-between">
            <select
              value={locale}
              onChange={(e) => {
                const newLocale = e.target.value;
                const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
                window.location.href = newPath;
              }}
              className="bg-space-800/80 border border-space-600/30 rounded-lg px-3 py-2 text-sm text-star-white focus:outline-none focus:border-cosmic-blue/50"
            >
              <option value="zh-CN">CN</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
              <option value="ja">JA</option>
            </select>
            <Button size="sm" variant="outline">Login</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
