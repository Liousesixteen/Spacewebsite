/**
 * Notification deduplication and delivery — pure logic.
 *
 * Framework-agnostic: no Prisma, React, or Next.js imports.
 * Handles idempotency key generation, dedup checking, quiet hours,
 * and delivery status classification.
 */

export type NotificationChannel = 'email' | 'web_push' | 'in_app' | 'ics';

export type NotificationEventType =
  | 'launch_24h'
  | 'launch_1h'
  | 'launch_10m'
  | 'launch_time_changed'
  | 'launch_postponed'
  | 'launch_cancelled'
  | 'launch_live'
  | 'launch_result';

export interface NotificationDedupInput {
  userId: string;
  eventType: NotificationEventType;
  targetType: string;
  targetId: string;
}

export interface AlertRuleInput {
  minutesBefore: number | null;
  quietStart: string | null;
  quietEnd: string | null;
  enabled: boolean;
}

/**
 * Build a deterministic idempotency key for a notification event.
 * Same user + event + target always produces the same key.
 */
export function buildIdempotencyKey(params: NotificationDedupInput): string {
  const { userId, eventType, targetType, targetId } = params;
  return `notify:${userId}:${eventType}:${targetType}:${targetId}`;
}

/**
 * Build a notification subject for a launch event.
 */
export function buildLaunchNotificationSubject(
  eventType: NotificationEventType,
  launchName: string
): string {
  switch (eventType) {
    case 'launch_24h':
      return `${launchName} 将在 24 小时内发射`;
    case 'launch_1h':
      return `${launchName} 即将在 1 小时内发射`;
    case 'launch_10m':
      return `${launchName} 即将在 10 分钟内发射`;
    case 'launch_time_changed':
      return `${launchName} 发射时间已变更`;
    case 'launch_postponed':
      return `${launchName} 发射已推迟`;
    case 'launch_cancelled':
      return `${launchName} 发射已取消`;
    case 'launch_live':
      return `${launchName} 正在直播`;
    case 'launch_result':
      return `${launchName} 发射结果已公布`;
  }
}

/**
 * Check whether the current time falls within quiet hours.
 * Quiet hours are stored as "HH:mm" in UTC.
 */
export function isQuietHours(
  now: Date,
  quietStart: string | null | undefined,
  quietEnd: string | null | undefined
): boolean {
  if (!quietStart || !quietEnd) return false;

  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const startParts = quietStart.split(':').map(Number);
  const endParts = quietEnd.split(':').map(Number);
  if (startParts.length !== 2 || endParts.length !== 2) return false;

  const startMinutes = startParts[0] * 60 + startParts[1];
  const endMinutes = endParts[0] * 60 + endParts[1];

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }
  // Overnight quiet hours (e.g., 22:00-06:00)
  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
}

/**
 * Compute the notification window for a launch event.
 * Returns the minutes before the launch when the notification should fire.
 */
export function getNotificationWindow(
  eventType: NotificationEventType
): number | null {
  switch (eventType) {
    case 'launch_24h':
      return 24 * 60;
    case 'launch_1h':
      return 60;
    case 'launch_10m':
      return 10;
    default:
      return null;
  }
}

/**
 * Check if a notification should be suppressed by the alert rule.
 */
export function shouldSuppressNotification(
  rule: AlertRuleInput,
  now: Date
): boolean {
  if (!rule.enabled) return true;
  if (isQuietHours(now, rule.quietStart, rule.quietEnd)) return true;
  return false;
}

/**
 * Given a set of recently delivered idempotency keys (from NotificationDelivery),
 * determine if a new notification is a duplicate.
 */
export function isDuplicate(
  idempotencyKey: string,
  recentKeys: Set<string>
): boolean {
  return recentKeys.has(idempotencyKey);
}
