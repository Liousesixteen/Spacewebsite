import { NextRequest, NextResponse } from 'next/server';
import { getCountryProfile } from '@/lib/api/country-profile';
import { buildCountryProfileResponse } from '@/lib/api/country-profile-response';

const COUNTRY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const dynamic = 'force-dynamic';
export const revalidate = 60 * 60;

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug.trim().toLowerCase();

  if (!COUNTRY_SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        slug,
        sourceStatus: 'invalid_request',
        data: null,
        message: 'Invalid country slug.',
      },
      {
        status: 400,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }

  const response = await buildCountryProfileResponse(slug, getCountryProfile);

  return NextResponse.json(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
