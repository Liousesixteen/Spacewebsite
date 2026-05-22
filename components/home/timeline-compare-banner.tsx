'use client';

import Link from 'next/link';
import { Clock, ArrowLeftRight } from 'lucide-react';

export function TimelineCompareBanner({ locale }: { locale: string }) {
  const isZh = locale === 'zh-CN';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Link
        href={`/${locale}/timeline`}
        className="group relative overflow-hidden rounded-2xl border border-space-600/40 bg-gradient-to-br from-cosmic-purple/10 to-cosmic-blue/5 bg-space-800/60 backdrop-blur-xl p-8 transition-all duration-500 hover:border-cosmic-blue/30 hover:-translate-y-1 hover:shadow-card-hover"
      >
        <div className="absolute inset-0 bg-cosmic-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex p-3 rounded-xl bg-cosmic-purple/10 text-cosmic-purple mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-star-white mb-3 group-hover:text-cosmic-blue transition-colors">
            {isZh ? '航天史时间线' : 'Space History Timeline'}
          </h3>
          <p className="text-sm text-star-dim leading-relaxed max-w-md">
            {isZh
              ? '从 1957 年 Sputnik 1 到今天的商业航天时代——探索航天史上的每一个关键时刻。'
              : 'From Sputnik 1 in 1957 to today\'s commercial spaceflight era — explore every key moment in space exploration history.'}
          </p>
          <span className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-cosmic-blue group-hover:gap-3 transition-all">
            {isZh ? '浏览时间线' : 'View Timeline'}
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </span>
        </div>
      </Link>

      <Link
        href={`/${locale}/compare`}
        className="group relative overflow-hidden rounded-2xl border border-space-600/40 bg-gradient-to-br from-cosmic-cyan/10 to-cosmic-purple/5 bg-space-800/60 backdrop-blur-xl p-8 transition-all duration-500 hover:border-cosmic-blue/30 hover:-translate-y-1 hover:shadow-card-hover"
      >
        <div className="absolute inset-0 bg-cosmic-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex p-3 rounded-xl bg-cosmic-cyan/10 text-cosmic-cyan mb-4">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-star-white mb-3 group-hover:text-cosmic-cyan transition-colors">
            {isZh ? '对比工具' : 'Comparison Tool'}
          </h3>
          <p className="text-sm text-star-dim leading-relaxed max-w-md">
            {isZh
              ? '并排对比火箭与航天器的详细规格——性能差异一目了然。'
              : 'Compare rockets and spacecraft side-by-side — performance differences at a glance with detailed spec sheets.'}
          </p>
          <span className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-cosmic-cyan group-hover:gap-3 transition-all">
            {isZh ? '开始对比' : 'Start Comparing'}
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </span>
        </div>
      </Link>
    </div>
  );
}
