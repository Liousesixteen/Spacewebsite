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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const data: Prisma.SpacecraftUpdateInput = {};
  const b = body as Record<string, unknown>;

  if (typeof b.name === 'string' && b.name.trim()) data.name = b.name.trim();
  if (typeof b.type === 'string') {
    if (!TYPES.includes(b.type as any)) {
      return NextResponse.json({ error: '类型无效' }, { status: 400 });
    }
    data.type = b.type as any;
  }
  if (typeof b.operator === 'string' && b.operator.trim()) data.operator = b.operator.trim();
  if (typeof b.launchDate === 'string') {
    if (Number.isNaN(new Date(b.launchDate).getTime())) {
      return NextResponse.json({ error: '日期无效' }, { status: 400 });
    }
    data.launchDate = new Date(b.launchDate);
  }
  if (typeof b.status === 'string') {
    if (!STATUSES.includes(b.status as any)) {
      return NextResponse.json({ error: '状态无效' }, { status: 400 });
    }
    data.status = b.status as any;
  }
  if (typeof b.orbitType === 'string') data.orbitType = b.orbitType.trim();
  if (b.orbitAltitude !== undefined)
    data.orbitAltitude = b.orbitAltitude == null || b.orbitAltitude === '' ? null : Number(b.orbitAltitude);
  if (b.orbitInclination !== undefined)
    data.orbitInclination =
      b.orbitInclination == null || b.orbitInclination === '' ? null : Number(b.orbitInclination);
  if (b.orbitPeriod !== undefined)
    data.orbitPeriod = b.orbitPeriod == null || b.orbitPeriod === '' ? null : Number(b.orbitPeriod);
  if (b.mass !== undefined) data.mass = Number(b.mass) || 0;
  if (typeof b.dimensions === 'string') data.dimensions = b.dimensions.trim();
  if (typeof b.mission === 'string') data.mission = b.mission.trim();
  if (typeof b.description === 'string') data.description = b.description.trim();
  if (b.images !== undefined) {
    data.images = Array.isArray(b.images)
      ? (b.images as string[]).filter((s) => typeof s === 'string')
      : [];
  }

  try {
    const spacecraft = await prisma.spacecraft.update({ where: { id }, data });
    return NextResponse.json({ spacecraft });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '更新失败' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.spacecraft.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '删除失败' },
      { status: 400 }
    );
  }
}
