'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronDown, Building2, ArrowDown } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import type { IndustrySegment, IndustryLevel } from '@/lib/api/industry';

interface IndustryChainDiagramProps {
  segments: IndustrySegment[];
  locale: string;
}

const levelMeta: Record<
  IndustryLevel,
  { variant: 'info' | 'warning' | 'success' }
> = {
  UPSTREAM: {
    variant: 'info',
  },
  MIDSTREAM: {
    variant: 'warning',
  },
  DOWNSTREAM: {
    variant: 'success',
  },
};

const levelOrder: IndustryLevel[] = ['UPSTREAM', 'MIDSTREAM', 'DOWNSTREAM'];

export function IndustryChainDiagram({
  segments,
  locale,
}: IndustryChainDiagramProps) {
  const t = useTranslations('industry');
  const [expanded, setExpanded] = useState<IndustryLevel | null>('UPSTREAM');

  const grouped = levelOrder.map((level) => ({
    level,
    items: segments.filter((s) => s.level === level),
  }));

  return (
    <div className="space-y-4">
      {grouped.map(({ level, items }, idx) => {
        const meta = levelMeta[level];
        const isOpen = expanded === level;
        const levelLabel = t(`levels.${level}`);
        return (
          <div key={level}>
            <Card
              variant="glow"
              className="cursor-pointer transition-all"
              onClick={() => setExpanded(isOpen ? null : level)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={meta.variant}
                      className="text-base px-3 py-1"
                    >
                      {levelLabel}
                    </Badge>
                    <div>
                      <h3 className="text-xl font-semibold text-star-white">
                        {t('levelTitle', { level: levelLabel })} ({items.length})
                      </h3>
                      <p className="text-sm text-star-dim mt-1">
                        {t(`levelDescriptions.${level}`)}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-star-dim transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {isOpen && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                    {items.length === 0 ? (
                      <div className="col-span-full text-center text-star-dim py-4">
                        {t('emptySegments')}
                      </div>
                    ) : (
                      items.map((segment) => (
                        <Link
                          key={segment.id}
                          href={`/${locale}/industry/companies?segmentId=${segment.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="block p-4 bg-space-700 hover:bg-space-600 rounded-lg border border-space-500 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-star-white font-medium">
                              {segment.name}
                            </h4>
                            {segment._count && (
                              <Badge variant="default">
                                <Building2 className="w-3 h-3 mr-1" />
                                {t('companyCount', { count: segment._count.companies })}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-star-dim line-clamp-2">
                            {segment.description}
                          </p>
                          {segment.category && (
                            <div className="mt-2">
                              <Badge variant="default">{segment.category}</Badge>
                            </div>
                          )}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            {idx < levelOrder.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className="w-6 h-6 text-cosmic-blue" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
