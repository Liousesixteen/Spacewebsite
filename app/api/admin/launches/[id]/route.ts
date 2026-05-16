import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getAdminOrNull } from '@/lib/auth/admin';
import { prisma } from '@/lib/db';

const STATUSES = ['PLANNED', 'IN_FLIGHT', 'SUCCESS', 'FAILURE', 'POSTPONED'] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOrNull();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const data: Prisma.LaunchUpdateInput = {};
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

  if (typeof name === 'string') {
    if (!name.trim()) {
      return NextResponse.json({ error: '任务名称不能为空' }, { status: 400 });
    }
    data.name = name.trim();
  }
  if (typeof date === 'string') {
    if (Number.isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: '日期格式无效' }, { status: 400 });
    }
    data.date = new Date(date);
  }
  if (typeof status === 'string') {
    if (!STATUSES.includes(status as any)) {
      return NextResponse.json({ error: '状态值无效' }, { status: 400 });
    }
    data.status = status as any;
  }
  if (typeof rocketId === 'string' && rocketId) {
    data.rocket = { connect: { id: rocketId } };
  }
  if (typeof launchSiteId === 'string' && launchSiteId) {
    data.launchSite = { connect: { id: launchSiteId } };
  }
  if (typeof missionDescription === 'string') {
    data.missionDescription = missionDescription.trim();
  }
  if (payloads !== undefined) {
    data.payloads = (payloads ?? []) as Prisma.InputJsonValue;
  }
  if (videoUrl !== undefined) {
    data.videoUrl =
      typeof videoUrl === 'string' && videoUrl.trim() ? videoUrl.trim() : null;
  }
  if (images !== undefined) {
    data.images = Array.isArray(images)
      ? (images as string[]).filter((s) => typeof s === 'string')
      : [];
  }

  try {
    const launch = await prisma.launch.update({ where: { id }, data });
    return NextResponse.json({ launch });
  } catch (err) {
    const message = err instanceof Error ? err.message : '更新失败';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOrNull();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.launch.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '删除失败';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
