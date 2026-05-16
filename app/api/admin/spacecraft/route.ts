import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getAdminOrNull } from '@/lib/auth/admin';
import { prisma } from '@/lib/db';

const TYPES = [
  'SPACE_STATION',
  'SATELLITE',
  'PROBE',
  'CREWED_SPACECRAFT',
  'CARGO_SPACECRAFT',
] as const;
const STATUSES = ['OPERATIONAL', 'RETIRED', 'LOST'] as const;

function buildData(body: Record<string, unknown>): Prisma.SpacecraftCreateInput | string {
  const {
    name,
    type,
    operator,
    launchDate,
    status,
    orbitType,
    orbitAltitude,
    orbitInclination,
    orbitPeriod,
    mass,
    dimensions,
    mission,
    description,
    images,
  } = body;
  if (typeof name !== 'string' || !name.trim()) return '名称必填';
  if (typeof type !== 'string' || !TYPES.includes(type as any)) return '类型无效';
  if (typeof operator !== 'string' || !operator.trim()) return '运营方必填';
  if (typeof launchDate !== 'string' || Number.isNaN(new Date(launchDate).getTime()))
    return '发射日期无效';
  if (typeof status !== 'string' || !STATUSES.includes(status as any)) return '状态无效';

  return {
    name: name.trim(),
    type: type as any,
    operator: operator.trim(),
    launchDate: new Date(launchDate),
    status: status as any,
    orbitType: typeof orbitType === 'string' ? orbitType.trim() : '',
    orbitAltitude: orbitAltitude == null || orbitAltitude === '' ? null : Number(orbitAltitude),
    orbitInclination:
      orbitInclination == null || orbitInclination === '' ? null : Number(orbitInclination),
    orbitPeriod: orbitPeriod == null || orbitPeriod === '' ? null : Number(orbitPeriod),
    mass: Number(mass) || 0,
    dimensions: typeof dimensions === 'string' ? dimensions.trim() : '',
    mission: typeof mission === 'string' ? mission.trim() : '',
    description: typeof description === 'string' ? description.trim() : '',
    images: Array.isArray(images) ? (images as string[]).filter((s) => typeof s === 'string') : [],
  };
}

export async function POST(request: Request) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const data = buildData(body);
  if (typeof data === 'string') return NextResponse.json({ error: data }, { status: 400 });

  try {
    const spacecraft = await prisma.spacecraft.create({ data });
    return NextResponse.json({ spacecraft }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '创建失败' },
      { status: 400 }
    );
  }
}
