import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isCronAuthorized } from '@/lib/api/cron-auth';
import { syncAgencies } from '@/scripts/sync/sync-agencies';
import { syncAstronauts } from '@/scripts/sync/sync-astronauts';
import { syncLaunches } from '@/scripts/sync/sync-launches';
import { syncLaunchSites } from '@/scripts/sync/sync-launch-sites';
import { syncRockets } from '@/scripts/sync/sync-rockets';
import { syncSpacecraft } from '@/scripts/sync/sync-spacecraft';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

const JOBS = {
  launches: { source: 'Launch Library 2: Launches', run: syncLaunches },
  agencies: { source: 'Launch Library 2: Agencies', run: syncAgencies },
  rockets: { source: 'Launch Library 2: Rockets', run: syncRockets },
  'launch-sites': { source: 'Launch Library 2: Launch Sites', run: syncLaunchSites },
  astronauts: { source: 'Launch Library 2: Astronauts', run: syncAstronauts },
  spacecraft: { source: 'Launch Library 2: Spacecraft', run: syncSpacecraft },
} as const;

type SyncJob = keyof typeof JOBS;

function parseJob(value: string | null): SyncJob | null {
  if (value && value in JOBS) return value as SyncJob;
  return null;
}

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request.headers.get('authorization'), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobName = parseJob(request.nextUrl.searchParams.get('job'));
  if (!jobName) {
    return NextResponse.json(
      { error: 'Invalid job', jobs: Object.keys(JOBS) },
      { status: 400 }
    );
  }

  const job = JOBS[jobName];
  const startedAfter = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const activeRun = await prisma.syncRun.findFirst({
    where: {
      source: job.source,
      status: { in: ['PENDING', 'RUNNING', 'FETCHING', 'ENRICHING'] },
      startedAt: { gte: startedAfter },
    },
    select: { id: true, startedAt: true, status: true },
  }).catch(() => null);

  if (activeRun) {
    return NextResponse.json(
      { error: 'Sync already running', job: jobName, activeRun },
      { status: 409 }
    );
  }

  try {
    const result = await job.run();
    return NextResponse.json({ job: jobName, status: 'completed', result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ job: jobName, status: 'failed', error: message }, { status: 500 });
  }
}
