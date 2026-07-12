'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronDown, Rocket, Menu, X, Search, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { MobileNav } from './mobile-nav';
import { GlobalSearch } from './global-search';
import { UserNav } from '@/components/auth/user-nav';
import { useTheme } from '@/components/providers/theme-provider';

interface NavbarProps {
  locale: string;
}

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform));
    }
  }, []);

  // Cmd/Ctrl+K to open search; ignore when typing in inputs/textareas/contentEditable
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName;
        const editing =
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          (target?.isContentEditable ?? false);
        if (editing && !searchOpen) return;
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [searchOpen]);

  const navItems = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/launches`, label: t('launches') },
    { href: `/${locale}/rockets`, label: t('rockets') },
    { href: `/${locale}/spacecraft`, label: t('spacecraft') },
    { href: `/${locale}/industry`, label: t('industry') },
    { href: `/${locale}/data-sources`, label: t('data') },
  ];

  const secondaryNavItems = [
    { href: `/${locale}/countries`, label: t('countries') },
    { href: `/${locale}/agencies`, label: t('agencies') },
    { href: `/${locale}/astronauts`, label: t('astronauts') },
    { href: `/${locale}/notifications`, label: t('notifications') },
    { href: `/${locale}/timeline`, label: t('timeline') },
    { href: `/${locale}/compare`, label: t('compare') },
    { href: `/${locale}/explore`, label: t('explore') },
    { href: `/${locale}/status`, label: t('status') },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const moreActive = secondaryNavItems.some((item) => isActive(item.href));

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Near-opaque HUD navbar */}
      <div className="bg-space-900/95 backdrop-blur-sm border-b border-space-600/20">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2.5 group"
            >
              <Rocket className="w-8 h-8 text-cosmic-blue transition-all duration-500 group-hover:animate-logo-pulse group-hover:drop-shadow-[0_0_8px_rgba(79,143,255,0.6)]" />
              <span className="text-xl font-bold text-gradient font-display uppercase tracking-wide">SpaceData</span>
            </Link>

            {/* Desktop nav items */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive(item.href)
                      ? 'text-star-white'
                      : 'text-star-dim hover:text-star-white hover:bg-space-800/60'
                  )}
                >
                  {item.label}
                  {/* Active gradient underline */}
                  {isActive(item.href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 rounded-full bg-gradient-to-r from-cosmic-blue to-cosmic-purple animate-gradient-underline origin-center" />
                  )}
                </Link>
              ))}

              <div className="group relative">
                <button
                  type="button"
                  className={cn(
                    'relative flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    moreActive
                      ? 'text-star-white'
                      : 'text-star-dim hover:text-star-white hover:bg-space-800/60'
                  )}
                  aria-haspopup="menu"
                >
                  {t('more')}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  {moreActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 rounded-full bg-gradient-to-r from-cosmic-blue to-cosmic-purple animate-gradient-underline origin-center" />
                  )}
                </button>
                <div className="invisible absolute left-1/2 top-full z-50 mt-2 w-44 -translate-x-1/2 rounded-xl border border-space-600/30 bg-space-900/95 p-1.5 opacity-0 shadow-xl backdrop-blur-md transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  {secondaryNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'block rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive(item.href)
                          ? 'bg-cosmic-blue/10 text-star-white'
                          : 'text-star-dim hover:bg-space-800/70 hover:text-star-white'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search button - glass style */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-800/80 border border-space-600/30 text-star-dim hover:text-star-white hover:border-cosmic-blue/50 transition-all duration-300 text-sm"
                aria-label="Open search"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline text-xs font-mono px-1.5 py-0.5 rounded bg-space-700/80 border border-space-600/50">
                  {isMac ? '⌘K' : 'Ctrl K'}
                </span>
              </button>

              {/* Theme toggle with smooth rotation */}
              <button
                type="button"
                onClick={toggle}
                className="p-2 rounded-lg text-star-dim hover:text-star-white hover:bg-space-800/60 transition-all duration-300"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="block transition-transform duration-500 rotate-0 hover:rotate-180">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </span>
              </button>

              {/* Language selector */}
              <select
                value={locale}
                onChange={(e) => {
                  const newLocale = e.target.value;
                  const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
                  window.location.href = newPath;
                }}
                className="bg-space-800/80 border border-space-600/30 rounded-lg px-3 py-1.5 text-sm text-star-white focus:outline-none focus:border-cosmic-blue/60 transition-colors"
              >
                <option value="zh-CN">CN</option>
                <option value="en">EN</option>
                <option value="ru">RU</option>
                <option value="ja">JA</option>
              </select>

              <UserNav locale={locale} />
            </div>

            {/* Mobile controls */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-star-dim hover:text-star-white transition-colors"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-star-dim hover:text-star-white transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>

        <MobileNav
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          navItems={navItems}
          secondaryNavItems={secondaryNavItems}
          secondaryLabel={t('more')}
          locale={locale}
          pathname={pathname}
        />

        <GlobalSearch
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          locale={locale}
        />

        {/* Subtle gradient bottom border line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(79,143,255,0.3), rgba(139,92,246,0.3), rgba(34,211,238,0.2), transparent)',
          }}
        />
      </div>
    </header>
  );
}
