import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildIdempotencyKey,
  buildLaunchNotificationSubject,
  isQuietHours,
  getNotificationWindow,
  shouldSuppressNotification,
  isDuplicate,
} from '../../lib/api/notifications';

describe('buildIdempotencyKey', () => {
  it('produces the same key for identical inputs', () => {
    const a = buildIdempotencyKey({
      userId: 'u1',
      eventType: 'launch_24h',
      targetType: 'Launch',
      targetId: 'l1',
    });
    const b = buildIdempotencyKey({
      userId: 'u1',
      eventType: 'launch_24h',
      targetType: 'Launch',
      targetId: 'l1',
    });
    assert.equal(a, b);
  });

  it('produces different keys for different events', () => {
    const a = buildIdempotencyKey({
      userId: 'u1',
      eventType: 'launch_24h',
      targetType: 'Launch',
      targetId: 'l1',
    });
    const b = buildIdempotencyKey({
      userId: 'u1',
      eventType: 'launch_1h',
      targetType: 'Launch',
      targetId: 'l1',
    });
    assert.notEqual(a, b);
  });
});

describe('buildLaunchNotificationSubject', () => {
  it('returns correct subject for each event type', () => {
    assert.ok(buildLaunchNotificationSubject('launch_24h', 'CZ-5').includes('24 小时'));
    assert.ok(buildLaunchNotificationSubject('launch_live', 'CZ-5').includes('直播'));
    assert.ok(buildLaunchNotificationSubject('launch_postponed', 'CZ-5').includes('推迟'));
    assert.ok(buildLaunchNotificationSubject('launch_cancelled', 'CZ-5').includes('取消'));
    assert.ok(buildLaunchNotificationSubject('launch_result', 'CZ-5').includes('结果'));
  });
});

describe('isQuietHours', () => {
  it('returns false when no quiet hours are set', () => {
    assert.equal(isQuietHours(new Date(), null, null), false);
  });

  it('returns true during quiet hours', () => {
    // 14:00 UTC = 840 minutes
    const now = new Date('2026-07-11T14:00:00Z');
    assert.equal(isQuietHours(now, '13:00', '15:00'), true);
  });

  it('returns false outside quiet hours', () => {
    const now = new Date('2026-07-11T16:00:00Z');
    assert.equal(isQuietHours(now, '13:00', '15:00'), false);
  });

  it('handles overnight quiet hours (22:00-06:00)', () => {
    const night = new Date('2026-07-11T23:00:00Z');
    const morning = new Date('2026-07-11T03:00:00Z');
    const afternoon = new Date('2026-07-11T14:00:00Z');
    assert.equal(isQuietHours(night, '22:00', '06:00'), true);
    assert.equal(isQuietHours(morning, '22:00', '06:00'), true);
    assert.equal(isQuietHours(afternoon, '22:00', '06:00'), false);
  });
});

describe('getNotificationWindow', () => {
  it('returns correct minutes for timed events', () => {
    assert.equal(getNotificationWindow('launch_24h'), 24 * 60);
    assert.equal(getNotificationWindow('launch_1h'), 60);
    assert.equal(getNotificationWindow('launch_10m'), 10);
  });

  it('returns null for non-timed events', () => {
    assert.equal(getNotificationWindow('launch_live'), null);
    assert.equal(getNotificationWindow('launch_result'), null);
  });
});

describe('shouldSuppressNotification', () => {
  it('suppresses when rule is disabled', () => {
    assert.equal(
      shouldSuppressNotification(
        { enabled: false, minutesBefore: null, quietStart: null, quietEnd: null },
        new Date()
      ),
      true
    );
  });

  it('suppresses during quiet hours', () => {
    const now = new Date('2026-07-11T14:00:00Z');
    assert.equal(
      shouldSuppressNotification(
        { enabled: true, minutesBefore: null, quietStart: '13:00', quietEnd: '15:00' },
        now
      ),
      true
    );
  });

  it('does not suppress an active rule outside quiet hours', () => {
    const now = new Date('2026-07-11T16:00:00Z');
    assert.equal(
      shouldSuppressNotification(
        { enabled: true, minutesBefore: null, quietStart: '13:00', quietEnd: '15:00' },
        now
      ),
      false
    );
  });
});

describe('isDuplicate', () => {
  it('returns true when key is in recent set', () => {
    const keys = new Set(['k1', 'k2', 'k3']);
    assert.equal(isDuplicate('k2', keys), true);
  });

  it('returns false when key is not in set', () => {
    const keys = new Set(['k1', 'k2']);
    assert.equal(isDuplicate('k3', keys), false);
  });
});
