import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Rocket, Factory } from 'lucide-react';
import { Button } from '@/components/ui';

interface HeroSectionProps {
  locale: string;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const t = useTranslations('home.hero');

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-cosmic-glow pointer-events-none" />

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
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse-glow rounded-full">
          <div className="w-6 h-10 rounded-full border-2 border-cosmic-blue/40 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-cosmic-blue animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
