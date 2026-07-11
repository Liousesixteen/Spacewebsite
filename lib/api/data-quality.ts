/**
 * Data Quality Scoring — pure logic.
 *
 * Each entity receives a 0-100 score based on six weighted dimensions
 * (per execution plan §8.4):
 *
 *   Source authority:   25 points
 *   Freshness:          20 points
 *   Core field coverage: 20 points
 *   Multi-source consistency: 15 points
 *   Editorial review:   10 points
 *   Relationship verifiability: 10 points
 *
 * Every score must be explainable — the breakdown shows exactly what
 * contributes to each dimension.
 */

export type FactType = 'OBSERVED' | 'DERIVED' | 'ESTIMATED' | 'EDITORIAL' | 'USER_SUBMITTED';
export type SourceTier = 'A' | 'B' | 'C' | 'D';

export interface QualityInput {
  sourceTier: SourceTier | null;
  lastSyncedAt: Date | string | null;
  coreFieldsTotal: number;
  coreFieldsPopulated: number;
  distinctSources: number;
  maxSources: number;
  hasEditorialReview: boolean;
  hasVerifiedRelationships: boolean;
}

export interface QualityDimension {
  label: string;
  score: number;
  maxScore: number;
  detail: string;
}

export interface QualityScore {
  total: number;
  maxTotal: number;
  dimensions: QualityDimension[];
}

const SOURCE_TIER_SCORE: Record<SourceTier, number> = {
  A: 25,
  B: 18,
  C: 10,
  D: 4,
};

/**
 * Compute data quality score for an entity.
 */
export function computeQualityScore(input: QualityInput, now: Date = new Date()): QualityScore {
  const dimensions: QualityDimension[] = [
    computeSourceAuthority(input.sourceTier),
    computeFreshness(input.lastSyncedAt, now),
    computeCoreFieldCoverage(input.coreFieldsTotal, input.coreFieldsPopulated),
    computeMultiSourceConsistency(input.distinctSources, input.maxSources),
    computeEditorialReview(input.hasEditorialReview),
    computeRelationshipVerifiability(input.hasVerifiedRelationships),
  ];

  const total = dimensions.reduce((sum, d) => sum + d.score, 0);
  const maxTotal = dimensions.reduce((sum, d) => sum + d.maxScore, 0);

  return { total, maxTotal, dimensions };
}

function computeSourceAuthority(tier: SourceTier | null): QualityDimension {
  const maxScore = 25;
  if (!tier) {
    return {
      label: '来源权威性',
      score: 0,
      maxScore,
      detail: '未设定来源等级',
    };
  }
  const score = SOURCE_TIER_SCORE[tier];
  return {
    label: '来源权威性',
    score,
    maxScore,
    detail: `来源等级 ${tier}`,
  };
}

function computeFreshness(
  lastSyncedAt: Date | string | null,
  now: Date
): QualityDimension {
  const maxScore = 20;
  if (!lastSyncedAt) {
    return { label: '数据新鲜度', score: 0, maxScore, detail: '无同步时间戳' };
  }

  const date = typeof lastSyncedAt === 'string' ? new Date(lastSyncedAt) : lastSyncedAt;
  const hours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (hours <= 6) return { label: '数据新鲜度', score: 20, maxScore, detail: '6 小时内同步' };
  if (hours <= 24) return { label: '数据新鲜度', score: 15, maxScore, detail: '24 小时内同步' };
  if (hours <= 72) return { label: '数据新鲜度', score: 10, maxScore, detail: '72 小时内同步' };
  if (hours <= 168) return { label: '数据新鲜度', score: 5, maxScore, detail: '7 天内同步' };
  return { label: '数据新鲜度', score: 2, maxScore, detail: '超过 7 天未同步' };
}

function computeCoreFieldCoverage(
  total: number,
  populated: number
): QualityDimension {
  const maxScore = 20;
  if (total === 0) {
    return { label: '核心字段完整度', score: 0, maxScore, detail: '无字段定义' };
  }
  const ratio = populated / total;
  const score = Math.round(ratio * maxScore);
  return {
    label: '核心字段完整度',
    score,
    maxScore,
    detail: `${populated}/${total} 字段已填充`,
  };
}

function computeMultiSourceConsistency(
  distinctSources: number,
  maxSources: number
): QualityDimension {
  const maxScore = 15;
  if (distinctSources === 0) {
    return { label: '多源一致性', score: 0, maxScore, detail: '无来源记录' };
  }
  if (distinctSources >= 3) {
    return { label: '多源一致性', score: 15, maxScore, detail: `${distinctSources} 个独立来源交叉验证` };
  }
  const ratio = distinctSources / Math.max(maxSources, 3);
  const score = Math.round(ratio * maxScore);
  return {
    label: '多源一致性',
    score,
    maxScore,
    detail: `${distinctSources} 个来源`,
  };
}

function computeEditorialReview(hasReview: boolean): QualityDimension {
  const maxScore = 10;
  return hasReview
    ? { label: '编辑审核', score: 10, maxScore, detail: '已通过编辑审核' }
    : { label: '编辑审核', score: 0, maxScore, detail: '未经编辑审核' };
}

function computeRelationshipVerifiability(hasVerified: boolean): QualityDimension {
  const maxScore = 10;
  return hasVerified
    ? { label: '关系可验证性', score: 10, maxScore, detail: '有关联实体证据' }
    : { label: '关系可验证性', score: 0, maxScore, detail: '未关联可验证实体' };
}

/**
 * Compute effective source tier from a source name.
 */
export function inferSourceTier(source: string | null | undefined): SourceTier {
  if (!source) return 'D';

  const s = source.toLowerCase();

  // Tier A: Government agencies, launch providers, exchanges, regulatory
  if (
    s.includes('nasa') ||
    s.includes('esa') ||
    s.includes('jaxa') ||
    s.includes('cnsa') ||
    s.includes('roscosmos') ||
    s.includes('isro') ||
    s.includes('spacex') ||
    s.includes('ula') ||
    s.includes('arianespace')
  ) {
    return 'A';
  }

  // Tier B: Professional databases, verified commercial providers
  if (
    s.includes('launch library') ||
    s.includes('celestrak') ||
    s.includes('space-track') ||
    s.includes('satcat') ||
    s.includes('oecd') ||
    s.includes('euspa')
  ) {
    return 'B';
  }

  // Tier C: Media, press releases, research
  if (
    s.includes('wikipedia') ||
    s.includes('news') ||
    s.includes('press') ||
    s.includes('research')
  ) {
    return 'C';
  }

  return 'C';
}
