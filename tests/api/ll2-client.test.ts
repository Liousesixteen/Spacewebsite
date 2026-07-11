import assert from 'node:assert/strict';
import test from 'node:test';
import { retryAsync } from '../../scripts/sync/lib/ll2-client';

test('retryAsync retries transient failures and returns the later result', async () => {
  let attempts = 0;

  const result = await retryAsync(
    async () => {
      attempts++;
      if (attempts < 3) throw new Error('fetch failed');
      return 'ok';
    },
    {
      attempts: 3,
      delayMs: 0,
      shouldRetry: () => true,
    }
  );

  assert.equal(result, 'ok');
  assert.equal(attempts, 3);
});

test('retryAsync stops immediately for non-retryable failures', async () => {
  let attempts = 0;

  await assert.rejects(
    retryAsync(
      async () => {
        attempts++;
        throw new Error('HTTP 429');
      },
      {
        attempts: 3,
        delayMs: 0,
        shouldRetry: () => false,
      }
    ),
    /HTTP 429/
  );

  assert.equal(attempts, 1);
});
