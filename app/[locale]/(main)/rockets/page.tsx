import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import {
  Badge,
  Breadcrumbs,
  Card,
  CardContent,
  PageHeader,
} from '@/components/ui';
import { Rocket, Ruler, Gauge, Layers } from 'lucide-react';

export default async function RocketsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'rockets' });

  let rockets: any[] = [];
  let dbUnavailable = false;

  try {
    rockets = await prisma.rocket.findMany({
      select: {
        id: true,
        name: true,
        manufacturer: true,
        country: true,
        height: true,
        diameter: true,
        mass: true,
        stages: true,
        payloadToLEO: true,
        status: true,
        firstFlight: true,
        successRate: true,
        images: true,
      },
      orderBy: { name: 'asc' },
      take: 200,
    });
  } catch (error) {
    console.error('[rockets] Failed to load:', error);
    dbUnavailable = true;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: 'SpaceData', href: `/${locale}` },
          { label: t('breadcrumb') },
        ]}
      />

      <PageHeader
        icon={Rocket}
        title={t('title')}
        description={dbUnavailable ? t('dbUnavailable') : t('description')}
      />

      {dbUnavailable ? (
        <div className="py-20 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
            <Rocket className="h-8 w-8 text-amber-400/70" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-star-white">
            {t('dbUnavailable')}
          </h2>
          <p className="text-sm text-star-dim">{t('dbUnavailableHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rockets.map((rocket) => (
            <Link
              key={rocket.id}
              href={`/${locale}/rockets/${rocket.id}`}
              className="group block"
            >
              <Card variant="glow" className="h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-cosmic-blue/25 bg-cosmic-blue/10 text-sm font-bold text-cosmic-blue">
                      {rocket.name.slice(0, 3).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-star-white group-hover:text-cosmic-blue transition-colors truncate">
                        {rocket.name}
                      </h2>
                      <p className="text-sm text-star-dim">
                        {rocket.manufacturer} · {rocket.country}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <SpecBadge icon={Ruler} label={t('height')} value={`${rocket.height}m`} />
                    <SpecBadge icon={Layers} label={t('stages')} value={rocket.stages} />
                    <SpecBadge icon={Gauge} label={t('payloadToLEO')} value={`${(rocket.payloadToLEO / 1000).toFixed(1)}t`} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={rocket.status === 'ACTIVE' ? 'info' : 'hud'}>
                      {rocket.status === 'ACTIVE' ? t('active') : rocket.status}
                    </Badge>
                    {rocket.successRate > 0 && (
                      <Badge variant="default">
                        {t('successRate')}: {rocket.successRate}%
                      </Badge>
                    )}
                    {rocket.firstFlight && (
                      <Badge variant="hud">
                        {new Date(rocket.firstFlight).getFullYear()}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!dbUnavailable && rockets.length === 0 && (
        <div className="py-16 text-center text-star-dim">{t('empty')}</div>
      )}
    </div>
  );
}

function SpecBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-space-600/40 bg-space-700/35 py-2 px-1">
      <Icon className="h-3.5 w-3.5 text-cosmic-blue/70 mb-1" />
      <span className="text-xs font-semibold text-star-white">{value}</span>
      <span className="text-[10px] text-star-dim">{label}</span>
    </div>
  );
}
