'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Rocket,
  Satellite,
  User,
  Building2,
  Cpu,
  Loader2,
} from 'lucide-react';

type ResultBase = {
  id: string;
  name: string;
  url: string;
  type:
    | 'launch'
    | 'spacecraft'
    | 'astronaut'
    | 'rocket'
    | 'company'
    | 'technology';
};

type LaunchResult = ResultBase & {
  type: 'launch';
  date: string;
  status: string;
};
type SpacecraftResult = ResultBase & {
  type: 'spacecraft';
  spacecraftType: string;
  operator: string;
};
type AstronautResult = ResultBase & {
  type: 'astronaut';
  nationality: string;
  agency: string;
};
type RocketResult = ResultBase & {
  type: 'rocket';
  manufacturer: string;
  country: string;
};
type CompanyResult = ResultBase & {
  type: 'company';
  country: string;
  companyType: string;
};
type TechnologyResult = ResultBase & {
  type: 'technology';
  category: string;
  maturityLevel: string;
};

interface SearchResponse {
  results: {
    launches?: Array<LaunchResult & Record<string, unknown>>;
    spacecraft?: Array<SpacecraftResult & Record<string, unknown>>;
    astronauts?: Array<AstronautResult & Record<string, unknown>>;
    rockets?: Array<RocketResult & Record<string, unknown>>;
    companies?: Array<CompanyResult & Record<string, unknown>>;
    technologies?: Array<TechnologyResult & Record<string, unknown>>;
  };
  total: number;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
  locale: string;
}

const groupLabelsByLocale: Record<string, Record<string, string>> = {
  'zh-CN': {
    launches: '发射',
    spacecraft: '航天器',
    astronauts: '宇航员',
    rockets: '火箭',
    companies: '企业',
    technologies: '技术',
    placeholder: '搜索发射、航天器、宇航员、企业…',
    minChars: '请至少输入 2 个字符',
    noResults: '没有找到相关结果',
    loading: '搜索中…',
    hint: '按 Esc 关闭',
  },
  en: {
    launches: 'Launches',
    spacecraft: 'Spacecraft',
    astronauts: 'Astronauts',
    rockets: 'Rockets',
    companies: 'Companies',
    technologies: 'Technologies',
    placeholder: 'Search launches, spacecraft, astronauts, companies…',
    minChars: 'Type at least 2 characters',
    noResults: 'No results found',
    loading: 'Searching…',
    hint: 'Press Esc to close',
  },
  ja: {
    launches: '打ち上げ',
    spacecraft: '宇宙機',
    astronauts: '宇宙飛行士',
    rockets: 'ロケット',
    companies: '企業',
    technologies: '技術',
    placeholder: '打ち上げ、宇宙機、宇宙飛行士、企業を検索…',
    minChars: '2 文字以上入力してください',
    noResults: '結果が見つかりません',
    loading: '検索中…',
    hint: 'Esc で閉じる',
  },
  ru: {
    launches: 'Запуски',
    spacecraft: 'Космические аппараты',
    astronauts: 'Космонавты',
    rockets: 'Ракеты',
    companies: 'Компании',
    technologies: 'Технологии',
    placeholder: 'Поиск запусков, аппаратов, космонавтов, компаний…',
    minChars: 'Введите минимум 2 символа',
    noResults: 'Ничего не найдено',
    loading: 'Поиск…',
    hint: 'Нажмите Esc, чтобы закрыть',
  },
};

const iconForType: Record<ResultBase['type'], typeof Rocket> = {
  launch: Rocket,
  spacecraft: Satellite,
  astronaut: User,
  rocket: Rocket,
  company: Building2,
  technology: Cpu,
};

export function GlobalSearch({ open, onClose, locale }: GlobalSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const labels = useMemo(
    () => groupLabelsByLocale[locale] ?? groupLabelsByLocale.en,
    [locale]
  );

  // Debounce query (300ms)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setQuery('');
      setDebounced('');
      setData(null);
      setLoading(false);
      return;
    }
    // Focus input when opened
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // Fetch results
  useEffect(() => {
    if (!open) return;
    if (debounced.length < 2) {
      setData(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((json: SearchResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setLoading(false);
      });
    return () => controller.abort();
  }, [debounced, open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock scroll when open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  const handleNavigate = (url: string) => {
    onClose();
    router.push(`/${locale}${url}`);
  };

  const groups = data?.results ?? {};
  const total = data?.total ?? 0;
  const hasResults = total > 0;

  type ResultUnion =
    | LaunchResult
    | SpacecraftResult
    | AstronautResult
    | RocketResult
    | CompanyResult
    | TechnologyResult;

  const sections: Array<{
    key: keyof typeof groups;
    label: string;
    items: ResultUnion[];
  }> = [
    {
      key: 'launches',
      label: labels.launches,
      items: (groups.launches ?? []) as ResultUnion[],
    },
    {
      key: 'spacecraft',
      label: labels.spacecraft,
      items: (groups.spacecraft ?? []) as ResultUnion[],
    },
    {
      key: 'astronauts',
      label: labels.astronauts,
      items: (groups.astronauts ?? []) as ResultUnion[],
    },
    {
      key: 'rockets',
      label: labels.rockets,
      items: (groups.rockets ?? []) as ResultUnion[],
    },
    {
      key: 'companies',
      label: labels.companies,
      items: (groups.companies ?? []) as ResultUnion[],
    },
    {
      key: 'technologies',
      label: labels.technologies,
      items: (groups.technologies ?? []) as ResultUnion[],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-2xl bg-space-800 border border-space-600 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-space-700">
          <Search className="w-5 h-5 text-star-dim flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.placeholder}
            className="flex-1 bg-transparent text-white placeholder-star-dim/60 focus:outline-none text-base"
            autoComplete="off"
            spellCheck={false}
          />
          {loading && (
            <Loader2 className="w-4 h-4 text-cosmic-blue animate-spin" />
          )}
          <button
            onClick={onClose}
            className="p-1 text-star-dim hover:text-white transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim().length < 2 && (
            <div className="px-6 py-12 text-center text-star-dim text-sm">
              {labels.minChars}
            </div>
          )}

          {query.trim().length >= 2 && loading && !data && (
            <div className="px-6 py-12 text-center text-star-dim text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {labels.loading}
            </div>
          )}

          {query.trim().length >= 2 && data && !hasResults && !loading && (
            <div className="px-6 py-12 text-center text-star-dim text-sm">
              {labels.noResults}
            </div>
          )}

          {hasResults && (
            <div className="py-2">
              {sections.map((section) => {
                if (section.items.length === 0) return null;
                return (
                  <div key={section.key} className="px-2 py-2">
                    <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-star-dim/70">
                      {section.label}
                    </div>
                    <ul>
                      {section.items.map((item) => {
                        const Icon = iconForType[item.type];
                        return (
                          <li key={`${item.type}-${item.id}`}>
                            <button
                              onClick={() => handleNavigate(item.url)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-space-700 transition-colors group"
                            >
                              <span className="flex items-center justify-center w-8 h-8 rounded-md bg-space-700 group-hover:bg-space-600 text-cosmic-blue flex-shrink-0">
                                <Icon className="w-4 h-4" />
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className="block text-sm text-white truncate">
                                  {item.name}
                                </span>
                                <span className="block text-xs text-star-dim truncate">
                                  {renderSubtitle(item)}
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-space-700 text-xs text-star-dim/70 flex justify-between">
          <span>{labels.hint}</span>
          {hasResults && <span>{total}</span>}
        </div>
      </div>
    </div>
  );
}

function renderSubtitle(item: {
  type: ResultBase['type'];
  [key: string]: unknown;
}): string {
  switch (item.type) {
    case 'launch': {
      const date = item.date ? new Date(item.date as string) : null;
      const dateStr = date && !isNaN(date.getTime())
        ? date.toISOString().slice(0, 10)
        : '';
      return [dateStr, item.status as string].filter(Boolean).join(' · ');
    }
    case 'spacecraft':
      return (item.operator as string) ?? '';
    case 'astronaut':
      return [item.nationality as string, item.agency as string]
        .filter(Boolean)
        .join(' · ');
    case 'rocket':
      return [item.manufacturer as string, item.country as string]
        .filter(Boolean)
        .join(' · ');
    case 'company':
      return (item.country as string) ?? '';
    case 'technology':
      return [item.category as string, item.maturityLevel as string]
        .filter(Boolean)
        .join(' · ');
    default:
      return '';
  }
}
