import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Rocket, MapPin, Calendar, Users, Video, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import type { BadgeProps } from '@/components/ui';

const statusColors: Record<string, BadgeProps['variant']> = {
  SUCCESS: 'success',
  FAILURE: 'error',
  PLANNED: 'info',
  POSTPONED: 'warning',
  IN_FLIGHT: 'info',
};

interface PayloadItem {
  name: string;
  type: string;
}

export default async function LaunchDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const launch = await prisma.launch.findUnique({
    where: { id },
    include: {
      rocket: true,
      launchSite: true,
      crews: { include: { astronaut: true } },
    },
  });

  if (!launch) notFound();

  const payloads = Array.isArray(launch.payloads)
    ? (launch.payloads as unknown as PayloadItem[])
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href={`/${locale}/launches`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </Button>
      </Link>

      <div className="flex items-start justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">{launch.name}</h1>
        <Badge
          variant={statusColors[launch.status] || 'default'}
          className="text-base px-4 py-1"
        >
          {launch.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">发射信息</h2>
            <div className="space-y-3 text-star-dim">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-cosmic-blue" />
                <span>{format(new Date(launch.date), 'yyyy-MM-dd HH:mm:ss')}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-cosmic-blue" />
                <span>{launch.launchSite.name}</span>
              </div>
              {launch.videoUrl && (
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-cosmic-blue" />
                  <a
                    href={launch.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cosmic-blue hover:underline"
                  >
                    观看视频
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">火箭信息</h2>
            <Link href={`/${locale}/rockets/${launch.rocket.id}`} className="block">
              <div className="flex items-center gap-3 mb-3">
                <Rocket className="w-5 h-5 text-cosmic-blue" />
                <span className="text-white hover:text-cosmic-blue">
                  {launch.rocket.name}
                </span>
              </div>
            </Link>
            <div className="text-sm text-star-dim space-y-1">
              <p>制造商: {launch.rocket.manufacturer}</p>
              <p>国家: {launch.rocket.country}</p>
              <p>成功率: {launch.rocket.successRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">任务描述</h2>
          <p className="text-star-dim leading-relaxed">{launch.missionDescription}</p>
        </CardContent>
      </Card>

      {launch.crews.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cosmic-blue" />
              机组成员
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {launch.crews.map((crew) => (
                <Link
                  key={crew.id}
                  href={`/${locale}/astronauts/${crew.astronaut.id}`}
                >
                  <div className="text-center p-4 bg-space-700 rounded-lg hover:bg-space-600 transition-colors">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-space-600 flex items-center justify-center">
                      {crew.astronaut.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={crew.astronaut.photo}
                          alt={crew.astronaut.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-8 h-8 text-star-dim" />
                      )}
                    </div>
                    <p className="text-white text-sm">{crew.astronaut.name}</p>
                    <p className="text-star-dim text-xs">{crew.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {payloads.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">载荷信息</h2>
            <div className="space-y-2">
              {payloads.map((payload, index) => (
                <div
                  key={index}
                  className="flex justify-between p-3 bg-space-700 rounded-lg"
                >
                  <span className="text-white">{payload.name}</span>
                  <span className="text-star-dim">{payload.type}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
