'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Rocket, Menu, X, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { MobileNav } from './mobile-nav';
import { GlobalSearch } from './global-search';
import { UserNav } from '@/components/auth/user-nav';

interface NavbarProps {
  locale: string;
}

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

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
    { href: `/${locale}/spacecraft`, label: t('spacecraft') },
    { href: `/${locale}/astronauts`, label: t('astronauts') },
    { href: `/${locale}/explore`, label: t('explore') },
    { href: `/${locale}/industry`, label: t('industry') },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-space-900/80 backdrop-blur-md border-b border-space-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <Rocket className="w-8 h-8 text-cosmic-blue group-hover:animate-float" />
            <span className="text-xl font-bold text-gradient">SpaceData</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'text-white bg-space-700'
                    : 'text-star-dim hover:text-white hover:bg-space-800'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-800 border border-space-600 text-star-dim hover:text-white hover:border-cosmic-blue/60 transition-colors text-sm"
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline text-xs font-mono px-1.5 py-0.5 rounded bg-space-700 border border-space-600">
                {isMac ? '⌘K' : 'Ctrl K'}
              </span>
            </button>
            <select
              value={locale}
              onChange={(e) => {
                const newLocale = e.target.value;
                const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
                window.location.href = newPath;
              }}
              className="bg-space-700 border border-space-500 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cosmic-blue"
            >
              <option value="zh-CN">中文</option>
              <option value="en">English</option>
              <option value="ru">Русский</option>
              <option value="ja">日本語</option>
            </select>
            <UserNav locale={locale} />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-star-dim hover:text-white"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-star-dim hover:text-white"
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
        locale={locale}
        pathname={pathname}
      />

      <GlobalSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        locale={locale}
      />
    </header>
  );
}
