import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getAdminOrNull } from '@/lib/auth/admin';
import { prisma } from '@/lib/db';

const STATUSES = ['ACTIVE', 'RETIRED', 'DECEASED'] as const;

export async function POST(request: Request) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

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

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: '姓名必填' }, { status: 400 });
  }
  if (typeof nationality !== 'string' || !nationality.trim()) {
    return NextResponse.json({ error: '国籍必填' }, { status: 400 });
  }
  if (typeof agency !== 'string' || !agency.trim()) {
    return NextResponse.json({ error: '机构必填' }, { status: 400 });
  }
  if (typeof birthDate !== 'string' || Number.isNaN(new Date(birthDate).getTime())) {
    return NextResponse.json({ error: '出生日期无效' }, { status: 400 });
  }
  if (typeof status !== 'string' || !STATUSES.includes(status as any)) {
    return NextResponse.json({ error: '状态值无效' }, { status: 400 });
  }

  const data: Prisma.AstronautCreateInput = {
    name: name.trim(),
    nationality: nationality.trim(),
    agency: agency.trim(),
    birthDate: new Date(birthDate),
    status: status as any,
    spaceFlights: Number(spaceFlights) || 0,
    totalTimeInSpace: Number(totalTimeInSpace) || 0,
    bio: typeof bio === 'string' ? bio.trim() : '',
    photo: typeof photo === 'string' && photo.trim() ? photo.trim() : null,
    socialLinks:
      socialLinks == null ? Prisma.JsonNull : (socialLinks as Prisma.InputJsonValue),
  };

  try {
    const astronaut = await prisma.astronaut.create({ data });
    return NextResponse.json({ astronaut }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '创建失败' },
      { status: 400 }
    );
  }
}
