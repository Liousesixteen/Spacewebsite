import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getAdminOrNull } from '@/lib/auth/admin';
import { prisma } from '@/lib/db';

const STATUSES = ['ACTIVE', 'RETIRED', 'DECEASED'] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const data: Prisma.AstronautUpdateInput = {};
  const {
    name,
    nationality,
    agency,
    birthDate,
    status,
    spaceFlights,
    totalTimeInSpace,
    bio,
    photo,
    socialLinks,
  } = body as Record<string, unknown>;

  if (typeof name === 'string') {
    if (!name.trim()) return NextResponse.json({ error: '姓名不能为空' }, { status: 400 });
    data.name = name.trim();
  }
  if (typeof nationality === 'string' && nationality.trim()) data.nationality = nationality.trim();
  if (typeof agency === 'string' && agency.trim()) data.agency = agency.trim();
  if (typeof birthDate === 'string') {
    if (Number.isNaN(new Date(birthDate).getTime())) {
      return NextResponse.json({ error: '日期无效' }, { status: 400 });
    }
    data.birthDate = new Date(birthDate);
  }
  if (typeof status === 'string') {
    if (!STATUSES.includes(status as any)) {
      return NextResponse.json({ error: '状态值无效' }, { status: 400 });
    }
    data.status = status as any;
  }
  if (spaceFlights !== undefined) data.spaceFlights = Number(spaceFlights) || 0;
  if (totalTimeInSpace !== undefined) data.totalTimeInSpace = Number(totalTimeInSpace) || 0;
  if (typeof bio === 'string') data.bio = bio.trim();
  if (photo !== undefined) {
    data.photo = typeof photo === 'string' && photo.trim() ? photo.trim() : null;
  }
  if (socialLinks !== undefined) {
    data.socialLinks =
      socialLinks == null ? Prisma.JsonNull : (socialLinks as Prisma.InputJsonValue);
  }

  try {
    const astronaut = await prisma.astronaut.update({ where: { id }, data });
    return NextResponse.json({ astronaut });
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
    await prisma.astronaut.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '删除失败' },
      { status: 400 }
    );
  }
}
