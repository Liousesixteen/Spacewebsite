'use client';

import { useEffect, useRef, useState } from 'react';
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

  const items: StatItem[] = [
    { key: 'launches', icon: Rocket, color: 'text-cosmic-blue', value: stats.launches },
    { key: 'spacecraft', icon: Satellite, color: 'text-cosmic-cyan', value: stats.spacecraft },
    { key: 'astronauts', icon: Users, color: 'text-cosmic-purple', value: stats.astronauts },
    { key: 'companies', icon: Building2, color: 'text-cosmic-pink', value: stats.companies },
  ];

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-star-white mb-2">{t('title')}</h2>
        <p className="text-star-dim">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.key} variant="glow">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex p-3 rounded-full bg-space-800 mb-4 ${item.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-star-white mb-1 tabular-nums">
                  <CountUp end={item.value} />
                </div>
                <div className="text-sm text-star-dim">{t(item.key)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
