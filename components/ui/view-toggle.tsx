'use client';

import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'table';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
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
        title="网格视图"
      >
        <LayoutGrid className="w-4 h-4" />
        网格
      </button>
      <button
        onClick={() => onChange('table')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
          mode === 'table'
            ? 'bg-cosmic-blue/20 text-cosmic-blue'
            : 'text-star-dim hover:text-star-white'
        )}
        title="列表视图"
      >
        <List className="w-4 h-4" />
        列表
      </button>
    </div>
  );
}
