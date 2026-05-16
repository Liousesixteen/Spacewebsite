import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { LaunchForm } from '@/components/admin/forms/launch-form';
import { Card, CardContent } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditLaunchPage({ params }: Props) {
  const { locale, id } = await params;
  const [launch, rockets, launchSites] = await Promise.all([
    prisma.launch.findUnique({ where: { id } }),
    prisma.rocket.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.launchSite.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  if (!launch) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">编辑发射任务</h1>
        <p className="text-sm text-star-dim mt-1">{launch.name}</p>
      </div>
      <Card>
        <CardContent>
          <LaunchForm
            mode="edit"
            initial={{
              id: launch.id,
              name: launch.name,
              date: launch.date.toISOString(),
              status: launch.status,
              rocketId: launch.rocketId,
              launchSiteId: launch.launchSiteId,
              missionDescription: launch.missionDescription,
              payloads: launch.payloads as any,
              videoUrl: launch.videoUrl ?? '',
              images: launch.images.join('\n'),
            }}
            rockets={rockets}
            launchSites={launchSites}
            locale={locale}
          />
        </CardContent>
      </Card>
    </div>
  );
}
