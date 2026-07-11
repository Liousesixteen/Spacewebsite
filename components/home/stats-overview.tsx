'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Rocket, Satellite, Users, Building2, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

interface StatsOverviewProps {
  stats: {
    launches: number;
    spacecraft: number;
    astronauts: number;
    companies: number;
  };
}

interface StatItem {
  key: keyof StatsOverviewProps['stats'];
  icon: LucideIcon;
  color: string;
  glowColor: string;
  value: number;
}

function CountUp({ end, duration = 1500 }: { end: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(end * eased));
            if (t < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      });
    }, { threshold: 0.2 });
    obs.observe(node);
    return () => obs.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const t = useTranslations('home.stats');

  const itemLinks: Record<string, string> = {
    launches: '/launches',
    spacecraft: '/spacecraft',
    astronauts: '/astronauts',
    companies: '/industry/companies',
  };

  const items: StatItem[] = [
    {
      key: 'launches',
      icon: Rocket,
      color: 'text-cosmic-blue',
      glowColor: 'rgba(79,143,255,0.15)',
      value: stats.launches,
    },
    {
      key: 'spacecraft',
      icon: Satellite,
      color: 'text-cosmic-cyan',
      glowColor: 'rgba(34,211,238,0.15)',
      value: stats.spacecraft,
    },
    {
      key: 'astronauts',
      icon: Users,
      color: 'text-cosmic-purple',
      glowColor: 'rgba(139,92,246,0.15)',
      value: stats.astronauts,
    },
    {
      key: 'companies',
      icon: Building2,
      color: 'text-cosmic-pink',
      glowColor: 'rgba(236,72,153,0.15)',
      value: stats.companies,
    },
  ];

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-star-white mb-2 font-display tracking-wide">
          {t('title')}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          const href = itemLinks[item.key];
          return (
            <Link key={item.key} href={href}>
              <Card
                variant="elevated"
                className="group cursor-pointer hover:border-cosmic-blue/30 transition-colors"
              style={{
                '--stat-glow': item.glowColor,
              } as React.CSSProperties}
            >
              <CardContent className="p-5 text-center lg:p-6">
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-space-700/60 border border-space-600/30 ${item.color} mb-4 transition-all duration-300 group-hover:scale-105`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Value */}
                <div className="font-display text-3xl font-bold mb-1 tabular-nums text-star-white lg:text-4xl">
                  <CountUp end={item.value} />
                </div>

                <div className="text-xs text-star-dim font-medium uppercase tracking-wider">
                  {t(item.key)}
                </div>
              </CardContent>
            </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
