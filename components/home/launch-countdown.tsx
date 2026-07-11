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
      <Card variant="elevated" className="h-full">
        <CardContent className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
          <Rocket className="w-10 h-10 mb-4 text-star-dim/40" />
          <h2 className="text-xl font-semibold text-star-white mb-2">
            {t('title')}
          </h2>
          <p className="text-sm text-star-dim">{t('empty')}</p>
        </CardContent>
      </Card>
    );
  }

  const units: { label: string; value: number }[] = [
    { label: t('days'), value: timeLeft.days },
    { label: t('hours'), value: timeLeft.hours },
    { label: t('minutes'), value: timeLeft.minutes },
    { label: t('seconds'), value: timeLeft.seconds },
  ];

  return (
    <Card variant="elevated" className="h-full animate-border-glow">
      <CardContent className="p-6 lg:p-7">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge variant="info" className="mb-3">
                {t('badge')}
              </Badge>
              <h2 className="text-xl font-bold leading-tight text-star-white lg:text-2xl">
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
            <div className="mb-5">
              <h3 className="text-lg font-semibold leading-snug text-star-white group-hover:text-cosmic-blue transition-colors duration-300 lg:text-xl">
                {nextLaunch.name}
              </h3>
              <div className="mt-3 flex flex-col gap-2 text-sm text-star-dim">
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
          <div className="grid grid-cols-4 gap-2">
            {units.map((u) => (
              <div
                key={u.label}
                className="relative overflow-hidden rounded-xl border border-space-500/40 bg-space-800 p-3 text-center group/count"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-cosmic-blue/5 opacity-0 group-hover/count:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative z-10">
                  <div className="font-mono text-2xl font-extrabold tabular-nums text-cosmic-blue lg:text-3xl">
                    {String(u.value).padStart(2, '0')}
                  </div>
                  <div className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-star-dim">
                    {u.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
  );
}
