import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildIndustryCoverage,
  type IndustryCoverageSegment,
} from '../../lib/api/industry-coverage';

const segments: IndustryCoverageSegment[] = [
  {
    id: 'materials',
    name: 'Space materials',
    level: 'UPSTREAM',
    category: 'Materials',
    description: 'Materials and components',
    companies: [
      {
        id: 'link-1',
        company: {
          id: 'company-cn',
          name: 'China Materials',
          country: 'China',
          type: 'PRIVATE',
        },
      },
    ],
  },
  {
    id: 'launch-services',
    name: 'Launch services',
    level: 'MIDSTREAM',
    category: 'Launch',
    description: 'Launch manufacturing and operations',
    companies: [
      {
        id: 'link-2',
        company: {
          id: 'company-us',
          name: 'US Launch',
          country: 'United States',
          type: 'PRIVATE',
        },
      },
    ],
  },
  {
    id: 'satellite-applications',
    name: 'Satellite applications',
    level: 'DOWNSTREAM',
    category: 'Applications',
    description: 'Communication and observation services',
    companies: [],
  },
];

test('buildIndustryCoverage summarizes all three value-chain levels', () => {
  const result = buildIndustryCoverage(segments);

  assert.equal(result.summary.totalSegments, 3);
  assert.equal(result.summary.totalCompanies, 2);
  assert.deepEqual(
    result.levels.map((level) => [level.level, level.companyCount]),
    [
      ['UPSTREAM', 1],
      ['MIDSTREAM', 1],
      ['DOWNSTREAM', 0],
    ]
  );
  assert.deepEqual(result.countries, [
    { country: 'China', count: 1 },
    { country: 'United States', count: 1 },
  ]);
});

test('buildIndustryCoverage filters companies without removing chain levels', () => {
  const result = buildIndustryCoverage(segments, { country: 'China' });

  assert.equal(result.summary.totalCompanies, 1);
  assert.deepEqual(
    result.levels.map((level) => [level.level, level.companyCount]),
    [
      ['UPSTREAM', 1],
      ['MIDSTREAM', 0],
      ['DOWNSTREAM', 0],
    ]
  );
  assert.equal(result.levels[1].segments[0].companies.length, 0);
});

test('buildIndustryCoverage returns stable empty lanes', () => {
  const result = buildIndustryCoverage([]);

  assert.deepEqual(
    result.levels.map((level) => [level.level, level.segmentCount]),
    [
      ['UPSTREAM', 0],
      ['MIDSTREAM', 0],
      ['DOWNSTREAM', 0],
    ]
  );
  assert.deepEqual(result.countries, []);
});
