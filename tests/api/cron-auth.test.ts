import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isCronAuthorized } from '../../lib/api/cron-auth';

describe('isCronAuthorized', () => {
  it('accepts the configured bearer token', () => {
    assert.equal(isCronAuthorized('Bearer secret-value', 'secret-value'), true);
  });

  it('rejects missing, malformed, and incorrect credentials', () => {
    assert.equal(isCronAuthorized(null, 'secret-value'), false);
    assert.equal(isCronAuthorized('Basic secret-value', 'secret-value'), false);
    assert.equal(isCronAuthorized('Bearer incorrect', 'secret-value'), false);
    assert.equal(isCronAuthorized('Bearer secret-value', undefined), false);
  });
});
