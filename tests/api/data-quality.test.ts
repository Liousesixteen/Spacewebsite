import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  computeQualityScore,
  inferSourceTier,
} from '../../lib/api/data-quality';

const NOW = new Date('2026-07-11T12:00:00Z');

describe('computeQualityScore', () => {
  it('returns a perfect score for an ideal entity', () => {
    const result = computeQualityScore(
      {
        sourceTier: 'A',
        lastSyncedAt: new Date('2026-07-11T10:00:00Z'),
        coreFieldsTotal: 10,
        coreFieldsPopulated: 10,
        distinctSources: 3,
        maxSources: 3,
        hasEditorialReview: true,
        hasVerifiedRelationships: true,
      },
      NOW
    );

    assert.equal(result.total, 100);
    assert.equal(result.dimensions.length, 6);
  });

  it('returns a low score for a poorly sourced entity', () => {
    const result = computeQualityScore(
      {
        sourceTier: 'D',
        lastSyncedAt: null,
        coreFieldsTotal: 10,
        coreFieldsPopulated: 2,
        distinctSources: 1,
        maxSources: 3,
        hasEditorialReview: false,
        hasVerifiedRelationships: false,
      },
      NOW
    );

    // D source: 4, no freshness: 0, 2/10 fields: 4, 1 source: 5, no review: 0, no rels: 0
    assert.equal(result.total, 13);
  });

  it('returns zero for source authority when no tier', () => {
    const result = computeQualityScore(
      {
        sourceTier: null,
        lastSyncedAt: new Date('2026-07-11T10:00:00Z'),
        coreFieldsTotal: 10,
        coreFieldsPopulated: 10,
        distinctSources: 0,
        maxSources: 0,
        hasEditorialReview: false,
        hasVerifiedRelationships: false,
      },
      NOW
    );

    const sourceDim = result.dimensions.find((d) => d.label === '来源权威性');
    assert.equal(sourceDim?.score, 0);
  });

  it('scores freshness tiers correctly', () => {
    const within6h = computeQualityScore(
      { sourceTier: 'B', lastSyncedAt: new Date('2026-07-11T08:00:00Z'), coreFieldsTotal: 1, coreFieldsPopulated: 1, distinctSources: 1, maxSources: 1, hasEditorialReview: false, hasVerifiedRelationships: false },
      NOW
    );
    const within24h = computeQualityScore(
      { sourceTier: 'B', lastSyncedAt: new Date('2026-07-10T14:00:00Z'), coreFieldsTotal: 1, coreFieldsPopulated: 1, distinctSources: 1, maxSources: 1, hasEditorialReview: false, hasVerifiedRelationships: false },
      NOW
    );
    const stale = computeQualityScore(
      { sourceTier: 'B', lastSyncedAt: new Date('2026-07-01T12:00:00Z'), coreFieldsTotal: 1, coreFieldsPopulated: 1, distinctSources: 1, maxSources: 1, hasEditorialReview: false, hasVerifiedRelationships: false },
      NOW
    );

    const freshDim = within6h.dimensions.find((d) => d.label === '数据新鲜度');
    const midDim = within24h.dimensions.find((d) => d.label === '数据新鲜度');
    const staleDim = stale.dimensions.find((d) => d.label === '数据新鲜度');

    assert.equal(freshDim?.score, 20);
    assert.equal(midDim?.score, 15);
    assert.equal(staleDim?.score, 2);
  });

  it('each dimension has a label, score, maxScore, and detail', () => {
    const result = computeQualityScore(
      { sourceTier: 'B', lastSyncedAt: null, coreFieldsTotal: 5, coreFieldsPopulated: 3, distinctSources: 1, maxSources: 1, hasEditorialReview: true, hasVerifiedRelationships: false },
      NOW
    );

    for (const dim of result.dimensions) {
      assert.ok(dim.label.length > 0);
      assert.ok(dim.maxScore > 0);
      assert.ok(dim.score >= 0 && dim.score <= dim.maxScore);
      assert.ok(dim.detail.length > 0);
    }
  });
});

describe('inferSourceTier', () => {
  it('returns A for government agencies and launch providers', () => {
    assert.equal(inferSourceTier('NASA'), 'A');
    assert.equal(inferSourceTier('CNSA'), 'A');
    assert.equal(inferSourceTier('SpaceX'), 'A');
    assert.equal(inferSourceTier('ESA'), 'A');
  });

  it('returns B for professional databases', () => {
    assert.equal(inferSourceTier('Launch Library 2'), 'B');
    assert.equal(inferSourceTier('CelesTrak'), 'B');
  });

  it('returns C for media and research sources', () => {
    assert.equal(inferSourceTier('Wikipedia'), 'C');
    assert.equal(inferSourceTier('Space News'), 'C');
  });

  it('returns D for missing or unknown sources', () => {
    assert.equal(inferSourceTier(null), 'D');
    assert.equal(inferSourceTier(undefined), 'D');
    assert.equal(inferSourceTier('Unknown'), 'C');
  });
});
