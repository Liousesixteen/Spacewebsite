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
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-star-white mb-3 font-display uppercase tracking-wider">
          {t('title')}
        </h2>
        <p className="text-star-dim text-lg max-w-xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.key}
              variant="elevated"
              className="group cursor-default"
              style={{
                '--stat-glow': item.glowColor,
              } as React.CSSProperties}
            >
              <CardContent className="p-6 md:p-8 text-center">
                {/* Frosted glass icon circle with hover pulse */}
                <div
                  className={`inline-flex p-4 rounded-2xl frosted-icon ${item.color} mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-blue`}
                >
                  <Icon className="w-7 h-7" />
                </div>

                {/* HUD value number — Orbitron */}
                <div
                  className="font-display text-4xl md:text-5xl font-bold mb-2 tabular-nums bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgb(var(--cosmic-blue)), rgb(var(--cosmic-purple)))`,
                  }}
                >
                  <CountUp end={item.value} />
                </div>

                <div className="text-sm text-star-dim font-medium uppercase tracking-wider">
                  {t(item.key)}
                </div>

                {/* Subtle hover background pulse */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at center, ${item.glowColor} 0%, transparent 70%)`,
                  }}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
