import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Rocket,
  Satellite,
  Users,
  Factory,
  Compass,
  User,
  Clock,
  ArrowLeftRight,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { AnimateIn } from '@/components/ui';

interface QuickNavProps {
  locale: string;
}

interface NavItem {
  key: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
}

export function QuickNav({ locale }: QuickNavProps) {
  const t = useTranslations('home.quickNav');

  const items: NavItem[] = [
    {
      key: 'launches',
      href: `/${locale}/launches`,
      icon: Rocket,
      gradient: 'from-cosmic-blue/10 to-cosmic-purple/5',
      iconColor: 'text-cosmic-blue',
    },
    {
      key: 'spacecraft',
      href: `/${locale}/spacecraft`,
      icon: Satellite,
      gradient: 'from-cosmic-cyan/10 to-cosmic-blue/5',
      iconColor: 'text-cosmic-cyan',
    },
    {
      key: 'astronauts',
      href: `/${locale}/astronauts`,
      icon: Users,
      gradient: 'from-cosmic-purple/10 to-cosmic-pink/5',
      iconColor: 'text-cosmic-purple',
    },
    {
      key: 'industry',
      href: `/${locale}/industry`,
      icon: Factory,
      gradient: 'from-cosmic-pink/10 to-cosmic-blue/5',
      iconColor: 'text-cosmic-pink',
    },
    {
      key: 'explore',
      href: `/${locale}/explore`,
      icon: Compass,
      gradient: 'from-cosmic-cyan/10 to-cosmic-purple/5',
      iconColor: 'text-cosmic-cyan',
    },
    {
      key: 'profile',
      href: `/${locale}/profile`,
      icon: User,
      gradient: 'from-cosmic-blue/10 to-cosmic-cyan/5',
      iconColor: 'text-cosmic-blue',
    },
    {
      key: 'timeline',
      href: `/${locale}/timeline`,
      icon: Clock,
      gradient: 'from-cosmic-purple/10 to-cosmic-pink/5',
      iconColor: 'text-cosmic-purple',
    },
    {
      key: 'compare',
      href: `/${locale}/compare`,
      icon: ArrowLeftRight,
      gradient: 'from-cosmic-cyan/10 to-cosmic-blue/5',
      iconColor: 'text-cosmic-cyan',
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-star-white mb-3">
          {t('title')}
        </h2>
        <p className="text-star-dim text-lg max-w-xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <AnimateIn key={item.key} delay={index * 75}>
              <Link
                href={item.href}
                className={`group relative overflow-hidden rounded-2xl border border-space-600/30 bg-space-800 p-6 transition-all duration-300 hover:border-cosmic-blue/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.06)]`}
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-cosmic-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative z-10">
                  {/* Frosted glass icon circle */}
                  <div className={`inline-flex p-3.5 rounded-xl frosted-icon mb-5 ${item.iconColor} transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-blue`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-semibold text-star-white mb-2 group-hover:text-cosmic-blue transition-colors duration-300">
                    {t(`${item.key}.title`)}
                  </h3>

                  <p className="text-sm text-star-dim leading-relaxed mb-4">
                    {t(`${item.key}.description`)}
                  </p>

                  {/* Slide-in arrow on hover */}
                  <div className="flex items-center gap-1.5 text-sm text-cosmic-blue font-medium">
                    <span className="transform transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                      {t('explore')}
                    </span>
                    <ArrowRight className="w-4 h-4 transform transition-all duration-300 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0" />
                  </div>
                </div>
              </Link>
            </AnimateIn>
          );
        })}
      </div>
    </section>
  );
}
