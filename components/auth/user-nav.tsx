'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Heart, MessageSquare, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui';

interface UserNavProps {
  locale: string;
}

export function UserNav({ locale }: UserNavProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (status === 'loading') {
    return <div className="w-8 h-8 rounded-full bg-space-700 animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Link href={`/${locale}/login`}>
        <Button size="sm">登录</Button>
      </Link>
    );
  }

  const displayName = session.user.name || session.user.email || '用户';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-space-700 transition-colors"
      >
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={displayName}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-cosmic-blue/20 border border-cosmic-blue/40 flex items-center justify-center text-sm font-medium text-cosmic-blue">
            {initial}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-space-800 border border-space-600 shadow-xl py-2 z-50">
          <div className="px-4 py-2 border-b border-space-700">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            {session.user.email && (
              <p className="text-xs text-star-dim truncate">{session.user.email}</p>
            )}
          </div>
          <Link
            href={`/${locale}/profile`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-star-dim hover:text-white hover:bg-space-700"
            onClick={() => setOpen(false)}
          >
            <User className="w-4 h-4" />
            个人主页
          </Link>
          <Link
            href={`/${locale}/profile/favorites`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-star-dim hover:text-white hover:bg-space-700"
            onClick={() => setOpen(false)}
          >
            <Heart className="w-4 h-4" />
            我的收藏
          </Link>
          <Link
            href={`/${locale}/profile/comments`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-star-dim hover:text-white hover:bg-space-700"
            onClick={() => setOpen(false)}
          >
            <MessageSquare className="w-4 h-4" />
            我的评论
          </Link>
          <Link
            href={`/${locale}/profile/settings`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-star-dim hover:text-white hover:bg-space-700"
            onClick={() => setOpen(false)}
          >
            <Settings className="w-4 h-4" />
            设置
          </Link>
          {session.user.role === 'ADMIN' && (
            <Link
              href={`/${locale}/admin`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-cosmic-blue hover:bg-space-700"
              onClick={() => setOpen(false)}
            >
              <Shield className="w-4 h-4" />
              管理后台
            </Link>
          )}
          <div className="border-t border-space-700 mt-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: `/${locale}` });
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-star-dim hover:text-white hover:bg-space-700"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
