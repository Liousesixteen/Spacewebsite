import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Rocket,
  Satellite,
  Users,
  Factory,
  Compass,
  User,
  type LucideIcon,
} from 'lucide-react';

interface QuickNavProps {
  locale: string;
}

interface NavItem {
  key: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
}

export function QuickNav({ locale }: QuickNavProps) {
  const t = useTranslations('home.quickNav');

  const items: NavItem[] = [
    {
      key: 'launches',
      href: `/${locale}/launches`,
      icon: Rocket,
      gradient: 'from-cosmic-blue/30 to-cosmic-purple/20',
    },
    {
      key: 'spacecraft',
      href: `/${locale}/spacecraft`,
      icon: Satellite,
      gradient: 'from-cosmic-cyan/30 to-cosmic-blue/20',
    },
    {
      key: 'astronauts',
      href: `/${locale}/astronauts`,
      icon: Users,
      gradient: 'from-cosmic-purple/30 to-cosmic-pink/20',
    },
    {
      key: 'industry',
      href: `/${locale}/industry`,
      icon: Factory,
      gradient: 'from-cosmic-pink/30 to-cosmic-blue/20',
    },
    {
      key: 'explore',
      href: `/${locale}/explore`,
      icon: Compass,
      gradient: 'from-cosmic-cyan/30 to-cosmic-purple/20',
    },
    {
      key: 'profile',
      href: `/${locale}/profile`,
      icon: User,
      gradient: 'from-cosmic-blue/30 to-cosmic-cyan/20',
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('title')}</h2>
        <p className="text-star-dim">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`group relative overflow-hidden rounded-xl border border-space-600 bg-gradient-to-br ${item.gradient} bg-space-800 p-6 transition-all duration-300 hover:border-cosmic-blue hover:-translate-y-1 hover:shadow-lg hover:shadow-cosmic-blue/20`}
            >
              <div className="absolute inset-0 bg-cosmic-glow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative">
                <div className="inline-flex p-3 rounded-lg bg-space-900/70 text-cosmic-blue mb-4 group-hover:text-cosmic-cyan transition">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cosmic-blue transition">
                  {t(`${item.key}.title`)}
                </h3>
                <p className="text-sm text-star-dim leading-relaxed">
                  {t(`${item.key}.description`)}
                </p>
                <div className="mt-4 inline-flex items-center text-sm text-cosmic-blue opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('explore')} →
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
