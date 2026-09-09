import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  countConsecutiveFailures,
  shouldAlertForFailureStreak,
} from '../../lib/api/sync-monitor';

describe('sync failure monitoring', () => {
  it('counts only failed runs at the head of a run history', () => {
    assert.equal(countConsecutiveFailures(['FAILED', 'FAILED', 'SUCCEEDED', 'FAILED']), 2);
    assert.equal(countConsecutiveFailures(['SUCCEEDED', 'FAILED']), 0);
  });

  it('alerts when the failure streak reaches the threshold exactly', () => {
    assert.equal(shouldAlertForFailureStreak(['FAILED', 'FAILED', 'FAILED']), true);
    assert.equal(shouldAlertForFailureStreak(['FAILED', 'FAILED']), false);
    assert.equal(shouldAlertForFailureStreak(['FAILED', 'FAILED', 'FAILED', 'FAILED']), false);
  });
});
