import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import {
  buildHealthSnapshot,
  type HealthDomainKey,
  type HealthDomainSample,
  type HealthSnapshot,
} from '@/lib/api/data-health';
import { HEALTH_DOMAINS, loadDataHealthSnapshot } from '@/lib/api/data-health-service';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Database, CheckCircle2, AlertTriangle, XCircle, Circle } from 'lucide-react';

const DOMAINS: Array<{
  key: HealthDomainKey;
  source: string;
  expectedRefreshHours: number;
}> = [
  { key: 'launches', source: 'Launch Library 2', expectedRefreshHours: 6 },
  { key: 'agencies', source: 'Launch Library 2', expectedRefreshHours: 24 },
  { key: 'rockets', source: 'Launch Library 2', expectedRefreshHours: 24 },
  { key: 'launchSites', source: 'Launch Library 2', expectedRefreshHours: 168 },
  { key: 'astronauts', source: 'Launch Library 2', expectedRefreshHours: 168 },
  { key: 'spacecraft', source: 'Launch Library 2', expectedRefreshHours: 168 },
];

async function queryDomain(key: HealthDomainKey): Promise<{
  count: number;
  latestUpdatedAt: Date | null;
  latestSyncedAt: Date | null;
}> {
  switch (key) {
    case 'launches': {
      const [count, latest] = await Promise.all([
        prisma.launch.count(),
        prisma.launch.findFirst({
          select: { updatedAt: true, lastSyncedAt: true },
          orderBy: { updatedAt: 'desc' },
        }),
      ]);
      return {
        count,
        latestUpdatedAt: latest?.updatedAt ?? null,
        latestSyncedAt: latest?.lastSyncedAt ?? null,
      };
    }
    case 'agencies': {
      const [count, latest] = await Promise.all([
        prisma.agency.count(),
        prisma.agency.findFirst({
          select: { updatedAt: true, lastSyncedAt: true },
          orderBy: { updatedAt: 'desc' },
        }),
      ]);
      return {
        count,
        latestUpdatedAt: latest?.updatedAt ?? null,
        latestSyncedAt: latest?.lastSyncedAt ?? null,
      };
    }
    case 'rockets': {
      const [count, latest] = await Promise.all([
        prisma.rocket.count(),
        prisma.rocket.findFirst({
          select: { updatedAt: true },
          orderBy: { updatedAt: 'desc' },
        }),
      ]);
      return {
        count,
        latestUpdatedAt: latest?.updatedAt ?? null,
        latestSyncedAt: null,
      };
    }
    case 'launchSites': {
      const [count, latest] = await Promise.all([
        prisma.launchSite.count(),
        prisma.launchSite.findFirst({
          select: { updatedAt: true },
          orderBy: { updatedAt: 'desc' },
        }),
      ]);
      return {
        count,
        latestUpdatedAt: latest?.updatedAt ?? null,
        latestSyncedAt: null,
      };
    }
    case 'astronauts': {
      const [count, latest] = await Promise.all([
        prisma.astronaut.count(),
        prisma.astronaut.findFirst({
          select: { updatedAt: true },
          orderBy: { updatedAt: 'desc' },
        }),
      ]);
      return {
        count,
        latestUpdatedAt: latest?.updatedAt ?? null,
        latestSyncedAt: null,
      };
    }
    case 'spacecraft': {
      const [count, latest] = await Promise.all([
        prisma.spacecraft.count(),
        prisma.spacecraft.findFirst({
          select: { updatedAt: true },
          orderBy: { updatedAt: 'desc' },
        }),
      ]);
      return {
        count,
        latestUpdatedAt: latest?.updatedAt ?? null,
        latestSyncedAt: null,
      };
    }
    default:
      return { count: 0, latestUpdatedAt: null, latestSyncedAt: null };
  }
}

async function loadHealthSnapshot(): Promise<HealthSnapshot | null> {
  try {
    return await loadDataHealthSnapshot();
  } catch (error) {
    console.error('[data-health] Complete failure:', error);
    return null;
  }
}

const STATUS_CONFIG = {
  healthy: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  stale: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  empty: { icon: Circle, color: 'text-star-dim/50', bg: 'bg-star-dim/5', border: 'border-space-600/30' },
  unavailable: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
} as const;

const OVERALL_CONFIG = {
  healthy: { icon: CheckCircle2, color: 'text-emerald-400' },
  degraded: { icon: AlertTriangle, color: 'text-amber-400' },
  unavailable: { icon: XCircle, color: 'text-red-400' },
} as const;

export default async function DataSourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dataHealth' });
  const statusLabels = {
    healthy: t('statusHealthy'),
    stale: t('statusStale'),
    empty: t('statusEmpty'),
    unavailable: t('statusUnavailable'),
  } as const;
  const overallLabels = {
    healthy: t('statusHealthy'),
    degraded: t('statusDegraded'),
    unavailable: t('statusUnavailable'),
  } as const;
  const domainLabels: Record<HealthDomainKey, string> = {
    launches: t('domainLaunches'),
    agencies: t('domainAgencies'),
    rockets: t('domainRockets'),
    launchSites: t('domainLaunchSites'),
    astronauts: t('domainAstronauts'),
    spacecraft: t('domainSpacecraft'),
  };

  const snapshot = await loadHealthSnapshot();
  const OverallIcon = snapshot
    ? OVERALL_CONFIG[snapshot.status].icon
    : XCircle;
  const overallColor = snapshot
    ? OVERALL_CONFIG[snapshot.status].color
    : 'text-red-400';
  const overallLabel = snapshot ? overallLabels[snapshot.status] : statusLabels.unavailable;

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
        icon={Database}
        title={t('title')}
        description={t('description')}
      />

      {/* Overall status strip */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="elevated">
          <CardContent className="flex items-center gap-4 p-5">
            <OverallIcon className={`h-8 w-8 ${overallColor}`} />
            <div>
              <div className="text-xs text-star-dim">{t('overallStatus')}</div>
              <div className={`text-lg font-semibold ${overallColor}`}>{overallLabel}</div>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-5">
            <div className="text-xs text-star-dim">{t('totalRecords')}</div>
            <div className="mt-1 text-3xl font-bold text-star-white">
              {(snapshot?.summary.totalRecords ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-5">
            <div className="text-xs text-star-dim">{t('healthyDomains')}</div>
            <div className="mt-1 text-3xl font-bold text-star-white">
              {snapshot?.summary.healthyDomains ?? 0}
              <span className="text-lg text-star-dim"> / {snapshot?.summary.totalDomains ?? HEALTH_DOMAINS.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-5">
            <div className="text-xs text-star-dim">{t('snapshotTime')}</div>
            <div className="mt-1 text-lg font-semibold text-star-white">
              {snapshot?.generatedAt
                ? new Intl.DateTimeFormat(locale, {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  }).format(new Date(snapshot.generatedAt))
                : '--:--:--'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Domain status table */}
      <Card variant="glow" className="mb-8 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-600/30 bg-space-800/50">
                  <th className="px-5 py-3 text-left text-xs font-medium text-star-dim uppercase tracking-wider">
                    {t('domain')}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-star-dim uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-star-dim uppercase tracking-wider">
                    {t('records')}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-star-dim uppercase tracking-wider">
                    {t('latestUpdate')}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-star-dim uppercase tracking-wider">
                    {t('source')}
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-star-dim uppercase tracking-wider">
                    {t('refreshInterval')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-space-600/20">
                {(snapshot?.domains ?? DOMAINS.map((d) => ({
                  key: d.key,
                  status: 'unavailable' as const,
                  count: 0,
                  latestUpdate: null,
                  latestSync: null,
                  source: d.source,
                  expectedRefreshHours: d.expectedRefreshHours,
                  lastRun: null,
                  message: t('domainUnavailable'),
                }))).map((domain) => {
                  const cfg = STATUS_CONFIG[domain.status];
                  const Icon = cfg.icon;
                  const label = domainLabels[domain.key] ?? domain.key;
                  const latestTime = domain.latestSync ?? domain.latestUpdate;

                  return (
                    <tr
                      key={domain.key}
                      className="hover:bg-space-700/30 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-star-white">{label}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border ${cfg.border} ${cfg.bg} px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {statusLabels[domain.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-star-white">
                        {domain.count.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-star-dim">
                        {latestTime
                          ? new Intl.DateTimeFormat(locale, {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(new Date(latestTime))
                          : '—'}
                        {domain.lastRun && (
                          <div className="mt-1 text-xs text-star-dim/70">
                            {t('lastSyncRun', {
                              status: domain.lastRun.status === 'SUCCEEDED'
                                ? t('syncSucceeded')
                                : domain.lastRun.status === 'FAILED'
                                  ? t('syncFailed')
                                  : domain.lastRun.status,
                              changed: domain.lastRun.recordsAdded + domain.lastRun.recordsUpdated,
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-star-dim">
                        {domain.source}
                      </td>
                      <td className="px-5 py-3.5 text-right text-star-dim">
                        {domain.expectedRefreshHours <= 24
                          ? `${domain.expectedRefreshHours}h`
                          : `${Math.round(domain.expectedRefreshHours / 24)}d`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Source registry */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-star-white mb-4">{t('sourceRegistry')}</h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-space-600/30 bg-space-700/30 p-4">
              <h3 className="font-medium text-star-white">Launch Library 2</h3>
              <p className="mt-1 text-sm text-star-dim">
                {t('ll2Description')}
              </p>
              <p className="mt-2 text-xs text-star-dim/70">
                {t('syncFrequency')}: {t('syncSchedule')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accuracy notice */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-star-white mb-3">{t('accuracyNotice')}</h2>
          <p className="text-sm text-star-dim leading-relaxed">
            {t('accuracyNoticeText')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
