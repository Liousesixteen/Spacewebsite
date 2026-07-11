import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAgencyStats,
  type AgencyLaunchInput,
} from '../../lib/api/agency-stats';

const now = new Date('2026-07-05T00:00:00.000Z');

function launch(
  overrides: Partial<AgencyLaunchInput> & { id: string }
): AgencyLaunchInput {
  return {
    id: overrides.id,
    name: overrides.name ?? 'Demo Mission',
    date: overrides.date ?? '2026-07-06T00:00:00.000Z',
    status: overrides.status ?? 'PLANNED',
    missionType: overrides.missionType ?? null,
    rocket: overrides.rocket ?? { id: 'rocket-1', name: 'Long March' },
    launchSite: overrides.launchSite ?? { id: 'site-1', name: 'Wenchang' },
    launchPad: overrides.launchPad ?? null,
  };
}

test('buildAgencyStats computes core launch and success metrics', () => {
  const stats = buildAgencyStats(
    [
      launch({ id: 'success-1', status: 'SUCCESS' }),
      launch({ id: 'success-2', status: 'SUCCESS' }),
      launch({ id: 'failure', status: 'FAILURE' }),
      launch({ id: 'planned', status: 'PLANNED' }),
      launch({ id: 'flying', status: 'IN_FLIGHT' }),
    ],
    now
  );

  assert.equal(stats.totalLaunches, 5);
  assert.equal(stats.successfulLaunches, 2);
  assert.equal(stats.failedLaunches, 1);
  assert.equal(stats.plannedLaunches, 1);
  assert.equal(stats.inFlightLaunches, 1);
  assert.equal(stats.successRate, 67);
});

test('buildAgencyStats groups mission types, rockets, and launch sites', () => {
  const stats = buildAgencyStats(
    [
      launch({
        id: 'comms-1',
        missionType: 'Communications',
        rocket: { id: 'falcon-9', name: 'Falcon 9' },
        launchSite: { id: 'ksc', name: 'Kennedy Space Center' },
      }),
      launch({
        id: 'comms-2',
        missionType: 'Communications',
        rocket: { id: 'falcon-9', name: 'Falcon 9' },
        launchSite: { id: 'ccsfs', name: 'Cape Canaveral' },
      }),
      launch({
        id: 'science',
        missionType: 'Earth Science',
        rocket: { id: 'electron', name: 'Electron' },
        launchSite: { id: 'mah', name: 'Mahia' },
        launchPad: { id: 'lc-1a', name: 'Launch Complex 1A' },
      }),
    ],
    now
  );

  assert.equal(stats.uniqueRocketCount, 2);
  assert.equal(stats.uniqueLaunchSiteCount, 3);
  assert.deepEqual(stats.missionTypeCounts, [
    { label: 'Communications', count: 2 },
    { label: 'Earth Science', count: 1 },
  ]);
  assert.deepEqual(stats.rocketCounts, [
    { id: 'falcon-9', label: 'Falcon 9', count: 2 },
    { id: 'electron', label: 'Electron', count: 1 },
  ]);
  assert.deepEqual(stats.siteCounts, [
    { id: 'ksc', label: 'Kennedy Space Center', count: 1 },
    { id: 'ccsfs', label: 'Cape Canaveral', count: 1 },
    { id: 'lc-1a', label: 'Launch Complex 1A', count: 1 },
  ]);
});

test('buildAgencyStats returns upcoming and recent launches in timeline order', () => {
  const stats = buildAgencyStats(
    [
      launch({
        id: 'old-success',
        status: 'SUCCESS',
        date: '2026-07-01T00:00:00.000Z',
      }),
      launch({
        id: 'new-success',
        status: 'SUCCESS',
        date: '2026-07-04T00:00:00.000Z',
      }),
      launch({
        id: 'next',
        status: 'PLANNED',
        date: '2026-07-06T00:00:00.000Z',
      }),
      launch({
        id: 'later',
        status: 'PLANNED',
        date: '2026-07-20T00:00:00.000Z',
      }),
    ],
    now
  );

  assert.deepEqual(
    stats.upcomingLaunches.map((item) => item.id),
    ['next', 'later']
  );
  assert.deepEqual(
    stats.recentLaunches.map((item) => item.id),
    ['new-success', 'old-success']
  );
});
