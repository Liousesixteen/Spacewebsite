import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatLaunchDateTime,
  formatLaunchWindow,
  isTentativeLaunchTime,
} from '../../lib/launch-time';

test('formatLaunchDateTime formats UTC and named time zones deterministically', () => {
  const date = '2026-07-10T01:30:00.000Z';

  assert.equal(formatLaunchDateTime(date, 'en', 'UTC'), '2026-07-10 01:30');
  assert.equal(
    formatLaunchDateTime(date, 'zh-CN', 'Asia/Shanghai'),
    '2026-07-10 09:30'
  );
});

test('formatLaunchWindow compacts same-day windows and expands cross-day windows', () => {
  assert.equal(
    formatLaunchWindow(
      '2026-07-10T01:30:00.000Z',
      '2026-07-10T03:00:00.000Z',
      'en',
      'UTC'
    ),
    '2026-07-10 01:30–03:00'
  );
  assert.equal(
    formatLaunchWindow(
      '2026-07-10T23:30:00.000Z',
      '2026-07-11T01:00:00.000Z',
      'en',
      'UTC'
    ),
    '2026-07-10 23:30–2026-07-11 01:00'
  );
});

test('formatLaunchWindow returns null without a meaningful end time', () => {
  assert.equal(
    formatLaunchWindow('2026-07-10T01:30:00.000Z', null, 'en', 'UTC'),
    null
  );
  assert.equal(
    formatLaunchWindow(
      '2026-07-10T01:30:00.000Z',
      '2026-07-10T01:30:00.000Z',
      'en',
      'UTC'
    ),
    null
  );
});

test('isTentativeLaunchTime recognizes explicit pending statuses', () => {
  assert.equal(isTentativeLaunchTime('To Be Determined'), true);
  assert.equal(isTentativeLaunchTime('TBC'), true);
  assert.equal(isTentativeLaunchTime('时间待确认'), true);
  assert.equal(isTentativeLaunchTime('Go for Launch'), false);
});
