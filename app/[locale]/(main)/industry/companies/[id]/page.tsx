import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Globe,
  Award,
  Package,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import type { BadgeProps } from '@/components/ui';
import { FavoriteButton } from '@/components/common/favorite-button';

const typeColors: Record<string, BadgeProps['variant']> = {
  STATE_OWNED: 'info',
  PRIVATE: 'default',
  PUBLIC: 'success',
  STARTUP: 'warning',
};

const typeLabels: Record<string, string> = {
  STATE_OWNED: '国有企业',
  PRIVATE: '民营企业',
  PUBLIC: '上市公司',
  STARTUP: '初创公司',
};

const levelColors: Record<string, BadgeProps['variant']> = {
  UPSTREAM: 'info',
  MIDSTREAM: 'warning',
  DOWNSTREAM: 'success',
};

const levelLabels: Record<string, string> = {
  UPSTREAM: '上游',
  MIDSTREAM: '中游',
  DOWNSTREAM: '下游',
};

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      segments: {
        include: { segment: true },
      },
    },
  });

  if (!company) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href={`/${locale}/industry/companies`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </Button>
      </Link>

      <div className="flex items-start gap-6 mb-8">
        <div className="w-20 h-20 shrink-0 rounded-xl bg-space-700 flex items-center justify-center overflow-hidden">
          {company.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logo}
              alt={company.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <Building2 className="w-10 h-10 text-star-dim" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-white">{company.name}</h1>
            <FavoriteButton
              targetType="COMPANY"
              targetId={company.id}
              locale={locale}
              size="sm"
            />
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Badge
              variant={typeColors[company.type] || 'default'}
              className="text-sm px-3 py-1"
            >
              {typeLabels[company.type] || company.type}
            </Badge>
            {company.stockCode && (
              <Badge variant="default">股票代码: {company.stockCode}</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">基本信息</h2>
            <div className="space-y-3 text-star-dim">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-cosmic-blue" />
                <span>
                  {company.country} · {company.headquarters}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-cosmic-blue" />
                <span>成立于 {company.foundedYear} 年</span>
              </div>
              {company.employees !== null && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-cosmic-blue" />
                  <span>员工人数: {company.employees.toLocaleString()}</span>
                </div>
              )}
              {company.revenue !== null && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-cosmic-blue" />
                  <span>
                    营收: ${company.revenue.toLocaleString()} 亿美元
                  </span>
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-cosmic-blue" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cosmic-blue hover:underline flex items-center gap-1"
                  >
                    官方网站
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {company.segments.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                所在产业环节
              </h2>
              <div className="space-y-2">
                {company.segments.map((cs) => (
                  <div
                    key={cs.id}
                    className="flex items-center justify-between p-3 bg-space-700 rounded-lg"
                  >
                    <span className="text-white">{cs.segment.name}</span>
                    <Badge variant={levelColors[cs.segment.level] || 'default'}>
                      {levelLabels[cs.segment.level] || cs.segment.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">公司简介</h2>
          <p className="text-star-dim leading-relaxed whitespace-pre-line">
            {company.description}
          </p>
        </CardContent>
      </Card>

      {company.products.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-cosmic-blue" />
              主要产品
            </h2>
            <div className="flex flex-wrap gap-2">
              {company.products.map((product, index) => (
                <Badge key={index} variant="info" className="text-sm px-3 py-1">
                  {product}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {company.achievements.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-cosmic-blue" />
              主要成就
            </h2>
            <ul className="space-y-2">
              {company.achievements.map((achievement, index) => (
                <li key={index} className="flex gap-3 text-star-dim">
                  <span className="text-cosmic-blue">·</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
