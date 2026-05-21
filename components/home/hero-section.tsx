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

function ShootingStars() {
  const stars = useMemo(() => {
    return [
      { top: '15%', left: '80%', delay: '0s', duration: '3s' },
      { top: '25%', left: '70%', delay: '2s', duration: '4s' },
      { top: '10%', left: '60%', delay: '5s', duration: '3.5s' },
      { top: '30%', left: '85%', delay: '1s', duration: '5s' },
    ];
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {stars.map((s, i) => (
        <div
          key={i}
          className="shooting-star"
          style={{
            top: s.top,
            left: s.left,
            animationDelay: s.delay,
            animationDuration: s.duration,
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

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-space-900/95 via-space-900/60 to-space-900/95" />
      <div className="absolute inset-0 bg-cosmic-glow pointer-events-none" />

      {/* Nebula background - layered colored blobs */}
      <div
        className="absolute inset-0 pointer-events-none nebula-bg animate-nebula-drift"
        aria-hidden="true"
      />

      {/* Shooting stars */}
      <ShootingStars />

      {/* Particle twinkle effect */}
      <ParticleField />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Title area with glass card */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-cosmic-blue via-cosmic-purple to-cosmic-cyan bg-clip-text text-transparent text-glow">
              {t('title')}
            </span>
          </h1>

          <div className="inline-block">
            <p className="text-lg md:text-2xl text-star-dim/90 max-w-3xl mx-auto mb-3 font-light">
              {t('subtitle')}
            </p>
            <p className="text-sm md:text-base text-star-dim/60 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href={`/${locale}/launches`}>
            <Button variant="primary" size="lg" className="gap-2.5 min-w-[200px] shadow-glow-blue hover:shadow-glow-purple">
              <Rocket className="w-5 h-5" />
              {t('ctaLaunches')}
            </Button>
          </Link>
          <Link href={`/${locale}/industry`}>
            <Button variant="outline" size="lg" className="gap-2.5 min-w-[200px]">
              <Factory className="w-5 h-5" />
              {t('ctaIndustry')}
            </Button>
          </Link>
          {liveLaunchUrl && (
            <a href={liveLaunchUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="lg" className="gap-2.5 min-w-[200px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-glow-blue">
                <Play className="w-5 h-5" />
                Live
              </Button>
            </a>
          )}
        </div>

        {/* APOD attribution when used as background */}
        {apod && (
          <p className="text-xs text-star-dim/40 max-w-lg mx-auto">
            Background: NASA APOD &mdash; {apod.title}
            {apod.copyright && ` (${apod.copyright})`}
          </p>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-xs text-star-dim/50 uppercase tracking-[0.2em]">Scroll</span>
        <div className="scroll-indicator">
          <div className="scroll-indicator-dot" />
        </div>
      </div>
    </section>
  );
}
