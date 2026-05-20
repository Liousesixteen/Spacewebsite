'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Rocket,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import type { Launch } from '@/lib/api/launches';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'] as const;

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: 'bg-green-400',
  FAILURE: 'bg-red-400',
  PLANNED: 'bg-cosmic-blue',
  POSTPONED: 'bg-yellow-400',
  IN_FLIGHT: 'bg-cosmic-cyan',
};

const STATUS_LABELS: Record<string, string> = {
  SUCCESS: '成功',
  FAILURE: '失败',
  PLANNED: '计划中',
  POSTPONED: '推迟',
  IN_FLIGHT: '飞行中',
};

function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Monday = 0 ... Sunday = 6 (getDay returns Sunday = 0)
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek < 0) startDayOfWeek = 6;

  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  // Fill leading nulls
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(new Date(year, month, day));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill trailing nulls
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

interface LaunchCalendarProps {
  locale: string;
}

export function LaunchCalendar({ locale }: LaunchCalendarProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const yearStr = viewYear.toString();
  const monthStr = (viewMonth + 1).toString().padStart(2, '0');

  const { data, isLoading } = useQuery({
    queryKey: ['launches-calendar', viewYear, viewMonth],
    queryFn: async () => {
      // Fetch launches for the view month + padding
      const startOfMonth = new Date(viewYear, viewMonth, 1).toISOString();
      const endOfMonth = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59).toISOString();

      const params = new URLSearchParams({
        year: viewYear.toString(),
        limit: '500',
      });

      const res = await fetch(`/api/launches?${params}`);
      if (!res.ok) throw new Error('Failed to fetch launches');
      return res.json() as Promise<{
        data: Launch[];
        pagination: { total: number };
      }>;
    },
  });

  const grid = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  // Map launch dates to launches for quick lookup
  const launchesByDay = useMemo(() => {
    const map = new Map<string, Launch[]>();
    if (!data?.data) return map;
    for (const launch of data.data) {
      const d = new Date(launch.date);
      // Only include launches whose month/year match the view
      if (d.getFullYear() !== viewYear || d.getMonth() !== viewMonth) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(launch);
    }
    return map;
  }, [data, viewYear, viewMonth]);

  const today = new Date();
  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const selectedLaunches =
    selectedDay && launchesByDay.get(
      `${selectedDay.getFullYear()}-${selectedDay.getMonth()}-${selectedDay.getDate()}`
    );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-cosmic-blue" />
          <h2 className="text-xl font-bold text-star-white">
            {viewYear} 年 {viewMonth + 1} 月
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goToToday}>
            今天
          </Button>
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-space-600 text-star-dim hover:text-star-white transition-colors"
            aria-label="上个月"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-space-600 text-star-dim hover:text-star-white transition-colors"
            aria-label="下个月"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12 text-star-dim">加载中...</div>
      )}

      {/* Calendar Grid */}
      <div className="bg-space-800 rounded-xl border border-space-600 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-space-600">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm font-medium text-star-dim"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {grid.flat().map((cell, idx) => {
            if (!cell) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[100px] md:min-h-[120px] p-1 border-b border-r border-space-700/50 bg-space-800/50"
                />
              );
            }

            const dateKey = `${cell.getFullYear()}-${cell.getMonth()}-${cell.getDate()}`;
            const launches = launchesByDay.get(dateKey) || [];
            const isCurrentDay = isToday(cell);
            const isSelected =
              selectedDay &&
              selectedDay.getFullYear() === cell.getFullYear() &&
              selectedDay.getMonth() === cell.getMonth() &&
              selectedDay.getDate() === cell.getDate();

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDay(cell)}
                className={cn(
                  'min-h-[100px] md:min-h-[120px] p-2 border-b border-r border-space-700/50',
                  'hover:bg-space-700 transition-colors text-left relative',
                  isCurrentDay && 'bg-cosmic-blue/10 ring-1 ring-cosmic-blue/50',
                  isSelected && 'bg-cosmic-purple/10 ring-1 ring-cosmic-purple/50'
                )}
              >
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm',
                    isCurrentDay
                      ? 'bg-cosmic-blue text-star-white font-bold'
                      : 'text-star-dim'
                  )}
                >
                  {cell.getDate()}
                </span>

                {/* Launch dots */}
                <div className="mt-1 space-y-0.5 max-h-[60px] md:max-h-[80px] overflow-y-auto">
                  {launches.slice(0, 4).map((launch, i) => (
                    <div
                      key={launch.id}
                      className="flex items-center gap-1.5 min-w-0"
                      title={`${launch.name} - ${STATUS_LABELS[launch.status] || launch.status}`}
                    >
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full flex-shrink-0',
                          STATUS_COLORS[launch.status] || 'bg-gray-400'
                        )}
                      />
                      <span className="text-xs text-star-dim truncate">
                        {launch.name}
                      </span>
                    </div>
                  ))}
                  {launches.length > 4 && (
                    <span className="text-xs text-cosmic-blue">
                      +{launches.length - 4} 更多
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: vertical list of days */}
      <div className="mt-6 md:hidden">
        <h3 className="text-lg font-semibold text-star-white mb-4">每日发射列表</h3>
        {grid.flat().some((c) => c && launchesByDay.has(`${c.getFullYear()}-${c.getMonth()}-${c.getDate()}`)) ? (
          grid.flat().map((cell, idx) => {
            if (!cell) return null;
            const dateKey = `${cell.getFullYear()}-${cell.getMonth()}-${cell.getDate()}`;
            const launches = launchesByDay.get(dateKey);
            if (!launches || launches.length === 0) return null;

            return (
              <div key={dateKey} className="mb-4 bg-space-800 rounded-xl border border-space-600 p-4">
                <h4 className="text-sm font-bold text-star-white mb-2">
                  {cell.getMonth() + 1} 月 {cell.getDate()} 日
                  {isToday(cell) && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-cosmic-blue/20 text-cosmic-blue text-xs">
                      今天
                    </span>
                  )}
                </h4>
                <div className="space-y-2">
                  {launches.map((launch) => (
                    <div key={launch.id} className="flex items-center gap-2">
                      <span
                        className={cn(
                          'w-2.5 h-2.5 rounded-full flex-shrink-0',
                          STATUS_COLORS[launch.status] || 'bg-gray-400'
                        )}
                      />
                      <div className="min-w-0">
                        <div className="text-sm text-star-white truncate">{launch.name}</div>
                        <div className="text-xs text-star-dim">
                          {STATUS_LABELS[launch.status] || launch.status}
                          {launch.rocket && ` · ${launch.rocket.name}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-star-dim">本月暂无发射任务</div>
        )}
      </div>

      {/* Day detail modal */}
      {selectedDay && selectedLaunches && selectedLaunches.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedDay(null)}
          />
          <div className="relative bg-space-800 border border-space-600 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-star-white">
                {selectedDay.getMonth() + 1} 月 {selectedDay.getDate()} 日 发射任务
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 rounded-lg hover:bg-space-600 text-star-dim hover:text-star-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedLaunches.map((launch) => (
                <div
                  key={launch.id}
                  className="p-4 bg-space-700 rounded-xl border border-space-500"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-4 h-4 text-cosmic-blue" />
                    <h4 className="font-semibold text-star-white">{launch.name}</h4>
                    <span
                      className={cn(
                        'ml-auto px-2 py-0.5 rounded-full text-xs font-medium',
                        launch.status === 'SUCCESS'
                          ? 'bg-green-400/20 text-green-400'
                          : launch.status === 'FAILURE'
                          ? 'bg-red-400/20 text-red-400'
                          : launch.status === 'PLANNED'
                          ? 'bg-cosmic-blue/20 text-cosmic-blue'
                          : launch.status === 'POSTPONED'
                          ? 'bg-yellow-400/20 text-yellow-400'
                          : 'bg-cosmic-cyan/20 text-cosmic-cyan'
                      )}
                    >
                      {STATUS_LABELS[launch.status] || launch.status}
                    </span>
                  </div>

                  {launch.missionDescription && (
                    <p className="text-sm text-star-dim mb-2">
                      {launch.missionDescription.slice(0, 150)}
                      {launch.missionDescription.length > 150 ? '...' : ''}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs text-star-dim">
                    {launch.rocket && (
                      <span>
                        🚀 火箭: {launch.rocket.name}
                      </span>
                    )}
                    {launch.launchSite && (
                      <span>
                        📍 发射场: {launch.launchSite.name}
                      </span>
                    )}
                  </div>

                  {launch.videoUrl && (
                    <a
                      href={launch.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-cosmic-blue hover:underline"
                    >
                      观看发射录像
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
