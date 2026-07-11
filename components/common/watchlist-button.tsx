'use client';

/**
 * Watchlist button — adds a launch or entity to the user's watchlist
 * and optionally creates an alert rule for notifications.
 */

import { useState } from 'react';
import { Bell, BellOff, Clock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertEvent = 'launch_24h' | 'launch_1h' | 'launch_10m' | 'launch_time_changed' | 'launch_result';

const ALERT_LABELS: Record<AlertEvent, string> = {
  launch_24h: '24 小时前提醒',
  launch_1h: '1 小时前提醒',
  launch_10m: '10 分钟前提醒',
  launch_time_changed: '时间变更提醒',
  launch_result: '结果公布提醒',
};

export function WatchlistButton({
  targetType,
  targetId,
  locale = 'zh-CN',
  size = 'sm',
  className,
}: {
  targetType: string;
  targetId: string;
  locale?: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const [watching, setWatching] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<AlertEvent>>(new Set());
  const [loading, setLoading] = useState(false);

  const toggleWatch = async () => {
    setLoading(true);
    try {
      if (watching) {
        // TODO: API call to remove from watchlist
        setWatching(false);
        setShowAlerts(false);
      } else {
        // TODO: API call to add to watchlist
        setWatching(true);
      }
    } catch {
      // silently fail for MVP
    } finally {
      setLoading(false);
    }
  };

  const toggleAlert = (event: AlertEvent) => {
    const next = new Set(selectedAlerts);
    if (next.has(event)) {
      next.delete(event);
    } else {
      next.add(event);
    }
    setSelectedAlerts(next);
  };

  const sizeStyles = size === 'md'
    ? 'px-4 py-2 text-sm'
    : 'px-3 py-1.5 text-xs';

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={toggleWatch}
        disabled={loading}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border font-medium transition-all duration-200',
          sizeStyles,
          watching
            ? 'border-cosmic-blue/40 bg-cosmic-blue/10 text-cosmic-blue'
            : 'border-space-600/40 bg-transparent text-star-dim hover:text-star-white hover:border-cosmic-blue/50'
        )}
      >
        {watching ? (
          <Bell className="h-4 w-4" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
        {watching ? '已关注' : '关注'}
        {loading && (
          <span className="ml-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
      </button>

      {watching && (
        <button
          type="button"
          onClick={() => setShowAlerts(!showAlerts)}
          className={cn(
            'ml-1 inline-flex items-center rounded-lg border px-2 py-1.5 text-xs transition-colors',
            showAlerts
              ? 'border-cosmic-blue/40 bg-cosmic-blue/10 text-cosmic-blue'
              : 'border-space-600/40 text-star-dim hover:text-star-white'
          )}
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Alert config panel */}
      {showAlerts && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-space-600/30 bg-space-900/95 p-3 shadow-xl backdrop-blur-md">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-star-dim">
            <Clock className="h-3.5 w-3.5" />
            提醒设置
          </div>
          <div className="space-y-1.5">
            {(Object.entries(ALERT_LABELS) as [AlertEvent, string][]).map(
              ([event, label]) => (
                <label
                  key={event}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-star-dim hover:bg-space-700/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedAlerts.has(event)}
                    onChange={() => toggleAlert(event)}
                    className="h-3.5 w-3.5 rounded border-space-500 bg-space-800 text-cosmic-blue focus:ring-cosmic-blue/30"
                  />
                  {label}
                </label>
              )
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowAlerts(false)}
            className="mt-2 w-full rounded-lg bg-cosmic-blue/15 px-3 py-1.5 text-xs font-medium text-cosmic-blue hover:bg-cosmic-blue/25 transition-colors"
          >
            保存设置
          </button>
        </div>
      )}
    </div>
  );
}
