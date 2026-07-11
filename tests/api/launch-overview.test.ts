import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildLaunchOverview,
  type LaunchOverviewInput,
} from '../../lib/api/launch-overview';

const now = new Date('2026-07-03T00:00:00.000Z');

function launch(
  overrides: Partial<LaunchOverviewInput> & Record<string, unknown>
): LaunchOverviewInput {
  return {
    id: overrides.id ?? 'launch-1',
    name: overrides.name ?? 'Demo Mission',
    date: overrides.date ?? '2026-07-04T00:00:00.000Z',
    status: overrides.status ?? 'PLANNED',
    missionDescription: overrides.missionDescription ?? 'Demo mission',
    rocket: overrides.rocket ?? {
      id: 'rocket-1',
      name: 'Demo Rocket',
      country: 'China',
    },
    launchSite: overrides.launchSite ?? {
      id: 'site-1',
      name: 'Jiuquan',
    },
    ...overrides,
  };
}

test('buildLaunchOverview highlights the next launch and upcoming windows', () => {
  const overview = buildLaunchOverview(
    [
      launch({
        id: 'far',
        name: 'Far Mission',
        date: '2026-07-25T00:00:00.000Z',
      }),
      launch({
        id: 'next',
        name: 'Next Mission',
        date: '2026-07-04T06:00:00.000Z',
      }),
      launch({
        id: 'week',
        name: 'Week Mission',
        date: '2026-07-09T00:00:00.000Z',
      }),
    ],
    now
  );

  assert.equal(overview.nextLaunch?.id, 'next');
  assert.deepEqual(
    overview.upcoming7Days.map((item) => item.id),
    ['next', 'week']
  );
  assert.deepEqual(
    overview.upcoming30Days.map((item) => item.id),
    ['next', 'week', 'far']
  );
});

test('buildLaunchOverview creates stable recent schedule buckets', () => {
  const overview = buildLaunchOverview(
    [
      launch({ id: 'now', date: '2026-07-03T00:00:00.000Z' }),
      launch({ id: 'plus-12-hours', date: '2026-07-03T12:00:00.000Z' }),
      launch({ id: 'plus-6-days', date: '2026-07-09T00:00:00.000Z' }),
      launch({ id: 'plus-20-days', date: '2026-07-23T00:00:00.000Z' }),
      launch({
        id: 'postponed',
        status: 'POSTPONED',
        rawStatus: 'To Be Determined',
        date: '2026-07-28T00:00:00.000Z',
      }),
      launch({ id: 'plus-45-days', date: '2026-08-17T00:00:00.000Z' }),
    ],
    now
  );

  assert.deepEqual(
    overview.next24Hours.map((item) => item.id),
    ['now', 'plus-12-hours']
  );
  assert.deepEqual(
    overview.upcoming7Days.map((item) => item.id),
    ['now', 'plus-12-hours', 'plus-6-days']
  );
  assert.deepEqual(
    overview.upcoming30Days.map((item) => item.id),
    ['now', 'plus-12-hours', 'plus-6-days', 'plus-20-days', 'postponed']
  );
  assert.deepEqual(
    overview.datePending.map((item) => item.id),
    ['postponed']
  );
  assert.equal(overview.nextLaunch?.id, 'now');
});

test('buildLaunchOverview finds the next planned launch beyond thirty days', () => {
  const overview = buildLaunchOverview(
    [
      launch({
        id: 'postponed-near',
        status: 'POSTPONED',
        date: '2026-07-05T00:00:00.000Z',
      }),
      launch({
        id: 'planned-far',
        date: '2026-08-17T00:00:00.000Z',
      }),
    ],
    now
  );

  assert.equal(overview.nextLaunch?.id, 'planned-far');
});

test('buildLaunchOverview separates in-flight, recent completed, and attention launches', () => {
  const overview = buildLaunchOverview(
    [
      launch({
        id: 'flying',
        status: 'IN_FLIGHT',
        date: '2026-07-03T00:05:00.000Z',
      }),
      launch({
        id: 'done',
        status: 'SUCCESS',
        date: '2026-07-01T00:00:00.000Z',
      }),
      launch({
        id: 'failed',
        status: 'FAILURE',
        date: '2026-07-02T00:00:00.000Z',
      }),
      launch({
        id: 'delayed',
        status: 'POSTPONED',
        date: '2026-07-08T00:00:00.000Z',
      }),
    ],
    now
  );

  assert.deepEqual(overview.inFlight.map((item) => item.id), ['flying']);
  assert.deepEqual(
    overview.recentCompleted.map((item) => item.id),
    ['failed', 'done']
  );
  assert.deepEqual(
    overview.attention.map((item) => item.id),
    ['failed', 'delayed']
  );
});

test('buildLaunchOverview counts visible launches by status and country', () => {
  const overview = buildLaunchOverview(
    [
      launch({ id: 'cn-1', status: 'PLANNED' }),
      launch({
        id: 'us-1',
        status: 'PLANNED',
        rocket: { id: 'r2', name: 'Falcon 9', country: 'United States' },
      }),
      launch({
        id: 'us-2',
        status: 'IN_FLIGHT',
        rocket: { id: 'r3', name: 'Atlas V', country: 'United States' },
      }),
    ],
    now
  );

  assert.deepEqual(overview.statusCounts, [
    { status: 'PLANNED', count: 2 },
    { status: 'IN_FLIGHT', count: 1 },
  ]);
  assert.deepEqual(overview.countryCounts, [
    { country: 'United States', count: 2 },
    { country: 'China', count: 1 },
  ]);
});

test('buildLaunchOverview counts providers, mission types, and source freshness', () => {
  const overview = buildLaunchOverview(
    [
      launch({
        id: 'spx-1',
        agency: { id: 'agency-1', name: 'SpaceX', country: 'USA' },
        missionType: 'Communications',
        source: 'Launch Library 2',
        lastSyncedAt: '2026-07-03T08:00:00.000Z',
      }),
      launch({
        id: 'spx-2',
        agency: { id: 'agency-1', name: 'SpaceX', country: 'USA' },
        missionType: 'Communications',
        source: 'Launch Library 2',
        lastSyncedAt: '2026-07-03T09:00:00.000Z',
      }),
      launch({
        id: 'casc-1',
        agency: { id: 'agency-2', name: 'CASC', country: 'China' },
        missionType: 'Earth Science',
        source: 'SpaceX API',
        lastSyncedAt: '2026-07-02T09:00:00.000Z',
      }),
    ],
    now
  );

  assert.deepEqual(overview.providerCounts, [
    { provider: 'SpaceX', count: 2 },
    { provider: 'CASC', count: 1 },
  ]);
  assert.deepEqual(overview.missionTypeCounts, [
    { missionType: 'Communications', count: 2 },
    { missionType: 'Earth Science', count: 1 },
  ]);
  assert.deepEqual(overview.freshness, {
    latestSyncedAt: '2026-07-03T09:00:00.000Z',
    status: 'fresh',
    ageHours: 0,
    sources: [
      {
        source: 'Launch Library 2',
        latestSyncedAt: '2026-07-03T09:00:00.000Z',
        count: 2,
      },
      {
        source: 'SpaceX API',
        latestSyncedAt: '2026-07-02T09:00:00.000Z',
        count: 1,
      },
    ],
  });
});

test('buildLaunchOverview marks launch data stale after six hours', () => {
  const overview = buildLaunchOverview(
    [
      launch({
        id: 'stale-launch',
        source: 'Launch Library 2',
        lastSyncedAt: '2026-07-02T16:00:00.000Z',
      }),
    ],
    now
  );

  assert.equal(overview.freshness.status, 'stale');
  assert.equal(overview.freshness.ageHours, 8);
});

test('buildLaunchOverview marks freshness unknown without sync timestamps', () => {
  const overview = buildLaunchOverview(
    [launch({ id: 'unknown-freshness', lastSyncedAt: null })],
    now
  );

  assert.equal(overview.freshness.status, 'unknown');
  assert.equal(overview.freshness.ageHours, null);
});
