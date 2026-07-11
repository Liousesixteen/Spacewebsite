import assert from 'node:assert/strict';
import test from 'node:test';
import { matchLaunchIndustry } from '../../lib/api/launch-industry';

const companies = [
  {
    id: 'spacex',
    name: 'SpaceX, Inc.',
    country: 'United States',
    aliases: ['Space Exploration Technologies'],
    segments: [
      {
        segment: {
          id: 'launch-services',
          name: 'Launch services',
          level: 'MIDSTREAM' as const,
        },
      },
    ],
  },
  {
    id: 'space-apps',
    name: 'Space Applications Ltd.',
    country: 'United Kingdom',
    segments: [],
  },
];

test('matchLaunchIndustry matches normalized full names and aliases', () => {
  const direct = matchLaunchIndustry(
    { agencyName: 'SpaceX', agencyAbbrev: 'SPX' },
    companies
  );
  const alias = matchLaunchIndustry(
    { agencyName: 'Space Exploration Technologies' },
    companies
  );

  assert.deepEqual(direct.companies.map((company) => company.id), ['spacex']);
  assert.deepEqual(alias.companies.map((company) => company.id), ['spacex']);
  assert.deepEqual(direct.segments.map((segment) => segment.id), [
    'launch-services',
  ]);
});

test('matchLaunchIndustry does not use partial names or country inference', () => {
  const result = matchLaunchIndustry(
    {
      agencyName: 'Space',
      agencyAbbrev: 'SPACE',
      country: 'United States',
    },
    companies
  );

  assert.deepEqual(result.companies, []);
  assert.deepEqual(result.segments, []);
});
