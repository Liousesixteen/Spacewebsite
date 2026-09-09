import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, Badge, SmartImage } from '@/components/ui';
import type { BadgeProps } from '@/components/ui';
import type { Company } from '@/lib/api/industry';
import { getCompanyImage } from '@/lib/image-fallbacks';
import {
  displayCountryName,
  displayLocalizedDescription,
} from '@/lib/display-names';
import { displayIndustryCompanyName } from '@/lib/industry-display';

const typeColors: Record<string, BadgeProps['variant']> = {
  STATE_OWNED: 'info',
  PRIVATE: 'default',
  PUBLIC: 'success',
  STARTUP: 'warning',
};

interface CompanyCardProps {
  company: Company;
  locale: string;
}

export function CompanyCard({ company, locale }: CompanyCardProps) {
  const t = useTranslations('industry.companyList');
  const displayName = displayIndustryCompanyName(company.name, locale);
  return (
    <Link href={`/${locale}/industry/companies/${company.id}`} className="block group">
      <Card variant="elevated" className="h-full cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start gap-4 mb-4">
            {/* Logo */}
            <div className="relative w-14 h-14 shrink-0 rounded-xl bg-space-700 overflow-hidden ring-1 ring-space-600/50 group-hover:ring-cosmic-blue/30 transition-all duration-300">
              <SmartImage
                src={getCompanyImage(company.id, company.logo, company.name)}
                alt={displayName}
                fallback="company"
                fill
                sizes="56px"
                className="object-contain p-1"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-star-white line-clamp-1 group-hover:text-cosmic-blue transition-colors duration-300">
                {displayName}
              </h3>
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <Badge variant={typeColors[company.type] || 'default'}>
                  {t.has(`types.${company.type}`) ? t(`types.${company.type}`) : company.type}
                </Badge>
                {company.stockCode && (
                  <Badge variant="default">{company.stockCode}</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-2.5 text-sm text-star-dim">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
              <span className="truncate">
                {displayCountryName(company.country, locale)} / {company.headquarters}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-cosmic-blue/70 shrink-0" />
              <span>{t('founded', { year: company.foundedYear })}</span>
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 text-sm text-star-dim/70 line-clamp-2 leading-relaxed">
            {displayLocalizedDescription(
              company.description,
              locale,
              t('noDescription')
            )}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
