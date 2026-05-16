import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { locales } from '@/lib/i18n/config';

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const data: { name?: string | null; locale?: string } = {};

  if ('name' in body) {
    if (typeof body.name !== 'string' && body.name !== null) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    const trimmed = typeof body.name === 'string' ? body.name.trim() : '';
    if (trimmed.length > 50) {
      return NextResponse.json({ error: 'Name too long' }, { status: 400 });
    }
    data.name = trimmed || null;
  }

  if ('locale' in body) {
    if (typeof body.locale !== 'string' || !(locales as readonly string[]).includes(body.locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }
    data.locale = body.locale;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No changes' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, name: true, email: true, image: true, locale: true },
  });

  return NextResponse.json({ user });
}
