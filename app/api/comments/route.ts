import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CommentTargetType } from '@prisma/client';

const VALID_TYPES: CommentTargetType[] = [
  'LAUNCH',
  'ROCKET',
  'SPACECRAFT',
  'ASTRONAUT',
  'COMPANY',
  'TECHNOLOGY',
];

function isValidType(value: unknown): value is CommentTargetType {
  return typeof value === 'string' && (VALID_TYPES as string[]).includes(value);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const targetType = url.searchParams.get('targetType');
  const targetId = url.searchParams.get('targetId');
  const userOnly = url.searchParams.get('userOnly') === '1';

  if (userOnly) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const comments = await prisma.comment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, image: true } } },
    });
    return NextResponse.json({ comments });
  }

  if (!isValidType(targetType) || typeof targetId !== 'string' || !targetId) {
    return NextResponse.json(
      { error: 'targetType and targetId are required' },
      { status: 400 }
    );
  }

  const comments = await prisma.comment.findMany({
    where: { targetType, targetId, parentId: null },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { targetType, targetId, content, parentId } = body ?? {};

  if (!isValidType(targetType)) {
    return NextResponse.json({ error: 'Invalid targetType' }, { status: 400 });
  }
  if (typeof targetId !== 'string' || !targetId) {
    return NextResponse.json({ error: 'Invalid targetId' }, { status: 400 });
  }
  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json(
      { error: 'Content too long (max 2000 chars)' },
      { status: 400 }
    );
  }

  let validatedParentId: string | null = null;
  if (parentId) {
    if (typeof parentId !== 'string') {
      return NextResponse.json({ error: 'Invalid parentId' }, { status: 400 });
    }
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.targetType !== targetType || parent.targetId !== targetId) {
      return NextResponse.json({ error: 'Parent comment not found' }, { status: 400 });
    }
    validatedParentId = parentId;
  }

  const comment = await prisma.comment.create({
    data: {
      userId: session.user.id,
      targetType,
      targetId,
      content: content.trim(),
      parentId: validatedParentId,
    },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
