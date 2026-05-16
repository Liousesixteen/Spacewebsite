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
    targetDate ? calcTimeLeft(targetDate) : { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
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
        <Card variant="glow">
          <CardContent className="p-8 text-center">
            <Rocket className="w-12 h-12 mx-auto mb-4 text-star-dim" />
            <h2 className="text-2xl font-semibold text-white mb-2">{t('title')}</h2>
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
      <Card variant="glow" className="animate-pulse-glow">
        <CardContent className="p-8 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <Badge variant="info" className="mb-2">{t('badge')}</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {t('title')}
              </h2>
            </div>
            <Link href={`/${locale}/launches/${nextLaunch.id}`} className="text-cosmic-blue hover:underline text-sm">
              {t('viewDetails')} →
            </Link>
          </div>

          <Link href={`/${locale}/launches/${nextLaunch.id}`} className="block group">
            <div className="mb-6">
              <h3 className="text-xl md:text-2xl font-semibold text-white group-hover:text-cosmic-blue transition mb-2">
                {nextLaunch.name}
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-star-dim">
                {nextLaunch.rocket?.name && (
                  <span className="flex items-center gap-1.5"><Rocket className="w-4 h-4" />{nextLaunch.rocket.name}</span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {targetDate.toISOString().slice(0, 16).replace('T', ' ')}
                </span>
              </div>
            </div>
          </Link>

          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {units.map((u) => (
              <div
                key={u.label}
                className="rounded-lg bg-space-800/60 border border-space-500/40 p-3 md:p-6 text-center"
              >
                <div className="text-3xl md:text-5xl font-extrabold text-white tabular-nums">
                  {String(u.value).padStart(2, '0')}
                </div>
                <div className="mt-1 md:mt-2 text-xs md:text-sm uppercase tracking-wider text-star-dim">
                  {u.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
