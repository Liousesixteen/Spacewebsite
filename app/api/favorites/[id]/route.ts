import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const favorite = await prisma.favorite.findUnique({ where: { id } });
  if (!favorite) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (favorite.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.favorite.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
