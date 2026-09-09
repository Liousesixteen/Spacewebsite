export const SYNC_FAILURE_ALERT_THRESHOLD = 3;

/** Counts consecutive failed runs from newest to oldest. */
export function countConsecutiveFailures(statuses: string[]): number {
  let count = 0;
  for (const status of statuses) {
    if (status !== 'FAILED') break;
    count += 1;
  }
  return count;
}

/** Alert exactly when a source reaches the configured failure threshold. */
export function shouldAlertForFailureStreak(
  statuses: string[],
  threshold = SYNC_FAILURE_ALERT_THRESHOLD
): boolean {
  return countConsecutiveFailures(statuses) === threshold;
}
