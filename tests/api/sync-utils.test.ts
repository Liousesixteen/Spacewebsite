import assert from 'node:assert/strict';
import test from 'node:test';
import { LaunchStatus } from '@prisma/client';
import { mapCountryCode, mapLaunchStatus } from '../../scripts/sync/lib/utils';

test('mapCountryCode normalizes common LL2 country codes', () => {
  assert.equal(mapCountryCode('USA'), 'USA');
  assert.equal(mapCountryCode('CHN'), 'China');
  assert.equal(mapCountryCode('RUS'), 'Russia');
  assert.equal(mapCountryCode('FRA'), 'France');
  assert.equal(mapCountryCode('INT'), 'International');
});

test('mapCountryCode preserves unknown source codes as explicit values', () => {
  assert.equal(mapCountryCode('XYZ'), 'XYZ');
  assert.equal(mapCountryCode(null), 'Unknown');
  assert.equal(mapCountryCode(undefined), 'Unknown');
});

test('mapLaunchStatus maps LL2 operational statuses into local launch statuses', () => {
  assert.equal(mapLaunchStatus('Go for Launch'), LaunchStatus.PLANNED);
  assert.equal(mapLaunchStatus('To Be Confirmed'), LaunchStatus.PLANNED);
  assert.equal(mapLaunchStatus('In Flight'), LaunchStatus.IN_FLIGHT);
  assert.equal(mapLaunchStatus('Launch Successful'), LaunchStatus.SUCCESS);
  assert.equal(mapLaunchStatus('Partial Failure'), LaunchStatus.FAILURE);
  assert.equal(mapLaunchStatus('Hold'), LaunchStatus.POSTPONED);
});
