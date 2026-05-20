'use client';

import { useState } from 'react';
import { ChevronFirst, ChevronLeft, ChevronRight, ChevronLast } from 'lucide-react';
import { Button } from './button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  const [jumpInput, setJumpInput] = useState('');

  const handleJump = () => {
    const target = parseInt(jumpInput, 10);
    if (target >= 1 && target <= totalPages) {
      onPageChange(target);
      setJumpInput('');
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-3 mt-8">
      <div className="text-sm text-star-dim">
        第 <span className="text-star-white font-semibold">{page}</span> 页，共{' '}
        <span className="text-star-white font-semibold">{totalPages}</span> 页
        {total !== undefined && (
          <> · 共 <span className="text-star-white font-semibold">{total}</span> 条</>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(1)}
          title="首页"
        >
          <ChevronFirst className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
          上一页
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          下一页
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => onPageChange(totalPages)}
          title="末页"
        >
          <ChevronLast className="w-4 h-4" />
        </Button>
      </div>

      {totalPages > 10 && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleJump(); }}
            placeholder="页码"
            className="w-20 px-3 py-1.5 rounded-lg bg-space-800 border border-space-600 text-sm text-star-white focus:outline-none focus:border-cosmic-blue"
          />
          <Button variant="outline" size="sm" onClick={handleJump}>
            跳转
          </Button>
        </div>
      )}
    </div>
  );
}
