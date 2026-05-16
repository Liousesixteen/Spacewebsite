import { prisma } from '@/lib/db';
import { LaunchForm } from '@/components/admin/forms/launch-form';
import { Card, CardContent } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export default async function NewLaunchPage({ params }: Props) {
  const { locale } = await params;
  const [rockets, launchSites] = await Promise.all([
    prisma.rocket.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.launchSite.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">新建发射任务</h1>
        <p className="text-sm text-star-dim mt-1">填写完整信息后提交</p>
      </div>
      <Card>
        <CardContent>
          <LaunchForm
            mode="create"
            rockets={rockets}
            launchSites={launchSites}
            locale={locale}
          />
        </CardContent>
      </Card>
    </div>
  );
}
