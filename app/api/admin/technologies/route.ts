import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getAdminOrNull } from '@/lib/auth/admin';
import { prisma } from '@/lib/db';

const MATURITY = ['RESEARCH', 'EXPERIMENTAL', 'APPLIED', 'MATURE'] as const;

function buildCreate(b: Record<string, unknown>): Prisma.TechnologyCreateInput | string {
  if (typeof b.name !== 'string' || !b.name.trim()) return '名称必填';
  if (typeof b.category !== 'string' || !b.category.trim()) return '分类必填';
  if (typeof b.maturityLevel !== 'string' || !MATURITY.includes(b.maturityLevel as any))
    return '成熟度无效';

  return {
    name: b.name.trim(),
    category: b.category.trim(),
    maturityLevel: b.maturityLevel as any,
    description: typeof b.description === 'string' ? b.description.trim() : '',
    applications: Array.isArray(b.applications)
      ? (b.applications as string[]).filter((s) => typeof s === 'string')
      : [],
    keyPlayers: Array.isArray(b.keyPlayers)
      ? (b.keyPlayers as string[]).filter((s) => typeof s === 'string')
      : [],
    challenges: Array.isArray(b.challenges)
      ? (b.challenges as string[]).filter((s) => typeof s === 'string')
      : [],
    breakthroughs: (b.breakthroughs ?? []) as Prisma.InputJsonValue,
  };
}

export async function POST(request: Request) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const data = buildCreate(body);
  if (typeof data === 'string') return NextResponse.json({ error: data }, { status: 400 });

  try {
    const technology = await prisma.technology.create({ data });
    return NextResponse.json({ technology }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '创建失败' },
      { status: 400 }
    );
  }
}
