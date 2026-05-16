import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getAdminOrNull } from '@/lib/auth/admin';
import { prisma } from '@/lib/db';

const TYPES = ['STATE_OWNED', 'PRIVATE', 'PUBLIC', 'STARTUP'] as const;

function buildCreate(b: Record<string, unknown>): Prisma.CompanyCreateInput | string {
  if (typeof b.name !== 'string' || !b.name.trim()) return '名称必填';
  if (typeof b.country !== 'string' || !b.country.trim()) return '国家必填';
  if (typeof b.type !== 'string' || !TYPES.includes(b.type as any)) return '类型无效';
  const foundedYear = Number(b.foundedYear);
  if (!Number.isFinite(foundedYear)) return '成立年份无效';
  if (typeof b.headquarters !== 'string' || !b.headquarters.trim()) return '总部必填';

  return {
    name: b.name.trim(),
    country: b.country.trim(),
    type: b.type as any,
    foundedYear,
    headquarters: b.headquarters.trim(),
    employees: b.employees == null || b.employees === '' ? null : Number(b.employees),
    revenue: b.revenue == null || b.revenue === '' ? null : Number(b.revenue),
    products: Array.isArray(b.products) ? (b.products as string[]).filter((s) => typeof s === 'string') : [],
    achievements: Array.isArray(b.achievements)
      ? (b.achievements as string[]).filter((s) => typeof s === 'string')
      : [],
    website: typeof b.website === 'string' && b.website.trim() ? b.website.trim() : null,
    stockCode: typeof b.stockCode === 'string' && b.stockCode.trim() ? b.stockCode.trim() : null,
    description: typeof b.description === 'string' ? b.description.trim() : '',
    logo: typeof b.logo === 'string' && b.logo.trim() ? b.logo.trim() : null,
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
    const company = await prisma.company.create({ data });
    return NextResponse.json({ company }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '创建失败' },
      { status: 400 }
    );
  }
}
