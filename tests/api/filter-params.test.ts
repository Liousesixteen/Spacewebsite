import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAstronautWhere,
  buildLaunchWhere,
  buildSpacecraftWhere,
  parsePositiveInt,
} from '../../lib/api/filter-params';

test('parsePositiveInt falls back for missing, invalid, and non-positive values', () => {
  assert.equal(parsePositiveInt(null, 1), 1);
  assert.equal(parsePositiveInt('abc', 20), 20);
  assert.equal(parsePositiveInt('0', 20), 20);
  assert.equal(parsePositiveInt('-4', 20), 20);
  assert.equal(parsePositiveInt('12', 20), 12);
});

test('buildLaunchWhere supports visible launch filters', () => {
  const where = buildLaunchWhere(
    new URLSearchParams({
      status: 'SUCCESS',
      country: 'USA',
      year: '2024',
      rocketName: 'Falcon',
      launchSite: 'Kennedy',
    })
  );

  assert.deepEqual(where, {
    status: 'SUCCESS',
    date: {
      gte: new Date('2024-01-01T00:00:00.000Z'),
      lt: new Date('2025-01-01T00:00:00.000Z'),
    },
    rocket: {
      country: 'USA',
      name: { contains: 'Falcon', mode: 'insensitive' },
    },
    launchSite: {
      name: { contains: 'Kennedy', mode: 'insensitive' },
    },
  });
});

test('buildLaunchWhere supports mission center filters', () => {
  const where = buildLaunchWhere(
    new URLSearchParams({
      provider: 'SpaceX',
      missionType: 'Communications',
      orbit: 'Low Earth Orbit',
      launchPad: 'SLC-40',
      from: '2026-07-01',
      to: '2026-07-31',
    })
  );

  assert.deepEqual(where, {
    date: {
      gte: new Date('2026-07-01T00:00:00.000Z'),
      lte: new Date('2026-07-31T23:59:59.999Z'),
    },
    missionType: { contains: 'Communications', mode: 'insensitive' },
    AND: [
      {
        OR: [
          { agency: { name: { contains: 'SpaceX', mode: 'insensitive' } } },
          { rocket: { manufacturer: { contains: 'SpaceX', mode: 'insensitive' } } },
        ],
      },
      {
        OR: [
          { orbitName: { contains: 'Low Earth Orbit', mode: 'insensitive' } },
          { orbitAbbrev: { contains: 'Low Earth Orbit', mode: 'insensitive' } },
        ],
      },
    ],
    launchPad: {
      name: { contains: 'SLC-40', mode: 'insensitive' },
    },
  });
});

test('buildSpacecraftWhere supports name, operator, and orbit filters', () => {
  const where = buildSpacecraftWhere(
    new URLSearchParams({
      type: 'SATELLITE',
      status: 'OPERATIONAL',
      name: 'Hubble',
      operator: 'NASA',
      orbitType: 'LEO',
    })
  );

  assert.deepEqual(where, {
    type: 'SATELLITE',
    status: 'OPERATIONAL',
    name: { contains: 'Hubble', mode: 'insensitive' },
    operator: { contains: 'NASA', mode: 'insensitive' },
    orbitType: { contains: 'LEO', mode: 'insensitive' },
  });
});

test('buildAstronautWhere supports name and flight range filters', () => {
  const where = buildAstronautWhere(
    new URLSearchParams({
      nationality: 'China',
      agency: 'CNSA',
      status: 'ACTIVE',
      name: 'Yang',
      flightsMin: '1',
      flightsMax: '3',
    })
  );

  assert.deepEqual(where, {
    nationality: 'China',
    agency: 'CNSA',
    status: 'ACTIVE',
    name: { contains: 'Yang', mode: 'insensitive' },
    spaceFlights: { gte: 1, lte: 3 },
  });
});
