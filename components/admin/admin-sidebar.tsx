'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Rocket,
  Satellite,
  Users2,
  Building2,
  Cpu,
  Layers,
  Wrench,
  UserCog,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

interface AdminSidebarProps {
  locale: string;
}

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const pathname = usePathname();
  const base = `/${locale}/admin`;

  const items = [
    { href: base, label: '仪表盘', icon: LayoutDashboard, exact: true },
    { href: `${base}/launches`, label: '发射任务', icon: Rocket },
    { href: `${base}/spacecraft`, label: '航天器', icon: Satellite },
    { href: `${base}/astronauts`, label: '宇航员', icon: Users2 },
    { href: `${base}/companies`, label: '企业', icon: Building2 },
    { href: `${base}/technologies`, label: '技术', icon: Cpu },
    { href: `${base}/materials`, label: '材料', icon: Layers },
    { href: `${base}/equipment`, label: '设备', icon: Wrench },
    { href: `${base}/users`, label: '用户管理', icon: UserCog },
    { href: `${base}/comments`, label: '评论审核', icon: MessageSquare },
    { href: `${base}/sync`, label: '数据同步', icon: RefreshCw },
  ];

  return (
    <aside className="w-60 shrink-0 bg-space-900 border-r border-space-700 min-h-screen sticky top-0 h-screen overflow-y-auto">
      <div className="px-4 py-5 border-b border-space-700">
        <Link href={`/${locale}`} className="flex items-center gap-2 group">
          <Rocket className="w-6 h-6 text-cosmic-blue group-hover:animate-float" />
          <div>
            <p className="text-base font-bold text-gradient leading-tight">
              SpaceData
            </p>
            <p className="text-[10px] uppercase tracking-wider text-star-dim">
              管理后台
            </p>
          </div>
        </Link>
      </div>

      <nav className="p-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-cosmic-blue/15 text-white border border-cosmic-blue/30'
                  : 'text-star-dim hover:text-white hover:bg-space-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
