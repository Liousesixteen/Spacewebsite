import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCountryStats,
  normalizeCountryName,
  type CountryCapabilityLaunchInput,
} from '../../lib/api/country-stats';

const now = new Date('2026-07-07T00:00:00.000Z');

function launch(
  overrides: Partial<CountryCapabilityLaunchInput> & { id: string }
): CountryCapabilityLaunchInput {
  return {
    id: overrides.id,
    name: overrides.name ?? 'Demo Mission',
    date: overrides.date ?? '2026-07-08T00:00:00.000Z',
    status: overrides.status ?? 'PLANNED',
    missionType: overrides.missionType ?? 'Communications',
    agency: overrides.agency ?? {
      id: 'agency-1',
      name: 'Demo Agency',
      country: 'USA',
    },
    rocket: overrides.rocket ?? {
      id: 'rocket-1',
      name: 'Demo Rocket',
      country: 'USA',
    },
    launchSite: overrides.launchSite ?? {
      id: 'site-1',
      name: 'Demo Range',
      country: 'USA',
    },
    launchPad: overrides.launchPad ?? null,
  };
}

test('normalizeCountryName maps common source values into stable country slugs', () => {
  assert.deepEqual(normalizeCountryName('USA'), {
    slug: 'usa',
    label: 'USA',
  });
  assert.deepEqual(normalizeCountryName('United States'), {
    slug: 'usa',
    label: 'USA',
  });
  assert.deepEqual(normalizeCountryName('CHN'), {
    slug: 'china',
    label: 'China',
  });
  assert.deepEqual(normalizeCountryName('Unknown'), null);
});

test('buildCountryStats groups launches by inferred country capability', () => {
  const countries = buildCountryStats(
    [
      launch({
        id: 'spx-1',
        agency: { id: 'spacex', name: 'SpaceX', country: 'Unknown' },
        rocket: { id: 'falcon-9', name: 'Falcon 9', country: 'USA' },
      }),
      launch({
        id: 'spx-2',
        agency: { id: 'spacex', name: 'SpaceX', country: 'Unknown' },
        rocket: { id: 'starship', name: 'Starship', country: 'USA' },
        launchSite: { id: 'starbase', name: 'Starbase', country: 'USA' },
      }),
      launch({
        id: 'casc-1',
        agency: { id: 'casc', name: 'CASC', country: 'CHN' },
        rocket: { id: 'lm-2f', name: 'Long March 2F', country: 'CHN' },
        launchSite: { id: 'jslc', name: 'Jiuquan', country: 'CHN' },
      }),
    ],
    now
  );

  assert.equal(countries.length, 2);
  assert.equal(countries[0].slug, 'usa');
  assert.equal(countries[0].totalLaunches, 2);
  assert.equal(countries[0].agencyCount, 1);
  assert.equal(countries[0].rocketCount, 2);
  assert.equal(countries[0].launchSiteCount, 2);
  assert.deepEqual(countries[0].topAgencies, [
    { id: 'spacex', label: 'SpaceX', count: 2 },
  ]);
  assert.equal(countries[1].slug, 'china');
  assert.equal(countries[1].label, 'China');
});

test('buildCountryStats calculates success rate and timeline windows', () => {
  const countries = buildCountryStats(
    [
      launch({
        id: 'success',
        status: 'SUCCESS',
        date: '2026-07-01T00:00:00.000Z',
      }),
      launch({
        id: 'failure',
        status: 'FAILURE',
        date: '2026-07-03T00:00:00.000Z',
      }),
      launch({
        id: 'next',
        status: 'PLANNED',
        date: '2026-07-08T00:00:00.000Z',
      }),
      launch({
        id: 'later',
        status: 'POSTPONED',
        date: '2026-08-01T00:00:00.000Z',
      }),
    ],
    now
  );

  const usa = countries[0];
  assert.equal(usa.successRate, 50);
  assert.deepEqual(
    usa.recentLaunches.map((item) => item.id),
    ['failure', 'success']
  );
  assert.deepEqual(
    usa.upcomingLaunches.map((item) => item.id),
    ['next', 'later']
  );
});
