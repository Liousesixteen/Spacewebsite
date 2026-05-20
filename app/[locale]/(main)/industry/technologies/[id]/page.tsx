import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Cpu,
  Tag,
  Target,
  AlertTriangle,
  Users,
  Clock,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import {
  Card,
  CardContent,
  StatusBadge,
  Breadcrumbs,
} from '@/components/ui';
import { FavoriteButton } from '@/components/common/favorite-button';
import { CommentSection } from '@/components/common/comment-section';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const technology = await prisma.technology.findUnique({
      where: { id },
      select: { name: true, description: true, category: true },
    });
    if (!technology) return { title: '未找到 - SpaceData' };

    const description =
      technology.description?.slice(0, 160) ??
      `${technology.name} - ${technology.category}`;

    return {
      title: `${technology.name} - SpaceData`,
      description,
      openGraph: {
        title: technology.name,
        description,
      },
    };
  } catch (error) {
    console.error('[technology metadata] failed:', error);
    return { title: '技术详情 - SpaceData' };
  }
}

const maturityLabels: Record<string, string> = {
  RESEARCH: '研究阶段',
  EXPERIMENTAL: '试验阶段',
  APPLIED: '应用阶段',
  MATURE: '成熟阶段',
};

interface BreakthroughItem {
  year?: number | string;
  date?: string;
  title?: string;
  event?: string;
  description?: string;
  org?: string;
}

export default async function TechnologyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const technology = await prisma.technology.findUnique({
    where: { id },
  });

  if (!technology) notFound();

  const breakthroughs: BreakthroughItem[] = Array.isArray(technology.breakthroughs)
    ? (technology.breakthroughs as unknown as BreakthroughItem[])
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: '航天数据', href: `/${locale}` },
          { label: '产业链', href: `/${locale}/industry` },
          { label: '技术', href: `/${locale}/industry/technologies` },
          { label: technology.name },
        ]}
      />

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <Cpu className="w-8 h-8 text-cosmic-blue mt-1" />
          <div>
            <h1 className="text-3xl font-bold text-star-white">{technology.name}</h1>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <StatusBadge
                status="default"
                label={technology.category}
                className="text-sm"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge
            status={technology.maturityLevel}
            className="text-base px-4 py-1"
          />
          <FavoriteButton
            targetType="TECHNOLOGY"
            targetId={technology.id}
            locale={locale}
            size="sm"
          />
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-star-white mb-4">技术描述</h2>
          <p className="text-star-dim leading-relaxed whitespace-pre-line">
            {technology.description}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {technology.applications.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-star-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-cosmic-blue" />
                应用领域
              </h2>
              <div className="flex flex-wrap gap-2">
                {technology.applications.map((app, index) => (
                  <StatusBadge key={index} status="default" label={app} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {technology.keyPlayers.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-star-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cosmic-blue" />
                主要参与方
              </h2>
              <div className="flex flex-wrap gap-2">
                {technology.keyPlayers.map((player, index) => (
                  <StatusBadge key={index} status="default" label={player} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {technology.challenges.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              主要挑战
            </h2>
            <ul className="space-y-2">
              {technology.challenges.map((challenge, index) => (
                <li key={index} className="flex gap-3 text-star-dim">
                  <span className="text-yellow-400">·</span>
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {breakthroughs.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-star-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cosmic-blue" />
              发展历程
            </h2>
            <div className="relative pl-6 border-l-2 border-space-600 space-y-6">
              {breakthroughs.map((item, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-cosmic-blue border-4 border-space-900" />
                  <div className="text-sm text-cosmic-blue font-medium">
                    {item.year || item.date || '—'}
                  </div>
                  <div className="mt-1 text-star-white font-medium">
                    {item.title || item.event || '里程碑'}
                  </div>
                  {item.description && (
                    <p className="mt-2 text-sm text-star-dim leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.org && (
                    <p className="mt-1 text-xs text-star-dim">
                      参与方: {item.org}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <CommentSection
          targetType="TECHNOLOGY"
          targetId={technology.id}
          locale={locale}
        />
      </div>
    </div>
  );
}
