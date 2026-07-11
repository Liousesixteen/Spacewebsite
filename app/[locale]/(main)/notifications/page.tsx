import { getTranslations } from 'next-intl/server';
import { Bell, Clock, Settings, Trash2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import {
  Breadcrumbs,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  Badge,
} from '@/components/ui';

/**
 * Notification Center — user-facing page for managing watchlist,
 * alert rules, and notification history.
 *
 * Currently displays the UI structure; data population requires
 * authenticated user session and database connectivity.
 */

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'notifications' });

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
        icon={Bell}
        title={t('title')}
        description={t('description')}
      />

      {/* Alert Rules */}
      <Card variant="glow" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-star-white">
            <Settings className="h-5 w-5 text-cosmic-blue" />
            {t('alertRules')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="rounded-lg border border-dashed border-space-600/30 bg-space-700/20 p-8 text-center">
            <Bell className="mx-auto mb-3 h-8 w-8 text-star-dim/40" />
            <p className="text-sm text-star-dim">{t('noAlertRules')}</p>
            <p className="mt-1 text-xs text-star-dim/60">{t('alertRulesHint')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card variant="elevated" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-star-white">
            <Clock className="h-5 w-5 text-cosmic-blue" />
            {t('notificationHistory')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {/* Placeholder items for UI demo */}
          <div className="space-y-2">
            <NotificationItem
              icon={CheckCircle2}
              iconColor="text-emerald-400"
              title="CZ-5B 发射成功"
              detail="2026-07-10 14:30 · 发射结果已公布"
              channel="in_app"
            />
            <NotificationItem
              icon={AlertTriangle}
              iconColor="text-amber-400"
              title="星舰发射推迟"
              detail="2026-07-09 08:15 · 发射时间已变更"
              channel="email"
            />
            <NotificationItem
              icon={XCircle}
              iconColor="text-red-400"
              title="朱雀二号发射取消"
              detail="2026-07-08 22:00 · 发射已取消"
              channel="push"
            />
          </div>

          <div className="mt-4 border-t border-space-600/20 pt-4 text-center">
            <p className="text-xs text-star-dim/60">{t('notificationHint')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Watchlist */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-star-white">
            <Bell className="h-5 w-5 text-cosmic-blue" />
            {t('watchlist')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="rounded-lg border border-dashed border-space-600/30 bg-space-700/20 p-8 text-center">
            <Bell className="mx-auto mb-3 h-8 w-8 text-star-dim/40" />
            <p className="text-sm text-star-dim">{t('noWatchlist')}</p>
            <p className="mt-1 text-xs text-star-dim/60">{t('watchlistHint')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationItem({
  icon: Icon,
  iconColor,
  title,
  detail,
  channel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  detail: string;
  channel: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-space-600/30 bg-space-700/30 p-3">
      <div className={`mt-0.5 shrink-0 ${iconColor}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-star-white">{title}</div>
        <div className="mt-0.5 text-xs text-star-dim">{detail}</div>
      </div>
      <div className="shrink-0">
        <Badge variant="hud" className="text-[10px]">
          {channel === 'email' ? '邮件' : channel === 'push' ? '推送' : '应用内'}
        </Badge>
      </div>
    </div>
  );
}
