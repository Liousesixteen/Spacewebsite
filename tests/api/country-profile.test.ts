import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCountryProfile,
  type CountryProfileCompanyInput,
  type CountryProfileLaunchInput,
} from '../../lib/api/country-profile';

function launch(
  overrides: Partial<CountryProfileLaunchInput> & { id: string }
): CountryProfileLaunchInput {
  return {
    id: overrides.id,
    name: overrides.name ?? 'Demo Mission',
    date: overrides.date ?? '2026-07-09T00:00:00.000Z',
    status: overrides.status ?? 'PLANNED',
    missionType: overrides.missionType ?? 'Communications',
    agency: overrides.agency ?? { id: 'agency-1', name: 'Demo Agency', country: 'USA' },
    rocket: overrides.rocket ?? { id: 'rocket-1', name: 'Demo Rocket', country: 'USA' },
    launchSite: overrides.launchSite ?? { id: 'site-1', name: 'Demo Site', country: 'USA' },
    launchPad: overrides.launchPad ?? null,
  };
}

function company(
  overrides: Partial<CountryProfileCompanyInput> & { id: string }
): CountryProfileCompanyInput {
  return {
    id: overrides.id,
    name: overrides.name ?? 'Demo Space',
    country: overrides.country ?? 'USA',
    type: overrides.type ?? 'PRIVATE',
    revenue: overrides.revenue ?? null,
    employees: overrides.employees ?? null,
    products: overrides.products ?? [],
    achievements: overrides.achievements ?? [],
    segments:
      overrides.segments ??
      [
        {
          segment: {
            id: 'launch-services',
            name: 'Launch Services',
            level: 'MIDSTREAM',
            category: 'Launch',
          },
        },
      ],
  };
}

test('buildCountryProfile returns a combined country launch and industry profile', () => {
  const profile = buildCountryProfile(
    'usa',
    [
      launch({ id: 'usa-launch-1' }),
      launch({
        id: 'china-launch-1',
        agency: { id: 'casc', name: 'CASC', country: 'CHN' },
        rocket: { id: 'lm', name: 'Long March', country: 'CHN' },
        launchSite: { id: 'jslc', name: 'Jiuquan', country: 'CHN' },
      }),
    ],
    [
      company({ id: 'spacex', name: 'SpaceX', country: 'USA', revenue: 200 }),
      company({
        id: 'airbus',
        name: 'Airbus',
        country: 'FRA,USA,DEU',
        type: 'PUBLIC',
        segments: [
          {
            segment: {
              id: 'satellite',
              name: 'Satellite Manufacturing',
              level: 'MIDSTREAM',
              category: 'Manufacturing',
            },
          },
        ],
      }),
      company({ id: 'casc-company', name: 'CASC Industry', country: 'CHN' }),
    ],
    new Date('2026-07-08T00:00:00.000Z')
  );

  assert.ok(profile);
  assert.equal(profile.country.slug, 'usa');
  assert.equal(profile.country.totalLaunches, 1);
  assert.equal(profile.industry.companyCount, 2);
  assert.deepEqual(
    profile.valueChainLanes.map((lane) => lane.level),
    ['UPSTREAM', 'MIDSTREAM', 'DOWNSTREAM']
  );
});

test('buildCountryProfile returns null for countries without launch capability data', () => {
  const profile = buildCountryProfile(
    'india',
    [launch({ id: 'usa-launch-1' })],
    [company({ id: 'isro-vendor', country: 'India' })]
  );

  assert.equal(profile, null);
});
