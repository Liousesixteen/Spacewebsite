'use client';

import { useState } from 'react';
import { ChevronDown, Flag, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LaunchCard } from './launch-card';
import { LaunchTableRow } from './launch-table-row';
import { AnimateIn } from '@/components/ui';
import type { Launch } from '@/lib/api/launches';

function isChinaLaunch(launch: Launch): boolean {
  const agencyCountry = launch.agency?.country ?? '';
  const rocketCountry = launch.rocket?.country ?? '';
  return (
    agencyCountry === 'China' ||
    agencyCountry === 'CHN' ||
    rocketCountry === 'China' ||
    rocketCountry === 'CHN'
  );
}

export function CountryLaunchSplit({
  launches,
  locale,
  viewMode,
}: {
  launches: Launch[];
  locale: string;
  viewMode: 'grid' | 'table';
}) {
  const [showOther, setShowOther] = useState(false);

  const china = launches.filter(isChinaLaunch);
  const other = launches.filter((l) => !isChinaLaunch(l));

  return (
    <div className="space-y-6 mt-8">
      {/* China section — always visible, fully expanded */}
      {china.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-sm font-semibold text-red-400">
              <Flag className="h-4 w-4" />
              中国发射
            </span>
            <span className="text-xs text-star-dim/70">
              {china.length} 个任务
            </span>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {china.map((launch, i) => (
                <AnimateIn key={launch.id} delay={i * 50}>
                  <LaunchCard launch={launch} locale={locale} />
                </AnimateIn>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {china.map((launch, i) => (
                <AnimateIn key={launch.id} delay={i * 30}>
                  <LaunchTableRow launch={launch} locale={locale} />
                </AnimateIn>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Other countries — collapsible */}
      {other.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowOther(!showOther)}
            className="mb-4 flex w-full items-center gap-3 rounded-xl border border-dashed border-space-600/30 bg-space-700/20 px-4 py-3 text-left hover:border-space-500/50 hover:bg-space-700/40 transition-colors"
          >
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-space-500/30 bg-space-600/30 px-3 py-1.5 text-sm font-medium text-star-dim">
              <Globe className="h-4 w-4" />
              其他国家发射
            </span>
            <span className="text-xs text-star-dim/60">
              {other.length} 个任务
            </span>
            <span className="ml-auto text-xs text-star-dim/50">
              {showOther ? '点击收起' : '点击查看'}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-star-dim/50 transition-transform duration-200',
                showOther && 'rotate-180'
              )}
            />
          </button>

          {showOther && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {other.map((launch, i) => (
                    <AnimateIn key={launch.id} delay={i * 30}>
                      <LaunchCard launch={launch} locale={locale} />
                    </AnimateIn>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {other.map((launch, i) => (
                    <AnimateIn key={launch.id} delay={i * 20}>
                      <LaunchTableRow launch={launch} locale={locale} />
                    </AnimateIn>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {china.length === 0 && other.length === 0 && (
        <div className="text-center py-12 text-star-dim">暂无发射数据</div>
      )}
    </div>
  );
}
