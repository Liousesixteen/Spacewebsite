import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Cpu,
  Tag,
  Target,
  AlertTriangle,
  Users,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import type { BadgeProps } from '@/components/ui';
import { FavoriteButton } from '@/components/common/favorite-button';
import { CommentSection } from '@/components/common/comment-section';

const maturityColors: Record<string, BadgeProps['variant']> = {
  RESEARCH: 'info',
  EXPERIMENTAL: 'warning',
  APPLIED: 'success',
  MATURE: 'success',
};

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
      <Link href={`/${locale}/industry/technologies`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </Button>
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <Cpu className="w-8 h-8 text-cosmic-blue mt-1" />
          <div>
            <h1 className="text-3xl font-bold text-white">{technology.name}</h1>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Badge variant="default">
                <Tag className="w-3 h-3 mr-1" />
                {technology.category}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={maturityColors[technology.maturityLevel] || 'default'}
            className="text-base px-4 py-1"
          >
            {maturityLabels[technology.maturityLevel] || technology.maturityLevel}
          </Badge>
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
          <h2 className="text-lg font-semibold text-white mb-4">技术描述</h2>
          <p className="text-star-dim leading-relaxed whitespace-pre-line">
            {technology.description}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {technology.applications.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-cosmic-blue" />
                应用领域
              </h2>
              <div className="flex flex-wrap gap-2">
                {technology.applications.map((app, index) => (
                  <Badge key={index} variant="info">
                    {app}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {technology.keyPlayers.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cosmic-blue" />
                主要参与方
              </h2>
              <div className="flex flex-wrap gap-2">
                {technology.keyPlayers.map((player, index) => (
                  <Badge key={index} variant="default">
                    {player}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {technology.challenges.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
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
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
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
                  <div className="mt-1 text-white font-medium">
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
