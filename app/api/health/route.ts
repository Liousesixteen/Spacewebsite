import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface HealthComponent {
  name: string;
  status: 'up' | 'down' | 'degraded';
  latencyMs: number;
  error?: string;
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'unavailable';
  version: string;
  uptime: number;
  timestamp: string;
  components: HealthComponent[];
}

const startTime = Date.now();

/**
 * GET /api/health — comprehensive health check for monitoring.
 *
 * Used by uptime monitors, load balancers, and the public status page.
 * Returns 200 when healthy, 503 when all components are down.
 */
export async function GET() {
  const components: HealthComponent[] = [];

  // Check database
  const dbStart = Date.now();
  let dbStatus: 'up' | 'down' = 'down';
  let dbError: string | undefined;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'up';
  } catch (error) {
    dbError = error instanceof Error ? error.message.slice(0, 100) : 'Database unreachable';
  }
  components.push({
    name: 'database',
    status: dbStatus,
    latencyMs: Date.now() - dbStart,
    error: dbError,
  });

  // Aggregate status
  const allDown = components.every((c) => c.status === 'down');
  const anyDown = components.some((c) => c.status === 'down');

  const response: HealthResponse = {
    status: allDown ? 'unavailable' : anyDown ? 'degraded' : 'ok',
    version: '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    components,
  };

  return NextResponse.json(response, {
    status: allDown ? 503 : 200,
    headers: {
      'Cache-Control': 'no-store',
      'X-Uptime': String(response.uptime),
    },
  });
}
