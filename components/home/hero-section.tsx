'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Rocket, Factory, Play } from 'lucide-react';
import { Button } from '@/components/ui';
import type { ApodData } from './apod-section';

interface HeroSectionProps {
  locale: string;
  apod: ApodData | null;
  liveLaunchUrl?: string | null;
}

function ParticleField() {
  // Stable pseudo-random particles using a fixed seed so they don't shift on re-render
  const particles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const seed = i * 137.508;
      const left = ((seed * 7) % 100);
      const top = ((seed * 13) % 100);
      const size = 1 + ((seed * 3) % 3);
      const duration = 2 + ((seed * 5) % 4);
      const delay = (seed * 0.3) % 5;
      return { left, top, size, duration, delay };
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function HeroSection({ locale, apod, liveLaunchUrl }: HeroSectionProps) {
  const t = useTranslations('home.hero');

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* APOD background image */}
      {apod && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${apod.url})` }}
        />
      )}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-space-900/90 via-space-900/60 to-space-900/90" />
      <div className="absolute inset-0 bg-cosmic-glow pointer-events-none" />

      {/* Particle twinkle effect */}
      <ParticleField />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="animate-float">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cosmic-blue via-cosmic-purple to-cosmic-cyan bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>
        </div>

        <p className="text-lg md:text-2xl text-star-dim max-w-3xl mx-auto mb-4">
          {t('subtitle')}
        </p>

        <p className="text-sm md:text-base text-star-dim/80 max-w-2xl mx-auto mb-10">
          {t('description')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={`/${locale}/launches`}>
            <Button variant="primary" size="lg" className="gap-2 min-w-[200px]">
              <Rocket className="w-5 h-5" />
              {t('ctaLaunches')}
            </Button>
          </Link>
          <Link href={`/${locale}/industry`}>
            <Button variant="outline" size="lg" className="gap-2 min-w-[200px]">
              <Factory className="w-5 h-5" />
              {t('ctaIndustry')}
            </Button>
          </Link>
          {liveLaunchUrl && (
            <a href={liveLaunchUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="lg" className="gap-2 min-w-[200px] bg-red-600 hover:bg-red-700">
                <Play className="w-5 h-5" />
                观看发射直播
              </Button>
            </a>
          )}
        </div>

        {/* APOD attribution when used as background */}
        {apod && (
          <p className="mt-8 text-xs text-star-dim/50">
            Background: NASA APOD &mdash; {apod.title}
            {apod.copyright && ` (${apod.copyright})`}
          </p>
        )}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse-glow rounded-full">
          <div className="w-6 h-10 rounded-full border-2 border-cosmic-blue/40 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-cosmic-blue animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
