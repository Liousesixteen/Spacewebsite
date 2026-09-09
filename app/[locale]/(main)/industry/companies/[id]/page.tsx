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
import { displayCountryName, displayLocalizedDescription } from '@/lib/display-names';
import { displayIndustryCompanyName, displayIndustrySegment } from '@/lib/industry-display';

let productCapabilityTableAvailable = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  try {
    const company = await prisma.company.findUnique({
      where: { id },
      select: { name: true, description: true, logo: true, country: true },
    });
    if (!company) return { title: 'Not Found - SpaceData' };

    const displayName = displayIndustryCompanyName(company.name, locale);
    const description =
      company.description?.slice(0, 160) ??
      `${displayName} - ${company.country} aerospace company`;

    return {
      title: `${displayName} - SpaceData`,
      description,
      openGraph: {
        title: displayName,
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
  const detailT = await getTranslations({ locale, namespace: 'industry.companyDetail' });

  let company: any = null;
  let dbUnavailable = false;

  try {
    company = await prisma.company.findUnique({
      where: { id },
      include: {
        segments: { include: { segment: true } },
      },
    });
    if (company && productCapabilityTableAvailable) {
      try {
        company.capabilities = await prisma.productCapability.findMany({
          where: { companyId: company.id },
          take: 10,
          orderBy: { createdAt: 'desc' },
        });
      } catch {
        // The optional capability migration may not yet be installed in a live database.
        productCapabilityTableAvailable = false;
        company.capabilities = [];
      }
    } else if (company) {
      company.capabilities = [];
    }
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
        <h1 className="mb-2 text-xl font-semibold text-star-white">{detailT('unavailableTitle')}</h1>
        <p className="text-sm text-star-dim">{detailT('unavailableDescription')}</p>
        <Link href={`/${locale}/industry/companies`} className="mt-6 inline-block text-sm text-cosmic-blue hover:underline">
          {detailT('backToCompanies')}
        </Link>
      </div>
    );
  }

  if (!company) notFound();

  const displayName = displayIndustryCompanyName(company.name, locale);
  const qualityLabels = [
    'sourceAuthority',
    'freshness',
    'completeness',
    'consistency',
    'editorialReview',
    'relationshipVerification',
  ] as const;
  const hasCjk = (value: string) => /[\u3400-\u9fff\u3040-\u30ff]/.test(value);
  const products = company.products.filter((product: string) => locale !== 'en' || !hasCjk(product));
  const achievements = company.achievements.filter((achievement: string) => locale !== 'en' || !hasCjk(achievement));

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
          name: displayName,
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
          { label: displayName },
        ]}
      />

      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-space-700">
          <SmartImage
            src={getCompanyImage(company.id, company.logo, company.name)}
            alt={displayName}
            fallback="company"
            fill
            priority
            sizes="80px"
            className="object-contain"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-star-white">{displayName}</h1>
            <FavoriteButton targetType="COMPANY" targetId={company.id} locale={locale} size="sm" />
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Badge variant="info" className="text-sm px-3 py-1">
              {t.has(`companyList.types.${company.type}`)
                ? t(`companyList.types.${company.type}`)
                : company.type}
            </Badge>
            {company.stockCode && <Badge variant="default">{company.stockCode}</Badge>}
          </div>
        </div>
      </div>

      {/* Info + Segments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-4">{detailT('basicInfo')}</h2>
            <div className="space-y-3 text-star-dim">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-cosmic-blue" />
                <span>{displayCountryName(company.country, locale)} · {company.headquarters}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-cosmic-blue" />
                <span>{detailT('founded', { year: company.foundedYear })}</span>
              </div>
              {company.employees !== null && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-cosmic-blue" />
                  <span>{detailT('employees', { count: company.employees.toLocaleString(locale) })}</span>
                </div>
              )}
              {company.revenue !== null && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-cosmic-blue" />
                  <span>{detailT('revenue', { amount: company.revenue.toLocaleString(locale) })}</span>
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-cosmic-blue" />
                  <a href={company.website} target="_blank" rel="noopener noreferrer"
                    className="text-cosmic-blue hover:underline flex items-center gap-1">
                    {detailT('website')} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {company.segments.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-star-white mb-4">{detailT('segments')}</h2>
              <div className="space-y-2">
                {company.segments.map((cs: any) => (
                  <div key={cs.id} className="flex items-center justify-between p-3 bg-space-700 rounded-lg">
                    <span className="text-star-white">{displayIndustrySegment(cs.segment, locale).name}</span>
                    <Badge variant="hud">
                      {t.has(`levels.${cs.segment.level}`) ? t(`levels.${cs.segment.level}`) : cs.segment.level}
                    </Badge>
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
          <h2 className="text-lg font-semibold text-star-white mb-4">{detailT('overview')}</h2>
          <p className="text-star-dim leading-relaxed whitespace-pre-line">
            {displayLocalizedDescription(company.description, locale, detailT('noDescription'))}
          </p>
        </CardContent>
      </Card>

      {/* Products */}
      {products.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-cosmic-blue" /> {detailT('products')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {products.map((product: any, i: number) => (
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
              <ShieldCheck className="w-5 h-5 text-cosmic-blue" /> {detailT('capabilities')}
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
      {achievements.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-cosmic-blue" /> {detailT('achievements')}
            </h2>
            <ul className="space-y-2">
              {achievements.map((a: any, i: number) => (
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
          <CardTitle className="text-lg text-star-white">{detailT('dataQuality')}</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-star-dim">{detailT('overallScore')}</span>
                <span className="text-2xl font-bold text-cosmic-blue">{quality.total}/{quality.maxTotal}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-space-700/50">
                <div className="h-2 rounded-full bg-gradient-to-r from-cosmic-blue to-cosmic-purple transition-all"
                  style={{ width: `${(quality.total / quality.maxTotal) * 100}%` }} />
              </div>
            </div>
            <SourceBadge tier={sourceTier} factType="OBSERVED" lastSyncedAt={company.updatedAt} locale={locale} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quality.dimensions.map((dim, index) => (
              <div key={dim.label} className="rounded-lg border border-space-600/30 bg-space-700/30 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-star-dim">{detailT(`quality.${qualityLabels[index]}`)}</span>
                  <span className="text-xs font-mono font-semibold text-star-white">{dim.score}/{dim.maxScore}</span>
                </div>
                <div className="mb-2 h-1.5 w-full rounded-full bg-space-600/30">
                  <div className="h-1.5 rounded-full bg-cosmic-blue/60"
                    style={{ width: `${(dim.score / dim.maxScore) * 100}%` }} />
                </div>
                <div className="text-xs text-star-dim/70">
                  {detailT('quality.score', { score: dim.score, max: dim.maxScore })}
                </div>
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
                <Cpu className="w-5 h-5 text-cosmic-blue" /> {detailT('relatedTechnologies')}
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
                <Building2 className="w-5 h-5 text-cosmic-blue" /> {detailT('peerCompanies')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {sameCountryCompanies.map((c: any) => (
                  <Link key={c.id} href={`/${locale}/industry/companies/${c.id}`}
                    className="p-3 bg-space-700 rounded-lg hover:bg-space-600 transition-colors group">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-star-white text-sm font-medium group-hover:text-cosmic-blue transition-colors">
                        {displayIndustryCompanyName(c.name, locale)}
                      </span>
                      <Badge variant="info" className="text-xs">
                        {t.has(`companyList.types.${c.type}`)
                          ? t(`companyList.types.${c.type}`)
                          : c.type}
                      </Badge>
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
