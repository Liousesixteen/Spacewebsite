/**
 * Promote a user to ADMIN role.
 * Usage: pnpm make-admin <email>
 */
import { prisma } from '../lib/db';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: pnpm make-admin <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, role: true },
    });
    console.log(`✓ Promoted ${user.email} (${user.id}) to ADMIN`);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Failed: ${err.message}`);
    } else {
      console.error(err);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
