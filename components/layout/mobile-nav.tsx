'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { href: string; label: string }[];
  secondaryNavItems?: { href: string; label: string }[];
  secondaryLabel?: string;
  locale: string;
  pathname: string;
}

export function MobileNav({
  isOpen,
  onClose,
  navItems,
  secondaryNavItems = [],
  secondaryLabel,
  locale,
  pathname,
}: MobileNavProps) {
  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  if (!isOpen) return null;

  return (
    <div className="lg:hidden">
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
          {secondaryNavItems.length > 0 && (
            <div className="mt-3 border-t border-space-700/50 pt-3">
              {secondaryLabel && (
                <div className="px-4 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-star-dim/70">
                  {secondaryLabel}
                </div>
              )}
              <div className="grid grid-cols-1 gap-1">
                {secondaryNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive(item.href)
                        ? 'text-star-white bg-cosmic-blue/10 border border-cosmic-blue/20'
                        : 'text-star-dim hover:text-star-white hover:bg-space-800/60'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
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
            <Link
              href={`/${locale}/login`}
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md border border-space-600/60 bg-transparent px-3 py-1.5 text-sm font-medium text-star-white transition-all duration-300 hover:border-cosmic-blue/50 hover:text-cosmic-blue hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] focus:outline-none focus:ring-2 focus:ring-cosmic-blue focus:ring-offset-2 focus:ring-offset-space-900 active:scale-[0.97]"
            >
              {locale === 'zh-CN' ? '登录' : 'Sign in'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
