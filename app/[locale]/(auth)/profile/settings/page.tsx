import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SettingsForm } from '@/components/profile/settings-form';

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, locale: true },
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">设置</h2>
      <SettingsForm
        initialName={user?.name ?? null}
        initialLocale={user?.locale ?? 'zh-CN'}
      />
    </div>
  );
}
