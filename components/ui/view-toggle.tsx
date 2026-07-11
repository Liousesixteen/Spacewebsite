'use client';

import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'table';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  labels?: {
    grid: string;
    table: string;
  };
}

export function ViewToggle({
  mode,
  onChange,
  labels = { grid: '网格', table: '列表' },
}: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-space-800 rounded-lg border border-space-600 p-1">
      <button
        onClick={() => onChange('grid')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
          mode === 'grid'
            ? 'bg-cosmic-blue/20 text-cosmic-blue'
            : 'text-star-dim hover:text-star-white'
        )}
        title={labels.grid}
      >
        <LayoutGrid className="w-4 h-4" />
        {labels.grid}
      </button>
      <button
        onClick={() => onChange('table')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
          mode === 'table'
            ? 'bg-cosmic-blue/20 text-cosmic-blue'
            : 'text-star-dim hover:text-star-white'
        )}
        title={labels.table}
      >
        <List className="w-4 h-4" />
        {labels.table}
      </button>
    </div>
  );
}
