import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getAdminOrNull } from '@/lib/auth/admin';
import { prisma } from '@/lib/db';

const STATUSES = ['PLANNED', 'IN_FLIGHT', 'SUCCESS', 'FAILURE', 'POSTPONED'] as const;

export async function POST(request: Request) {
  const admin = await getAdminOrNull();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    name,
    date,
    status,
    rocketId,
    launchSiteId,
    missionDescription,
    payloads,
    videoUrl,
    images,
  } = body as Record<string, unknown>;

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: '任务名称必填' }, { status: 400 });
  }
  if (typeof date !== 'string' || Number.isNaN(new Date(date).getTime())) {
    return NextResponse.json({ error: '日期格式无效' }, { status: 400 });
  }
  if (typeof status !== 'string' || !STATUSES.includes(status as any)) {
    return NextResponse.json({ error: '状态值无效' }, { status: 400 });
  }
  if (typeof rocketId !== 'string' || !rocketId) {
    return NextResponse.json({ error: '请选择运载火箭' }, { status: 400 });
  }
  if (typeof launchSiteId !== 'string' || !launchSiteId) {
    return NextResponse.json({ error: '请选择发射场' }, { status: 400 });
  }

  const data: Prisma.LaunchCreateInput = {
    name: name.trim(),
    date: new Date(date),
    status: status as any,
    missionDescription:
      typeof missionDescription === 'string' ? missionDescription.trim() : '',
    payloads: (payloads ?? []) as Prisma.InputJsonValue,
    videoUrl: typeof videoUrl === 'string' && videoUrl.trim() ? videoUrl.trim() : null,
    images: Array.isArray(images) ? (images as string[]).filter((s) => typeof s === 'string') : [],
    rocket: { connect: { id: rocketId } },
    launchSite: { connect: { id: launchSiteId } },
  };

  try {
    const launch = await prisma.launch.create({ data });
    return NextResponse.json({ launch }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '创建失败';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
