import { NextResponse } from 'next/server';
import { getAdminOrNull } from '@/lib/auth/admin';
import { prisma } from '@/lib/db';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOrNull();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  // Block self-demotion / self-promotion to keep at least the current admin intact.
  if (admin.id === id) {
    return NextResponse.json(
      { error: '不能修改自己的角色' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
  const updated = await prisma.user.update({
    where: { id },
    data: { role: newRole },
    select: { id: true, role: true, name: true, email: true },
  });

  return NextResponse.json({ user: updated });
}
