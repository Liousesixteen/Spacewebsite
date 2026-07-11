import assert from 'node:assert/strict';
import test from 'node:test';
import { mapLimit, memoizeAsync } from '../../scripts/sync/lib/cache';

test('memoizeAsync reuses resolved values for repeated keys', async () => {
  let calls = 0;
  const resolve = memoizeAsync(async (key: string) => {
    calls++;
    return `value:${key}`;
  });

  assert.equal(await resolve('falcon-9'), 'value:falcon-9');
  assert.equal(await resolve('falcon-9'), 'value:falcon-9');
  assert.equal(await resolve('soyuz'), 'value:soyuz');

  assert.equal(calls, 2);
});

test('memoizeAsync does not cache rejected resolutions', async () => {
  let calls = 0;
  const resolve = memoizeAsync(async (key: string) => {
    calls++;
    if (calls === 1) throw new Error(`miss:${key}`);
    return `value:${key}`;
  });

  await assert.rejects(() => resolve('pad-1'), /miss:pad-1/);
  assert.equal(await resolve('pad-1'), 'value:pad-1');
  assert.equal(calls, 2);
});

test('mapLimit runs work with a fixed concurrency ceiling', async () => {
  let active = 0;
  let peak = 0;

  const results = await mapLimit([1, 2, 3, 4, 5], 2, async (value) => {
    active++;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, 5));
    active--;
    return value * 10;
  });

  assert.deepEqual(results, [10, 20, 30, 40, 50]);
  assert.equal(peak, 2);
});
