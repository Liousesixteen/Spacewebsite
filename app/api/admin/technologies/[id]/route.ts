import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getAdminOrNull } from '@/lib/auth/admin';
import { prisma } from '@/lib/db';

const MATURITY = ['RESEARCH', 'EXPERIMENTAL', 'APPLIED', 'MATURE'] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const data: Prisma.TechnologyUpdateInput = {};
  const b = body as Record<string, unknown>;

  if (typeof b.name === 'string' && b.name.trim()) data.name = b.name.trim();
  if (typeof b.category === 'string' && b.category.trim()) data.category = b.category.trim();
  if (typeof b.maturityLevel === 'string') {
    if (!MATURITY.includes(b.maturityLevel as any)) {
      return NextResponse.json({ error: '成熟度无效' }, { status: 400 });
    }
    data.maturityLevel = b.maturityLevel as any;
  }
  if (typeof b.description === 'string') data.description = b.description.trim();
  if (b.applications !== undefined)
    data.applications = Array.isArray(b.applications)
      ? (b.applications as string[]).filter((s) => typeof s === 'string')
      : [];
  if (b.keyPlayers !== undefined)
    data.keyPlayers = Array.isArray(b.keyPlayers)
      ? (b.keyPlayers as string[]).filter((s) => typeof s === 'string')
      : [];
  if (b.challenges !== undefined)
    data.challenges = Array.isArray(b.challenges)
      ? (b.challenges as string[]).filter((s) => typeof s === 'string')
      : [];
  if (b.breakthroughs !== undefined) {
    data.breakthroughs = (b.breakthroughs ?? []) as Prisma.InputJsonValue;
  }

  try {
    const technology = await prisma.technology.update({ where: { id }, data });
    return NextResponse.json({ technology });
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
    await prisma.technology.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '删除失败' },
      { status: 400 }
    );
  }
}
