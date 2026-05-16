import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { FavoriteType } from '@prisma/client';

const VALID_TYPES: FavoriteType[] = [
  'LAUNCH',
  'ROCKET',
  'SPACECRAFT',
  'ASTRONAUT',
  'COMPANY',
  'TECHNOLOGY',
];

function isValidType(value: unknown): value is FavoriteType {
  return typeof value === 'string' && (VALID_TYPES as string[]).includes(value);
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const targetType = url.searchParams.get('targetType');
  const targetId = url.searchParams.get('targetId');

  if (targetType && targetId) {
    if (!isValidType(targetType)) {
      return NextResponse.json({ error: 'Invalid targetType' }, { status: 400 });
    }
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: session.user.id,
          targetType,
          targetId,
        },
      },
    });
    return NextResponse.json({ favorited: Boolean(favorite), favorite });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ favorites });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { targetType, targetId } = body ?? {};

  if (!isValidType(targetType)) {
    return NextResponse.json({ error: 'Invalid targetType' }, { status: 400 });
  }
  if (typeof targetId !== 'string' || !targetId) {
    return NextResponse.json({ error: 'Invalid targetId' }, { status: 400 });
  }

  const favorite = await prisma.favorite.upsert({
    where: {
      userId_targetType_targetId: {
        userId: session.user.id,
        targetType,
        targetId,
      },
    },
    create: {
      userId: session.user.id,
      targetType,
      targetId,
    },
    update: {},
  });

  return NextResponse.json({ favorite }, { status: 201 });
}
