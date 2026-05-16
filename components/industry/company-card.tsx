import Link from 'next/link';
import { MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, Badge, SmartImage } from '@/components/ui';
import type { BadgeProps } from '@/components/ui';
import type { Company } from '@/lib/api/industry';
import { getCompanyImage } from '@/lib/image-fallbacks';

const typeColors: Record<string, BadgeProps['variant']> = {
  STATE_OWNED: 'info',
  PRIVATE: 'default',
  PUBLIC: 'success',
  STARTUP: 'warning',
};

const typeLabels: Record<string, string> = {
  STATE_OWNED: '国企',
  PRIVATE: '民营',
  PUBLIC: '上市',
  STARTUP: '初创',
};

interface CompanyCardProps {
  company: Company;
  locale: string;
}

export function CompanyCard({ company, locale }: CompanyCardProps) {
  return (
    <Link href={`/${locale}/industry/companies/${company.id}`}>
      <Card variant="glow" className="h-full cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative w-12 h-12 shrink-0 rounded-lg bg-space-700 overflow-hidden">
              <SmartImage
                src={getCompanyImage(company.id, company.logo, company.name)}
                alt={company.name}
                fallback="company"
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white line-clamp-1">
                {company.name}
              </h3>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <Badge variant={typeColors[company.type] || 'default'}>
                  {typeLabels[company.type] || company.type}
                </Badge>
                {company.stockCode && (
                  <Badge variant="default">{company.stockCode}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-star-dim">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>
                {company.country} · {company.headquarters}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>成立于 {company.foundedYear}</span>
            </div>
          </div>

          <p className="mt-4 text-sm text-star-dim line-clamp-2">
            {company.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
