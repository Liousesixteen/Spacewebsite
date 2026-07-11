import { getTranslations } from 'next-intl/server';
import { CheckCircle2, AlertTriangle, XCircle, Clock, Activity } from 'lucide-react';
import {
  Breadcrumbs,
  Card,
  CardContent,
  PageHeader,
} from '@/components/ui';
interface HealthComponent {
  name: string;
  status: 'up' | 'down' | 'degraded';
  latencyMs: number;
  error?: string;
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'unavailable';
  version: string;
  uptime: number;
  timestamp: string;
  components: HealthComponent[];
}

async function fetchHealth(): Promise<HealthResponse | null> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base}/api/health`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as HealthResponse;
  } catch {
    return null;
  }
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'status' });
  const health = await fetchHealth();

  const OverallIcon = health?.status === 'ok'
    ? CheckCircle2
    : health?.status === 'degraded'
      ? AlertTriangle
      : XCircle;

  const overallColor = health?.status === 'ok'
    ? 'text-emerald-400'
    : health?.status === 'degraded'
      ? 'text-amber-400'
      : 'text-red-400';

  const overallLabel = health?.status === 'ok'
    ? '正常'
    : health?.status === 'degraded'
      ? '部分降级'
      : '不可用';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: 'SpaceData', href: `/${locale}` },
          { label: t('breadcrumb') },
        ]}
      />

      <PageHeader
        icon={Activity}
        title={t('title')}
        description={t('description')}
      />

      {/* Overall Status */}
      <Card variant="glow" className="mb-8">
        <CardContent className="flex items-center gap-6 p-6">
          <OverallIcon className={`h-12 w-12 ${overallColor}`} />
          <div>
            <div className="text-sm text-star-dim">{t('currentStatus')}</div>
            <div className={`text-2xl font-bold ${overallColor}`}>{overallLabel}</div>
            {health && (
              <div className="mt-1 flex items-center gap-3 text-xs text-star-dim/70">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(health.timestamp).toLocaleTimeString()}
                </span>
                <span>运行时间: {formatUptime(health.uptime)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Component Status */}
      <Card variant="elevated" className="mb-8">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-space-600/30 bg-space-800/50">
                <th className="px-5 py-3 text-left text-xs font-medium text-star-dim uppercase">
                  {t('component')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-star-dim uppercase">
                  {t('status')}
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-star-dim uppercase">
                  {t('latency')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-600/20">
              {(health?.components ?? [
                { name: 'database', status: 'down' as const, latencyMs: 0, error: '无法获取健康数据' },
                { name: 'api', status: 'down' as const, latencyMs: 0, error: '无法获取健康数据' },
              ]).map((component: HealthComponent) => {
                const Icon = component.status === 'up'
                  ? CheckCircle2
                  : component.status === 'degraded'
                    ? AlertTriangle
                    : XCircle;
                const color = component.status === 'up'
                  ? 'text-emerald-400'
                  : component.status === 'degraded'
                    ? 'text-amber-400'
                    : 'text-red-400';
                const label = component.status === 'up'
                  ? '正常'
                  : component.status === 'degraded'
                    ? '降级'
                    : '故障';

                return (
                  <tr key={component.name} className="hover:bg-space-700/30">
                    <td className="px-5 py-3.5 font-medium text-star-white">
                      {component.name}
                      {component.error && (
                        <div className="mt-0.5 text-xs text-red-400/70">{component.error}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-star-dim">
                      {component.latencyMs > 0 ? `${component.latencyMs}ms` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* SLO Summary */}
      <Card variant="elevated" className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-star-white mb-4">{t('sloTitle')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SloCard label="公共页面可用性" target="99.9%" current="—" />
            <SloCard label="核心 API 可用性" target="99.9%" current="—" />
            <SloCard label="发射列表 P95 响应" target="< 500ms" current="—" />
          </div>
        </CardContent>
      </Card>

      {/* Incident History */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-star-white mb-4">{t('incidentHistory')}</h2>
          <div className="rounded-lg border border-dashed border-space-600/30 bg-space-700/20 p-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-400/40" />
            <p className="text-sm text-star-dim">{t('noIncidents')}</p>
            <p className="mt-1 text-xs text-star-dim/60">{t('incidentsHint')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SloCard({
  label,
  target,
  current,
}: {
  label: string;
  target: string;
  current: string;
}) {
  return (
    <div className="rounded-xl border border-space-600/30 bg-space-700/30 p-4">
      <div className="text-xs text-star-dim mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-star-white">{current}</span>
        <span className="text-xs text-star-dim/60">目标 {target}</span>
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
