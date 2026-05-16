'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui';

interface AdminTopbarProps {
  locale: string;
  name: string | null;
  email: string | null;
  image?: string | null;
}

export function AdminTopbar({ locale, name, email, image }: AdminTopbarProps) {
  const display = name || email || '管理员';
  const initial = display.charAt(0).toUpperCase();

  return (
    <header className="h-14 bg-space-900/80 backdrop-blur border-b border-space-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-sm text-star-dim hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回站点
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-white truncate max-w-[180px]">{display}</p>
          {email && (
            <p className="text-xs text-star-dim truncate max-w-[180px]">{email}</p>
          )}
        </div>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={display} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-cosmic-blue/20 border border-cosmic-blue/40 flex items-center justify-center text-sm font-medium text-cosmic-blue">
            {initial}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          aria-label="退出登录"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
