import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  classifyHealth,
  computeOverallStatus,
  buildHealthSnapshot,
  type HealthDomainSample,
  type HealthDomain,
} from '../../lib/api/data-health';

const NOW = new Date('2026-07-11T12:00:00Z');
const FRESH = new Date('2026-07-11T10:00:00Z'); // 2 hours ago
const STALE_48H = new Date('2026-07-09T12:00:00Z'); // 48 hours ago
const STALE_7D = new Date('2026-07-04T12:00:00Z'); // 7 days ago

function sample(overrides: Partial<HealthDomainSample> = {}): HealthDomainSample {
  return {
    key: 'launches',
    count: 100,
    latestUpdatedAt: FRESH,
    latestSyncedAt: FRESH,
    source: 'Launch Library 2',
    expectedRefreshHours: 6,
    ...overrides,
  };
}

describe('classifyHealth', () => {
  it('marks a domain with an error as unavailable', () => {
    assert.equal(classifyHealth(sample({ error: 'connection refused' }), NOW), 'unavailable');
  });

  it('marks a domain with zero records as empty', () => {
    assert.equal(classifyHealth(sample({ count: 0 }), NOW), 'empty');
  });

  it('marks a domain as stale when last synced is older than expected refresh', () => {
    assert.equal(
      classifyHealth(sample({ latestSyncedAt: STALE_48H, latestUpdatedAt: STALE_48H }), NOW),
      'stale'
    );
  });

  it('uses latestUpdatedAt when latestSyncedAt is null', () => {
    assert.equal(
      classifyHealth(sample({ latestSyncedAt: null, latestUpdatedAt: STALE_7D }), NOW),
      'stale'
    );
  });

  it('marks a domain as stale when there is no timestamp at all', () => {
    assert.equal(
      classifyHealth(sample({ latestSyncedAt: null, latestUpdatedAt: null }), NOW),
      'stale'
    );
  });

  it('marks a domain as healthy when freshly synced', () => {
    assert.equal(classifyHealth(sample(), NOW), 'healthy');
  });
});

describe('computeOverallStatus', () => {
  function domain(status: string): HealthDomain {
    return {
      key: 'launches',
      status: status as HealthDomain['status'],
      count: status === 'empty' ? 0 : 100,
      latestUpdate: null,
      latestSync: null,
      source: 'test',
      expectedRefreshHours: 6,
      message: null,
    };
  }

  it('returns healthy when all non-empty domains are healthy', () => {
    assert.equal(
      computeOverallStatus([domain('healthy'), domain('healthy'), domain('empty')]),
      'healthy'
    );
  });

  it('returns degraded when at least one domain is stale', () => {
    assert.equal(
      computeOverallStatus([domain('healthy'), domain('stale')]),
      'degraded'
    );
  });

  it('returns degraded when at least one domain is unavailable', () => {
    assert.equal(
      computeOverallStatus([domain('healthy'), domain('unavailable')]),
      'degraded'
    );
  });

  it('returns unavailable when all non-empty domains are unavailable', () => {
    assert.equal(
      computeOverallStatus([domain('unavailable'), domain('unavailable'), domain('empty')]),
      'unavailable'
    );
  });

  it('returns unavailable when all domains are empty', () => {
    assert.equal(
      computeOverallStatus([domain('empty'), domain('empty')]),
      'unavailable'
    );
  });
});

describe('buildHealthSnapshot', () => {
  it('produces a snapshot with the correct structure', () => {
    const snapshot = buildHealthSnapshot(
      [
        sample({ key: 'launches', count: 200 }),
        sample({ key: 'agencies', count: 50, expectedRefreshHours: 24 }),
        sample({ key: 'rockets', count: 150 }),
        sample({ key: 'launchSites', count: 30, expectedRefreshHours: 168 }),
        sample({ key: 'astronauts', count: 600, expectedRefreshHours: 168 }),
        sample({ key: 'spacecraft', count: 0, expectedRefreshHours: 24 }),
      ],
      NOW
    );

    assert.equal(snapshot.domains.length, 6);
    assert.equal(snapshot.summary.totalDomains, 6);
    assert.equal(snapshot.summary.totalRecords, 1030);

    const emptyDomain = snapshot.domains.find((d) => d.key === 'spacecraft');
    assert.equal(emptyDomain?.status, 'empty');

    const healthyDomain = snapshot.domains.find((d) => d.key === 'launches');
    assert.equal(healthyDomain?.status, 'healthy');
  });

  it('marks stale domains correctly and returns degraded overall status', () => {
    const snapshot = buildHealthSnapshot(
      [
        sample({ key: 'launches', count: 100, latestSyncedAt: STALE_48H, latestUpdatedAt: STALE_48H }),
        sample({ key: 'agencies', count: 50 }),
      ],
      NOW
    );

    assert.equal(snapshot.status, 'degraded');
    assert.equal(snapshot.domains[0].status, 'stale');
    assert.equal(snapshot.domains[1].status, 'healthy');
  });

  it('produces safe output even with no samples', () => {
    const snapshot = buildHealthSnapshot([], NOW);

    assert.equal(snapshot.domains.length, 0);
    assert.equal(snapshot.summary.totalRecords, 0);
    assert.equal(snapshot.summary.healthyDomains, 0);
    assert.equal(snapshot.status, 'unavailable');
  });
});
