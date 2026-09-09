import { NextResponse } from 'next/server';
import { HEALTH_DOMAINS, loadDataHealthSnapshot } from '@/lib/api/data-health-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot = await loadDataHealthSnapshot();

    if (snapshot.status === 'unavailable') {
      return NextResponse.json(
        { ...snapshot, status: 'unavailable' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json(snapshot, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
      },
    });
  } catch (error) {
    console.error('[data-health] Complete failure:', error);
    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        status: 'unavailable',
        summary: { totalRecords: 0, healthyDomains: 0, totalDomains: HEALTH_DOMAINS.length },
        domains: [],
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
