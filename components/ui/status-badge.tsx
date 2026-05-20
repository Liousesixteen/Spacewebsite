import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Rocket,
  Satellite,
  User,
  FlaskConical,
  Cpu,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { Badge, type BadgeProps } from './badge';
import { cn } from '@/lib/utils';

// Launch statuses
const launchStatusMap: Record<string, { variant: BadgeProps['variant']; icon: LucideIcon; label: string }> = {
  SUCCESS: { variant: 'success', icon: CheckCircle2, label: '成功' },
  FAILURE: { variant: 'error', icon: XCircle, label: '失败' },
  PLANNED: { variant: 'info', icon: Clock, label: '计划中' },
  POSTPONED: { variant: 'warning', icon: AlertTriangle, label: '推迟' },
  IN_FLIGHT: { variant: 'info', icon: Rocket, label: '飞行中' },
};

// Spacecraft statuses
const spacecraftStatusMap: Record<string, { variant: BadgeProps['variant']; icon: LucideIcon; label: string }> = {
  OPERATIONAL: { variant: 'success', icon: CheckCircle2, label: '运行中' },
  RETIRED: { variant: 'default', icon: Clock, label: '已退役' },
  LOST: { variant: 'error', icon: XCircle, label: '已失联' },
};

// Astronaut statuses
const astronautStatusMap: Record<string, { variant: BadgeProps['variant']; icon: LucideIcon; label: string }> = {
  ACTIVE: { variant: 'success', icon: CheckCircle2, label: '现役' },
  RETIRED: { variant: 'default', icon: Clock, label: '已退役' },
  DECEASED: { variant: 'warning', icon: AlertTriangle, label: '已故' },
};

// Rocket statuses
const rocketStatusMap: Record<string, { variant: BadgeProps['variant']; icon: LucideIcon; label: string }> = {
  ACTIVE: { variant: 'success', icon: CheckCircle2, label: '现役' },
  RETIRED: { variant: 'default', icon: Clock, label: '已退役' },
  IN_DEVELOPMENT: { variant: 'info', icon: FlaskConical, label: '研发中' },
};

// Company types
const companyTypeMap: Record<string, { variant: BadgeProps['variant']; icon: LucideIcon; label: string }> = {
  STATE_OWNED: { variant: 'info', icon: User, label: '国有企业' },
  PRIVATE: { variant: 'default', icon: User, label: '民营企业' },
  PUBLIC: { variant: 'success', icon: CheckCircle2, label: '上市公司' },
  STARTUP: { variant: 'warning', icon: Rocket, label: '初创公司' },
};

// Industry levels
const industryLevelMap: Record<string, { variant: BadgeProps['variant']; icon: LucideIcon; label: string }> = {
  UPSTREAM: { variant: 'info', icon: Cpu, label: '上游' },
  MIDSTREAM: { variant: 'warning', icon: Cpu, label: '中游' },
  DOWNSTREAM: { variant: 'success', icon: Cpu, label: '下游' },
};

// Technology maturity
const technologyMaturityMap: Record<string, { variant: BadgeProps['variant']; icon: LucideIcon; label: string }> = {
  RESEARCH: { variant: 'info', icon: FlaskConical, label: '研究阶段' },
  EXPERIMENTAL: { variant: 'warning', icon: FlaskConical, label: '试验阶段' },
  APPLIED: { variant: 'success', icon: CheckCircle2, label: '应用阶段' },
  MATURE: { variant: 'success', icon: CheckCircle2, label: '成熟阶段' },
};

// Launch site statuses
const launchSiteStatusMap: Record<string, { variant: BadgeProps['variant']; icon: LucideIcon; label: string }> = {
  ACTIVE: { variant: 'success', icon: CheckCircle2, label: '运营中' },
  INACTIVE: { variant: 'default', icon: Clock, label: '已停用' },
  UNDER_CONSTRUCTION: { variant: 'warning', icon: Wrench, label: '建设中' },
};

// Default fallback for unknown statuses
const defaultMap: Record<string, { variant: BadgeProps['variant']; icon: LucideIcon; label?: string }> = {
  default: { variant: 'default', icon: Satellite },
};

// Combine all maps for auto-detection
const allMaps: Record<string, { variant?: BadgeProps['variant']; icon?: LucideIcon; label?: string }> = {
  ...launchStatusMap,
  ...spacecraftStatusMap,
  ...astronautStatusMap,
  ...rocketStatusMap,
  ...companyTypeMap,
  ...industryLevelMap,
  ...technologyMaturityMap,
  ...launchSiteStatusMap,
};

export interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
  /** If provided, use this map instead of auto-detection */
  statusMap?: Record<string, { variant: BadgeProps['variant']; icon: LucideIcon; label: string }>;
}

export function StatusBadge({ status, label, className, statusMap }: StatusBadgeProps) {
  const map = statusMap ?? allMaps;
  const config = map[status] ?? { variant: 'default' as BadgeProps['variant'], icon: Satellite };
  const displayLabel = label ?? config.label ?? status;
  const Icon = config.icon;
  const variant = config.variant ?? 'default';

  return (
    <Badge variant={variant} className={cn('inline-flex items-center gap-1.5', className)}>
      {Icon && <Icon className={cn('w-3.5 h-3.5', status === 'IN_FLIGHT' && 'animate-spin')} />}
      {displayLabel}
    </Badge>
  );
}

// Export individual map accessors for convenience
export {
  launchStatusMap,
  spacecraftStatusMap,
  astronautStatusMap,
  rocketStatusMap,
  companyTypeMap,
  industryLevelMap,
  technologyMaturityMap,
  launchSiteStatusMap,
};
