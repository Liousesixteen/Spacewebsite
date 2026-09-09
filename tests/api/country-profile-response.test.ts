import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCountryProfileResponse,
  type CountryProfileLoader,
} from '../../lib/api/country-profile-response';
import type { CountryProfile } from '../../lib/api/country-profile';

const generatedAt = new Date('2026-07-09T08:00:00.000Z');
const profile = {
  country: { slug: 'usa', name: 'United States' },
  industry: { countrySlug: 'usa', companyCount: 1 },
  valueChainLanes: [],
} as unknown as CountryProfile;

test('country profile response returns data with shared-cache headers', async () => {
  const loadProfile: CountryProfileLoader = async () => profile;
  const response = await buildCountryProfileResponse(
    'usa',
    loadProfile,
    generatedAt
  );

  assert.equal(response.status, 200);
  assert.equal(
    response.headers['Cache-Control'],
    'public, s-maxage=3600, stale-while-revalidate=86400'
  );
  assert.deepEqual(response.body, {
    generatedAt: '2026-07-09T08:00:00.000Z',
    slug: 'usa',
    sourceStatus: 'ok',
    data: profile,
  });
});

test('country profile response returns a non-cacheable 404 when absent', async () => {
  const loadProfile: CountryProfileLoader = async () => null;
  const response = await buildCountryProfileResponse(
    'moon',
    loadProfile,
    generatedAt
  );

  assert.equal(response.status, 404);
  assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.deepEqual(response.body, {
    generatedAt: '2026-07-09T08:00:00.000Z',
    slug: 'moon',
    sourceStatus: 'not_found',
    data: null,
    message: 'Country profile not found.',
  });
});

test('country profile response returns a non-cacheable 503 on source failure', async () => {
  const loadProfile: CountryProfileLoader = async () => {
    throw new Error('database unavailable');
  };
  const response = await buildCountryProfileResponse(
    'usa',
    loadProfile,
    generatedAt
  );

  assert.equal(response.status, 503);
  assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.deepEqual(response.body, {
    generatedAt: '2026-07-09T08:00:00.000Z',
    slug: 'usa',
    sourceStatus: 'unavailable',
    data: null,
    message: 'Country profile data is temporarily unavailable.',
  });
});
