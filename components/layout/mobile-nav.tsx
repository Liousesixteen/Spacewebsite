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
    <div className="md:hidden bg-space-800 border-b border-space-700">
      <div className="px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              'block px-4 py-3 rounded-lg text-base font-medium transition-colors',
              isActive(item.href)
                ? 'text-star-white bg-space-700'
                : 'text-star-dim hover:text-star-white hover:bg-space-700'
            )}
          >
            {item.label}
          </Link>
        ))}
        <div className="pt-4 border-t border-space-600 flex items-center justify-between">
          <select
            value={locale}
            onChange={(e) => {
              const newLocale = e.target.value;
              const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
              window.location.href = newPath;
            }}
            className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-sm text-star-white"
          >
            <option value="zh-CN">中文</option>
            <option value="en">English</option>
            <option value="ru">Русский</option>
            <option value="ja">日本語</option>
          </select>
          <Button size="sm">登录</Button>
        </div>
      </div>
    </div>
  );
}
