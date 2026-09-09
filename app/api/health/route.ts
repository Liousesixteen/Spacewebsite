import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { assessSchemaHealth, REQUIRED_SCHEMA_TABLES } from '@/lib/api/schema-health';

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

  // Verify schema objects required by the currently deployed application.
  const schemaStart = Date.now();
  try {
    const rows = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (${REQUIRED_SCHEMA_TABLES[0]})
    `;
    const schema = assessSchemaHealth(rows.map((row) => row.table_name));
    components.push({
      name: 'database_schema',
      status: schema.status,
      latencyMs: Date.now() - schemaStart,
      error: schema.missingTables.length ? `Missing table: ${schema.missingTables.join(', ')}` : undefined,
    });
  } catch (error) {
    components.push({
      name: 'database_schema',
      status: 'down',
      latencyMs: Date.now() - schemaStart,
      error: error instanceof Error ? error.message.slice(0, 100) : 'Schema check failed',
    });
  }

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
