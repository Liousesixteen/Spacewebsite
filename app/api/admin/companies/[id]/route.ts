import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getAdminOrNull } from '@/lib/auth/admin';
import { prisma } from '@/lib/db';

const TYPES = ['STATE_OWNED', 'PRIVATE', 'PUBLIC', 'STARTUP'] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const data: Prisma.CompanyUpdateInput = {};
  const b = body as Record<string, unknown>;

  if (typeof b.name === 'string' && b.name.trim()) data.name = b.name.trim();
  if (typeof b.country === 'string' && b.country.trim()) data.country = b.country.trim();
  if (typeof b.type === 'string') {
    if (!TYPES.includes(b.type as any)) {
      return NextResponse.json({ error: '类型无效' }, { status: 400 });
    }
    data.type = b.type as any;
  }
  if (b.foundedYear !== undefined) {
    const y = Number(b.foundedYear);
    if (!Number.isFinite(y)) return NextResponse.json({ error: '年份无效' }, { status: 400 });
    data.foundedYear = y;
  }
  if (typeof b.headquarters === 'string' && b.headquarters.trim()) data.headquarters = b.headquarters.trim();
  if (b.employees !== undefined)
    data.employees = b.employees == null || b.employees === '' ? null : Number(b.employees);
  if (b.revenue !== undefined)
    data.revenue = b.revenue == null || b.revenue === '' ? null : Number(b.revenue);
  if (b.products !== undefined)
    data.products = Array.isArray(b.products) ? (b.products as string[]).filter((s) => typeof s === 'string') : [];
  if (b.achievements !== undefined)
    data.achievements = Array.isArray(b.achievements)
      ? (b.achievements as string[]).filter((s) => typeof s === 'string')
      : [];
  if (b.website !== undefined)
    data.website = typeof b.website === 'string' && b.website.trim() ? b.website.trim() : null;
  if (b.stockCode !== undefined)
    data.stockCode = typeof b.stockCode === 'string' && b.stockCode.trim() ? b.stockCode.trim() : null;
  if (typeof b.description === 'string') data.description = b.description.trim();
  if (b.logo !== undefined)
    data.logo = typeof b.logo === 'string' && b.logo.trim() ? b.logo.trim() : null;

  try {
    const company = await prisma.company.update({ where: { id }, data });
    return NextResponse.json({ company });
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
    await prisma.company.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '删除失败' },
      { status: 400 }
    );
  }
}
