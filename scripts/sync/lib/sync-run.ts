import { prisma } from '../../../lib/db/prisma';
import {
  SYNC_FAILURE_ALERT_THRESHOLD,
  shouldAlertForFailureStreak,
} from '../../../lib/api/sync-monitor';

export interface SyncResult {
  added: number;
  updated: number;
  skipped: number;
}

/** Records sync execution without making the data import depend on observability. */
export async function runTrackedSync(
  source: string,
  run: () => Promise<SyncResult>,
  version = '2.3.0'
): Promise<SyncResult> {
  let syncRunId: string | null = null;

  try {
    const record = await prisma.syncRun.create({
      data: { source, status: 'RUNNING', version },
      select: { id: true },
    });
    syncRunId = record.id;
  } catch (error) {
    console.warn(`[sync-run] Could not create run record for ${source}:`, (error as Error).message);
  }

  try {
    const result = await run();
    if (syncRunId) {
      await prisma.syncRun.update({
        where: { id: syncRunId },
        data: {
          status: result.skipped > 0 && result.added + result.updated === 0 ? 'PARTIAL' : 'SUCCEEDED',
          completedAt: new Date(),
          recordsAdded: result.added,
          recordsUpdated: result.updated,
          recordsSkipped: result.skipped,
        },
      }).catch(() => undefined);
    }
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (syncRunId) {
      await prisma.syncRun.update({
        where: { id: syncRunId },
        data: { status: 'FAILED', completedAt: new Date(), error: message },
      }).catch(() => undefined);
    }
    await notifyFailureStreak(source, message);
    throw error;
  }
}

export async function notifyFailureStreak(source: string, error: string): Promise<void> {
  const webhookUrl = process.env.SYNC_ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const runs = await prisma.syncRun.findMany({
      where: { source },
      orderBy: { startedAt: 'desc' },
      take: SYNC_FAILURE_ALERT_THRESHOLD + 1,
      select: { status: true },
    });

    if (!shouldAlertForFailureStreak(runs.map((run) => run.status))) return;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'sync.failure_threshold_reached',
        source,
        consecutiveFailures: SYNC_FAILURE_ALERT_THRESHOLD,
        error,
        occurredAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (notificationError) {
    console.warn(
      `[sync-run] Could not send failure alert for ${source}:`,
      notificationError instanceof Error ? notificationError.message : String(notificationError)
    );
  }
}
