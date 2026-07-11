import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCountryIndustryStats,
  buildCountryValueChainMap,
  type CountryIndustryCompanyInput,
} from '../../lib/api/country-industry';

function company(
  overrides: Partial<CountryIndustryCompanyInput> & { id: string }
): CountryIndustryCompanyInput {
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

test('buildCountryIndustryStats matches single-country and multi-country company records', () => {
  const stats = buildCountryIndustryStats('usa', [
    company({ id: 'spacex', name: 'SpaceX', country: 'USA', revenue: 120 }),
    company({
      id: 'airbus',
      name: 'Airbus Defence and Space',
      country: 'FRA,USA,DEU',
      type: 'PUBLIC',
    }),
    company({ id: 'casc', name: 'CASC', country: 'CHN' }),
    company({ id: 'bad', name: 'Unknown Operator', country: '???' }),
  ]);

  assert.equal(stats.countrySlug, 'usa');
  assert.equal(stats.companyCount, 2);
  assert.deepEqual(
    stats.featuredCompanies.map((item) => item.id),
    ['spacex', 'airbus']
  );
});

test('buildCountryIndustryStats counts value-chain levels, company types, and top segments', () => {
  const stats = buildCountryIndustryStats('china', [
    company({
      id: 'casc',
      name: 'CASC',
      country: 'China',
      type: 'STATE_OWNED',
      revenue: 100,
      segments: [
        {
          segment: {
            id: 'launch',
            name: 'Launch Services',
            level: 'MIDSTREAM',
            category: 'Launch',
          },
        },
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
    company({
      id: 'galaxy',
      name: 'GalaxySpace',
      country: 'CHN',
      type: 'STARTUP',
      revenue: 30,
      segments: [
        {
          segment: {
            id: 'satellite',
            name: 'Satellite Manufacturing',
            level: 'MIDSTREAM',
            category: 'Manufacturing',
          },
        },
        {
          segment: {
            id: 'applications',
            name: 'Satellite Applications',
            level: 'DOWNSTREAM',
            category: 'Services',
          },
        },
      ],
    }),
  ]);

  assert.equal(stats.companyCount, 2);
  assert.equal(stats.totalRevenue, 130);
  assert.deepEqual(stats.levelCounts, [
    { label: 'MIDSTREAM', count: 2 },
    { label: 'DOWNSTREAM', count: 1 },
  ]);
  assert.deepEqual(stats.companyTypeCounts, [
    { label: 'STATE_OWNED', count: 1 },
    { label: 'STARTUP', count: 1 },
  ]);
  assert.deepEqual(stats.topSegments, [
    { id: 'satellite', label: 'Satellite Manufacturing', count: 2 },
    { id: 'launch', label: 'Launch Services', count: 1 },
    { id: 'applications', label: 'Satellite Applications', count: 1 },
  ]);
});

test('buildCountryValueChainMap creates ordered upstream-midstream-downstream lanes', () => {
  const lanes = buildCountryValueChainMap([
    company({
      id: 'materials-co',
      name: 'Materials Co',
      country: 'USA',
      segments: [
        {
          segment: {
            id: 'composites',
            name: 'Composite Materials',
            level: 'UPSTREAM',
            category: 'Materials',
          },
        },
      ],
    }),
    company({
      id: 'integrator',
      name: 'Orbital Integrator',
      country: 'USA',
      revenue: 200,
      segments: [
        {
          segment: {
            id: 'satellite',
            name: 'Satellite Manufacturing',
            level: 'MIDSTREAM',
            category: 'Manufacturing',
          },
        },
        {
          segment: {
            id: 'analytics',
            name: 'Earth Observation Analytics',
            level: 'DOWNSTREAM',
            category: 'Services',
          },
        },
      ],
    }),
  ]);

  assert.deepEqual(
    lanes.map((lane) => lane.level),
    ['UPSTREAM', 'MIDSTREAM', 'DOWNSTREAM']
  );
  assert.deepEqual(
    lanes.map((lane) => lane.companyCount),
    [1, 1, 1]
  );
  assert.deepEqual(lanes[1].segments, [
    { id: 'satellite', label: 'Satellite Manufacturing', count: 1 },
  ]);
  assert.deepEqual(
    lanes[2].companies.map((item) => item.id),
    ['integrator']
  );
});
