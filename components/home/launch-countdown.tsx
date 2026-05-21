'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Rocket, Calendar } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';

interface NextLaunch {
  id: string;
  name: string;
  date: string | Date;
  rocket?: { name: string };
  launchSite?: { name: string };
}

interface LaunchCountdownProps {
  nextLaunch: NextLaunch | null;
  locale: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calcTimeLeft(target: Date): TimeLeft {
  const total = target.getTime() - Date.now();
  const safe = Math.max(0, total);
  return {
    days: Math.floor(safe / (1000 * 60 * 60 * 24)),
    hours: Math.floor((safe / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((safe / (1000 * 60)) % 60),
    seconds: Math.floor((safe / 1000) % 60),
    total: safe,
  };
}

export function LaunchCountdown({ nextLaunch, locale }: LaunchCountdownProps) {
  const t = useTranslations('home.countdown');
  const targetDate = useMemo(
    () => (nextLaunch ? new Date(nextLaunch.date) : null),
    [nextLaunch]
  );
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    targetDate
      ? calcTimeLeft(targetDate)
      : { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  );

  useEffect(() => {
    if (!targetDate) return;
    const id = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!nextLaunch || !targetDate) {
    return (
      <section className="container mx-auto px-4 py-12">
        <Card variant="elevated">
          <CardContent className="p-10 text-center">
            <Rocket className="w-12 h-12 mx-auto mb-4 text-star-dim/40" />
            <h2 className="text-2xl font-semibold text-star-white mb-2">
              {t('title')}
            </h2>
            <p className="text-star-dim">{t('empty')}</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const units: { label: string; value: number }[] = [
    { label: t('days'), value: timeLeft.days },
    { label: t('hours'), value: timeLeft.hours },
    { label: t('minutes'), value: timeLeft.minutes },
    { label: t('seconds'), value: timeLeft.seconds },
  ];

  return (
    <section className="container mx-auto px-4 py-12">
      <Card variant="elevated" className="animate-border-glow">
        <CardContent className="p-8 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <Badge variant="info" className="mb-3">
                {t('badge')}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-star-white">
                {t('title')}
              </h2>
            </div>
            <Link
              href={`/${locale}/launches/${nextLaunch.id}`}
              className="text-sm text-cosmic-blue hover:text-cosmic-cyan transition-colors font-medium"
            >
              {t('viewDetails')} &rarr;
            </Link>
          </div>

          <Link
            href={`/${locale}/launches/${nextLaunch.id}`}
            className="block group"
          >
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-semibold text-star-white group-hover:text-cosmic-blue transition-colors duration-300 mb-3">
                {nextLaunch.name}
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-star-dim">
                {nextLaunch.rocket?.name && (
                  <span className="flex items-center gap-1.5">
                    <Rocket className="w-4 h-4 text-cosmic-blue/70" />
                    {nextLaunch.rocket.name}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-cosmic-blue/70" />
                  {targetDate.toISOString().slice(0, 16).replace('T', ' ')}
                </span>
              </div>
            </div>
          </Link>

          {/* Countdown digits */}
          <div className="grid grid-cols-4 gap-3 md:gap-5">
            {units.map((u) => (
              <div
                key={u.label}
                className="relative rounded-xl bg-space-800/60 backdrop-blur-md border border-space-500/40 p-4 md:p-7 text-center overflow-hidden group/count"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-cosmic-blue/5 opacity-0 group-hover/count:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-3xl md:text-5xl font-extrabold text-gradient-blue tabular-nums">
                    {String(u.value).padStart(2, '0')}
                  </div>
                  <div className="mt-1.5 md:mt-2.5 text-xs md:text-sm uppercase tracking-[0.2em] text-star-dim font-medium">
                    {u.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
