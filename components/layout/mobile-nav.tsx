'use client';

import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { href: string; label: string }[];
  secondaryNavItems?: { href: string; label: string }[];
  secondaryLabel?: string;
  archiveNavItems?: { href: string; label: string }[];
  archiveLabel?: string;
  locale: string;
  pathname: string;
}

export function MobileNav({
  isOpen,
  onClose,
  navItems,
  secondaryNavItems = [],
  secondaryLabel,
  archiveNavItems = [],
  archiveLabel,
  locale,
  pathname,
}: MobileNavProps) {
  const t = useTranslations('nav');
  const authT = useTranslations('auth');
  const { theme, toggle } = useTheme();
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
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/70"
        onClick={onClose}
        aria-label={t('closeMenu')}
      />

      {/* Panel */}
      <div className="relative z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-space-600/30 bg-space-900/98 shadow-2xl">
        <div className="space-y-1 px-4 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'block rounded-md px-4 py-3 text-base font-medium transition-all duration-200',
                isActive(item.href)
                  ? 'text-star-white bg-cosmic-blue/10 border border-cosmic-blue/20'
                  : 'text-star-dim hover:text-star-white hover:bg-space-800/60'
              )}
            >
              {item.label}
            </Link>
          ))}
          {archiveNavItems.length > 0 && (
            <div className="mt-3 border-t border-space-700/50 pt-3">
              {archiveLabel && (
                <div className="px-4 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-star-dim/70">
                  {archiveLabel}
                </div>
              )}
              <div className="grid grid-cols-1 gap-1">
                {archiveNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'block rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200',
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
                      'block rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200',
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
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-space-700/50 pt-4">
            <button
              type="button"
              onClick={toggle}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-space-600/60 text-star-dim transition-colors hover:border-cosmic-blue/40 hover:text-star-white"
              aria-label={t(theme === 'dark' ? 'switchToLight' : 'switchToDark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <select
              value={locale}
              aria-label={t('language')}
              onChange={(e) => {
                const newLocale = e.target.value;
                const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
                window.location.href = newPath;
              }}
              className="bg-space-800/80 border border-space-600/30 rounded-lg px-3 py-2 text-sm text-star-white focus:outline-none focus:border-cosmic-blue/50"
            >
              <option value="zh-CN">CN</option>
              <option value="en">EN</option>
            </select>
            <Link
              href={`/${locale}/login`}
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md border border-space-600/60 bg-transparent px-3 py-1.5 text-sm font-medium text-star-white transition-all duration-300 hover:border-cosmic-blue/50 hover:text-cosmic-blue hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] focus:outline-none focus:ring-2 focus:ring-cosmic-blue focus:ring-offset-2 focus:ring-offset-space-900 active:scale-[0.97]"
            >
              {authT('login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
