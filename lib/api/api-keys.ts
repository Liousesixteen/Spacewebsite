/**
 * API Key management — pure logic.
 *
 * Key format: sd_<random_32_chars>
 * Stored as SHA-256 hash; only the prefix (first 8 chars) is visible after creation.
 */

import { createHash, randomBytes } from 'node:crypto';

const KEY_PREFIX = 'sd_';
const KEY_LENGTH = 40; // including prefix

/**
 * Generate a new API key.
 * Returns the raw key (to show the user once) and the hash (to store).
 */
export function generateApiKey(): { rawKey: string; hash: string; prefix: string } {
  const random = randomBytes(32).toString('base64url');
  const rawKey = `${KEY_PREFIX}${random}`;
  const hash = hashKey(rawKey);
  const prefix = rawKey.slice(0, 10); // "sd_" + 7 chars

  return { rawKey, hash, prefix };
}

/**
 * Hash an API key for storage.
 */
export function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Validate the format of an API key.
 */
export function isValidKeyFormat(key: string | null | undefined): boolean {
  if (!key) return false;
  return key.startsWith(KEY_PREFIX) && key.length >= KEY_LENGTH;
}

/**
 * Permission sets for each plan tier.
 */
export type PlanTier = 'free' | 'pro' | 'team' | 'enterprise';

export interface PlanPermissions {
  tier: PlanTier;
  rateLimitRpm: number;
  monthlyQuota: number;
  canExport: boolean;
  canAccessHistory: boolean;
  canUseApi: boolean;
  maxAlerts: number;
  maxWatchlist: number;
  teamMembers: number;
}

const PLAN_PERMISSIONS: Record<PlanTier, PlanPermissions> = {
  free: {
    tier: 'free',
    rateLimitRpm: 30,
    monthlyQuota: 1000,
    canExport: false,
    canAccessHistory: false,
    canUseApi: false,
    maxAlerts: 3,
    maxWatchlist: 10,
    teamMembers: 1,
  },
  pro: {
    tier: 'pro',
    rateLimitRpm: 120,
    monthlyQuota: 10000,
    canExport: true,
    canAccessHistory: true,
    canUseApi: true,
    maxAlerts: 20,
    maxWatchlist: 100,
    teamMembers: 1,
  },
  team: {
    tier: 'team',
    rateLimitRpm: 300,
    monthlyQuota: 50000,
    canExport: true,
    canAccessHistory: true,
    canUseApi: true,
    maxAlerts: 100,
    maxWatchlist: 500,
    teamMembers: 10,
  },
  enterprise: {
    tier: 'enterprise',
    rateLimitRpm: 1000,
    monthlyQuota: 500000,
    canExport: true,
    canAccessHistory: true,
    canUseApi: true,
    maxAlerts: 500,
    maxWatchlist: 5000,
    teamMembers: 100,
  },
};

/**
 * Get permissions for a given plan tier.
 */
export function getPlanPermissions(tier: PlanTier): PlanPermissions {
  return PLAN_PERMISSIONS[tier];
}

/**
 * Check if a plan has a specific capability.
 */
export function canPerform(
  permissions: PlanPermissions,
  action: keyof PlanPermissions
): boolean {
  const value = permissions[action];
  if (typeof value === 'boolean') return value;
  return true; // numeric limits are not boolean checks
}
