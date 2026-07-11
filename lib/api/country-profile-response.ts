import type { CountryProfile } from './country-profile';

export type CountryProfileLoader = (
  slug: string
) => Promise<CountryProfile | null>;

interface CountryProfileResponse {
  status: 200 | 404 | 503;
  headers: Record<string, string>;
  body: {
    generatedAt: string;
    slug: string;
    sourceStatus: 'ok' | 'not_found' | 'unavailable';
    data: CountryProfile | null;
    message?: string;
  };
}

export async function buildCountryProfileResponse(
  slug: string,
  loadProfile: CountryProfileLoader,
  generatedAt: Date = new Date()
): Promise<CountryProfileResponse> {
  const generatedAtIso = generatedAt.toISOString();

  try {
    const profile = await loadProfile(slug);

    if (!profile) {
      return {
        status: 404,
        headers: { 'Cache-Control': 'no-store' },
        body: {
          generatedAt: generatedAtIso,
          slug,
          sourceStatus: 'not_found',
          data: null,
          message: 'Country profile not found.',
        },
      };
    }

    return {
      status: 200,
      headers: {
        'Cache-Control':
          'public, s-maxage=3600, stale-while-revalidate=86400',
      },
      body: {
        generatedAt: generatedAtIso,
        slug,
        sourceStatus: 'ok',
        data: profile,
      },
    };
  } catch {
    return {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
      body: {
        generatedAt: generatedAtIso,
        slug,
        sourceStatus: 'unavailable',
        data: null,
        message: 'Country profile data is temporarily unavailable.',
      },
    };
  }
}
