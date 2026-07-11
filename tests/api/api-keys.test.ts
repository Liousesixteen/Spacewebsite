import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  generateApiKey,
  hashKey,
  isValidKeyFormat,
  getPlanPermissions,
  canPerform,
} from '../../lib/api/api-keys';

describe('generateApiKey', () => {
  it('generates a key with the correct prefix', () => {
    const { rawKey, hash, prefix } = generateApiKey();
    assert.ok(rawKey.startsWith('sd_'));
    assert.ok(rawKey.length >= 40);
    assert.equal(prefix, rawKey.slice(0, 10));
    assert.notEqual(hash, rawKey);
  });

  it('generates unique keys each time', () => {
    const a = generateApiKey();
    const b = generateApiKey();
    assert.notEqual(a.rawKey, b.rawKey);
    assert.notEqual(a.hash, b.hash);
  });
});

describe('hashKey', () => {
  it('produces consistent hashes', () => {
    const key = 'sd_test_key_12345';
    assert.equal(hashKey(key), hashKey(key));
  });

  it('produces a 64-char hex string (SHA-256)', () => {
    const hash = hashKey('test');
    assert.equal(hash.length, 64);
    assert.ok(/^[a-f0-9]+$/.test(hash));
  });
});

describe('isValidKeyFormat', () => {
  it('accepts valid keys', () => {
    const { rawKey } = generateApiKey();
    assert.equal(isValidKeyFormat(rawKey), true);
  });

  it('rejects keys without prefix', () => {
    assert.equal(isValidKeyFormat('abc123'), false);
  });

  it('rejects null or empty keys', () => {
    assert.equal(isValidKeyFormat(null), false);
    assert.equal(isValidKeyFormat(undefined), false);
    assert.equal(isValidKeyFormat(''), false);
  });

  it('rejects short keys', () => {
    assert.equal(isValidKeyFormat('sd_short'), false);
  });
});

describe('getPlanPermissions', () => {
  it('free plan has limited capabilities', () => {
    const p = getPlanPermissions('free');
    assert.equal(p.canUseApi, false);
    assert.equal(p.canExport, false);
    assert.equal(p.maxAlerts, 3);
  });

  it('pro plan allows API and export', () => {
    const p = getPlanPermissions('pro');
    assert.equal(p.canUseApi, true);
    assert.equal(p.canExport, true);
  });

  it('enterprise has highest limits', () => {
    const p = getPlanPermissions('enterprise');
    assert.equal(p.rateLimitRpm, 1000);
    assert.equal(p.teamMembers, 100);
  });
});

describe('canPerform', () => {
  it('returns false for boolean capabilities the plan lacks', () => {
    const free = getPlanPermissions('free');
    assert.equal(canPerform(free, 'canExport'), false);
    assert.equal(canPerform(free, 'canUseApi'), false);
  });

  it('returns true for boolean capabilities the plan has', () => {
    const pro = getPlanPermissions('pro');
    assert.equal(canPerform(pro, 'canExport'), true);
  });
});
