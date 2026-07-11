import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Globe,
  Award,
  Package,
  ExternalLink,
  Building2,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  StatusBadge,
  SmartImage,
  Breadcrumbs,
} from '@/components/ui';
import { FavoriteButton } from '@/components/common/favorite-button';
import { CommentSection } from '@/components/common/comment-section';
import { JsonLd, buildOrganizationSchema } from '@/components/seo/json-ld';
import { SourceBadge } from '@/components/ui/source-badge';
import { computeQualityScore, inferSourceTier } from '@/lib/api/data-quality';
import { getCompanyImage } from '@/lib/image-fallbacks';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const company = await prisma.company.findUnique({
      where: { id },
      select: { name: true, description: true, logo: true, country: true },
    });
    if (!company) return { title: 'Not Found - SpaceData' };

    const description =
      company.description?.slice(0, 160) ??
      `${company.name} - ${company.country} aerospace company`;

    return {
      title: `${company.name} - SpaceData`,
      description,
      openGraph: {
        title: company.name,
        description,
        images: company.logo ? [company.logo] : undefined,
      },
    };
  } catch (error) {
    console.error('[company metadata] failed:', error);
    return { title: 'Company Detail - SpaceData' };
  }
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'industry' });

  let company: any = null;
  let dbUnavailable = false;

  try {
    company = await prisma.company.findUnique({
      where: { id },
      include: {
        segments: { include: { segment: true } },
        capabilities: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
  } catch (error) {
    console.error('[company detail] Failed:', error);
    dbUnavailable = true;
  }

  if (dbUnavailable) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
          <Building2 className="h-8 w-8 text-amber-400/70" />
        </div>
        <h1 className="mb-2 text-xl font-semibold text-star-white">数据库暂时不可用</h1>
        <p className="text-sm text-star-dim">企业数据服务正在恢复中，请稍后再试。</p>
        <Link href={`/${locale}/industry/companies`} className="mt-6 inline-block text-sm text-cosmic-blue hover:underline">
          ← 返回企业列表
        </Link>
      </div>
    );
  }

  if (!company) notFound();

  const sourceTier = inferSourceTier('Launch Library 2');
  const quality = computeQualityScore({
    sourceTier,
    lastSyncedAt: company.updatedAt,
    coreFieldsTotal: 7,
    coreFieldsPopulated: [
      company.name, company.country, company.type,
      company.description, company.website, company.headquarters,
      company.foundedYear ? String(company.foundedYear) : null,
    ].filter(Boolean).length,
    distinctSources: 1,
    maxSources: 3,
    hasEditorialReview: false,
    hasVerifiedRelationships: company.segments.length > 0 || (company.capabilities?.length ?? 0) > 0,
  });

  const companyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${locale}/industry/companies/${company.id}`;

  // Related tech and same-country companies — with graceful fallback
  let relatedTechnologies: any[] = [];
  let sameCountryCompanies: any[] = [];
  try {
    [relatedTechnologies, sameCountryCompanies] = await Promise.all([
      prisma.technology.findMany({
        where: { keyPlayers: { has: company.name } },
        select: { id: true, name: true, category: true, maturityLevel: true },
        take: 3,
      }),
      prisma.company.findMany({
        where: { id: { not: company.id }, country: company.country },
        select: { id: true, name: true, type: true, headquarters: true },
        take: 3,
      }),
    ]);
  } catch {
    // best-effort
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <JsonLd
        data={buildOrganizationSchema({
          name: company.name,
          description: company.description,
          url: companyUrl,
          logo: company.logo ?? null,
          country: company.country,
        })}
      />

      <Breadcrumbs
        className="mb-6"
        items={[
          { label: 'SpaceData', href: `/${locale}` },
          { label: t('title'), href: `/${locale}/industry` },
          { label: t('companies'), href: `/${locale}/industry/companies` },
          { label: company.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-space-700">
          <SmartImage
            src={getCompanyImage(company.id, company.logo, company.name)}
            alt={company.name}
            fallback="company"
            fill
            priority
            sizes="80px"
            className="object-contain"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-star-white">{company.name}</h1>
            <FavoriteButton targetType="COMPANY" targetId={company.id} locale={locale} size="sm" />
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <StatusBadge status={company.type} className="text-sm px-3 py-1" />
            {company.stockCode && <Badge variant="default">{company.stockCode}</Badge>}
          </div>
        </div>
      </div>

      {/* Info + Segments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-4">基本信息</h2>
            <div className="space-y-3 text-star-dim">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-cosmic-blue" />
                <span>{company.country} · {company.headquarters}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-cosmic-blue" />
                <span>成立于 {company.foundedYear} 年</span>
              </div>
              {company.employees !== null && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-cosmic-blue" />
                  <span>员工: {company.employees.toLocaleString()}</span>
                </div>
              )}
              {company.revenue !== null && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-cosmic-blue" />
                  <span>营收: ${company.revenue.toLocaleString()} 亿</span>
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-cosmic-blue" />
                  <a href={company.website} target="_blank" rel="noopener noreferrer"
                    className="text-cosmic-blue hover:underline flex items-center gap-1">
                    官方网站 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {company.segments.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-star-white mb-4">产业环节</h2>
              <div className="space-y-2">
                {company.segments.map((cs: any) => (
                  <div key={cs.id} className="flex items-center justify-between p-3 bg-space-700 rounded-lg">
                    <span className="text-star-white">{cs.segment.name}</span>
                    <Badge variant="hud">{cs.segment.level}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Description */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-star-white mb-4">公司简介</h2>
          <p className="text-star-dim leading-relaxed whitespace-pre-line">
            {company.description}
          </p>
        </CardContent>
      </Card>

      {/* Products */}
      {company.products.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-cosmic-blue" /> 主要产品
            </h2>
            <div className="flex flex-wrap gap-2">
              {company.products.map((product: any, i: number) => (
                <Badge key={i} variant="info" className="text-sm px-3 py-1">{product}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Capabilities */}
      {(company.capabilities?.length ?? 0) > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cosmic-blue" /> 核心能力
            </h2>
            <div className="space-y-3">
              {company.capabilities?.map((cap: any) => (
                <div key={cap.id} className="rounded-lg border border-space-600/30 bg-space-700/30 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-star-white">{cap.name}</span>
                    {cap.maturityLevel && (
                      <Badge variant="hud">{cap.maturityLevel}</Badge>
                    )}
                  </div>
                  {cap.description && (
                    <p className="text-sm text-star-dim">{cap.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {company.achievements.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-cosmic-blue" /> 主要成就
            </h2>
            <ul className="space-y-2">
              {company.achievements.map((a: any, i: number) => (
                <li key={i} className="flex gap-3 text-star-dim">
                  <span className="text-cosmic-blue">·</span><span>{a}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Data Quality Score */}
      <Card variant="elevated" className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg text-star-white">数据质量</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-star-dim">综合评分</span>
                <span className="text-2xl font-bold text-cosmic-blue">{quality.total}/{quality.maxTotal}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-space-700/50">
                <div className="h-2 rounded-full bg-gradient-to-r from-cosmic-blue to-cosmic-purple transition-all"
                  style={{ width: `${(quality.total / quality.maxTotal) * 100}%` }} />
              </div>
            </div>
            <SourceBadge tier={sourceTier} factType="OBSERVED" lastSyncedAt={company.updatedAt} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quality.dimensions.map((dim) => (
              <div key={dim.label} className="rounded-lg border border-space-600/30 bg-space-700/30 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-star-dim">{dim.label}</span>
                  <span className="text-xs font-mono font-semibold text-star-white">{dim.score}/{dim.maxScore}</span>
                </div>
                <div className="mb-2 h-1.5 w-full rounded-full bg-space-600/30">
                  <div className="h-1.5 rounded-full bg-cosmic-blue/60"
                    style={{ width: `${(dim.score / dim.maxScore) * 100}%` }} />
                </div>
                <div className="text-xs text-star-dim/70">{dim.detail}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Related */}
      <div className="space-y-6 mb-8">
        {relatedTechnologies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cosmic-blue" /> 相关技术
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {relatedTechnologies.map((tech: any) => (
                  <Link key={tech.id} href={`/${locale}/industry/technologies/${tech.id}`}
                    className="p-3 bg-space-700 rounded-lg hover:bg-space-600 transition-colors group">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-star-white text-sm font-medium group-hover:text-cosmic-blue transition-colors">
                        {tech.name}
                      </span>
                      <StatusBadge status={tech.maturityLevel} className="text-xs" />
                    </div>
                    <span className="text-xs text-star-dim">{tech.category}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {sameCountryCompanies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cosmic-blue" /> 同国家企业
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {sameCountryCompanies.map((c: any) => (
                  <Link key={c.id} href={`/${locale}/industry/companies/${c.id}`}
                    className="p-3 bg-space-700 rounded-lg hover:bg-space-600 transition-colors group">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-star-white text-sm font-medium group-hover:text-cosmic-blue transition-colors">
                        {c.name}
                      </span>
                      <StatusBadge status={c.type} className="text-xs" />
                    </div>
                    <span className="text-xs text-star-dim">{c.headquarters}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8">
        <CommentSection targetType="COMPANY" targetId={company.id} locale={locale} />
      </div>
    </div>
  );
}
