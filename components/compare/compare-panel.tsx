'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getRocketList, type Rocket } from '@/lib/api/rockets';
import { getSpacecraftList, type Spacecraft } from '@/lib/api/spacecraft';
import { Card, CardContent, Badge, Button, Input } from '@/components/ui';
import {
  ArrowLeftRight,
  Search,
  X,
  Share2,
  Check,
  Rocket as RocketIcon,
  Satellite,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type CompareType = 'rockets' | 'spacecraft';

interface ComparePanelProps {
  locale: string;
}

// ---------------------------------------------------------------------------
// Helper: determine which value is "better" (green = better)
// ---------------------------------------------------------------------------

type Highlight = 'better' | 'worse' | 'neutral';

function rocketComparators(a: Rocket, b: Rocket): Record<string, (valA: number, valB: number) => Highlight> {
  return {
    height: (a, b) => (a > b ? 'better' : 'worse'),     // taller = better
    diameter: (a, b) => (a > b ? 'better' : 'worse'),
    mass: (a, b) => (a < b ? 'better' : 'worse'),       // lighter = better (cheaper to launch)
    payloadToLEO: (a, b) => (a > b ? 'better' : 'worse'), // higher payload = better
    payloadToGTO: (a, b) => (a > b ? 'better' : 'worse'),
    stages: (a, b) => 'neutral',  // not inherently better
    successRate: (a, b) => (a > b ? 'better' : 'worse'),
  };
}

function spacecraftComparators(): Record<string, (valA: number, valB: number) => Highlight> {
  return {
    mass: (a, b) => (a < b ? 'better' : 'worse'),
    orbitAltitude: (a, b) => 'neutral',
    orbitInclination: (a, b) => 'neutral',
    orbitPeriod: (a, b) => 'neutral',
  };
}

// ---------------------------------------------------------------------------
// Selection dropdown with search
// ---------------------------------------------------------------------------

function SelectionDropdown<T extends { id: string; name: string }>({
  items,
  selected,
  onSelect,
  placeholder,
  loading,
}: {
  items: T[];
  selected: T | null;
  onSelect: (item: T) => void;
  placeholder: string;
  loading: boolean;
}) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div className="relative w-full">
      {selected ? (
        <div className="flex items-center justify-between p-4 rounded-xl border border-cosmic-blue bg-cosmic-blue/5">
          <div>
            <div className="text-sm text-star-dim">{placeholder.replace('选择', '').replace('Select ', '')}</div>
            <div className="text-star-white font-semibold">{selected.name}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelect(null as unknown as T);
              setSearch('');
            }}
            className="text-star-dim hover:text-star-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-star-dim" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-space-600 bg-space-800 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue transition-colors text-sm"
            />
          </div>

          {open && (
            <div className="absolute z-50 top-full mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-space-600 bg-space-800 shadow-xl">
              {loading && (
                <div className="p-4 text-sm text-star-dim text-center">Loading...</div>
              )}
              {!loading && filtered.length === 0 && (
                <div className="p-4 text-sm text-star-dim text-center">No results</div>
              )}
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full text-left px-4 py-3 text-sm text-star-white hover:bg-space-700 transition-colors border-b border-space-700 last:border-0"
                  onClick={() => {
                    onSelect(item);
                    setSearch('');
                    setOpen(false);
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}

          {/* Click outside to close */}
          {open && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Highlight pill
// ---------------------------------------------------------------------------

function HighlightPill({ highlight }: { highlight: Highlight }) {
  if (highlight === 'better') return <ArrowUp className="w-3.5 h-3.5 text-green-400 ml-1" />;
  if (highlight === 'worse') return <ArrowDown className="w-3.5 h-3.5 text-red-400 ml-1" />;
  return <Minus className="w-3.5 h-3.5 text-star-dim ml-1" />;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ComparePanel({ locale }: ComparePanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isZh = locale === 'zh-CN';

  const [compareType, setCompareType] = useState<CompareType>(
    (searchParams.get('type') as CompareType) || 'rockets'
  );
  const [left, setLeft] = useState<Rocket | Spacecraft | null>(null);
  const [right, setRight] = useState<Rocket | Spacecraft | null>(null);
  const [shared, setShared] = useState(false);
  const [origin, setOrigin] = useState('');

  // Fetch data
  const { data: rocketData, isLoading: rocketsLoading } = useQuery({
    queryKey: ['rockets', { limit: 500 }],
    queryFn: () => getRocketList({ limit: 500 }),
  });

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const { data: spacecraftData, isLoading: spacecraftLoading } = useQuery({
    queryKey: ['spacecraft', { limit: 500 }],
    queryFn: () => getSpacecraftList({ limit: 500 }),
  });

  // Pre-select from URL params
  useEffect(() => {
    const leftParam = searchParams.get('left');
    const rightParam = searchParams.get('right');
    const typeParam = (searchParams.get('type') as CompareType) || 'rockets';

    if (typeParam) setCompareType(typeParam);

    if (typeParam === 'rockets' && rocketData?.data) {
      if (leftParam) {
        const found = rocketData.data.find((r) => r.id === leftParam || r.name === leftParam);
        if (found) setLeft(found);
      }
      if (rightParam) {
        const found = rocketData.data.find((r) => r.id === rightParam || r.name === rightParam);
        if (found) setRight(found);
      }
    }

    if (typeParam === 'spacecraft' && spacecraftData?.data) {
      if (leftParam) {
        const found = spacecraftData.data.find((s) => s.id === leftParam || s.name === leftParam);
        if (found) setLeft(found);
      }
      if (rightParam) {
        const found = spacecraftData.data.find((s) => s.id === rightParam || s.name === rightParam);
        if (found) setRight(found);
      }
    }
  }, [rocketData, spacecraftData, searchParams]);

  // Update URL when selections change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('type', compareType);
    if (left) params.set('left', left.id || (left as Rocket | Spacecraft).name);
    if (right) params.set('right', right.id || (right as Rocket | Spacecraft).name);
    router.replace(`/${locale}/compare?${params.toString()}`, { scroll: false });
  }, [left, right, compareType, locale, router]);

  // Swap left and right
  const swap = () => {
    const tmp = left;
    setLeft(right);
    setRight(tmp);
  };

  // Share link
  const shareLink = useMemo(() => {
    const params = new URLSearchParams();
    params.set('type', compareType);
    if (left) params.set('left', left.id || (left as Rocket | Spacecraft).name);
    if (right) params.set('right', right.id || (right as Rocket | Spacecraft).name);
    const path = `/${locale}/compare?${params.toString()}`;
    return origin ? `${origin}${path}` : path;
  }, [left, right, compareType, locale, origin]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = shareLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  // Items for dropdowns
  const items = compareType === 'rockets' ? rocketData?.data || [] : spacecraftData?.data || [];
  const loading = compareType === 'rockets' ? rocketsLoading : spacecraftLoading;

  // Reset selections when switching type
  const handleTypeChange = (type: CompareType) => {
    setCompareType(type);
    setLeft(null);
    setRight(null);
  };

  // Build comparison rows
  const rows = useMemo(() => {
    if (!left || !right) return null;

    if (compareType === 'rockets') {
      const a = left as Rocket;
      const b = right as Rocket;
      const comparators = rocketComparators(a, b);

      const fields: { label: string; labelZh: string; key: string; valueA: string | number; valueB: string | number; highlightA: Highlight; highlightB: Highlight }[] = [
        { label: 'Manufacturer', labelZh: '制造商', key: 'manufacturer', valueA: a.manufacturer, valueB: b.manufacturer, highlightA: 'neutral', highlightB: 'neutral' },
        { label: 'Country', labelZh: '国家', key: 'country', valueA: a.country, valueB: b.country, highlightA: 'neutral', highlightB: 'neutral' },
        { label: 'Height (m)', labelZh: '高度 (米)', key: 'height', valueA: a.height, valueB: b.height, highlightA: comparators.height(a.height, b.height), highlightB: comparators.height(b.height, a.height) },
        { label: 'Diameter (m)', labelZh: '直径 (米)', key: 'diameter', valueA: a.diameter, valueB: b.diameter, highlightA: comparators.diameter(a.diameter, b.diameter), highlightB: comparators.diameter(b.diameter, a.diameter) },
        { label: 'Mass (kg)', labelZh: '质量 (千克)', key: 'mass', valueA: a.mass, valueB: b.mass, highlightA: comparators.mass(a.mass, b.mass), highlightB: comparators.mass(b.mass, a.mass) },
        { label: 'Payload to LEO (kg)', labelZh: 'LEO 运力 (千克)', key: 'payloadToLEO', valueA: a.payloadToLEO, valueB: b.payloadToLEO, highlightA: comparators.payloadToLEO(a.payloadToLEO, b.payloadToLEO), highlightB: comparators.payloadToLEO(b.payloadToLEO, a.payloadToLEO) },
        { label: 'Payload to GTO (kg)', labelZh: 'GTO 运力 (千克)', key: 'payloadToGTO', valueA: a.payloadToGTO, valueB: b.payloadToGTO, highlightA: comparators.payloadToGTO(a.payloadToGTO, b.payloadToGTO), highlightB: comparators.payloadToGTO(b.payloadToGTO, a.payloadToGTO) },
        { label: 'Stages', labelZh: '级数', key: 'stages', valueA: a.stages, valueB: b.stages, highlightA: 'neutral', highlightB: 'neutral' },
        { label: 'First Flight', labelZh: '首飞', key: 'firstFlight', valueA: a.firstFlight ? new Date(a.firstFlight).toLocaleDateString() : '-', valueB: b.firstFlight ? new Date(b.firstFlight).toLocaleDateString() : '-', highlightA: 'neutral', highlightB: 'neutral' },
        { label: 'Status', labelZh: '状态', key: 'status', valueA: a.status, valueB: b.status, highlightA: 'neutral', highlightB: 'neutral' },
        { label: 'Success Rate', labelZh: '成功率', key: 'successRate', valueA: `${a.successRate}%`, valueB: `${b.successRate}%`, highlightA: comparators.successRate(a.successRate, b.successRate), highlightB: comparators.successRate(b.successRate, a.successRate) },
      ];
      return { a, b, fields };
    }

    if (compareType === 'spacecraft') {
      const a = left as Spacecraft;
      const b = right as Spacecraft;
      const comparators = spacecraftComparators();

      const fields: { label: string; labelZh: string; key: string; valueA: string | number; valueB: string | number; highlightA: Highlight; highlightB: Highlight }[] = [
        { label: 'Type', labelZh: '类型', key: 'type', valueA: a.type, valueB: b.type, highlightA: 'neutral', highlightB: 'neutral' },
        { label: 'Operator', labelZh: '运营商', key: 'operator', valueA: a.operator, valueB: b.operator, highlightA: 'neutral', highlightB: 'neutral' },
        { label: 'Launch Date', labelZh: '发射日期', key: 'launchDate', valueA: a.launchDate ? new Date(a.launchDate).toLocaleDateString() : '-', valueB: b.launchDate ? new Date(b.launchDate).toLocaleDateString() : '-', highlightA: 'neutral', highlightB: 'neutral' },
        { label: 'Status', labelZh: '状态', key: 'status', valueA: a.status, valueB: b.status, highlightA: 'neutral', highlightB: 'neutral' },
        { label: 'Orbit Type', labelZh: '轨道类型', key: 'orbitType', valueA: a.orbitType, valueB: b.orbitType, highlightA: 'neutral', highlightB: 'neutral' },
        { label: 'Orbit Altitude (km)', labelZh: '轨道高度 (公里)', key: 'orbitAltitude', valueA: a.orbitAltitude ?? '-', valueB: b.orbitAltitude ?? '-', highlightA: comparators.orbitAltitude(a.orbitAltitude ?? 0, b.orbitAltitude ?? 0), highlightB: comparators.orbitAltitude(b.orbitAltitude ?? 0, a.orbitAltitude ?? 0) },
        { label: 'Orbit Inclination (°)', labelZh: '轨道倾角 (°)', key: 'orbitInclination', valueA: a.orbitInclination ?? '-', valueB: b.orbitInclination ?? '-', highlightA: 'neutral', highlightB: 'neutral' },
        { label: 'Orbit Period (min)', labelZh: '轨道周期 (分钟)', key: 'orbitPeriod', valueA: a.orbitPeriod ?? '-', valueB: b.orbitPeriod ?? '-', highlightA: 'neutral', highlightB: 'neutral' },
        { label: 'Mass (kg)', labelZh: '质量 (千克)', key: 'mass', valueA: a.mass, valueB: b.mass, highlightA: comparators.mass(a.mass, b.mass), highlightB: comparators.mass(b.mass, a.mass) },
        { label: 'Mission', labelZh: '任务', key: 'mission', valueA: a.mission, valueB: b.mission, highlightA: 'neutral', highlightB: 'neutral' },
      ];
      return { a, b, fields };
    }

    return null;
  }, [left, right, compareType]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Type toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-space-600 bg-space-800 p-1">
          <button
            type="button"
            onClick={() => handleTypeChange('rockets')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              compareType === 'rockets'
                ? 'bg-cosmic-blue/20 text-cosmic-blue'
                : 'text-star-dim hover:text-star-white'
            )}
          >
            <RocketIcon className="w-4 h-4" />
            {isZh ? '火箭' : 'Rockets'}
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('spacecraft')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              compareType === 'spacecraft'
                ? 'bg-cosmic-blue/20 text-cosmic-blue'
                : 'text-star-dim hover:text-star-white'
            )}
          >
            <Satellite className="w-4 h-4" />
            {isZh ? '航天器' : 'Spacecraft'}
          </button>
        </div>
      </div>

      {/* Selection panels */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start mb-8">
        <SelectionDropdown
          items={items}
          selected={left}
          onSelect={setLeft}
          placeholder={
            isZh
              ? `选择${compareType === 'rockets' ? '火箭' : '航天器'}...`
              : `Select ${compareType === 'rockets' ? 'rocket' : 'spacecraft'}...`
          }
          loading={loading}
        />

        <button
          type="button"
          onClick={swap}
          className="flex items-center justify-center p-3 rounded-xl border border-space-600 bg-space-800 hover:border-cosmic-blue text-star-dim hover:text-star-white transition-all self-center mx-auto md:mx-0"
          disabled={!left || !right}
          title={isZh ? '交换对比' : 'Swap comparison'}
        >
          <ArrowLeftRight className="w-5 h-5" />
        </button>

        <SelectionDropdown
          items={items}
          selected={right}
          onSelect={setRight}
          placeholder={
            isZh
              ? `选择${compareType === 'rockets' ? '火箭' : '航天器'}...`
              : `Select ${compareType === 'rockets' ? 'rocket' : 'spacecraft'}...`
          }
          loading={loading}
        />
      </div>

      {/* Comparison table */}
      {rows && (
        <>
          {/* Share button */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-space-600 bg-space-800 text-sm text-star-dim hover:text-star-white hover:border-cosmic-blue transition-all"
            >
              {shared ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  {isZh ? '已复制链接' : 'Link copied'}
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  {isZh ? '分享对比' : 'Share comparison'}
                </>
              )}
            </button>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-space-600 bg-space-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-600">
                  <th className="text-left p-4 text-star-dim font-medium w-1/4">
                    {isZh ? '属性' : 'Attribute'}
                  </th>
                  <th className="text-left p-4 text-star-white font-semibold bg-cosmic-blue/5">
                    {rows.a.name}
                  </th>
                  <th className="text-left p-4 text-star-white font-semibold bg-cosmic-purple/5">
                    {rows.b.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.fields.map((field) => (
                  <tr key={field.key} className="border-b border-space-700/50 last:border-0">
                    <td className="p-4 text-star-dim">{isZh ? field.labelZh : field.label}</td>
                    <td
                      className={cn(
                        'p-4 text-star-white bg-cosmic-blue/[0.02]',
                        field.highlightA === 'better' && 'text-green-400',
                        field.highlightA === 'worse' && 'text-red-400/80'
                      )}
                    >
                      <span className="inline-flex items-center">
                        {String(field.valueA)}
                        <HighlightPill highlight={field.highlightA} />
                      </span>
                    </td>
                    <td
                      className={cn(
                        'p-4 text-star-white bg-cosmic-purple/[0.02]',
                        field.highlightB === 'better' && 'text-green-400',
                        field.highlightB === 'worse' && 'text-red-400/80'
                      )}
                    >
                      <span className="inline-flex items-center">
                        {String(field.valueB)}
                        <HighlightPill highlight={field.highlightB} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards */}
          <div className="md:hidden space-y-4">
            {rows.fields.map((field) => (
              <Card key={field.key} className="p-4">
                <div className="text-xs text-star-dim mb-2">{isZh ? field.labelZh : field.label}</div>
                <div className="flex gap-3">
                  <div
                    className={cn(
                      'flex-1 px-3 py-2 rounded bg-cosmic-blue/5 text-sm',
                      field.highlightA === 'better' && 'text-green-400',
                      field.highlightA === 'worse' && 'text-red-400/80',
                      field.highlightA === 'neutral' && 'text-star-white'
                    )}
                  >
                    <div className="text-[10px] text-star-dim mb-0.5">{rows.a.name}</div>
                    <span className="inline-flex items-center">
                      {String(field.valueA)}
                      <HighlightPill highlight={field.highlightA} />
                    </span>
                  </div>
                  <div
                    className={cn(
                      'flex-1 px-3 py-2 rounded bg-cosmic-purple/5 text-sm',
                      field.highlightB === 'better' && 'text-green-400',
                      field.highlightB === 'worse' && 'text-red-400/80',
                      field.highlightB === 'neutral' && 'text-star-white'
                    )}
                  >
                    <div className="text-[10px] text-star-dim mb-0.5">{rows.b.name}</div>
                    <span className="inline-flex items-center">
                      {String(field.valueB)}
                      <HighlightPill highlight={field.highlightB} />
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-star-dim">
            <span className="inline-flex items-center gap-1">
              <ArrowUp className="w-3 h-3 text-green-400" />
              {isZh ? '更优值' : 'Better'}
            </span>
            <span className="inline-flex items-center gap-1">
              <ArrowDown className="w-3 h-3 text-red-400" />
              {isZh ? '较低值' : 'Lower'}
            </span>
          </div>
        </>
      )}

      {/* Empty state */}
      {!left && !right && (
        <div className="text-center py-16">
          <ArrowLeftRight className="w-16 h-16 text-star-dim/30 mx-auto mb-4" />
          <p className="text-star-dim">
            {isZh
              ? `选择两个${compareType === 'rockets' ? '火箭' : '航天器'}进行对比`
              : `Select two ${compareType} to compare`}
          </p>
        </div>
      )}
    </div>
  );
}
