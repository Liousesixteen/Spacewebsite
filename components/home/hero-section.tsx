'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Rocket, Factory, Play } from 'lucide-react';
import { Button } from '@/components/ui';

interface HeroSectionProps {
  locale: string;
  liveLaunchUrl?: string | null;
}

export function HeroSection({ locale, liveLaunchUrl }: HeroSectionProps) {
  const t = useTranslations('home.hero');

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-space-900 via-space-900/85 to-space-900" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="mb-8">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight tracking-tight uppercase">
            <span className="text-gradient text-glow">
              {t('title')}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-star-dim/80 max-w-2xl mx-auto font-light">
            {t('subtitle')}
          </p>
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
              <Button variant="primary" size="lg" className="gap-2.5 min-w-[200px] bg-red-600 hover:bg-red-700 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse-glow">
                <Play className="w-5 h-5" />
                观看发射直播
              </Button>
            </a>
          )}
        </div>

      </div>

      {/* Clean scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-xs text-star-dim/40 uppercase tracking-[0.2em] font-mono">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-cosmic-blue/60 to-transparent" />
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-space-900 pointer-events-none z-20" />
    </section>
  );
}
