import { redirect } from 'next/navigation';
import { auth } from './index';
import { prisma } from '@/lib/db';

/**
 * Server-side guard for admin pages.
 * Use in any server component / page that should be admin-only.
 * Redirects unauthenticated users to login, non-admins to home.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/zh-CN/login?callbackUrl=/zh-CN/admin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true, image: true },
  });

  if (user?.role !== 'ADMIN') {
    redirect('/zh-CN');
  }

  return { ...user, id: session.user.id };
}

/**
 * Server-side check for admin API routes.
 * Returns either the admin user or null. Caller is responsible for
 * returning a proper 401/403 NextResponse.
 */
export async function getAdminOrNull() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true, id: true },
  });

  if (!user || user.role !== 'ADMIN') return null;
  return user;
}
