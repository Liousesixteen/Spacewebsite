/**
 * Source credibility badge — shows source tier, fact type, and freshness.
 *
 * Source tiers (per execution plan §5.3):
 *   A: Government agency, launch provider, exchange, regulatory filing
 *   B: Professional database, industry association, verified commercial provider
 *   C: Mainstream media, company press release, research institute
 *   D: Community, aggregator, unverified social — clues only, not core facts
 *
 * Fact types (per execution plan §5.4):
 *   OBSERVED: Source directly states this value
 *   DERIVED: Computed from public fields (e.g. success rate)
 *   ESTIMATED: Model or analyst estimate (e.g. market size)
 *   EDITORIAL: Editorial description or classification
 *   USER_SUBMITTED: User or company submitted, verified or not
 */

import { Clock, ShieldCheck, ShieldAlert, ShieldQuestion, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SourceTier = 'A' | 'B' | 'C' | 'D';
export type FactType = 'OBSERVED' | 'DERIVED' | 'ESTIMATED' | 'EDITORIAL' | 'USER_SUBMITTED';

const TIER_CONFIG: Record<
  SourceTier,
  { icon: typeof ShieldCheck; color: string; label: string }
> = {
  A: { icon: ShieldCheck, color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10', label: 'A' },
  B: { icon: ShieldCheck, color: 'text-blue-400 border-blue-400/30 bg-blue-400/10', label: 'B' },
  C: { icon: ShieldAlert, color: 'text-amber-400 border-amber-400/30 bg-amber-400/10', label: 'C' },
  D: { icon: ShieldQuestion, color: 'text-star-dim/60 border-star-dim/30 bg-star-dim/5', label: 'D' },
};

const FACT_TYPE_LABELS: Record<FactType, string> = {
  OBSERVED: '观测',
  DERIVED: '推算',
  ESTIMATED: '估算',
  EDITORIAL: '编辑',
  USER_SUBMITTED: '用户提交',
};

export function SourceBadge({
  tier,
  factType,
  lastSyncedAt,
  className,
}: {
  tier?: SourceTier | null;
  factType?: FactType | null;
  lastSyncedAt?: Date | string | null;
  className?: string;
}) {
  const config = tier ? TIER_CONFIG[tier] : null;
  const TierIcon = config?.icon ?? Shield;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-space-600/30 bg-space-700/40 px-2.5 py-1.5 text-xs',
        className
      )}
    >
      {config && tier && (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[10px] font-semibold',
            config.color
          )}
          title={`来源等级 ${tier}: ${getTierDescription(tier)}`}
        >
          <TierIcon className="h-2.5 w-2.5" />
          {config.label}
        </span>
      )}
      {factType && (
        <span className="text-star-dim/80">{FACT_TYPE_LABELS[factType]}</span>
      )}
      {lastSyncedAt && (
        <span className="inline-flex items-center gap-1 text-star-dim/60">
          <Clock className="h-2.5 w-2.5" />
          {formatRelativeTime(lastSyncedAt)}
        </span>
      )}
    </div>
  );
}

function getTierDescription(tier: SourceTier): string {
  switch (tier) {
    case 'A':
      return '权威来源：政府机构、发射商、交易所、监管文件';
    case 'B':
      return '专业数据库、行业协会、验证的商业数据';
    case 'C':
      return '主流媒体、企业新闻稿、研究机构';
    case 'D':
      return '社区、聚合站、未验证信息';
  }
}

function formatRelativeTime(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} 小时前`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} 天前`;
  return `${Math.floor(diffDays / 7)} 周前`;
}
